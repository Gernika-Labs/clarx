import { ALT_SCREEN_OFF, ALT_SCREEN_ON, CLEAR, HIDE_CURSOR, HOME, SHOW_CURSOR } from './ansi.js';
import { bodyViewportRows, footerLineCount, promptCursorPosition, sliceBodyLines } from './layout.js';

export interface SplitFrame {
  body: string;
  footer: string;
  commandBuffer?: string;
  bodyScroll?: number;
  showPrompt?: boolean;
}

export class TerminalScreen {
  private mounted = false;

  mount(): void {
    if (!process.stdout.isTTY || this.mounted) return;
    process.stdout.write(ALT_SCREEN_ON + HIDE_CURSOR);
    this.mounted = true;
  }

  render(frame: string): void {
    this.renderSplit({ body: frame, footer: '' });
  }

  renderSplit({ body, footer, commandBuffer = '', bodyScroll = 0, showPrompt = true }: SplitFrame): void {
    if (!process.stdout.isTTY) {
      process.stdout.write([body, footer].filter(Boolean).join('\n') + '\n');
      return;
    }

    const rows = process.stdout.rows ?? 24;
    const footerLines = footer ? footerLineCount(footer) : 0;
    const bodyMax = bodyViewportRows(rows, footerLines);
    const bodyLines = body.split('\n');
    const slice = sliceBodyLines(bodyLines, bodyScroll, bodyMax);

    process.stdout.write(HOME + CLEAR);
    process.stdout.write(slice.visible.join('\n'));

    if (footerLines > 0) {
      const footerStartRow = rows - footerLines + 1;
      footer.split('\n').forEach((line, index) => {
        process.stdout.write(`\x1b[${footerStartRow + index};1H\x1b[2K${line}`);
      });

      if (showPrompt) {
        const cursor = promptCursorPosition(commandBuffer, footerStartRow);
        process.stdout.write(`\x1b[${cursor.row};${cursor.col}H${SHOW_CURSOR}`);
      }
    }
  }

  unmount(): void {
    if (!process.stdout.isTTY || !this.mounted) return;
    process.stdout.write(SHOW_CURSOR + ALT_SCREEN_OFF);
    this.mounted = false;
  }
}