import type { AnalysisResult, AnalyzeOptions, Manifest } from './types.js';
import { scanFilesystem } from './analyzers/filesystem.js';
import { buildImportGraph } from './analyzers/import-graph.js';
import { evaluateRules } from './scoring/rules.js';
import { computeScore } from './scoring/overall.js';
import { loadManifest } from './manifest.js';

export async function analyze(options: AnalyzeOptions): Promise<AnalysisResult> {
  const { root, manifest: manifestPath, ignore = [] } = options;

  const manifest = await loadManifest(root, manifestPath);
  const { files, stats } = await scanFilesystem(root, { ignore, manifest });
  const importGraph = await buildImportGraph(root, files, manifest?.workspaces ?? null);
  const { rules, importGraphResolved } = await evaluateRules(root, files, manifest, importGraph);
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
