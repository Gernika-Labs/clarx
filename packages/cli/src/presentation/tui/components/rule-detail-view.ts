import type { RuleExplanation } from '../../../commands/explain.js';
import type { PillarFindingView } from '../../score-report/model.js';
import { Badge, severityToBadge } from './badge.js';
import { Box } from './box.js';
import { Text } from './text.js';
import { truncateEnd, terminalWidth } from '../utils/truncate.js';

function severityIntent(severity: string): 'danger' | 'warning' | 'info' {
  if (severity === 'hard_failure') return 'danger';
  if (severity === 'warning') return 'warning';
  return 'info';
}

function wrapText(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width) {
      if (current) lines.push(current);
      current = word.length > width ? truncateEnd(word, width) : word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

export function RuleDetailView({
  rule,
  finding,
  engineMessage,
}: {
  rule: RuleExplanation;
  finding?: PillarFindingView;
  engineMessage?: string;
}): string {
  const width = Math.min(terminalWidth() - 2, 76);
  const contentWidth = width - 4;
  const intent = severityIntent(rule.severity);
  const badge = severityToBadge(
    rule.severity === 'hard_failure'
      ? 'hard_failure'
      : rule.severity === 'warning'
        ? 'warning'
        : 'recommendation',
  );

  const lines: string[] = [
    Text({ children: 'Rule details', dim: true }),
    '',
    `${Text({ children: rule.id, bold: true, intent })}  ${Badge({ keyword: badge })}  ${Text({ children: rule.title, bold: true })}`,
    '',
    `${Text({ children: 'Pillar', dim: true })}     ${Text({ children: rule.pillar, intent: 'brand' })}`,
    `${Text({ children: 'Severity', dim: true })}   ${Text({ children: rule.severity.replace('_', ' '), intent })}`,
  ];

  if (engineMessage) {
    lines.push('');
    lines.push(Box({
      width,
      intent,
      lines: [
        Text({ children: 'Finding', bold: true, intent }),
        ...wrapText(engineMessage, contentWidth).map(line => Text({ children: line })),
      ],
    }));
  }

  if (finding?.locations.length) {
    lines.push('');
    lines.push(Text({ children: 'Locations', bold: true }));
    for (const loc of finding.locations.slice(0, 8)) {
      const detail = loc.detail ? ` · ${loc.detail}` : '';
      lines.push(`  ${Text({ children: '→', dim: true })} ${loc.path}${Text({ children: detail, dim: true })}`);
    }
    if (finding.locations.length > 8) {
      lines.push(`  ${Text({ children: `… ${finding.locations.length - 8} more`, dim: true })}`);
    }
  }

  lines.push('');
  lines.push(Text({ children: 'Why this matters', bold: true, intent: 'warning' }));
  for (const line of wrapText(rule.why, contentWidth)) {
    lines.push(Text({ children: line }));
  }

  lines.push('');
  lines.push(Text({ children: 'How to fix it', bold: true, intent: 'success' }));
  lines.push(Box({
    width,
    intent: 'success',
    lines: wrapText(rule.fix, contentWidth).map(line => Text({ children: line })),
  }));

  return lines.join('\n');
}