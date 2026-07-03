import test from 'node:test';
import assert from 'node:assert/strict';
import { Box } from './box.js';
import { stripAnsi } from '../utils/truncate.js';
import { Text } from './text.js';

test('Box keeps right border aligned for long styled lines', () => {
  const width = 60;
  const inner = width - 2;
  const longLine = `${Text({ children: 'B4', bold: true, intent: 'info' })}  ${'x'.repeat(120)}`;
  const rendered = Box({ lines: [longLine], width, intent: 'info' });
  const rows = rendered.split('\n');

  for (const row of rows) {
    assert.equal(stripAnsi(row).length, inner + 2, `row width mismatch: ${stripAnsi(row)}`);
  }
  assert.match(rows[0]!, /┐/);
  assert.match(rows.at(-1)!, /┘/);
  assert.match(rows[1]!, /│.*│/);
});