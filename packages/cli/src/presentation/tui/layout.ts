import { stripAnsi } from './utils/truncate.js';

export function footerLineCount(footer: string): number {
  return footer.split('\n').length;
}

export function bodyViewportRows(termRows: number | undefined, footerLines: number): number {
  const rows = termRows ?? 24;
  return Math.max(1, rows - footerLines);
}

export function sliceBodyLines(
  bodyLines: string[],
  scrollOffset: number,
  maxLines: number,
): { visible: string[]; maxScroll: number; scrollOffset: number } {
  const maxScroll = Math.max(0, bodyLines.length - maxLines);
  const offset = Math.min(Math.max(0, scrollOffset), maxScroll);
  const visible = bodyLines.slice(offset, offset + maxLines);
  while (visible.length < maxLines) visible.push('');
  return { visible, maxScroll, scrollOffset: offset };
}

export function promptCursorPosition(commandBuffer: string, footerStartRow: number): {
  row: number;
  col: number;
} {
  const prefix = '› ';
  const col = prefix.length + commandBuffer.length + 1;
  return { row: footerStartRow + 1, col };
}

export function maxBodyScroll(body: string, termRows: number | undefined, footer: string): number {
  const footerLines = footerLineCount(footer);
  const bodyMax = bodyViewportRows(termRows, footerLines);
  return Math.max(0, body.split('\n').length - bodyMax);
}