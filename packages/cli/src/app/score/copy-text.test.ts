import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCopyAllText, buildCopySectionText, normalizeCopySectionTarget } from './copy-text.js';
import { makeResult, makeRule } from './test-helpers.js';

test('buildCopyAllText returns a no-issues message when there are no failing rules', () => {
  const result = makeResult({ score: 92 });
  assert.equal(buildCopyAllText(result), 'Clarx AI-First Score: 92/100 — No issues found.');
});

test('buildCopyAllText includes grouped section headings', () => {
  const result = makeResult({
    score: 71,
    rules: [
      makeRule('B1', { severity: 'hard_failure' }),
      makeRule('C2', { severity: 'warning' }),
      makeRule('E2', { severity: 'recommendation' }),
    ],
  });

  const text = buildCopyAllText(result);

  assert.match(text, /HARD FAILURES/);
  assert.match(text, /WARNINGS/);
  assert.match(text, /RECOMMENDATIONS/);
  assert.match(text, /B1 — No circular imports between packages or workspaces/);
});

test('normalizeCopySectionTarget handles aliases', () => {
  assert.equal(normalizeCopySectionTarget('f'), 'hard_failure');
  assert.equal(normalizeCopySectionTarget('warnings'), 'warning');
  assert.equal(normalizeCopySectionTarget('recs'), 'recommendation');
  assert.equal(normalizeCopySectionTarget('nope'), null);
});

test('buildCopySectionText returns section text for aliases and null for unknown sections', () => {
  const result = makeResult({
    score: 80,
    rules: [makeRule('C2', { severity: 'warning' })],
  });

  assert.match(buildCopySectionText(result, 'w') ?? '', /WARNINGS/);
  assert.equal(buildCopySectionText(result, 'invalid'), null);
});
