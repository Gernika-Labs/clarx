import test from 'node:test';
import assert from 'node:assert/strict';
import { bucketFindings, getFailingRulesByPillar } from './findings.js';
import { makeResult, makeRule } from './test-helpers.js';

test('bucketFindings groups failing rules by severity', () => {
  const result = makeResult({
    rules: [
      makeRule('D1', { severity: 'hard_failure' }),
      makeRule('B2', { severity: 'warning' }),
      makeRule('C3', { severity: 'recommendation' }),
      makeRule('E1', { passed: true, severity: 'warning' }),
    ],
  });

  const buckets = bucketFindings(result);

  assert.deepEqual(buckets.hardFailures.map(rule => rule.id), ['D1']);
  assert.deepEqual(buckets.warnings.map(rule => rule.id), ['B2']);
  assert.deepEqual(buckets.recommendations.map(rule => rule.id), ['C3']);
});

test('getFailingRulesByPillar returns only failing rules for that pillar', () => {
  const result = makeResult({
    rules: [
      makeRule('C1'),
      makeRule('C4', { severity: 'recommendation' }),
      makeRule('D2'),
      makeRule('C6', { passed: true }),
    ],
  });

  assert.deepEqual(getFailingRulesByPillar(result, 'C').map(rule => rule.id), ['C1', 'C4']);
});
