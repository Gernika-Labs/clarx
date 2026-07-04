import type { AnalysisResult, PillarName, Severity } from '@clarxai/engine';
import { hardFailureFloor } from '@clarxai/engine';
import { barTone, primaryNote, renderBarUnits } from './pillar.js';
import { NAME_W, PILLAR_LABELS } from './tokens.js';

type Rule = NonNullable<AnalysisResult['rules'][keyof AnalysisResult['rules']]>;

export interface PillarFindingView {
  id: string;
  message: string;
  severity: Severity;
  locations: Array<{ path: string; detail?: string }>;
}

export interface PillarRowView {
  key: PillarName;
  label: string;
  score: number;
  bar: ReturnType<typeof renderBarUnits>;
  note: ReturnType<typeof primaryNote>;
  findings: PillarFindingView[];
}

export interface RuleGroupView {
  label: string;
  rules: Rule[];
}

export interface MigrationRowView {
  rating: 'high' | 'medium' | 'low';
  path: string;
  score: number;
  summary: string;
  tracingRoi: number;
  simplificationRoi: number;
  reasons: string[];
  limits: string[];
}

export interface ScoreReportView {
  version: string;
  filesScanned: number;
  confidence: AnalysisResult['confidence'];
  score: number;
  pillars: PillarRowView[];
  confidenceCaveat?: string;
  tip?: string;
  summary: {
    hardFailures: number;
    warnings: number;
    recommendations: number;
  };
  topRule?: Rule;
  migrations: MigrationRowView[];
  verboseGroups: RuleGroupView[];
  /** Rule ids that could not be evaluated for this stack (e.g. import-graph
   * rules on a repo with no resolvable JS/TS sources). Shown as "not
   * evaluated" so partial coverage is declared, never silent. */
  notEvaluated: string[];
  /** Hard failures in fix-first order, with the score cap they impose.
   * Present only when there is at least one hard failure. */
  fixFirst?: { rules: Rule[]; scoreCap: number };
}

export function buildScoreReportView(
  result: AnalysisResult,
  opts: { verbose?: boolean } = {},
): ScoreReportView {
  const pillars = (Object.entries(result.pillars) as [PillarName, AnalysisResult['pillars'][PillarName]][]).map(
    ([key, pillar]) => {
      const findings = Object.values(pillar.rules)
        .filter((rule): rule is Rule => Boolean(rule && !rule.passed))
        .map(rule => ({
          id: rule.id,
          message: rule.message,
          severity: rule.severity,
          locations: (rule.locations ?? []).map(loc => ({
            path: loc.path,
            detail: loc.detail,
          })),
        }));

      return {
        key,
        label: PILLAR_LABELS[key],
        score: pillar.score,
        bar: renderBarUnits(pillar.score, barTone(pillar)),
        note: primaryNote(pillar),
        findings,
      };
    },
  );

  const allRules = Object.values(result.rules).filter(Boolean) as Rule[];
  const hardFails = allRules.filter(r => !r.passed && r.severity === 'hard_failure');
  const warnings = allRules.filter(r => !r.passed && r.severity === 'warning');
  const recs = allRules.filter(r => !r.passed && r.severity === 'recommendation');
  const notEvaluated = allRules.filter(r => r.inapplicable).map(r => r.id);

  const verboseGroups: RuleGroupView[] = opts.verbose
    ? [
        { label: 'Hard failures', rules: hardFails },
        { label: 'Warnings', rules: warnings },
        { label: 'Recommendations', rules: recs },
      ].filter(group => group.rules.length > 0)
    : [];

  return {
    version: result.version,
    filesScanned: result.meta.filesScanned,
    confidence: result.confidence,
    score: result.score,
    pillars,
    confidenceCaveat: result.confidenceCaveat,
    tip: result.tip,
    summary: {
      hardFailures: hardFails.length,
      warnings: warnings.length,
      recommendations: recs.length,
    },
    topRule: hardFails[0] ?? warnings[0],
    notEvaluated,
    fixFirst: hardFails.length > 0
      ? { rules: hardFails, scoreCap: hardFailureFloor(hardFails.length) }
      : undefined,
    migrations: result.opportunities.viewModelMigrations.slice(0, 5).map(item => ({
      rating: item.rating,
      path: item.path,
      score: item.score,
      summary: item.summary,
      tracingRoi: item.scores.tracingRoi,
      simplificationRoi: item.scores.simplificationRoi,
      reasons: item.reasons.slice(0, 3),
      limits: item.limits.slice(0, 2),
    })),
    verboseGroups,
  };
}

export function padName(label: string): string {
  return label.padEnd(NAME_W);
}