import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommandHistoryState, historyDown, historyUp, pushCommandHistory } from './history.js';

test('pushCommandHistory stores commands and resets navigation state', () => {
  const initial = createCommandHistoryState();
  const next = pushCommandHistory(initial, 'show all');
  assert.deepEqual(next.entries, ['show all']);
  assert.equal(next.index, null);
});

test('historyUp navigates backward through entries and preserves draft', () => {
  let state = createCommandHistoryState();
  state = pushCommandHistory(state, 'show all');
  state = pushCommandHistory(state, 'copy all');

  const first = historyUp(state, 'sho');
  assert.equal(first.buffer, 'copy all');
  assert.equal(first.state.draft, 'sho');

  const second = historyUp(first.state, first.buffer);
  assert.equal(second.buffer, 'show all');
});

test('historyDown restores draft after reaching the end', () => {
  let state = createCommandHistoryState();
  state = pushCommandHistory(state, 'show all');
  state = pushCommandHistory(state, 'copy all');

  const up = historyUp(state, 'draft');
  const down = historyDown(up.state);
  assert.equal(down.buffer, 'draft');
  assert.equal(down.state.index, null);
});