import { stripAnsi } from './utils/truncate.js';

export function findSelectedIssueLineRange(
  body: string,
  ruleId: string,
): { start: number; end: number } | null {
  const lines = body.split('\n');
  let start = -1;

  for (let i = 0; i < lines.length; i++) {
    const plain = stripAnsi(lines[i]!);
    if (plain.startsWith('›') && plain.includes(`${ruleId}  `)) {
      start = i;
      break;
    }
  }

  if (start < 0) {
    for (let i = 0; i < lines.length; i++) {
      const plain = stripAnsi(lines[i]!);
      if (plain.includes(`${ruleId}  `) && /WARN|REC|FAIL/.test(plain)) {
        start = i;
        break;
      }
    }
  }

  if (start < 0) return null;

  let end = start;
  for (let i = start; i < lines.length; i++) {
    if (stripAnsi(lines[i]!).includes('└')) {
      end = i;
      break;
    }
  }

  return { start, end };
}

export function scrollToRevealRange(
  range: { start: number; end: number },
  scroll: number,
  viewport: number,
  maxScroll: number,
): number {
  if (range.start < scroll) return range.start;
  if (range.end >= scroll + viewport) {
    return Math.min(maxScroll, range.end - viewport + 1);
  }
  return scroll;
}