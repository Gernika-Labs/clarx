export interface ViewportSlice {
  visible: string[];
  total: number;
  scrollOffset: number;
  maxScroll: number;
}

export function sliceLines(lines: string[], scrollOffset: number, maxLines: number): ViewportSlice {
  const total = lines.length;
  const maxScroll = Math.max(0, total - maxLines);
  const offset = Math.min(Math.max(0, scrollOffset), maxScroll);
  return {
    visible: lines.slice(offset, offset + maxLines),
    total,
    scrollOffset: offset,
    maxScroll,
  };
}

export function transcriptHeight(termRows: number | undefined): number {
  const rows = termRows ?? 24;
  return Math.max(4, Math.min(12, rows - 18));
}