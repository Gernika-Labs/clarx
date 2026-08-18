import type { Confidence, PillarName, RuleId, Severity } from '@clarxai/engine';

/** How a corpus entry's tree is obtained. */
export type CorpusSource =
  /** Cloned from a public git remote at a pinned SHA. Publishable with the benchmark. */
  | { kind: 'git'; url: string; sha: string }
  /** A repo checked out on this machine. Never published; skipped when absent. */
  | { kind: 'local'; path: string }
  /** A tree written by the harness, then git-init'ed so `git ls-files` behaves. */
  | { kind: 'fixture'; files: Record<string, string> };

export interface CorpusRepo {
  /** Stable identifier. Also the snapshot filename. Never rename without regenerating. */
  id: string;
  /** Why this repo is in the corpus — which shape or bug class it covers. */
  rationale: string;
  source: CorpusSource;
  /** Fail the run if the tree exceeds this many scanned files. Keeps CI bounded. */
  maxFiles?: number;
  /** Passed through to analyze(). */
  ignore?: string[];
}

/**
 * A finding location, retained in full.
 *
 * `detail` is not decoration: it is where the engine states line counts, export
 * counts, and overage percentage ("923 lines (130% over), 20 exports"). Those
 * numbers are the substance of the claim — dropping them would let a regression
 * in the detail string pass unnoticed, which is exactly the class of bug that
 * produced PA-005 and the C3 label case.
 */
export interface LocationSnapshot {
  path: string;
  line?: number;
  endLine?: number;
  detail?: string;
}

export interface RuleSnapshot {
  passed: boolean;
  severity: Severity;
  confidence: Confidence;
  scoreImpact: number;
  inapplicable: boolean;
  message: string;
  /** Sorted by path; `primary` preserves the engine's locations[0] contract. */
  locations: LocationSnapshot[];
  primary: string | null;
}

export interface Snapshot {
  repo: string;
  /** Recorded for provenance. NOT diffed — see diff.ts. */
  engineVersion: string;
  /** Recorded for provenance. Present for git sources only. */
  sha: string | null;
  score: number;
  confidence: Confidence;
  hardFailures: RuleId[];
  manifestFound: boolean;
  importGraphResolved: boolean;
  filesScanned: number;
  gitTrackedFiles: number;
  pillars: Record<PillarName, number>;
  tip: string | null;
  confidenceCaveat: string | null;
  rules: Record<string, RuleSnapshot>;
}

export type DiffClass = 'structural' | 'score' | 'location' | 'message' | 'cosmetic';

export interface DiffEntry {
  repo: string;
  class: DiffClass;
  /** Whether this entry fails the run. Message diffs warn unless a number moved. */
  fails: boolean;
  /** Dotted path to what changed, e.g. `rules.C2.passed`. */
  field: string;
  before: unknown;
  after: unknown;
  note?: string;
}
