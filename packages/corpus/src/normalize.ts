import type { AnalysisResult, PillarName } from '@clarxai/engine';

import type { LocationSnapshot, RuleSnapshot, Snapshot } from './types.js';

const PILLAR_ORDER: PillarName[] = [
  'discoverability',
  'boundary_clarity',
  'context_efficiency',
  'operational_guidance',
  'edit_safety',
];

/**
 * Turn an AnalysisResult into a diffable snapshot.
 *
 * Everything non-deterministic is dropped here, and the reasons are specific:
 *
 * - `meta.analyzedAt` is `new Date()` — changes every run.
 * - `meta.root` is an absolute path — differs between a dev machine and CI.
 * - `opportunities.viewModelMigrations` is advisory scoring, not rule output;
 *   it is excluded to keep the snapshot about scan correctness. Add it later as
 *   its own snapshot if it becomes a product surface.
 *
 * `version` and `sha` ARE recorded — provenance matters when reading a diff —
 * but diff.ts deliberately ignores them so an engine bump does not red the
 * whole corpus for no behavioural reason.
 */
export function normalize(
  result: AnalysisResult,
  meta: { repo: string; sha: string | null; gitTrackedFiles: number },
): Snapshot {
  const rules: Record<string, RuleSnapshot> = {};

  // Sorted so JSON key order is stable regardless of rule evaluation order.
  for (const id of Object.keys(result.rules).sort()) {
    const rule = result.rules[id as keyof typeof result.rules];
    if (!rule) continue;

    const locations = rule.locations ?? [];
    rules[id] = {
      passed: rule.passed,
      severity: rule.severity,
      confidence: rule.confidence,
      scoreImpact: rule.scoreImpact,
      // Normalized to a boolean: the engine leaves it undefined when false, and
      // `undefined` vs `false` is not a behavioural difference worth diffing.
      inapplicable: rule.inapplicable === true,
      message: rule.message,
      // Sorted by path for stability, but retained in full: `detail` carries the
      // line counts, export counts, and overage percentage that ARE the finding.
      // The engine's "locations[0] is the primary target" contract is preserved
      // separately in `primary` so sorting cannot hide a regression in which
      // file a finding actually points at (KUA-008).
      locations: locations
        .map((l): LocationSnapshot => ({
          path: l.path,
          ...(l.line !== undefined ? { line: l.line } : {}),
          ...(l.endLine !== undefined ? { endLine: l.endLine } : {}),
          ...(l.detail !== undefined ? { detail: l.detail } : {}),
        }))
        .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0)),
      primary: locations[0]?.path ?? null,
    };
  }

  const pillars = {} as Record<PillarName, number>;
  for (const name of PILLAR_ORDER) {
    pillars[name] = result.pillars[name]?.score ?? 0;
  }

  return {
    repo: meta.repo,
    engineVersion: result.version,
    sha: meta.sha,
    score: result.score,
    confidence: result.confidence,
    hardFailures: [...result.hardFailures].sort(),
    manifestFound: result.meta.manifestFound,
    importGraphResolved: result.meta.importGraphResolved,
    filesScanned: result.meta.filesScanned,
    gitTrackedFiles: meta.gitTrackedFiles,
    pillars,
    tip: result.tip ?? null,
    confidenceCaveat: result.confidenceCaveat ?? null,
    rules,
  };
}

/** Deterministic serialization: sorted keys, trailing newline, 2-space indent. */
export function serialize(snapshot: Snapshot): string {
  return JSON.stringify(snapshot, sortedReplacer, 2) + '\n';
}

/**
 * Key-order-independent form, for comparing two values.
 *
 * A freshly built object carries insertion order; one parsed back from a
 * snapshot file carries the sorted order it was written in. Comparing raw
 * JSON.stringify output would call those different and report a regression on
 * every run with no behavioural change at all.
 */
export function canonical(value: unknown): string {
  return JSON.stringify(value, sortedReplacer);
}

function sortedReplacer(_key: string, value: unknown): unknown {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return value;
  const source = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(source).sort()) out[k] = source[k];
  return out;
}
