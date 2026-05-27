import test from 'node:test';
import assert from 'node:assert/strict';
import { formatText } from './text.js';
import { makeResult, makeRule } from '../../app/score/test-helpers.js';

test('formatText includes score header and explain hint', () => {
  const result = makeResult({
    score: 78,
    rules: [makeRule('C2', { severity: 'warning', message: 'Large file' })],
  });

  const output = formatText(result);

  assert.match(output, /clarx v0\.1\.0-test/);
  assert.match(output, /Overall score/);
  assert.match(output, /78 \/ 100/);
  assert.match(output, /clarx explain C2/);
});

test('formatText verbose mode includes failing locations', () => {
  const result = makeResult({
    rules: [
      makeRule('B1', {
        severity: 'hard_failure',
        message: 'Cycle found',
        locations: [{ path: 'packages/a/index.ts', detail: 'imports b' }],
      }),
    ],
  });

  const output = formatText(result, { verbose: true });

  assert.match(output, /Hard failures \(1\)/);
  assert.match(output, /packages\/a\/index\.ts/);
});
