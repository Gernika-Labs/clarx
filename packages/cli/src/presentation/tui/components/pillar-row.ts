import type { PillarRowView } from '../../score-report/model.js';
import { padName } from '../../score-report/model.js';
import { Text } from './text.js';

function renderBar(pillar: PillarRowView): string {
  const { filled, dots, tone } = pillar.bar;
  const fill = ' '.repeat(filled);
  const dot = '⠂'.repeat(dots);

  const bg =
    tone === 'bad'
      ? '\u001b[48;2;185;100;100m'
      : tone === 'warn'
        ? '\u001b[48;2;185;160;75m'
        : '\u001b[48;2;205;205;210m';

  return `${bg}${fill}\u001b[0m${Text({ children: dot, dim: true })}`;
}

function renderNote(pillar: PillarRowView): string {
  const { text, tone } = pillar.note;
  if (tone === 'ok') return Text({ children: text, intent: 'success' });
  if (tone === 'bad') return Text({ children: text, intent: 'danger' });
  if (tone === 'warn') return Text({ children: text, intent: 'warning' });
  return Text({ children: text, dim: true });
}

export function PillarRow({ pillar }: { pillar: PillarRowView }): string {
  const name = padName(pillar.label);
  const bar = renderBar(pillar);
  const score = Text({ children: String(pillar.score).padStart(4), bold: true });
  const note = renderNote(pillar);
  return `${name}  ${bar}  ${score}  ${note}`;
}