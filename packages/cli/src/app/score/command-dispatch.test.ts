import test from 'node:test';
import assert from 'node:assert/strict';
import type { TelemetryEvent } from '../../utils/telemetry.js';
import { dispatchScoreCommand } from './command-dispatch.js';
import { makeResult, makeRule } from './test-helpers.js';

function makeDeps() {
  const events: TelemetryEvent[] = [];
  const copied: string[] = [];
  return {
    deps: {
      formatExplanation: (ruleId: string) => `explain:${ruleId}`,
      getRuleCopyText: (ruleId: string) => `copy:${ruleId}`,
      copyToClipboard: (text: string) => {
        copied.push(text);
        return true;
      },
      track: (event: TelemetryEvent) => { events.push(event); },
      dim: (text: string) => text,
    },
    events,
    copied,
  };
}

test('dispatchScoreCommand returns refresh for refresh command', () => {
  const { deps } = makeDeps();
  const result = makeResult();
  assert.deepEqual(dispatchScoreCommand(result, { kind: 'refresh' }, deps), { refresh: true, lines: [] });
});

test('dispatchScoreCommand renders show_all explanations', () => {
  const { deps, events } = makeDeps();
  const result = makeResult({ score: 81, rules: [makeRule('C2')] });
  const dispatched = dispatchScoreCommand(result, { kind: 'show_all' }, deps);
  assert.deepEqual(dispatched.lines, ['explain:C2']);
  assert.equal(events[0]?.action, 'show_all');
});

test('dispatchScoreCommand copies a rule fix', () => {
  const { deps, copied, events } = makeDeps();
  const result = makeResult({ score: 81 });
  const dispatched = dispatchScoreCommand(result, { kind: 'copy_rule', ruleId: 'E2' }, deps);
  assert.equal(copied[0], 'copy:E2');
  assert.match(dispatched.lines[0] ?? '', /Copied fix for E2/);
  assert.equal(events[0]?.action, 'copy');
});
