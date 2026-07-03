import type { AnalysisResult } from '@clarxai/engine';
import { buildScoreReportView } from '../score-report/model.js';
import { joinLines } from './ansi.js';
import { CommandPrompt } from './components/command-prompt.js';
import { CompactSummary } from './components/compact-summary.js';
import { Footer } from './components/footer.js';
import { PillarList } from './components/pillar-list.js';
import { ScoreHeaderBar } from './components/score-header-bar.js';
import { StatusLine } from './components/status.js';
import { Transcript, type TranscriptEntry } from './components/transcript.js';
import { Text } from './components/text.js';
import { VerboseRules } from './components/verbose-rules.js';
import { terminalWidth } from './utils/truncate.js';
import { transcriptHeight } from './viewport.js';

export interface TuiFrameState {
  result: AnalysisResult;
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

function filterQueryFromBuffer(buffer: string): string {
  return buffer.startsWith('/') ? buffer.slice(1) : '';
}

export function renderTuiFrame(state: TuiFrameState): string {
  const view = buildScoreReportView(state.result, { verbose: state.verbose });
  const width = terminalWidth();
  const filterQuery = filterQueryFromBuffer(state.commandBuffer);
  const filterActive = state.commandBuffer.startsWith('/');
  const panelHeight = Math.min(4, transcriptHeight(process.stdout.rows));

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
      children: `confidence ${view.confidence} · engine v${view.version} · ${view.filesScanned} files${state.watchMode ? ' · watch' : ''}${state.verbose ? ' · verbose' : ''}`,
      dim: true,
    }),
    state.isRefreshing ? StatusLine({ message: 'Refreshing...', tone: 'warning' }) : null,
    state.status ? StatusLine({
      message: state.status,
      tone: state.status.startsWith('Refresh failed') || state.status.startsWith('Could not open') ? 'danger' : 'success',
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
      ? Transcript({
          entries: state.transcript,
          scrollOffset: state.transcriptScroll,
          maxLines: panelHeight,
        })
      : null,
    '',
    CommandPrompt({ buffer: state.commandBuffer }),
    Footer({ filterActive }),
  ]);
}