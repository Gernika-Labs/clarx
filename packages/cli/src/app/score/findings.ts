import type { PillarLetter, FindingBuckets, RuleWithId, ScoreResult } from './types.js';

export function getAllRules(result: ScoreResult): RuleWithId[] {
  return Object.values(result.rules).filter(Boolean) as RuleWithId[];
}

export function getFailingRules(result: ScoreResult): RuleWithId[] {
  return getAllRules(result).filter(rule => !rule.passed);
}

export function bucketFindings(result: ScoreResult): FindingBuckets {
  const failing = getFailingRules(result);

  return {
    hardFailures: failing.filter(rule => rule.severity === 'hard_failure'),
    warnings: failing.filter(rule => rule.severity === 'warning'),
    recommendations: failing.filter(rule => rule.severity === 'recommendation'),
  };
}

export function getFailingRulesByPillar(result: ScoreResult, pillar: PillarLetter): RuleWithId[] {
  return getFailingRules(result).filter(rule => rule.id.startsWith(pillar));
}
