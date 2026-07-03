import type { AnalysisResult } from '@clarxai/engine';
import type { ScoreOptions } from '../../app/score/types.js';
import { runScan } from '../../app/score/run-scan.js';
import { createRecursiveWatcher } from '../../platform/watcher.js';
import { parseScoreCommand } from '../../app/score/command-parser.js';
import { formatExplanation, getRuleCopyText, getRuleExplanation } from '../../commands/explain.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { track } from '../../utils/telemetry.js';
import { buildScoreReportView } from '../score-report/model.js';
import { executeTuiCommand } from './command-loop.js';
import { flattenTranscript, type TranscriptEntry } from './components/transcript.js';
import {
  createCommandHistoryState,
  historyDown,
  historyUp,
  pushCommandHistory,
  type CommandHistoryState,
} from './history.js';
import { enableRawInput } from './input.js';
import {
  defaultSelectedPillarIndex,
  findingsForPillar,
  nextPillarIndex,
  visiblePillarIndices,
} from './navigation.js';
import { findSelectedIssueLineRange, scrollToRevealRange } from './body-scroll.js';
import { bodyViewportRows, footerLineCount, maxBodyScroll } from './layout.js';
import { renderTuiFrameParts, type TuiFrameState } from './render-frame.js';
import { TerminalScreen } from './screen.js';
import { transcriptHeight } from './viewport.js';
import type { TuiView } from './views.js';

const MAX_TRANSCRIPT_ENTRIES = 50;

export interface TuiScoreAppInput {
  opts: ScoreOptions;
  result: AnalysisResult;
  code: number;
  watchMode?: boolean;
}

function maxTranscriptScroll(entries: TranscriptEntry[]): number {
  const lines = flattenTranscript(entries);
  const maxLines = Math.min(4, transcriptHeight(process.stdout.rows));
  return Math.max(0, lines.length - maxLines);
}

function isFilterMode(buffer: string): boolean {
  return buffer.startsWith('/');
}

function isCommandMode(buffer: string): boolean {
  return buffer.length > 0 && !isFilterMode(buffer);
}

export async function runTuiScoreApp(input: TuiScoreAppInput): Promise<number> {
  const screen = new TerminalScreen();
  let latestCode = input.code;
  let exiting = false;

  let result = input.result;
  const initialView = buildScoreReportView(result);
  let selectedPillarIndex = defaultSelectedPillarIndex(initialView.pillars);
  let selectedIssueIndex = 0;

  let status: string | null = null;
  let isRefreshing = false;
  let lastChangedFile: string | null = null;
  let watchError: string | null = null;
  let copied: string | null = null;
  let commandBuffer = '';
  let history: CommandHistoryState = createCommandHistoryState();
  let transcript: TranscriptEntry[] = [];
  let transcriptScroll = 0;
  let bodyScroll = 0;
  let activeView: TuiView = 'main';
  let detailRuleId: string | null = null;

  const syncSelection = () => {
    const view = buildScoreReportView(result);
    const filterQuery = commandBuffer.startsWith('/') ? commandBuffer.slice(1) : '';
    const visible = visiblePillarIndices(view.pillars, filterQuery);
    if (!visible.includes(selectedPillarIndex)) {
      selectedPillarIndex = visible[0] ?? defaultSelectedPillarIndex(view.pillars);
    }
    const findings = findingsForPillar(view.pillars[selectedPillarIndex]!, filterQuery);
    if (selectedIssueIndex >= findings.length) {
      selectedIssueIndex = Math.max(0, findings.length - 1);
    }
  };

  const appendTranscript = (entry: TranscriptEntry) => {
    transcript = [...transcript.slice(-(MAX_TRANSCRIPT_ENTRIES - 1)), entry];
    transcriptScroll = maxTranscriptScroll(transcript);
  };

  const getFrameState = (): TuiFrameState => ({
    result,
    activeView,
    detailRuleId,
    watchMode: Boolean(input.watchMode),
    verbose: input.opts.verbose,
    isRefreshing,
    status,
    watchError,
    lastChangedFile,
    copied,
    commandBuffer,
    transcript,
    transcriptScroll,
    selectedPillarIndex,
    selectedIssueIndex,
  });

  const frameMetrics = () => {
    const parts = renderTuiFrameParts(getFrameState());
    const footerLines = footerLineCount(parts.footer);
    return {
      parts,
      footerLines,
      viewport: bodyViewportRows(process.stdout.rows, footerLines),
      maxScroll: parts.bodyMaxScroll,
    };
  };

  const bodyScrollPage = () => frameMetrics().viewport;

  const scrollBody = (delta: number) => {
    const parts = renderTuiFrameParts(getFrameState());
    const max = maxBodyScroll(parts.body, process.stdout.rows, parts.footer);
    bodyScroll = Math.min(Math.max(0, bodyScroll + delta), max);
    screen.renderSplit({
      body: parts.body,
      footer: parts.footer,
      commandBuffer,
      bodyScroll,
      showPrompt: parts.showPrompt,
    });
  };

  const redraw = () => {
    syncSelection();
    const parts = renderTuiFrameParts(getFrameState());
    const max = maxBodyScroll(parts.body, process.stdout.rows, parts.footer);
    bodyScroll = Math.min(bodyScroll, max);
    screen.renderSplit({
      body: parts.body,
      footer: parts.footer,
      commandBuffer,
      bodyScroll,
      showPrompt: parts.showPrompt,
    });
  };

  const openDetail = (ruleId: string) => {
    if (!getRuleExplanation(ruleId)) {
      status = `Unknown rule: ${ruleId}`;
      redraw();
      return;
    }
    detailRuleId = ruleId.toUpperCase();
    activeView = 'detail';
    bodyScroll = 0;
    copied = null;
    status = null;
    track({ action: 'explain', rule: detailRuleId, score: result.score });
    redraw();
  };

  const closeDetail = () => {
    activeView = 'main';
    detailRuleId = null;
    bodyScroll = 0;
    redraw();
  };

  const navigatePillar = (delta: number) => {
    const view = buildScoreReportView(result);
    const filterQuery = commandBuffer.startsWith('/') ? commandBuffer.slice(1) : '';
    const visible = visiblePillarIndices(view.pillars, filterQuery);
    if (visible.length === 0) return;

    const currentPos = visible.indexOf(selectedPillarIndex);
    const base = currentPos === -1 ? 0 : currentPos;
    const nextPos = nextPillarIndex(base, delta, visible.length);
    selectedPillarIndex = visible[nextPos]!;
    selectedIssueIndex = 0;
    bodyScroll = 0;
    redraw();
  };

  const scrollSelectedIssueIntoView = () => {
    const finding = selectedFinding();
    if (!finding) return;

    const { parts, viewport, maxScroll } = frameMetrics();
    const range = findSelectedIssueLineRange(parts.body, finding.id);
    if (!range) return;

    const nextScroll = scrollToRevealRange(range, bodyScroll, viewport, maxScroll);
    if (nextScroll === bodyScroll) return;

    bodyScroll = nextScroll;
    screen.renderSplit({
      body: parts.body,
      footer: parts.footer,
      commandBuffer,
      bodyScroll,
      showPrompt: parts.showPrompt,
    });
  };

  const mainVerticalNav = (direction: -1 | 1) => {
    const { maxScroll } = frameMetrics();

    if (direction === 1) {
      if (bodyScroll < maxScroll) {
        scrollBody(1);
        return;
      }
      navigatePillar(1);
      return;
    }

    if (bodyScroll > 0) {
      scrollBody(-1);
      return;
    }
    navigatePillar(-1);
  };

  const navigateIssue = (delta: number) => {
    const view = buildScoreReportView(result);
    const filterQuery = commandBuffer.startsWith('/') ? commandBuffer.slice(1) : '';
    const findings = findingsForPillar(view.pillars[selectedPillarIndex]!, filterQuery);
    if (findings.length === 0) return;
    selectedIssueIndex = nextPillarIndex(selectedIssueIndex, delta, findings.length);
    redraw();
    scrollSelectedIssueIntoView();
  };

  const selectedFinding = () => {
    const view = buildScoreReportView(result);
    const filterQuery = commandBuffer.startsWith('/') ? commandBuffer.slice(1) : '';
    const findings = findingsForPillar(view.pillars[selectedPillarIndex]!, filterQuery);
    return findings[selectedIssueIndex] ?? null;
  };

  const explainSelectedIssue = () => {
    const finding = selectedFinding();
    if (!finding) {
      status = 'No issue selected.';
      redraw();
      return;
    }
    openDetail(finding.id);
  };

  const navigateDetailIssue = (delta: number) => {
    const view = buildScoreReportView(result);
    const filterQuery = commandBuffer.startsWith('/') ? commandBuffer.slice(1) : '';
    const findings = findingsForPillar(view.pillars[selectedPillarIndex]!, filterQuery);
    if (findings.length === 0) return;
    selectedIssueIndex = nextPillarIndex(selectedIssueIndex, delta, findings.length);
    const finding = findings[selectedIssueIndex];
    if (finding) {
      detailRuleId = finding.id;
      bodyScroll = 0;
    }
    redraw();
  };

  const copyDetailFix = () => {
    if (!detailRuleId) return;
    const text = getRuleCopyText(detailRuleId);
    if (!text) {
      status = `No copy text for ${detailRuleId}.`;
      redraw();
      return;
    }
    const ok = copyToClipboard(text);
    copied = ok ? `Copied fix for ${detailRuleId} to clipboard` : 'Clipboard not available on this system';
    track({ action: 'copy', rule: detailRuleId, score: result.score });
    redraw();
  };

  const copySelectedFix = () => {
    const finding = selectedFinding();
    if (!finding) {
      status = 'No issue selected.';
      redraw();
      return;
    }
    const text = getRuleCopyText(finding.id);
    if (!text) {
      status = `No copy text for ${finding.id}.`;
      redraw();
      return;
    }
    const ok = copyToClipboard(text);
    copied = ok ? `Copied fix for ${finding.id} to clipboard` : 'Clipboard not available on this system';
    track({ action: 'copy', rule: finding.id, score: result.score });
    redraw();
  };

  const refresh = async (source?: string) => {
    isRefreshing = true;
    copied = null;
    status = source ? `Refreshing after change in ${source}...` : 'Refreshing...';
    if (source) lastChangedFile = source;
    redraw();

    try {
      const next = await runScan(input.opts);
      latestCode = next.code;
      result = next.result;
      status = source ? `Updated from ${source}` : 'Refreshed.';
      syncSelection();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      status = `Refresh failed: ${message}`;
      appendTranscript({
        command: 'refresh',
        lines: [`Refresh failed: ${message}`],
        tone: 'warning',
      });
    } finally {
      isRefreshing = false;
      redraw();
    }
  };

  const runCommand = (rawInput: string) => {
    const trimmed = rawInput.trim();
    const command = parseScoreCommand(rawInput);
    if (command.kind === 'show_rule' && getRuleExplanation(command.ruleId)) {
      openDetail(command.ruleId);
      return;
    }

    const handled = executeTuiCommand(result, rawInput, {
      formatExplanation,
      getRuleCopyText,
      copyToClipboard,
      track,
    });

    if (handled.refreshRequested) {
      void refresh();
      return;
    }

    if (handled.copiedMessage !== undefined) copied = handled.copiedMessage;
    if (handled.statusMessage !== undefined) status = handled.statusMessage;
    if (handled.transcriptEntry) {
      appendTranscript({
        command: trimmed,
        lines: handled.transcriptEntry.split('\n').slice(1),
        tone: handled.copiedMessage
          ? 'success'
          : handled.transcriptEntry.includes('Unknown')
            ? 'warning'
            : 'neutral',
      });
    }
    redraw();
  };

  let resolveExit: (() => void) | null = null;

  const stop = () => {
    if (exiting) return;
    exiting = true;
    screen.unmount();
    resolveExit?.();
  };

  let watcher: ReturnType<typeof createRecursiveWatcher> | null = null;
  let debounce: ReturnType<typeof setTimeout> | null = null;

  if (input.watchMode) {
    try {
      watcher = createRecursiveWatcher(input.opts.root, filename => {
        if (debounce) clearTimeout(debounce);
        debounce = setTimeout(() => {
          void refresh(filename);
        }, 400);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      watchError = `Watch mode unavailable: ${message}`;
    }
  }

  screen.mount();
  redraw();

  const disableRaw = enableRawInput(key => {
    if (exiting) return;

    if (activeView === 'detail') {
      if (key.escape) {
        closeDetail();
        return;
      }
      if (key.ctrl && key.value === 'c') {
        stop();
        return;
      }
      if (key.value === 'c' && !key.ctrl && !key.meta) {
        copyDetailFix();
        return;
      }
      if (key.tab) {
        navigateDetailIssue(1);
        return;
      }
      if (key.upArrow) {
        scrollBody(-1);
        return;
      }
      if (key.downArrow) {
        scrollBody(1);
        return;
      }
      if (key.pageUp) {
        scrollBody(-bodyScrollPage());
        return;
      }
      if (key.pageDown) {
        scrollBody(bodyScrollPage());
        return;
      }
      return;
    }

    if (key.escape) {
      if (commandBuffer.length > 0) {
        commandBuffer = '';
        redraw();
        return;
      }
      stop();
      return;
    }

    if (key.return) {
      if (isFilterMode(commandBuffer)) {
        commandBuffer = '';
        redraw();
        return;
      }
      if (isCommandMode(commandBuffer)) {
        runCommand(commandBuffer);
        history = pushCommandHistory(history, commandBuffer);
        commandBuffer = '';
        redraw();
        return;
      }
      explainSelectedIssue();
      return;
    }

    if (key.backspace || key.delete) {
      commandBuffer = commandBuffer.slice(0, -1);
      redraw();
      return;
    }

    if (key.tab) {
      if (!isCommandMode(commandBuffer) && !isFilterMode(commandBuffer)) {
        navigateIssue(1);
      }
      return;
    }

    if (key.pageUp) {
      if (!isCommandMode(commandBuffer) && !isFilterMode(commandBuffer)) {
        scrollBody(-bodyScrollPage());
      }
      return;
    }

    if (key.pageDown) {
      if (!isCommandMode(commandBuffer) && !isFilterMode(commandBuffer)) {
        scrollBody(bodyScrollPage());
      }
      return;
    }

    if (key.upArrow) {
      if (isCommandMode(commandBuffer)) {
        const next = historyUp(history, commandBuffer);
        history = next.state;
        commandBuffer = next.buffer;
        redraw();
        return;
      }
      if (!isFilterMode(commandBuffer)) {
        mainVerticalNav(-1);
      }
      return;
    }

    if (key.downArrow) {
      if (isCommandMode(commandBuffer)) {
        const next = historyDown(history);
        history = next.state;
        commandBuffer = next.buffer;
        redraw();
        return;
      }
      if (!isFilterMode(commandBuffer)) {
        mainVerticalNav(1);
      }
      return;
    }

    if (key.ctrl && key.value === 'c') {
      stop();
      return;
    }

    if (!isCommandMode(commandBuffer) && !isFilterMode(commandBuffer)) {
      if (key.value === 'q') {
        stop();
        return;
      }
      if (key.value === 'r') {
        void refresh();
        return;
      }
      if (key.value === 'c') {
        copySelectedFix();
        return;
      }
      if (key.value === '/') {
        commandBuffer = '/';
        redraw();
        return;
      }
    }

    if (key.value && !key.ctrl && !key.meta) {
      if (history.index !== null) {
        history = { ...history, index: null };
      }
      commandBuffer += key.value;
      redraw();
    }
  });

  await new Promise<void>(resolve => {
    resolveExit = resolve;

    const onExit = () => {
      if (debounce) clearTimeout(debounce);
      watcher?.close();
      disableRaw();
      stop();
    };

    process.once('SIGINT', onExit);
  });

  if (debounce) clearTimeout(debounce);
  watcher?.close();
  disableRaw();

  return latestCode;
}

/** @deprecated Use runTuiScoreApp */
export const runInkScoreApp = runTuiScoreApp;