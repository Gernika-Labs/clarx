import { CLARX_NEON_STOPS } from '../tokens.js';

function interpolateChannel(start: number, end: number, ratio: number) {
  return Math.round(start + (end - start) * ratio);
}

function interpolateColor(index: number, total: number): readonly [number, number, number] {
  if (total <= 1) return CLARX_NEON_STOPS[0];

  const position = index / (total - 1);
  const segmentCount = CLARX_NEON_STOPS.length - 1;
  const scaled = position * segmentCount;
  const segment = Math.min(Math.floor(scaled), segmentCount - 1);
  const ratio = scaled - segment;
  const start = CLARX_NEON_STOPS[segment]!;
  const end = CLARX_NEON_STOPS[segment + 1]!;

  return [
    interpolateChannel(start[0], end[0], ratio),
    interpolateChannel(start[1], end[1], ratio),
    interpolateChannel(start[2], end[2], ratio),
  ] as const;
}

export function ClarxLogo(): string {
  const text = 'clarx ai';
  const chars = Array.from(text);
  return chars
    .map((char, index) => {
      const [r, g, b] = interpolateColor(index, chars.length);
      return `\u001b[38;2;${r};${g};${b}m${char}`;
    })
    .join('') + '\u001b[0m';
}