import test from 'node:test';
import assert from 'node:assert/strict';
import { bodyViewportRows, footerLineCount, sliceBodyLines } from './layout.js';

test('sliceBodyLines pads to viewport height', () => {
  const slice = sliceBodyLines(['a', 'b', 'c'], 0, 5);
  assert.equal(slice.visible.length, 5);
  assert.equal(slice.visible[0], 'a');
  assert.equal(slice.visible[4], '');
});

test('bodyViewportRows reserves space for footer', () => {
  assert.equal(bodyViewportRows(24, footerLineCount('one\ntwo\n\nfour')), 20);
});