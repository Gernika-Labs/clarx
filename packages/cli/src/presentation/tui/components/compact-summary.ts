import type { ScoreReportView } from '../../score-report/model.js';
import { Text } from './text.js';

export function CompactSummary({ summary }: { summary: ScoreReportView['summary'] }): string {
  const parts = [
    `${Text({ children: '×', intent: summary.hardFailures ? 'danger' : 'neutral' })} ${Text({
      children: `${summary.hardFailures} ${summary.hardFailures === 1 ? 'failure' : 'failures'}`,
      intent: summary.hardFailures ? 'danger' : undefined,
      dim: summary.hardFailures === 0,
    })}`,
    `${Text({ children: '▲', intent: summary.warnings ? 'warning' : 'neutral' })} ${Text({
      children: `${summary.warnings} ${summary.warnings === 1 ? 'warning' : 'warnings'}`,
      intent: summary.warnings ? 'warning' : undefined,
      dim: summary.warnings === 0,
    })}`,
    `${Text({ children: '·', intent: 'info' })} ${Text({
      children: `${summary.recommendations} ${summary.recommendations === 1 ? 'recommendation' : 'recommendations'}`,
      intent: summary.recommendations ? 'info' : undefined,
      dim: summary.recommendations === 0,
    })}`,
  ];
  return parts.join(`  ${Text({ children: '·', dim: true })}  `);
}