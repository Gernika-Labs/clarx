import type { AnalysisResult } from '@clarxai/engine';
import type { TelemetryEvent } from '../../utils/telemetry.js';
import { parseScoreCommand } from '../../app/score/command-parser.js';
import { executeScoreCommand } from '../../app/score/command-core.js';

export interface InkCommandLoopDeps {
  formatExplanation: (ruleId: string) => string | null;
  getRuleCopyText: (ruleId: string) => string | null;
  copyToClipboard: (text: string) => boolean;
  track: (event: TelemetryEvent) => void;
}

export interface InkCommandLoopResult {
  refreshRequested?: boolean;
  copiedMessage?: string | null;
  statusMessage?: string | null;
  transcriptEntry?: string | null;
}

export function executeInkCommand(
  result: AnalysisResult,
  rawInput: string,
  deps: InkCommandLoopDeps,
): InkCommandLoopResult {
  const command = parseScoreCommand(rawInput);
  const trimmed = rawInput.trim();
  const executed = executeScoreCommand(result, command, deps);
  if (executed.refresh) return { refreshRequested: true };
  if (executed.blocks.length === 0) return {};
  return {
    copiedMessage: executed.copiedMessage,
    statusMessage: executed.copiedMessage ? null : undefined,
    transcriptEntry: `> ${trimmed}\n${executed.blocks.join('\n')}`,
  };
}
