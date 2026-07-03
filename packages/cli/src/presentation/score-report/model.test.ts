import test from 'node:test';
import assert from 'node:assert/strict';
import { buildScoreReportView } from './model.js';
import { makeResult, makeRule } from '../../app/score/test-helpers.js';

test('buildScoreReportView summarizes failing rules', () => {
  const result = makeResult({
    score: 72,
    rules: [
      makeRule('B1', { severity: 'hard_failure' }),
      makeRule('C2', { severity: 'warning' }),
      makeRule('E4', { severity: 'recommendation' }),
    ],
  });

  const view = buildScoreReportView(result);
  assert.equal(view.score, 72);
  assert.equal(view.summary.hardFailures, 1);
  assert.equal(view.summary.warnings, 1);
  assert.equal(view.summary.recommendations, 1);
  assert.equal(view.topRule?.id, 'B1');
  assert.equal(view.pillars.length, 5);
});