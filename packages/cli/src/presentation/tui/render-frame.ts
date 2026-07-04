import type { AnalysisResult } from '@clarxai/engine';
import { getRuleExplanation } from '../../commands/explain.js';
import { buildScoreReportView } from '../score-report/model.js';
import { findingsForPillar } from './navigation.js';
import { joinLines } from './ansi.js';
import { CommandPrompt } from './components/command-prompt.js';
import { CompactSummary } from './components/compact-summary.js';
import { Footer } from './components/footer.js';
import { PillarList } from './components/pillar-list.js';
import { RuleDetailView } from './components/rule-detail-view.js';
import { ScoreHeaderBar } from './components/score-header-bar.js';
import { StatusLine } from './components/status.js';
import { Transcript, type TranscriptEntry } from './components/transcript.js';
import { Text } from './components/text.js';
import { VerboseRules } from './components/verbose-rules.js';
import { maxBodyScroll } from './layout.js';
import type { FooterContext, TuiView } from './views.js';
import { terminalWidth } from './utils/truncate.js';

export interface TuiFrameState {
  result: AnalysisResult;
  activeView: TuiView;
  detailRuleId: string | null;
  watchMode: boolean;
  verbose: boolean;
  isRefreshing: boolean;
  status: string | null;
  watchError: string | null;
  lastChangedFile: string | null;
  copied: string | null;
  commandBuffer: string;
  transcript: TranscriptEntry[];
  transcriptScroll: number;
  selectedPillarIndex: number;
  selectedIssueIndex: number;
}

export interface TuiFrameParts {
  body: string;
  footer: string;
  showPrompt: boolean;
  bodyMaxScroll: number;
}

function filterQueryFromBuffer(buffer: string): string {
  return buffer.startsWith('/') ? buffer.slice(1) : '';
}

function resolveFooterContext(state: TuiFrameState): FooterContext {
  if (state.activeView === 'detail') return 'detail';
  if (state.commandBuffer.startsWith('/')) return 'filter';
  if (state.commandBuffer.length > 0) return 'command';
  return 'main';
}

function selectedPillarIssueCount(state: TuiFrameState): number {
  const view = buildScoreReportView(state.result);
  const filterQuery = filterQueryFromBuffer(state.commandBuffer);
  return findingsForPillar(view.pillars[state.selectedPillarIndex]!, filterQuery).length;
}

function renderMainBody(state: TuiFrameState): string {
  const view = buildScoreReportView(state.result, { verbose: state.verbose });
  const width = terminalWidth();
  const filterQuery = filterQueryFromBuffer(state.commandBuffer);

  const migrationLines = view.migrations.flatMap(item => {
    const intent = item.rating === 'high' ? 'warning' : item.rating === 'medium' ? 'info' : undefined;
    return [
      `${Text({ children: item.rating.toUpperCase().padEnd(6), intent, dim: !intent })} ${item.path} ${Text({ children: `(${item.score})`, dim: true })}`,
      `       ${item.summary}`,
    ];
  });

  return joinLines([
    ScoreHeaderBar({ score: view.score }),
    Text({
      children: `confidence ${view.confidence}${view.notEvaluated.length > 0 ? ` · ${view.notEvaluated.length} rules n/a for stack` : ''} · engine v${view.version} · ${view.filesScanned} files${state.watchMode ? ' · watch' : ''}${state.verbose ? ' · verbose' : ''}`,
      dim: true,
    }),
    state.isRefreshing ? StatusLine({ message: 'Refreshing...', tone: 'warning' }) : null,
    state.status ? StatusLine({
      message: state.status,
      tone: state.status.startsWith('Refresh failed') ? 'danger' : 'success',
    }) : null,
    state.watchError ? StatusLine({ message: state.watchError, tone: 'warning' }) : null,
    state.lastChangedFile ? Text({ children: `Last changed: ${state.lastChangedFile}`, dim: true }) : null,
    view.confidenceCaveat ? StatusLine({ message: view.confidenceCaveat, tone: 'warning' }) : null,
    view.tip ? StatusLine({ message: view.tip, tone: 'info' }) : null,
    '',
    CompactSummary({ summary: view.summary }),
    '',
    PillarList({
      pillars: view.pillars,
      selectedIndex: state.selectedPillarIndex,
      selectedIssueIndex: state.selectedIssueIndex,
      width,
      filterQuery,
    }),
    view.migrations.length > 0
      ? ['', Text({ children: 'View-model migration opportunities', bold: true }), ...migrationLines].join('\n')
      : null,
    VerboseRules({ groups: view.verboseGroups }),
    state.copied
      ? StatusLine({
          message: state.copied,
          tone: state.copied.startsWith('Copied') ? 'success' : 'warning',
        })
      : null,
    state.transcript.length > 0
      ? ['', Transcript({ entries: state.transcript, scrollOffset: state.transcriptScroll })].join('\n')
      : null,
  ]);
}

function renderDetailBody(state: TuiFrameState): string {
  const ruleId = state.detailRuleId;
  if (!ruleId) {
    return Text({ children: 'No rule selected.', intent: 'warning' });
  }

  const rule = getRuleExplanation(ruleId);
  if (!rule) {
    return Text({ children: `Unknown rule: ${ruleId}`, intent: 'warning' });
  }

  const report = buildScoreReportView(state.result);
  const engineRule = state.result.rules[ruleId as keyof typeof state.result.rules];
  let finding = report.pillars
    .flatMap(p => p.findings)
    .find(f => f.id === ruleId);

  if (!finding) {
    const filterQuery = '';
    const pillarFindings = findingsForPillar(report.pillars[state.selectedPillarIndex]!, filterQuery);
    finding = pillarFindings.find(f => f.id === ruleId);
  }

  return RuleDetailView({
    rule,
    finding,
    engineMessage: engineRule && !engineRule.passed ? engineRule.message : undefined,
  });
}

export function renderTuiFrameParts(state: TuiFrameState): TuiFrameParts {
  const width = terminalWidth();
  const footerContext = resolveFooterContext(state);
  const showPrompt = state.activeView === 'main';
  const multipleIssues = selectedPillarIssueCount(state) > 1;

  const body = state.activeView === 'detail' ? renderDetailBody(state) : renderMainBody(state);

  const footerContent = Footer({
    context: footerContext,
    multipleIssues,
    bodyScrollable: false,
  });

  const footerLines = showPrompt
    ? [
        Text({ children: '─'.repeat(Math.min(width, 72)), dim: true }),
        CommandPrompt({ buffer: state.commandBuffer }),
        '',
        footerContent,
      ]
    : [
        Text({ children: '─'.repeat(Math.min(width, 72)), dim: true }),
        Text({ children: `‹ ${state.detailRuleId ?? 'rule'} · press Esc to return`, dim: true }),
        '',
        footerContent,
      ];

  let footer = footerLines.join('\n');
  let bodyMaxScroll = maxBodyScroll(body, process.stdout.rows, footer);
  const bodyScrollable = state.activeView === 'main' && bodyMaxScroll > 0;

  if (bodyScrollable) {
    const scrollFooterContent = Footer({
      context: footerContext,
      multipleIssues,
      bodyScrollable: true,
    });
    footer = (showPrompt
      ? [
          Text({ children: '─'.repeat(Math.min(width, 72)), dim: true }),
          CommandPrompt({ buffer: state.commandBuffer }),
          '',
          scrollFooterContent,
        ]
      : [
          Text({ children: '─'.repeat(Math.min(width, 72)), dim: true }),
          Text({ children: `‹ ${state.detailRuleId ?? 'rule'} · press Esc to return`, dim: true }),
          '',
          scrollFooterContent,
        ]).join('\n');
    bodyMaxScroll = maxBodyScroll(body, process.stdout.rows, footer);
  }

  return {
    body,
    footer,
    showPrompt,
    bodyMaxScroll,
  };
}

/** @deprecated Use renderTuiFrameParts for split body/footer rendering */
export function renderTuiFrame(state: TuiFrameState): string {
  const parts = renderTuiFrameParts(state);
  return joinLines([parts.body, '', parts.footer]);
}