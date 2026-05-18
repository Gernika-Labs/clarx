import type { ImportGraph } from '../analyzers/import-graph.js';

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
