const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const isTTY = process.stdout.isTTY;

export class Spinner {
  private frame = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private text: string;

  constructor(text: string) {
    this.text = text;
  }

  start(): this {
    if (!isTTY) return this;
    process.stdout.write('\x1b[?25l'); // hide cursor
    this.timer = setInterval(() => {
      const f = FRAMES[this.frame % FRAMES.length]!;
      process.stdout.write(`\r\x1b[36m${f}\x1b[0m \x1b[2m${this.text}\x1b[0m`);
      this.frame++;
    }, 80);
    return this;
  }

  update(text: string): void {
    this.text = text;
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (isTTY) {
      process.stdout.write('\r\x1b[2K'); // clear line
      process.stdout.write('\x1b[?25h'); // show cursor
    }
  }
}
