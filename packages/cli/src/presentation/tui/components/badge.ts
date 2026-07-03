import type { Intent } from '../tokens.js';
import { Text } from './text.js';

export const BADGE_KEYWORDS = ['warn', 'rec', 'fail', 'ok'] as const;
export type BadgeKeyword = (typeof BADGE_KEYWORDS)[number];

const KEYWORD_MAP: Record<BadgeKeyword, { label: string; intent: Intent }> = {
  warn: { label: 'WARN', intent: 'warning' },
  rec: { label: 'REC', intent: 'info' },
  fail: { label: 'FAIL', intent: 'danger' },
  ok: { label: 'OK', intent: 'success' },
};

export function severityToBadge(severity: 'hard_failure' | 'warning' | 'recommendation'): BadgeKeyword {
  if (severity === 'hard_failure') return 'fail';
  if (severity === 'warning') return 'warn';
  return 'rec';
}

export function Badge({ keyword }: { keyword: BadgeKeyword }): string {
  const mapped = KEYWORD_MAP[keyword];
  return Text({ children: mapped.label, intent: mapped.intent, bold: true });
}