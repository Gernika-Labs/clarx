import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FileEntry } from './filesystem.js';
import type { ImportGraph } from './import-graph.js';
import { detectCycles } from './import-graph.js';
import type { Manifest, RuleResult } from '../types.js';

// B1 — no circular imports between packages or workspaces
export function evaluateB1(
  graph: ImportGraph,
  manifest: Manifest | null
): RuleResult {
  const workspaceDirs = manifest?.workspaces ? Object.keys(manifest.workspaces) : [];

  if (workspaceDirs.length === 0) {
    return {
      id: 'B1',
      passed: true,
      severity: 'hard_failure',
      confidence: 'medium',
      scoreImpact: 100,
      message: 'No workspaces to check for circular imports',
    };
  }

  const { hasCycle, cycles } = detectCycles(graph, workspaceDirs);

  if (!hasCycle) {
    return {
      id: 'B1',
      passed: true,
      severity: 'hard_failure',
      confidence: 'high',
      scoreImpact: 100,
      message: 'No circular imports detected between packages',
    };
  }

  return {
    id: 'B1',
    passed: false,
    severity: 'hard_failure',
    confidence: 'high',
    scoreImpact: 100,
    message: `${cycles.length} circular import cycle${cycles.length > 1 ? 's' : ''} detected between packages`,
    locations: cycles.map(cycle => ({
      path: cycle.join(' → '),
      detail: 'Break the cycle by extracting shared code into a third package',
    })),
  };
}

// B2 — shared code lives in a declared shared package
// Detects when the same relative filename exists in multiple packages under src/,
// which is a strong signal of copy-paste duplication.
export function evaluateB2(
  files: FileEntry[],
  manifest: Manifest | null
): RuleResult {
  const workspaceDirs = manifest?.workspaces ? Object.keys(manifest.workspaces) : [];

  if (workspaceDirs.length < 2) {
    return {
      id: 'B2',
      passed: true,
      severity: 'warning',
      confidence: 'medium',
      scoreImpact: 25,
      message: 'Only one workspace — no cross-package duplication possible',
    };
  }

  // Build: filename (without leading package path) → list of packages that have it
  const filesByName = new Map<string, string[]>();

  for (const f of files) {
    if (f.isGenerated) continue;
    const pkg = workspaceDirs.find(d => f.relativePath.startsWith(d + '/'));
    if (!pkg) continue;

    // Strip package prefix and src/ prefix to get the "logical" path
    let logical = f.relativePath.slice(pkg.length + 1);
    if (logical.startsWith('src/')) logical = logical.slice(4);

    // Only check source files with meaningful names (not index, types, package.json)
    const basename = logical.split('/').pop() ?? '';
    if (['index.ts', 'index.tsx', 'index.js', 'types.ts', 'types.d.ts'].includes(basename)) continue;
    if (!logical.match(/\.[jt]sx?$/)) continue;

    const list = filesByName.get(logical) ?? [];
    list.push(pkg);
    filesByName.set(logical, list);
  }

  const duplicates = [...filesByName.entries()]
    .filter(([, pkgs]) => pkgs.length > 1)
    .map(([path, pkgs]) => ({ path, pkgs }));

  if (duplicates.length === 0) {
    return {
      id: 'B2',
      passed: true,
      severity: 'warning',
      confidence: 'medium',
      scoreImpact: 25,
      message: 'No duplicated source files detected across packages',
    };
  }

  return {
    id: 'B2',
    passed: false,
    severity: 'warning',
    confidence: 'medium',
    scoreImpact: 25,
    message: `${duplicates.length} file${duplicates.length > 1 ? 's' : ''} duplicated across packages`,
    locations: duplicates.slice(0, 10).map(d => ({
      path: d.path,
      detail: `Found in: ${d.pkgs.join(', ')}`,
    })),
  };
}
