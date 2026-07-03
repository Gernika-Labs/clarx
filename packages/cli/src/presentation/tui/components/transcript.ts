import { sliceLines } from '../viewport.js';
import { Text } from './text.js';

export interface TranscriptEntry {
  command: string;
  lines: string[];
  tone: 'neutral' | 'success' | 'warning';
}

export function flattenTranscript(entries: TranscriptEntry[]): string[] {
  if (entries.length === 0) return [];

  const lines = [Text({ children: 'Output', bold: true })];
  for (const entry of entries) {
    lines.push(Text({ children: `> ${entry.command}`, dim: true }));
    for (const line of entry.lines) {
      const intent =
        entry.tone === 'success' ? 'success' : entry.tone === 'warning' ? 'warning' : undefined;
      lines.push(Text({ children: line, intent, dim: !intent }));
    }
    lines.push('');
  }
  return lines;
}

export function Transcript({
  entries,
  scrollOffset = 0,
  maxLines,
}: {
  entries: TranscriptEntry[];
  scrollOffset?: number;
  maxLines?: number;
}): string | null {
  const lines = flattenTranscript(entries);
  if (lines.length === 0) return null;

  if (!maxLines || maxLines >= lines.length) {
    return lines.join('\n').trimEnd();
  }

  const slice = sliceLines(lines, scrollOffset, maxLines);
  const header = Text({
    children: `Output (${slice.scrollOffset + 1}-${slice.scrollOffset + slice.visible.length} of ${slice.total})`,
    bold: true,
  });

  return [header, ...slice.visible].join('\n').trimEnd();
}