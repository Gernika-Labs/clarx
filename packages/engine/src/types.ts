export type RuleId =
  | 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6'
  | 'B1' | 'B2' | 'B3' | 'B4' | 'B5'
  | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6'
  | 'O1' | 'O2' | 'O3' | 'O4' | 'O5'
  | 'E1' | 'E2' | 'E3' | 'E4' | 'E5';

export type Severity = 'hard_failure' | 'warning' | 'recommendation';

export type Confidence = 'high' | 'medium' | 'low';

/**
 * A file-system location associated with a rule finding.
 *
 * Ordering: `locations[0]` is always the primary file — the canonical path the
 * finding is about (e.g. the oversized file for C2, the file missing a purpose
 * statement for D2). Subsequent entries are secondary: related files, callsites,
 * or additional examples of the same violation. Consumers that want a single
 * representative path should always use `locations[0].path`.
 *
 * `path` is relative to the repo root. `line` and `endLine` are 1-based and
 * optional; when both are present they form an inclusive line range. Rules that
 * point to a single line may omit `endLine`. `detail` is a short human-readable
 * annotation for the location (e.g. the export name that triggered the rule, or
 * the import that created a cycle).
 */
export type Location = {
  path: string;
  line?: number;
  endLine?: number;
  detail?: string;
};

export type RuleResult = {
  id: RuleId;
  passed: boolean;
  severity: Severity;
  confidence: Confidence;
  scoreImpact: number;
  message: string;
  remediation?: string;
  locations?: Location[];
  /**
   * True when the rule could not be evaluated for this repo's stack (e.g.
   * import-graph rules on a repo with no resolvable JS/TS sources). Distinct
   * from a pass: the rule neither passed nor failed — it did not run. Such
   * rules carry `passed: true` and `scoreImpact: 0` so they never move the
   * score, and UIs should report them as "not evaluated" rather than "passing".
   */
  inapplicable?: boolean;
};

export type PillarName =
  | 'discoverability'
  | 'boundary_clarity'
  | 'context_efficiency'
  | 'operational_guidance'
  | 'edit_safety';

export type PillarScore = {
  score: number;
  weight: number;
  rules: Partial<Record<RuleId, RuleResult>>;
};

export type AnalysisResult = {
  version: string;
  confidence: Confidence;
  score: number;
  hardFailures: RuleId[];
  pillars: Record<PillarName, PillarScore>;
  rules: Partial<Record<RuleId, RuleResult>>;
  tip?: string;
  /**
   * Present when one or more hard failures were detected but scan confidence is
   * low (no manifest and import graph unresolved). The hard failures are real
   * findings — they are not suppressed — but their accuracy may improve once
   * confidence rises. UIs should render these findings as "soft-critical" rather
   * than blocking: surface them prominently but pair them with this caveat text
   * rather than treating them as confirmed blockers.
   */
  confidenceCaveat?: string;
  opportunities: {
    viewModelMigrations: ViewModelMigrationOpportunity[];
  };
  meta: {
    analyzedAt: string;
    root: string;
    filesScanned: number;
    manifestFound: boolean;
    importGraphResolved: boolean;
  };
};

export type ViewModelMigrationOpportunity = {
  path: string;
  score: number;
  rating: 'high' | 'medium' | 'low';
  summary: string;
  reasons: string[];
  limits: string[];
  scores: {
    tracingRoi: number;
    simplificationRoi: number;
  };
  signals: {
    lines: number;
    queryHookImports: number;
    handlerTypeImports: number;
    tokenReferences: number;
    mutationSignals: number;
    hasBoundarySurface: boolean;
    inlineDerivedSignals: number;
  };
};

export type AnalyzeOptions = {
  root: string;
  manifest?: string;
  ignore?: string[];
};

export type Manifest = {
  version?: string;
  generated?: string[];
  workspaces?: Record<string, string>;
  highFanIn?: string[];
  highFanOut?: string[];
  verificationCommands?: {
    typecheck?: string;
    test?: string;
    lint?: string;
  };
  commonTasks?: Record<string, string>;
  /**
   * Per-repo overrides for the standard's numeric thresholds (see
   * thresholds.ts for keys, defaults, and rationale). Only finite positive
   * numbers are honored. Overrides tune rules to a repo's reality — they do
   * not change the standard itself, and scan output notes when they are active.
   */
  thresholds?: Partial<Record<keyof import('./thresholds.js').Thresholds, number>>;
};
