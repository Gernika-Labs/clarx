export type {
  AnalysisResult,
  AnalyzeOptions,
  Manifest,
  PillarName,
  PillarScore,
  RuleId,
  RuleResult,
  Severity,
  Confidence,
  Location,
  ViewModelMigrationOpportunity,
} from './types.js';

export { analyze } from './analyze.js';
export { PILLAR_RULES, hardFailureFloor } from './scoring/overall.js';
export { DEFAULT_THRESHOLDS, resolveThresholds } from './thresholds.js';
export type { Thresholds } from './thresholds.js';
