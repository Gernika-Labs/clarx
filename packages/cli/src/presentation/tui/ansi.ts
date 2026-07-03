import type { Intent } from './tokens.js';
import { INTENT_RGB } from './tokens.js';

export interface PaintOptions {
  bold?: boolean;
  dim?: boolean;
  intent?: Intent;
  rgb?: readonly [number, number, number];
}

export function paint(text: string, opts: PaintOptions = {}): string {
  const codes: string[] = [];
  if (opts.bold) codes.push('1');
  if (opts.dim) codes.push('2');
  if (opts.rgb) codes.push(`38;2;${opts.rgb[0]};${opts.rgb[1]};${opts.rgb[2]}`);
  else if (opts.intent) {
    const rgb = INTENT_RGB[opts.intent];
    codes.push(`38;2;${rgb[0]};${rgb[1]};${rgb[2]}`);
  }
  if (codes.length === 0) return text;
  return `\u001b[${codes.join(';')}m${text}\u001b[0m`;
}

export function joinLines(lines: Array<string | null | undefined | false>): string {
  return lines.filter((line): line is string => Boolean(line)).join('\n');
}

export const ALT_SCREEN_ON = '\x1b[?1049h';
export const ALT_SCREEN_OFF = '\x1b[?1049l';
export const HIDE_CURSOR = '\x1b[?25l';
export const SHOW_CURSOR = '\x1b[?25h';
export const HOME = '\x1b[H';
export const CLEAR = '\x1b[2J';