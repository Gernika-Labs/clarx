import type { Intent } from '../tokens.js';
import { stripAnsi, truncateEnd, truncateVisible } from '../utils/truncate.js';

export interface BoxProps {
  lines: string[];
  width: number;
  intent?: Intent;
}

function borderColor(intent: Intent | undefined): string {
  if (!intent) return '\u001b[2m';
  const rgb: Record<Intent, [number, number, number]> = {
    success: [60, 140, 80],
    warning: [185, 140, 60],
    danger: [185, 90, 90],
    info: [70, 130, 200],
    brand: [99, 180, 255],
    neutral: [100, 100, 110],
  };
  const [r, g, b] = rgb[intent];
  return `\u001b[38;2;${r};${g};${b}m`;
}

export function Box({ lines, width, intent }: BoxProps): string {
  const inner = Math.max(10, width - 2);
  const contentWidth = inner - 2;
  const color = borderColor(intent);
  const reset = '\u001b[0m';
  const top = `${color}┌${'─'.repeat(inner)}┐${reset}`;
  const bottom = `${color}└${'─'.repeat(inner)}┘${reset}`;

  const body = lines.map(line => {
    const fitted = truncateVisible(line, contentWidth);
    const visible = stripAnsi(fitted).length;
    const pad = Math.max(0, contentWidth - visible);
    return `${color}│${reset} ${fitted}${' '.repeat(pad)} ${color}│${reset}`;
  });

  return [top, ...body, bottom].join('\n');
}

export function boxLine(text: string, boxWidth: number): string {
  const contentWidth = Math.max(8, boxWidth - 4);
  return truncateEnd(text, contentWidth);
}