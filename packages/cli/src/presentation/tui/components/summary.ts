import type { ScoreReportView } from '../../score-report/model.js';
import { Text } from './text.js';

export function FindingSummary({ summary }: { summary: ScoreReportView['summary'] }): string {
  const parts: string[] = [];
  if (summary.hardFailures) {
    parts.push(Text({ children: `Hard failures: ${summary.hardFailures}`, intent: 'danger' }));
  } else {
    parts.push(Text({ children: `Hard failures: ${summary.hardFailures}`, dim: true }));
  }
  if (summary.warnings) {
    parts.push(Text({ children: `Warnings: ${summary.warnings}`, intent: 'warning' }));
  } else {
    parts.push(Text({ children: `Warnings: ${summary.warnings}`, dim: true }));
  }
  if (summary.recommendations) {
    parts.push(Text({ children: `Recommendations: ${summary.recommendations}`, intent: 'info' }));
  } else {
    parts.push(Text({ children: `Recommendations: ${summary.recommendations}`, dim: true }));
  }
  return parts.join('\n');
}