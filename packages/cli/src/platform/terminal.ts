export function clearScreen(): void {
  process.stdout.write('\x1b[2J\x1b[H');
}
