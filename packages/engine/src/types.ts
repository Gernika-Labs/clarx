export type RuleId =
  | 'D1' | 'D2' | 'D3' | 'D4' | 'D5'
  | 'B1' | 'B2' | 'B3' | 'B4' | 'B5'
  | 'C1' | 'C2' | 'C3' | 'C4' | 'C5'
  | 'O1' | 'O2' | 'O3' | 'O4' | 'O5'
  | 'E1' | 'E2' | 'E3' | 'E4' | 'E5';

export type Severity = 'hard_failure' | 'warning' | 'recommendation';

export type Confidence = 'high' | 'medium' | 'low';

export type Location = {
  path: string;
  line?: number;
  detail?: string;
};

export type RuleResult = {
  id: RuleId;
  passed: boolean;
  severity: Severity;
  confidence: Confidence;
  scoreImpact: number;
  message: string;
  locations?: Location[];
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
  meta: {
    analyzedAt: string;
    root: string;
    filesScanned: number;
    manifestFound: boolean;
    importGraphResolved: boolean;
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
  verificationCommands?: {
    typecheck?: string;
    test?: string;
    lint?: string;
  };
  commonTasks?: Record<string, string>;
};
