import test from 'node:test';
import assert from 'node:assert/strict';
import { sliceLines } from './viewport.js';

test('sliceLines returns a visible window with clamped scroll offset', () => {
  const lines = ['a', 'b', 'c', 'd', 'e'];
  const slice = sliceLines(lines, 10, 2);
  assert.deepEqual(slice.visible, ['d', 'e']);
  assert.equal(slice.scrollOffset, 3);
  assert.equal(slice.maxScroll, 3);
});