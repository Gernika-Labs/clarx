import type { Manifest } from './types.js';

/**
 * Central home for every numeric threshold in the standard.
 *
 * Each value documents its rationale so rule findings can be defended rather
 * than argued about. Defaults are heuristics informed by the repos the standard
 * was developed against; they are pending formal corpus calibration (see
 * journal/improvement-plan.md §2.2). Teams can override any of them via the
 * `thresholds` key in clarx-manifest.json — overrides are per-repo tuning,
 * not a change to the standard itself.
 */
export type Thresholds = {
  /**
   * D1 — meaningful entries allowed at the repo root.
   * Rationale: an agent's first `ls` should fit in one glance. Ten entries is
   * roughly what a person (or a model summarizing a directory) can hold as a
   * single mental chunk before the root stops communicating structure.
   */
  d1RootEntries: number;
  /**
   * D1 (Next.js repos) — Next.js conventionally requires more root files
   * (next.config, middleware, app/, public/, etc.), so the default would flag
   * healthy repos. 17 covers the conventional set plus headroom.
   */
  d1RootEntriesNextjs: number;
  /**
   * D1 (monorepos) — workspace tooling (turbo.json, pnpm-workspace.yaml,
   * per-tool configs) legitimately widens the root. 20 keeps the "one glance"
   * intent while absorbing standard monorepo scaffolding.
   */
  d1RootEntriesMonorepo: number;
  /**
   * D4 — minimum line count before a utility-named file counts as a dumping
   * ground. A 10-line `utils.ts` with one `cn()` helper is not a navigation
   * problem; 30 lines is where "grab bag" behavior starts.
   */
  d4MinLines: number;
  /**
   * C2 — soft line limit per source file.
   * Rationale: a targeted edit to a file should not require loading more than
   * ~400 lines of context. Beyond this, files usually contain more than one
   * responsibility and agents pay for all of them on every edit.
   */
  c2FileLines: number;
  /**
   * C2 — hard-failure line limit. Files above this are unambiguously too large
   * regardless of internal structure; the finding escalates from warning to
   * hard failure.
   */
  c2FileLinesHard: number;
  /**
   * C3 — maximum distinct modules a file may import.
   * Rationale: past ~15 imports a file is a coordination layer; every import
   * is a context chain an agent may need to follow. Intentional aggregation
   * points can be exempted via manifest.highFanOut.
   */
  c3ImportLimit: number;
  /**
   * C4 — fan-in count at which a file becomes "load-bearing" and must be
   * documented in manifest.highFanIn. Ten direct callers is where a silent
   * API change starts breaking code an agent has not loaded.
   */
  c4FanInThreshold: number;
  /**
   * C5 — maximum import-graph depth (hops) from an entry point to a leaf.
   * Rationale: each hop is a file an agent must load to trace a call path;
   * 8 hops ≈ the practical limit before tracing dominates the context budget.
   */
  c5ImportDepth: number;
  /**
   * C6 — total import count at which an entry file (page/screen/route) is
   * expected to expose a local boundary surface instead of coordinating
   * infrastructure directly.
   */
  c6ImportThreshold: number;
  /**
   * C6 — infrastructure-style relative imports (api/, query, service, store…)
   * at which the same expectation kicks in even with few total imports.
   */
  c6InfraThreshold: number;
  /**
   * E1 — line limit for route/controller/handler files. Stricter than C2
   * because multi-concern handlers are the highest-blast-radius edit surface:
   * auth, validation, and business logic corrupt each other silently.
   */
  e1RouteFileLines: number;
  /**
   * E3 — maximum exports from a utility-named file. Past ~20 exports a
   * utility file has no coherent domain and therefore no safe edit surface.
   */
  e3UtilityExports: number;
};

export const DEFAULT_THRESHOLDS: Thresholds = {
  d1RootEntries: 10,
  d1RootEntriesNextjs: 17,
  d1RootEntriesMonorepo: 20,
  d4MinLines: 30,
  c2FileLines: 400,
  c2FileLinesHard: 600,
  c3ImportLimit: 15,
  c4FanInThreshold: 10,
  c5ImportDepth: 8,
  c6ImportThreshold: 8,
  c6InfraThreshold: 2,
  e1RouteFileLines: 300,
  e3UtilityExports: 20,
};

/**
 * Merge manifest `thresholds` overrides onto the defaults. Only finite
 * positive numbers for known keys are accepted; anything else is ignored so a
 * malformed manifest can never disable a rule outright.
 */
export function resolveThresholds(manifest: Manifest | null): Thresholds {
  const overrides = manifest?.thresholds;
  if (!overrides) return DEFAULT_THRESHOLDS;

  const resolved: Thresholds = { ...DEFAULT_THRESHOLDS };
  for (const key of Object.keys(DEFAULT_THRESHOLDS) as Array<keyof Thresholds>) {
    const value = overrides[key];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      resolved[key] = value;
    }
  }
  return resolved;
}
