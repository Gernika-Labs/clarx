import { Text } from './text.js';

export function CommandPrompt({ buffer }: { buffer: string }): string {
  const hint = buffer.length === 0
    ? Text({ children: 'run a command… (try: C3, show all, copy, r)', dim: true })
    : '';
  return `${Text({ children: '› ', intent: 'info' })}${buffer}${hint}`;
}