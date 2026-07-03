import { paint, type PaintOptions } from '../ansi.js';
import type { Intent } from '../tokens.js';

export interface TextProps {
  children: string;
  bold?: boolean;
  dim?: boolean;
  intent?: Intent;
  rgb?: readonly [number, number, number];
}

export function Text({ children, bold, dim, intent, rgb }: TextProps): string {
  const opts: PaintOptions = {};
  if (bold) opts.bold = true;
  if (dim) opts.dim = true;
  if (rgb) opts.rgb = rgb;
  else if (intent) opts.intent = intent;
  return paint(children, opts);
}