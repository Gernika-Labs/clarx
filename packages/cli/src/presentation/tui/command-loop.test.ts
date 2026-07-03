import test from 'node:test';
import assert from 'node:assert/strict';
import type { TelemetryEvent } from '../../utils/telemetry.js';
import { executeTuiCommand } from './command-loop.js';
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

test('executeTuiCommand requests refresh for refresh command', () => {
  const { deps } = makeDeps();
  const result = makeResult();
  assert.deepEqual(executeTuiCommand(result, 'r', deps), { refreshRequested: true });
});

test('executeTuiCommand shows rule explanation in transcript', () => {
  const { deps } = makeDeps();
  const result = makeResult({ rules: [makeRule('C2')] });
  const output = executeTuiCommand(result, 'C2', deps);
  assert.match(output.transcriptEntry ?? '', /> C2/);
  assert.match(output.transcriptEntry ?? '', /explain:C2/);
});

test('executeTuiCommand copies all findings', () => {
  const { deps, copied, events } = makeDeps();
  const result = makeResult({ rules: [makeRule('B1', { severity: 'hard_failure' })] });
  const output = executeTuiCommand(result, 'copy all', deps);
  assert.equal(copied.length, 1);
  assert.match(output.copiedMessage ?? '', /All failing rules copied to clipboard/);
  assert.deepEqual(events, ['copy_all']);
});

test('executeTuiCommand handles pillar view with no issues', () => {
  const { deps } = makeDeps();
  const result = makeResult();
  const output = executeTuiCommand(result, 'C', deps);
  assert.match(output.transcriptEntry ?? '', /No issues in pillar C/);
});

test('executeTuiCommand handles invalid section copy target', () => {
  const { deps } = makeDeps();
  const result = makeResult();
  const output = executeTuiCommand(result, 'copy nope', deps);
  assert.match(output.transcriptEntry ?? '', /Unknown rule or section "NOPE"/);
});