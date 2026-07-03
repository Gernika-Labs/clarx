import test from 'node:test';
import assert from 'node:assert/strict';
import { findSelectedIssueLineRange, scrollToRevealRange } from './body-scroll.js';

test('findSelectedIssueLineRange locates selected issue card', () => {
  const body = [
    'PILLARS',
    '',
    'Context efficiency',
    '',
    '┌────┐',
    '› C2  WARN  big file',
    '│ path │',
    '│ fix  │',
    '└────┘',
    '',
    '┌────┐',
    'C3  WARN  imports',
    '└────┘',
  ].join('\n');

  const range = findSelectedIssueLineRange(body, 'C2');
  assert.deepEqual(range, { start: 5, end: 8 });
});

test('scrollToRevealRange moves down when issue is below viewport', () => {
  const next = scrollToRevealRange({ start: 20, end: 24 }, 0, 10, 30);
  assert.equal(next, 15);
});

test('scrollToRevealRange moves up when issue is above viewport', () => {
  const next = scrollToRevealRange({ start: 2, end: 6 }, 10, 10, 30);
  assert.equal(next, 2);
});

test('scrollToRevealRange keeps offset when issue is already visible', () => {
  const next = scrollToRevealRange({ start: 5, end: 8 }, 3, 10, 30);
  assert.equal(next, 3);
});