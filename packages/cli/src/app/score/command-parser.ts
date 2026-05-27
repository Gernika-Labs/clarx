import type { ParsedScoreCommand, PillarLetter } from './types.js';

export function normalizeScoreInput(input: string): string {
  return input.trim().toUpperCase().replace(/^0([1-5])$/, 'O$1');
}

export function isPillarCommand(input: string): input is PillarLetter {
  return /^[DBCOE]$/.test(input);
}

export function isRuleId(input: string): boolean {
  return /^(?:D[1-6]|B[1-5]|C[1-6]|O[1-5]|E[1-5])$/.test(input);
}

export function parseScoreCommand(input: string): ParsedScoreCommand {
  const normalized = normalizeScoreInput(input);
  if (!normalized) return { kind: 'noop' };

  if (normalized === 'R' || normalized === 'H') {
    return { kind: 'refresh' };
  }

  if (normalized === 'SHOW ALL') {
    return { kind: 'show_all' };
  }

  if (isPillarCommand(normalized)) {
    return { kind: 'show_pillar', pillar: normalized };
  }

  if (normalized === 'COPY ALL') {
    return { kind: 'copy_all' };
  }

  if (normalized.startsWith('COPY ')) {
    const target = normalized.slice(5).trim();
    if (!target) return { kind: 'unknown', raw: input.trim() };

    if (isRuleId(target)) {
      return { kind: 'copy_rule', ruleId: target };
    }

    return { kind: 'copy_section', target };
  }

  if (isRuleId(normalized)) {
    return { kind: 'show_rule', ruleId: normalized };
  }

  return { kind: 'unknown', raw: input.trim() };
}
