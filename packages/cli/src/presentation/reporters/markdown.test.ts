import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMarkdown } from './markdown.js';
import { makeResult, makeRule } from '../../app/score/test-helpers.js';

test('formatMarkdown renders score summary and findings sections', () => {
  const result = makeResult({
    score: 64,
    rules: [
      makeRule('B1', { severity: 'hard_failure', message: 'Cycle found' }),
      makeRule('C2', { severity: 'warning', message: 'Large file' }),
    ],
  });

  const output = formatMarkdown(result);

  assert.match(output, /## Clarx AI-First Score/);
  assert.match(output, /### 🔴 Hard Failures/);
  assert.match(output, /### 🟡 Warnings/);
  assert.match(output, /\*\*`B1`\*\* — Cycle found/);
});

test('formatMarkdown renders all-passed state', () => {
  const result = makeResult({ score: 95 });
  const output = formatMarkdown(result);
  assert.match(output, /### ✅ All checks passed/);
});
