import type { AnalysisResult, Confidence, PillarName, PillarScore, RuleId, RuleResult } from '../types.js';

const PILLAR_RULES: Record<PillarName, RuleId[]> = {
  discoverability: ['D1', 'D2', 'D3', 'D4', 'D5'],
  boundary_clarity: ['B1', 'B2', 'B3', 'B4', 'B5'],
  context_efficiency: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
  operational_guidance: ['O1', 'O2', 'O3', 'O4', 'O5'],
  edit_safety: ['E1', 'E2', 'E3', 'E4', 'E5'],
};

function hardFailureFloor(count: number): number {
  if (count <= 0) return Infinity;
  return Math.max(65 - (count - 1) * 15, 25);
}

export function computeScore(
  rules: Partial<Record<RuleId, RuleResult>>,
  opts: { importGraphResolved: boolean; manifestFound: boolean }
): Pick<AnalysisResult, 'score' | 'confidence' | 'hardFailures' | 'pillars'> {
  const hardFailures: RuleId[] = (Object.keys(rules) as RuleId[]).filter(
    id => rules[id] && !rules[id]!.passed && rules[id]!.severity === 'hard_failure'
  );

  const pillars = {} as Record<PillarName, PillarScore>;
  let weightedSum = 0;

  for (const [pillarName, ruleIds] of Object.entries(PILLAR_RULES) as [PillarName, RuleId[]][]) {
    let pillarScore = 100;
    const pillarRules: Partial<Record<RuleId, RuleResult>> = {};

    for (const id of ruleIds) {
      const rule = rules[id];
      if (!rule) continue;
      pillarRules[id] = rule;

      if (!rule.passed && rule.severity === 'warning') {
        pillarScore = Math.max(0, pillarScore - rule.scoreImpact);
      }
    }

    pillars[pillarName] = { score: pillarScore, weight: 0.20, rules: pillarRules };
    weightedSum += pillarScore * 0.20;
  }

  let score = Math.round(weightedSum);
  if (hardFailures.length > 0) {
    score = Math.min(score, hardFailureFloor(hardFailures.length));
  }

  const confidence: Confidence = opts.manifestFound && opts.importGraphResolved
    ? 'high'
    : opts.importGraphResolved || opts.manifestFound
    ? 'medium'
    : 'low';

  return { score, confidence, hardFailures, pillars };
}
