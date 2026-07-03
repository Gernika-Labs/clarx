import type { PillarRowView } from '../../score-report/model.js';
import { IssueCard } from './issue-card.js';
import { PillarNavRow } from './pillar-nav-row.js';
import { Text } from './text.js';

export function PillarList({
  pillars,
  selectedIndex,
  selectedIssueIndex,
  width,
  filterQuery,
}: {
  pillars: PillarRowView[];
  selectedIndex: number;
  selectedIssueIndex: number;
  width: number;
  filterQuery?: string;
}): string {
  const query = filterQuery?.trim().toLowerCase() ?? '';
  const lines: string[] = [Text({ children: 'PILLARS', bold: true }), ''];

  for (let i = 0; i < pillars.length; i++) {
    const pillar = pillars[i]!;
    const matchesPillar =
      !query ||
      pillar.label.toLowerCase().includes(query) ||
      pillar.findings.some(f =>
        f.id.toLowerCase().includes(query) ||
        f.message.toLowerCase().includes(query),
      );

    if (query && !matchesPillar) continue;

    lines.push(PillarNavRow({ pillar, selected: i === selectedIndex, width }));

    if (i === selectedIndex) {
      const findings = pillar.findings.filter(f =>
        !query ||
        f.id.toLowerCase().includes(query) ||
        f.message.toLowerCase().includes(query) ||
        pillar.label.toLowerCase().includes(query),
      );

      if (findings.length > 0) {
        lines.push('');
        for (let j = 0; j < findings.length; j++) {
          lines.push(IssueCard({
            finding: findings[j]!,
            width: Math.min(width - 2, 72),
            selected: j === selectedIssueIndex,
          }));
          if (j < findings.length - 1) lines.push('');
        }
        lines.push('');
      } else {
        lines.push('');
      }
    } else {
      lines.push('');
    }
  }

  return lines.join('\n').trimEnd();
}