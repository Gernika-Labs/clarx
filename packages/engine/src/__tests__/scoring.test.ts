import { describe, it, expect } from '@jest/globals';
import { computeScore } from '../scoring/overall.js';
import type { RuleId, RuleResult } from '../types.js';

function passing(id: RuleId, scoreImpact = 25): RuleResult {
  return { id, passed: true, severity: 'warning', confidence: 'medium', scoreImpact, message: 'ok' };
}

function failing(id: RuleId, severity: RuleResult['severity'] = 'warning', scoreImpact = 25): RuleResult {
  return { id, passed: false, severity, confidence: 'medium', scoreImpact, message: 'fail' };
}

const ALL_PASSING: Partial<Record<RuleId, RuleResult>> = {
  D1: passing('D1'), D2: passing('D2'), D3: passing('D3'), D4: passing('D4'), D5: passing('D5', 0),
  B1: passing('B1', 100), B2: passing('B2'), B3: passing('B3'), B4: passing('B4', 0), B5: passing('B5', 0),
  C1: passing('C1', 100), C2: passing('C2'), C3: passing('C3'), C4: passing('C4', 0), C5: passing('C5', 0), C6: passing('C6', 0),
  O1: passing('O1', 100), O2: passing('O2'), O3: passing('O3'), O4: passing('O4'), O5: passing('O5', 0),
  E1: passing('E1'), E2: passing('E2', 0), E3: passing('E3'), E4: passing('E4', 0), E5: passing('E5'),
};

describe('computeScore', () => {
  it('returns 100 when all rules pass', () => {
    const { score, hardFailures } = computeScore(ALL_PASSING, { importGraphResolved: true, manifestFound: true });
    expect(score).toBe(100);
    expect(hardFailures).toHaveLength(0);
  });

  it('caps score at 65 when a single hard failure rule fails', () => {
    const rules = { ...ALL_PASSING, O1: failing('O1', 'hard_failure', 100) };
    const { score, hardFailures } = computeScore(rules, { importGraphResolved: true, manifestFound: true });
    expect(score).toBeLessThanOrEqual(65);
    expect(hardFailures).toContain('O1');
  });

  it('caps score at 50 when two hard failures occur', () => {
    const rules = { ...ALL_PASSING, O1: failing('O1', 'hard_failure', 100), C1: failing('C1', 'hard_failure', 100) };
    const { score } = computeScore(rules, { importGraphResolved: true, manifestFound: true });
    expect(score).toBeLessThanOrEqual(50);
  });

  it('caps score at 35 when all three hard failures occur', () => {
    const rules = {
      ...ALL_PASSING,
      O1: failing('O1', 'hard_failure', 100),
      C1: failing('C1', 'hard_failure', 100),
      B1: failing('B1', 'hard_failure', 100),
    };
    const { score } = computeScore(rules, { importGraphResolved: true, manifestFound: true });
    expect(score).toBeLessThanOrEqual(35);
  });

  it('deducts from the correct pillar when a warning fails', () => {
    const rules = { ...ALL_PASSING, C2: failing('C2', 'warning', 25) };
    const { score, pillars } = computeScore(rules, { importGraphResolved: true, manifestFound: true });
    expect(pillars.context_efficiency.score).toBe(75);
    expect(score).toBe(95); // one pillar drops by 25, 25/5 = 5 point drop overall
  });

  it('returns high confidence when manifest found and import graph resolved', () => {
    const { confidence } = computeScore(ALL_PASSING, { importGraphResolved: true, manifestFound: true });
    expect(confidence).toBe('high');
  });

  it('returns medium confidence when only manifest found', () => {
    const { confidence } = computeScore(ALL_PASSING, { importGraphResolved: false, manifestFound: true });
    expect(confidence).toBe('medium');
  });

  it('returns low confidence when neither manifest nor import graph', () => {
    const { confidence } = computeScore(ALL_PASSING, { importGraphResolved: false, manifestFound: false });
    expect(confidence).toBe('low');
  });

  it('pillar scores cannot go below 0', () => {
    const rules = {
      ...ALL_PASSING,
      D1: failing('D1', 'warning', 25),
      D2: failing('D2', 'warning', 25),
      D3: failing('D3', 'warning', 25),
      D4: failing('D4', 'warning', 25),
    };
    const { pillars } = computeScore(rules, { importGraphResolved: true, manifestFound: true });
    expect(pillars.discoverability.score).toBeGreaterThanOrEqual(0);
  });
});
