import test from 'node:test';
import assert from 'node:assert/strict';
import { formatJson } from './json.js';
import { makeResult } from '../../app/score/test-helpers.js';

test('formatJson serializes the analysis result deterministically', () => {
  const result = makeResult({ score: 88 });
  const output = formatJson(result);
  const parsed = JSON.parse(output) as { score: number; version: string };

  assert.equal(parsed.score, 88);
  assert.equal(parsed.version, '0.1.0-test');
});
