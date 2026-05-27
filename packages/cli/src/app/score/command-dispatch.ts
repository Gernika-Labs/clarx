import { executeScoreCommand } from './command-core.js';
import type { ParsedScoreCommand, ScoreResult } from './types.js';
import type { TelemetryEvent } from '../../utils/telemetry.js';

export interface ScoreCommandDispatchDeps {
  formatExplanation: (ruleId: string) => string | null;
  getRuleCopyText: (ruleId: string) => string | null;
  copyToClipboard: (text: string) => boolean;
  track: (event: TelemetryEvent) => void;
  dim: (text: string) => string;
}

export interface ScoreCommandDispatchResult {
  refresh?: boolean;
  lines: string[];
}

export function dispatchScoreCommand(
  result: ScoreResult,
  command: ParsedScoreCommand,
  deps: ScoreCommandDispatchDeps,
): ScoreCommandDispatchResult {
  const executed = executeScoreCommand(result, command, deps);
  if (executed.refresh) return { refresh: true, lines: [] };

  const lines = executed.blocks.flatMap(block => {
    if (block.startsWith('Copied ') || block === 'All failing rules copied to clipboard') {
      return [`  \x1b[92m✓\x1b[0m \x1b[2m${block}\x1b[0m`, ''];
    }
    if (block === 'Clipboard not available on this system') {
      return ['  \x1b[2mClipboard not available on this system\x1b[0m', ''];
    }
    if (block.startsWith('Unknown') || block.startsWith('No issues')) {
      return [`  ${deps.dim(block)}`, ''];
    }
    return [block];
  });

  return { lines };
}
