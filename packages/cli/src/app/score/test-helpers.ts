import type { AnalysisResult, Confidence, PillarName, RuleId, RuleResult } from '@clarxai/engine';

const PILLARS: PillarName[] = [
  'discoverability',
  'boundary_clarity',
  'context_efficiency',
  'operational_guidance',
  'edit_safety',
];

function emptyPillars() {
  return Object.fromEntries(
    PILLARS.map(pillar => [pillar, { score: 100, weight: 1, rules: {} }]),
  ) as AnalysisResult['pillars'];
}

export function makeRule(id: RuleId, overrides: Partial<RuleResult> = {}): RuleResult {
  return {
    id,
    passed: false,
    severity: 'warning',
    confidence: 'high',
    scoreImpact: 0,
    message: `${id} message`,
    ...overrides,
  };
}

export function makeResult(input: {
  rules?: RuleResult[];
  score?: number;
  confidence?: Confidence;
  hardFailures?: RuleId[];
  pillarScores?: Partial<Record<PillarName, number>>;
} = {}): AnalysisResult {
  const pillars = emptyPillars();

  if (input.pillarScores) {
    for (const [pillar, score] of Object.entries(input.pillarScores) as Array<[PillarName, number]>) {
      pillars[pillar].score = score;
    }
  }

  const ruleMap = Object.fromEntries((input.rules ?? []).map(rule => [rule.id, rule])) as AnalysisResult['rules'];

  return {
    version: '0.1.0-test',
    confidence: input.confidence ?? 'high',
    score: input.score ?? 100,
    hardFailures: input.hardFailures ?? [],
    pillars,
    rules: ruleMap,
    opportunities: {
      viewModelMigrations: [],
    },
    meta: {
      analyzedAt: '2026-05-26T00:00:00.000Z',
      root: '/tmp/repo',
      filesScanned: 1,
      manifestFound: true,
      importGraphResolved: true,
    },
  };
}
