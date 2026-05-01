import { spawnSync } from 'node:child_process';
import type { AnalysisResult, AnalyzeOptions, Manifest } from './types.js';
import { scanFilesystem } from './analyzers/filesystem.js';
import { buildImportGraph } from './analyzers/import-graph.js';
import { evaluateRules } from './scoring/rules.js';
import { computeScore } from './scoring/overall.js';
import { loadManifest } from './manifest.js';

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

  const manifest = await loadManifest(root, manifestPath);
  const { files, stats } = await scanFilesystem(root, { ignore, manifest });
  const gitTrackedPaths = getGitTrackedPaths(root);
  const importGraph = await buildImportGraph(root, files, manifest?.workspaces ?? null);
  const { rules, importGraphResolved } = await evaluateRules(root, files, manifest, importGraph, gitTrackedPaths);
  const { score, confidence, hardFailures, pillars } = computeScore(rules, { importGraphResolved, manifestFound: manifest !== null });

  return {
    version: '0.1',
    confidence,
    score,
    hardFailures,
    pillars,
    rules,
    meta: {
      analyzedAt: new Date().toISOString(),
      root,
      filesScanned: stats.filesScanned,
      manifestFound: manifest !== null,
      importGraphResolved,
    },
  };
}
