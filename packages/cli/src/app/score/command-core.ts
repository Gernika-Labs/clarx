import type { TelemetryEvent } from '../../utils/telemetry.js';
import { buildCopyAllText, buildCopySectionText } from './copy-text.js';
import { getFailingRules, getFailingRulesByPillar } from './findings.js';
import type { ParsedScoreCommand, ScoreResult } from './types.js';

const UNKNOWN_HINT = `Try a rule ID (e.g. 'C1'), a section letter ('C'), 'show all', or 'copy all'`;
const UNKNOWN_RULE_TEXT = 'Valid rules: D1–D5, B1–B5, C1–C6, O1–O5, E1–E5. Sections: failures/f, warnings/w, recs/recommendations';

export interface ScoreCommandCoreDeps {
  formatExplanation: (ruleId: string) => string | null;
  getRuleCopyText: (ruleId: string) => string | null;
  copyToClipboard: (text: string) => boolean;
  track: (event: TelemetryEvent) => void;
}

export interface ScoreCommandCoreResult {
  refresh?: boolean;
  blocks: string[];
  copiedMessage?: string;
}

export function executeScoreCommand(
  result: ScoreResult,
  command: ParsedScoreCommand,
  deps: ScoreCommandCoreDeps,
): ScoreCommandCoreResult {
  switch (command.kind) {
    case 'noop':
      return { blocks: [] };
    case 'refresh':
      return { refresh: true, blocks: [] };
    case 'show_all': {
      const failing = getFailingRules(result);
      if (failing.length === 0) return { blocks: ['No issues found.'] };
      deps.track({ action: 'show_all', score: result.score });
      return {
        blocks: failing.flatMap(rule => {
          const explanation = deps.formatExplanation(rule.id);
          return explanation ? [explanation] : [];
        }),
      };
    }
    case 'show_pillar': {
      const failing = getFailingRulesByPillar(result, command.pillar);
      if (failing.length === 0) return { blocks: [`No issues in pillar ${command.pillar}.`] };
      deps.track({ action: 'show_section', rule: command.pillar, score: result.score });
      return {
        blocks: failing.flatMap(rule => {
          const explanation = deps.formatExplanation(rule.id);
          return explanation ? [explanation] : [];
        }),
      };
    }
    case 'copy_all': {
      const ok = deps.copyToClipboard(buildCopyAllText(result));
      const message = ok ? 'All failing rules copied to clipboard' : 'Clipboard not available on this system';
      deps.track({ action: 'copy_all', score: result.score });
      return { blocks: [message], copiedMessage: message };
    }
    case 'copy_section': {
      const sectionText = buildCopySectionText(result, command.target);
      if (sectionText) {
        const ok = deps.copyToClipboard(sectionText);
        const message = ok
          ? `Copied ${command.target.toLowerCase()} section to clipboard`
          : 'Clipboard not available on this system';
        deps.track({ action: 'copy_section', rule: command.target, score: result.score });
        return { blocks: [message], copiedMessage: message };
      }
      return { blocks: [`Unknown rule or section "${command.target}". ${UNKNOWN_RULE_TEXT}`] };
    }
    case 'copy_rule': {
      const text = deps.getRuleCopyText(command.ruleId);
      if (text) {
        const ok = deps.copyToClipboard(text);
        const message = ok
          ? `Copied fix for ${command.ruleId} to clipboard`
          : 'Clipboard not available on this system';
        deps.track({ action: 'copy', rule: command.ruleId, score: result.score });
        return { blocks: [message], copiedMessage: message };
      }
      return { blocks: [`Unknown rule or section "${command.ruleId}". ${UNKNOWN_RULE_TEXT}`] };
    }
    case 'show_rule': {
      const explanation = deps.formatExplanation(command.ruleId);
      if (explanation) {
        deps.track({ action: 'explain', rule: command.ruleId, score: result.score });
        return { blocks: [explanation] };
      }
      return { blocks: [`Unknown: "${command.ruleId}". ${UNKNOWN_HINT}`] };
    }
    case 'unknown':
      return { blocks: [`Unknown: "${command.raw}". ${UNKNOWN_HINT}`] };
  }
}
