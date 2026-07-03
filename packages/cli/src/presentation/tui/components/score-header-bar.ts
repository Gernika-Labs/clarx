import { ClarxLogo } from './logo.js';
import { Text } from './text.js';

export function ScoreHeaderBar({ score }: { score: number }): string {
  const width = process.stdout.columns ?? 80;
  const scoreText = Text({ children: `${score} / 100`, intent: 'success', bold: true });
  const logo = `${ClarxLogo()}${Text({ children: ' score', bold: true })}`;
  const pad = Math.max(1, width - stripAnsi(logo).length - stripAnsi(scoreText).length);
  return `${logo}${' '.repeat(pad)}${scoreText}`;
}

function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, '');
}