import test from 'node:test';
import assert from 'node:assert/strict';
import { getScoreExitCode } from './exit-code.js';
import { makeResult } from './test-helpers.js';

test('getScoreExitCode returns 2 when hard failures exist', () => {
  const result = makeResult({ score: 99, hardFailures: ['B1'] });
  assert.equal(getScoreExitCode(result, { minScore: 50, minPillarScore: 50 }), 2);
});

test('getScoreExitCode returns 1 when overall score is below threshold', () => {
  const result = makeResult({ score: 69 });
  assert.equal(getScoreExitCode(result, { minScore: 70, minPillarScore: null }), 1);
});

test('getScoreExitCode returns 1 when any pillar score is below threshold', () => {
  const result = makeResult({
    score: 88,
    pillarScores: {
      context_efficiency: 64,
    },
  });

  assert.equal(getScoreExitCode(result, { minScore: null, minPillarScore: 70 }), 1);
});

test('getScoreExitCode returns 0 for a clean passing result', () => {
  const result = makeResult({ score: 88 });
  assert.equal(getScoreExitCode(result, { minScore: 70, minPillarScore: 70 }), 0);
});
