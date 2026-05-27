import test from 'node:test';
import assert from 'node:assert/strict';
import type { TelemetryEvent } from '../../utils/telemetry.js';
import { executeInkCommand } from './command-loop.js';
import { makeResult, makeRule } from '../../app/score/test-helpers.js';

function makeDeps() {
  const copied: string[] = [];
  const events: string[] = [];
  return {
    copied,
    events,
    deps: {
      formatExplanation: (ruleId: string) => `explain:${ruleId}`,
      getRuleCopyText: (ruleId: string) => `copy:${ruleId}`,
      copyToClipboard: (text: string) => {
        copied.push(text);
        return true;
      },
      track: (event: TelemetryEvent) => { events.push(event.action); },
    },
  };
}

test('executeInkCommand requests refresh for refresh command', () => {
  const { deps } = makeDeps();
  const result = makeResult();
  assert.deepEqual(executeInkCommand(result, 'r', deps), { refreshRequested: true });
});

test('executeInkCommand shows rule explanation in transcript', () => {
  const { deps } = makeDeps();
  const result = makeResult({ rules: [makeRule('C2')] });
  const output = executeInkCommand(result, 'C2', deps);
  assert.match(output.transcriptEntry ?? '', /> C2/);
  assert.match(output.transcriptEntry ?? '', /explain:C2/);
});

test('executeInkCommand copies all findings', () => {
  const { deps, copied, events } = makeDeps();
  const result = makeResult({ rules: [makeRule('B1', { severity: 'hard_failure' })] });
  const output = executeInkCommand(result, 'copy all', deps);
  assert.equal(copied.length, 1);
  assert.match(output.copiedMessage ?? '', /All failing rules copied to clipboard/);
  assert.deepEqual(events, ['copy_all']);
});

test('executeInkCommand handles pillar view with no issues', () => {
  const { deps } = makeDeps();
  const result = makeResult();
  const output = executeInkCommand(result, 'C', deps);
  assert.match(output.transcriptEntry ?? '', /No issues in pillar C/);
});

test('executeInkCommand handles invalid section copy target', () => {
  const { deps } = makeDeps();
  const result = makeResult();
  const output = executeInkCommand(result, 'copy nope', deps);
  assert.match(output.transcriptEntry ?? '', /Unknown rule or section "NOPE"/);
});
