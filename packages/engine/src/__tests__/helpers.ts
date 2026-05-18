import type { FileEntry } from '../analyzers/filesystem.js';
import type { ImportGraph } from '../analyzers/import-graph.js';
import type { Manifest } from '../types.js';

export function makeFile(relativePath: string, lines?: number): FileEntry {
  return { path: `/root/${relativePath}`, relativePath, lines, isGenerated: false };
}

export function makeGenerated(relativePath: string): FileEntry {
  return { path: `/root/${relativePath}`, relativePath, isGenerated: true };
}

export function makeManifest(overrides: Partial<Manifest> = {}): Manifest {
  return {
    version: '0.1',
    generated: ['**/dist', '**/node_modules'],
    workspaces: {
      'packages/a': 'Package A',
      'packages/b': 'Package B',
    },
    verificationCommands: { typecheck: 'tsc', test: 'jest', lint: 'eslint' },
    commonTasks: { 'add a component': 'packages/a/src/' },
    ...overrides,
  };
}

export function makeImportGraph(
  entries: Array<{ file: string; count: number; deps?: string[] }>
): ImportGraph {
  const edges = new Map<string, Set<string>>();
  const fanIn = new Map<string, number>();
  const importCount = new Map<string, number>();
  for (const { file, count, deps = [] } of entries) {
    edges.set(file, new Set(deps));
    importCount.set(file, count);
    for (const dep of deps) fanIn.set(dep, (fanIn.get(dep) ?? 0) + 1);
  }
  return { edges, fanIn, importCount, packageIndex: new Map() };
}

export function makeFanInGraph(
  entries: Array<{ file: string; callers: number }>
): ImportGraph {
  const fanIn = new Map<string, number>();
  const edges = new Map<string, Set<string>>();
  const importCount = new Map<string, number>();
  for (const { file, callers } of entries) {
    fanIn.set(file, callers);
    edges.set(file, new Set());
    importCount.set(file, 0);
  }
  return { edges, fanIn, importCount, packageIndex: new Map() };
}
