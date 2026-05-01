import type { FileEntry } from './filesystem.js';
import type { ImportGraph } from './import-graph.js';
import type { Manifest, RuleResult } from '../types.js';

// C3 — no file imports from more than 15 distinct modules
// Files declared in manifest.highFanIn are intentional hubs and are exempt.
const C3_LIMIT = 15;

export function evaluateC3(graph: ImportGraph, manifest: Manifest | null): RuleResult {
  const declared = new Set(manifest?.highFanIn ?? []);
  const violations = [...graph.importCount.entries()]
    .filter(([path, count]) => count > C3_LIMIT && !declared.has(path))
    .sort((a, b) => b[1] - a[1]);

  if (violations.length === 0) {
    return {
      id: 'C3',
      passed: true,
      severity: 'warning',
      confidence: 'high',
      scoreImpact: 25,
      message: `No file imports from more than ${C3_LIMIT} distinct modules`,
    };
  }

  return {
    id: 'C3',
    passed: false,
    severity: 'warning',
    confidence: 'high',
    scoreImpact: 25,
    message: `${violations.length} file${violations.length > 1 ? 's' : ''} import from more than ${C3_LIMIT} modules`,
    locations: violations.slice(0, 10).map(([path, count]) => ({
      path,
      detail: `${count} imports`,
    })),
  };
}

// C4 — high fan-in files are documented
const C4_THRESHOLD = 10;

export function evaluateC4(
  graph: ImportGraph,
  manifest: Manifest | null
): RuleResult {
  const highFanIn = [...graph.fanIn.entries()]
    .filter(([path, count]) => count >= C4_THRESHOLD && !path.endsWith('/__entry__'))
    .sort((a, b) => b[1] - a[1]);

  if (highFanIn.length === 0) {
    return {
      id: 'C4',
      passed: true,
      severity: 'recommendation',
      confidence: 'medium',
      scoreImpact: 0,
      message: 'No high fan-in files detected',
    };
  }

  const declared = manifest?.highFanIn ?? [];
  const undocumented = highFanIn.filter(
    ([path]) => !declared.some(d => path === d || path.endsWith('/' + d))
  );

  if (undocumented.length === 0) {
    return {
      id: 'C4',
      passed: true,
      severity: 'recommendation',
      confidence: 'medium',
      scoreImpact: 0,
      message: `All ${highFanIn.length} high fan-in file${highFanIn.length > 1 ? 's' : ''} are documented in the manifest`,
    };
  }

  return {
    id: 'C4',
    passed: false,
    severity: 'recommendation',
    confidence: 'medium',
    scoreImpact: 0,
    message: `${undocumented.length} high fan-in file${undocumented.length > 1 ? 's' : ''} not documented in manifest.highFanIn`,
    locations: undocumented.slice(0, 10).map(([path, count]) => ({
      path,
      detail: `imported by ${count} files`,
    })),
  };
}

// C5 — import graph depth does not exceed 8 hops from entry to leaf
const C5_LIMIT = 8;

export function evaluateC5(graph: ImportGraph, files: FileEntry[]): RuleResult {
  // Find entry points: files with no fan-in within the graph
  const allTargets = new Set([...graph.edges.values()].flatMap(s => [...s]));
  const entries = [...graph.edges.keys()].filter(f => !allTargets.has(f));

  if (entries.length === 0) {
    return {
      id: 'C5',
      passed: true,
      severity: 'recommendation',
      confidence: 'medium',
      scoreImpact: 0,
      message: 'No entry points detected to measure import depth',
    };
  }

  // BFS from each entry to find max depth
  let maxDepth = 0;
  let deepestPath: string[] = [];

  for (const entry of entries) {
    const queue: Array<{ node: string; path: string[] }> = [{ node: entry, path: [entry] }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { node, path } = queue.shift()!;
      if (visited.has(node)) continue;
      visited.add(node);

      if (path.length - 1 > maxDepth) {
        maxDepth = path.length - 1;
        deepestPath = path;
      }

      for (const neighbor of graph.edges.get(node) ?? []) {
        if (!visited.has(neighbor)) {
          queue.push({ node: neighbor, path: [...path, neighbor] });
        }
      }
    }
  }

  if (maxDepth <= C5_LIMIT) {
    return {
      id: 'C5',
      passed: true,
      severity: 'recommendation',
      confidence: 'medium',
      scoreImpact: 0,
      message: `Maximum import depth is ${maxDepth} hops (limit: ${C5_LIMIT})`,
    };
  }

  return {
    id: 'C5',
    passed: false,
    severity: 'recommendation',
    confidence: 'medium',
    scoreImpact: 0,
    message: `Import graph depth reaches ${maxDepth} hops (limit: ${C5_LIMIT})`,
    locations: [{ path: deepestPath[deepestPath.length - 1] ?? '', detail: `${maxDepth}-hop chain` }],
  };
}
