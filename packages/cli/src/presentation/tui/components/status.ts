import { Text } from './text.js';

export function StatusLine({ message, tone }: { message: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }): string {
  const intent = tone === 'neutral' ? undefined : tone;
  return Text({ children: message, intent, dim: tone === 'neutral' });
}