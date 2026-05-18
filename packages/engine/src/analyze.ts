import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import type { AnalysisResult, AnalyzeOptions, Manifest, RuleResult } from './types.js';
import type { FileEntry } from './analyzers/filesystem.js';

const _require = createRequire(import.meta.url);
const ENGINE_VERSION: string = (_require('../package.json') as { version: string }).version;
import { scanFilesystem } from './analyzers/filesystem.js';
import { buildImportGraph } from './analyzers/import-graph.js';
import { findViewModelMigrationOpportunities } from './analyzers/index.js';
import { evaluateRules } from './scoring/rules.js';
import { computeScore } from './scoring/overall.js';
import { loadManifest } from './manifest.js';

// Build a set of every valid path reachable in the scanned tree:
// all file relativePaths plus every directory segment derived from them.
function buildValidPathSet(files: FileEntry[]): Set<string> {
  const valid = new Set<string>();
  for (const f of files) {
    valid.add(f.relativePath);
    const parts = f.relativePath.split('/');
    for (let i = 1; i < parts.length; i++) {
      valid.add(parts.slice(0, i).join('/'));
    }
  }
  return valid;
}

// Drop any location whose path doesn't correspond to a real file or directory
// in the scanned tree. Prevents phantom paths from leaking into results.
function filterLocationPaths(rules: Partial<Record<string, RuleResult>>, validPaths: Set<string>): void {
  for (const rule of Object.values(rules)) {
    if (!rule?.locations) continue;
    rule.locations = rule.locations.filter(loc => loc.path.length > 0 && validPaths.has(loc.path));
    if (rule.locations.length === 0) delete rule.locations;
  }
}

function getGitTrackedPaths(root: string): Set<string> {
  try {
    const result = spawnSync('git', ['ls-files'], { cwd: root, encoding: 'utf-8' });
    if (result.status !== 0 || result.error) return new Set();
    return new Set(result.stdout.split('\n').filter(Boolean));
  } catch {
    return new Set();
  }
}

export async function analyze(options: AnalyzeOptions): Promise<AnalysisResult> {
  const { root, manifest: manifestPath, ignore = [] } = options;

  const { manifest, unknownKeys: unknownManifestKeys } = await loadManifest(root, manifestPath);
  const { files, stats } = await scanFilesystem(root, { ignore, manifest });
  const gitTrackedPaths = getGitTrackedPaths(root);
  const importGraph = await buildImportGraph(root, files, manifest?.workspaces ?? null);
  const { rules, importGraphResolved } = await evaluateRules(root, files, manifest, importGraph, gitTrackedPaths);
  filterLocationPaths(rules, buildValidPathSet(files));
  const viewModelMigrations = await findViewModelMigrationOpportunities(root, files);
  const { score, confidence, hardFailures, pillars } = computeScore(rules, { importGraphResolved, manifestFound: manifest !== null });

  const manifestKeyTip = unknownManifestKeys.length > 0
    ? `Unknown key${unknownManifestKeys.length > 1 ? 's' : ''} in clarx-manifest.json: ${unknownManifestKeys.map(k => `"${k}"`).join(', ')} — ${unknownManifestKeys.length > 1 ? 'these have' : 'this has'} no effect. Valid keys: generated, highFanIn, highFanOut, verificationCommands, commonTasks, workspaces.`
    : undefined;

  const tip = manifestKeyTip
    ?? ((rules['O1'] && !rules['O1'].passed && confidence !== 'high')
      ? 'Add a clarx-manifest.json to improve scan confidence and unlock operational guidance rules (O1–O5).'
      : undefined);

  const confidenceCaveat = (hardFailures.length > 0 && confidence === 'low')
    ? 'Hard failures detected, but scan confidence is low — the import graph did not resolve fully and no manifest was found. These findings are real but may shift once a clarx-manifest.json is added. Treat them as soft-critical rather than confirmed blockers.'
    : undefined;

  return {
    version: ENGINE_VERSION,
    confidence,
    score,
    hardFailures,
    pillars,
    rules,
    tip,
    confidenceCaveat,
    opportunities: {
      viewModelMigrations,
    },
    meta: {
      analyzedAt: new Date().toISOString(),
      root,
      filesScanned: stats.filesScanned,
      manifestFound: manifest !== null,
      importGraphResolved,
    },
  };
}
