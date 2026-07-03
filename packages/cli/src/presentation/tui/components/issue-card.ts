import type { PillarFindingView } from '../../score-report/model.js';
import { getRuleFix } from '../../../commands/explain.js';
import { stripAnsi, truncateEnd } from '../utils/truncate.js';
import { Badge, severityToBadge } from './badge.js';
import { Box, boxLine } from './box.js';
import { Text } from './text.js';

function headerLine(finding: PillarFindingView, contentWidth: number, selected: boolean): string {
  const badge = severityToBadge(finding.severity);
  const intent = badge === 'fail' ? 'danger' : badge === 'warn' ? 'warning' : 'info';
  const prefix = selected ? Text({ children: '› ', intent: 'brand' }) : '';
  const id = Text({ children: finding.id, bold: true, intent });
  const badgeText = Badge({ keyword: badge });
  const reserved = stripAnsi(`${prefix}${id}  ${badgeText}  `).length + 1;
  const message = truncateEnd(finding.message, Math.max(8, contentWidth - reserved));
  return `${prefix}${id}  ${badgeText}  ${message}`;
}

export function IssueCard({
  finding,
  width,
  selected = false,
}: {
  finding: PillarFindingView;
  width: number;
  selected?: boolean;
}): string {
  const badge = severityToBadge(finding.severity);
  const intent = badge === 'fail' ? 'danger' : badge === 'warn' ? 'warning' : 'info';
  const contentWidth = Math.max(8, width - 4);
  const loc = finding.locations[0];
  const fileLine = loc
    ? `${loc.path}${loc.detail ? ` · ${loc.detail}` : ''}`
    : 'No file location';
  const fix = getRuleFix(finding.id) ?? 'Run clarx explain for guidance.';

  const lines = [
    headerLine(finding, contentWidth, selected),
    boxLine(fileLine, width),
    Text({ children: boxLine(fix, width), dim: true }),
  ];

  return Box({ lines, width, intent: selected ? intent : undefined });
}