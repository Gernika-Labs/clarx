import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSarif } from './sarif.js';
import { makeResult, makeRule } from '../../app/score/test-helpers.js';

test('formatSarif emits valid SARIF with failing rule results', () => {
  const result = makeResult({
    rules: [
      makeRule('C2', {
        severity: 'warning',
        message: 'Files exceed line limit',
        locations: [{ path: 'src/big.ts', line: 10, detail: '847 lines' }],
      }),
      makeRule('B1', { passed: true, severity: 'hard_failure' }),
    ],
  });

  const parsed = JSON.parse(formatSarif(result)) as {
    version: string;
    runs: Array<{
      tool: { driver: { rules: Array<{ id: string }> } };
      results: Array<{ ruleId: string; level: string; locations: unknown[] }>;
    }>;
  };

  assert.equal(parsed.version, '2.1.0');
  assert.equal(parsed.runs[0]!.results.length, 1);
  assert.equal(parsed.runs[0]!.results[0]!.ruleId, 'C2');
  assert.equal(parsed.runs[0]!.results[0]!.level, 'warning');
  assert.equal(parsed.runs[0]!.tool.driver.rules[0]!.id, 'C2');
  assert.ok(parsed.runs[0]!.results[0]!.locations.length > 0);
});

test('formatSarif maps hard failures to error level', () => {
  const result = makeResult({
    rules: [makeRule('B1', { severity: 'hard_failure' })],
  });
  const parsed = JSON.parse(formatSarif(result)) as {
    runs: Array<{ results: Array<{ level: string }> }>;
  };
  assert.equal(parsed.runs[0]!.results[0]!.level, 'error');
});

test('formatSarif returns empty results for clean scan', () => {
  const result = makeResult();
  const parsed = JSON.parse(formatSarif(result)) as {
    runs: Array<{ results: unknown[] }>;
  };
  assert.deepEqual(parsed.runs[0]!.results, []);
});