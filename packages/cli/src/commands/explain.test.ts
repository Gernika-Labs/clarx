import test from 'node:test';
import assert from 'node:assert/strict';
import { PILLAR_RULES } from '@clarxai/engine';
import { getRuleExplanation } from './explain.js';

const ENGINE_RULE_IDS = Object.values(PILLAR_RULES).flat();

test('every rule the engine scores has an explanation', () => {
  for (const id of ENGINE_RULE_IDS) {
    const explanation = getRuleExplanation(id);
    assert.ok(explanation, `Missing explanation for scored rule ${id} — clarx explain ${id} would print "Unknown rule"`);
    assert.equal(explanation.id, id);
    assert.ok(explanation.title.length > 0, `Empty title for ${id}`);
    assert.ok(explanation.why.length > 0, `Empty "why" for ${id}`);
    assert.ok(explanation.fix.length > 0, `Empty "fix" for ${id}`);
  }
});

test('explanations do not reference rules the engine does not score', () => {
  // Probe a superset of plausible ids; anything explained but unscored is drift.
  const engineIds = new Set(ENGINE_RULE_IDS);
  for (const pillar of ['D', 'B', 'C', 'O', 'E']) {
    for (let n = 1; n <= 9; n++) {
      const id = `${pillar}${n}`;
      if (getRuleExplanation(id) && !engineIds.has(id as never)) {
        assert.fail(`Explanation exists for ${id} but the engine does not score it`);
      }
    }
  }
});

test('explanation lookup is case-insensitive', () => {
  assert.ok(getRuleExplanation('d6'));
  assert.equal(getRuleExplanation('d6')?.id, 'D6');
});
