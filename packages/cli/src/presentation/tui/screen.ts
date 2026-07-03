import { ALT_SCREEN_OFF, ALT_SCREEN_ON, CLEAR, HIDE_CURSOR, HOME, SHOW_CURSOR } from './ansi.js';

export class TerminalScreen {
  private mounted = false;

  mount(): void {
    if (!process.stdout.isTTY || this.mounted) return;
    process.stdout.write(ALT_SCREEN_ON + HIDE_CURSOR);
    this.mounted = true;
  }

  render(frame: string): void {
    if (!process.stdout.isTTY) {
      process.stdout.write(frame + '\n');
      return;
    }
    process.stdout.write(HOME + CLEAR + frame);
  }

  unmount(): void {
    if (!process.stdout.isTTY || !this.mounted) return;
    process.stdout.write(SHOW_CURSOR + ALT_SCREEN_OFF);
    this.mounted = false;
  }
}