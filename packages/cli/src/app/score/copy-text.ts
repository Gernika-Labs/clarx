import type { Severity } from '@clarxai/engine';
import { getRuleCopyText } from '../../commands/explain.js';
import { bucketFindings, getFailingRules } from './findings.js';
import type { ScoreResult } from './types.js';

const COPY_SECTION_LABELS: Record<Severity, string> = {
  hard_failure: 'HARD FAILURES',
  warning: 'WARNINGS',
  recommendation: 'RECOMMENDATIONS',
};

export function normalizeCopySectionTarget(target: string): Severity | null {
  const normalized = target.trim().toUpperCase();

  if (normalized === 'FAILURES' || normalized === 'FAILURE' || normalized === 'F') {
    return 'hard_failure';
  }

  if (normalized === 'WARNINGS' || normalized === 'WARNING' || normalized === 'W') {
    return 'warning';
  }

  if (
    normalized === 'RECS' ||
    normalized === 'REC' ||
    normalized === 'RECOMMENDATIONS' ||
    normalized === 'RECOMMENDATION'
  ) {
    return 'recommendation';
  }

  return null;
}

export function buildCopyAllText(result: ScoreResult): string {
  const failing = getFailingRules(result);
  if (failing.length === 0) return `Clarx AI-Readiness: ${result.score}/100 — No issues found.`;

  const sep = '─'.repeat(56);
  const sections: string[] = [
    `Clarx AI-Readiness: ${result.score}/100`,
    `Confidence: ${result.confidence}`,
    '',
  ];

  const buckets = bucketFindings(result);
  const groups: Array<[Severity, typeof buckets.hardFailures]> = [
    ['hard_failure', buckets.hardFailures],
    ['warning', buckets.warnings],
    ['recommendation', buckets.recommendations],
  ];

  for (const [severity, group] of groups) {
    if (group.length === 0) continue;
    sections.push(COPY_SECTION_LABELS[severity]);
    sections.push(sep);
    for (const rule of group) {
      const copy = getRuleCopyText(rule.id);
      if (copy) sections.push(copy);
      sections.push('');
    }
  }

  return sections.join('\n');
}

export function buildCopySectionText(result: ScoreResult, target: string): string | null {
  const severity = normalizeCopySectionTarget(target);
  if (!severity) return null;

  const buckets = bucketFindings(result);
  const group = severity === 'hard_failure'
    ? buckets.hardFailures
    : severity === 'warning'
    ? buckets.warnings
    : buckets.recommendations;

  if (group.length === 0) {
    const label = severity === 'hard_failure' ? 'failures' : severity === 'warning' ? 'warnings' : 'recommendations';
    return `Clarx AI-Readiness: ${result.score}/100 — No ${label}.`;
  }

  const sep = '─'.repeat(56);
  const sections: string[] = [
    `Clarx AI-Readiness: ${result.score}/100`,
    `Confidence: ${result.confidence}`,
    '',
    COPY_SECTION_LABELS[severity],
    sep,
  ];

  for (const rule of group) {
    const copy = getRuleCopyText(rule.id);
    if (copy) sections.push(copy);
    sections.push('');
  }

  return sections.join('\n');
}
