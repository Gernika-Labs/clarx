import type { ScoreReportView } from '../../score-report/model.js';
import { Text } from './text.js';

export function VerboseRules({ groups }: { groups: ScoreReportView['verboseGroups'] }): string | null {
  if (groups.length === 0) return null;

  const lines: string[] = [];
  for (const group of groups) {
    const intent =
      group.label === 'Hard failures'
        ? 'danger'
        : group.label === 'Warnings'
          ? 'warning'
          : undefined;
    lines.push(Text({ children: `${group.label} (${group.rules.length})`, bold: true, intent }));
    for (const rule of group.rules) {
      lines.push(`  ${Text({ children: rule.id, bold: true })}  ${Text({ children: rule.message, intent, dim: !intent })}`);
      if (rule.locations) {
        for (const loc of rule.locations.slice(0, 5)) {
          const detail = loc.detail ? ` — ${loc.detail}` : '';
          lines.push(`      ${Text({ children: '→', dim: true })} ${loc.path}${Text({ children: detail, dim: true })}`);
        }
        if (rule.locations.length > 5) {
          lines.push(`      ${Text({ children: `… and ${rule.locations.length - 5} more`, dim: true })}`);
        }
      }
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}