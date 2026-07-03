import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenTranscript, Transcript } from './components/transcript.js';

test('flattenTranscript preserves command output lines', () => {
  const lines = flattenTranscript([
    { command: 'C2', lines: ['explain:C2'], tone: 'neutral' },
  ]);
  assert.ok(lines.length >= 2);
  assert.match(lines.join('\n'), /> C2/);
  assert.match(lines.join('\n'), /explain:C2/);
});

test('Transcript scrolls when maxLines is smaller than content', () => {
  const entries = Array.from({ length: 8 }, (_, i) => ({
    command: `cmd-${i}`,
    lines: [`line-${i}`],
    tone: 'neutral' as const,
  }));
  const output = Transcript({ entries, scrollOffset: 2, maxLines: 4 }) ?? '';
  assert.match(output, /of \d+\)/);
  assert.doesNotMatch(output, /> cmd-0/);
});