import type { PillarRowView } from '../../score-report/model.js';
import { truncateEnd } from '../utils/truncate.js';
import { Text } from './text.js';

const LABEL_W = 18;
const BAR_W = 20;

function pillarIcon(pillar: PillarRowView): { glyph: string; intent: 'success' | 'warning' | 'danger' } {
  if (pillar.findings.some(f => f.severity === 'hard_failure')) {
    return { glyph: '×', intent: 'danger' };
  }
  if (pillar.findings.length > 0) {
    return { glyph: '▲', intent: 'warning' };
  }
  return { glyph: '✓', intent: 'success' };
}

function renderMiniBar(pillar: PillarRowView): string {
  const { filled, dots, tone } = pillar.bar;
  const scale = BAR_W / (filled + dots);
  const f = Math.round(filled * scale);
  const d = BAR_W - f;
  const fill = ' '.repeat(f);
  const dot = '⠂'.repeat(d);

  const bg =
    tone === 'bad'
      ? '\u001b[48;2;185;100;100m'
      : tone === 'warn'
        ? '\u001b[48;2;185;140;60m'
        : '\u001b[48;2;60;140;80m';

  return `${bg}${fill}\u001b[0m${Text({ children: dot, dim: true })}`;
}

function statusText(pillar: PillarRowView, max: number): string {
  if (pillar.findings.length === 0) {
    return Text({ children: 'no open items', dim: true });
  }
  const note = pillar.note.text === '✓' ? pillar.findings[0]!.message : pillar.note.text;
  return truncateEnd(note, max);
}

export function PillarNavRow({
  pillar,
  selected,
  width,
}: {
  pillar: PillarRowView;
  selected: boolean;
  width: number;
}): string {
  const icon = pillarIcon(pillar);
  const label = truncateEnd(pillar.label, LABEL_W).padEnd(LABEL_W);
  const bar = renderMiniBar(pillar);
  const score = Text({ children: String(pillar.score).padStart(3), bold: true });
  const noteMax = Math.max(12, width - LABEL_W - BAR_W - 16);
  const note = statusText(pillar, noteMax);

  const accent = selected ? Text({ children: '▎', intent: 'warning' }) : ' ';
  const rowBg = selected ? '\u001b[48;2;32;28;24m' : '';
  const rowReset = selected ? '\u001b[0m' : '';

  return `${rowBg}${accent} ${Text({ children: icon.glyph, intent: icon.intent })} ${label} ${bar} ${score}  ${note}${rowReset}`;
}