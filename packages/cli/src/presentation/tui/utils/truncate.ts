export function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, '');
}

export function truncateEnd(text: string, max: number): string {
  if (max <= 3) return text.slice(0, max);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function truncateVisible(text: string, max: number): string {
  const plain = stripAnsi(text);
  if (plain.length <= max) return text;
  const stylePrefix = text.match(/^(\u001b\[[0-9;]*m)+/)?.[0] ?? '';
  return `${stylePrefix}${truncateEnd(plain, max)}\u001b[0m`;
}

export function terminalWidth(): number {
  return process.stdout.columns ?? 80;
}