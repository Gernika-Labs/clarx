import { ClarxLogo } from './logo.js';
import { Text } from './text.js';

export function ScoreHeader({ score }: { score: number }): string {
  return `${ClarxLogo()}${Text({ children: ` score · ${score} / 100`, bold: true })}`;
}