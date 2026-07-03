import test from 'node:test';
import assert from 'node:assert/strict';
import { Badge, severityToBadge } from './badge.js';

test('severityToBadge maps severities to keywords', () => {
  assert.equal(severityToBadge('hard_failure'), 'fail');
  assert.equal(severityToBadge('warning'), 'warn');
  assert.equal(severityToBadge('recommendation'), 'rec');
});

test('Badge renders semantic label', () => {
  assert.match(Badge({ keyword: 'warn' }), /WARN/);
});