import type { AnalysisResult, RuleId, RuleResult, Severity } from '@clarxai/engine';

export type ScoreResult = AnalysisResult;
export type ScoreRule = RuleResult;
export type RuleSeverity = Severity;
export type PillarLetter = 'D' | 'B' | 'C' | 'O' | 'E';

export interface ScoreOptions {
  root: string;
  format: string;
  ignore: string[];
  verbose: boolean;
  minScore: number | null;
  minPillarScore: number | null;
  copyAll: boolean;
}

export interface FindingBuckets {
  hardFailures: ScoreRule[];
  warnings: ScoreRule[];
  recommendations: ScoreRule[];
}

export type ParsedScoreCommand =
  | { kind: 'noop' }
  | { kind: 'refresh' }
  | { kind: 'show_all' }
  | { kind: 'show_pillar'; pillar: PillarLetter }
  | { kind: 'copy_all' }
  | { kind: 'copy_section'; target: string }
  | { kind: 'copy_rule'; ruleId: string }
  | { kind: 'show_rule'; ruleId: string }
  | { kind: 'unknown'; raw: string };

export type RuleWithId = ScoreRule & { id: RuleId };
