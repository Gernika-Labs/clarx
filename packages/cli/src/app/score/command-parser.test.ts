import test from 'node:test';
import assert from 'node:assert/strict';
import { isRuleId, normalizeScoreInput, parseScoreCommand } from './command-parser.js';

test('normalizeScoreInput normalizes operator guidance input', () => {
  assert.equal(normalizeScoreInput(' 01 '), 'O1');
});

test('parseScoreCommand handles refresh, show-all, pillar, and rule flows', () => {
  assert.deepEqual(parseScoreCommand(''), { kind: 'noop' });
  assert.deepEqual(parseScoreCommand('r'), { kind: 'refresh' });
  assert.deepEqual(parseScoreCommand('show all'), { kind: 'show_all' });
  assert.deepEqual(parseScoreCommand('C'), { kind: 'show_pillar', pillar: 'C' });
  assert.deepEqual(parseScoreCommand('01'), { kind: 'show_rule', ruleId: 'O1' });
});

test('parseScoreCommand handles copy commands', () => {
  assert.deepEqual(parseScoreCommand('copy all'), { kind: 'copy_all' });
  assert.deepEqual(parseScoreCommand('copy w'), { kind: 'copy_section', target: 'W' });
  assert.deepEqual(parseScoreCommand('copy e2'), { kind: 'copy_rule', ruleId: 'E2' });
});

test('parseScoreCommand returns unknown for unsupported input', () => {
  assert.deepEqual(parseScoreCommand('???'), { kind: 'unknown', raw: '???' });
});

test('isRuleId validates known rule formats', () => {
  assert.equal(isRuleId('C6'), true);
  assert.equal(isRuleId('O6'), false);
});
