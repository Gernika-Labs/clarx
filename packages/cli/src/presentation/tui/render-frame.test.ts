import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTuiFrame } from './render-frame.js';
import { makeResult, makeRule } from '../../app/score/test-helpers.js';
import type { AnalysisResult, PillarName, RuleId } from '@clarxai/engine';

function withPillarRule(
  result: AnalysisResult,
  pillar: PillarName,
  rule: ReturnType<typeof makeRule>,
): AnalysisResult {
  return {
    ...result,
    rules: { ...result.rules, [rule.id as RuleId]: rule },
    pillars: {
      ...result.pillars,
      [pillar]: {
        ...result.pillars[pillar],
        rules: { ...result.pillars[pillar].rules, [rule.id as RuleId]: rule },
      },
    },
  };
}

test('renderTuiFrame renders dashboard layout with pillar navigation', () => {
  let result = makeResult({
    score: 75,
    rules: [makeRule('C3', { severity: 'warning', message: '1 file imports from more than 15 modules' })],
    pillarScores: { context_efficiency: 75 },
  });
  result = withPillarRule(result, 'context_efficiency', makeRule('C3', {
    severity: 'warning',
    message: '1 file imports from more than 15 modules',
    locations: [{ path: 'packages/engine/src/foo.ts', detail: '17 imports' }],
  }));

  const frame = renderTuiFrame({
    result,
    watchMode: true,
    verbose: false,
    isRefreshing: false,
    status: null,
    watchError: null,
    lastChangedFile: null,
    copied: null,
    commandBuffer: '',
    transcript: [],
    transcriptScroll: 0,
    selectedPillarIndex: 2,
    selectedIssueIndex: 0,
  });

  assert.match(frame, /75 \/ 100/);
  assert.match(frame, /PILLARS/);
  assert.match(frame, /Context efficiency/);
  assert.match(frame, /C3/);
  assert.match(frame, /WARN/);
  assert.match(frame, /navigate/);
  assert.match(frame, /run a command/);
});