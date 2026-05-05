import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FileEntry } from './filesystem.js';
import type { ImportGraph } from './import-graph.js';
import type { Manifest, RuleResult } from '../types.js';

// C3 — no file imports from more than 15 distinct modules
// Files declared in manifest.highFanIn are intentional hubs and are exempt.
const C3_LIMIT = 15;

export function evaluateC3(graph: ImportGraph, manifest: Manifest | null): RuleResult {
  const declared = new Set(manifest?.highFanIn ?? []);
  const violations = [...graph.importCount.entries()]
    .filter(([path, count]) => count > C3_LIMIT && ![...declared].some(d => path === d || path.endsWith('/' + d)))
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

const ENTRY_FILE_RE = /(?:^|\/)(?:page|screen|view|container|layout|route)\.[jt]sx?$/;
const BOUNDARY_IMPORT_RE = /(?:^|\/)(?:view-models?\/|presenters?\/|facades?\/)|(?:^|\/)(?:use[A-Z][A-Za-z0-9]*ViewModel|[A-Za-z0-9-]+(?:view-model|viewmodel|presenter|facade|adapter))\.[jt]sx?$/;
const INFRA_IMPORT_RE = /(?:^|\/)(?:api|client|fetch|query|queries|service|services|store|state|pagination|types?|hooks?|use-[a-z0-9-]+)\b/i;
const IMPORT_PATH_RE = /(?:import|export)\b[^'"]*['"]([^'"]+)['"]/g;
const C6_IMPORT_THRESHOLD = 8;
const C6_INFRA_THRESHOLD = 2;

function extractImports(source: string): string[] {
  const imports: string[] = [];
  IMPORT_PATH_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = IMPORT_PATH_RE.exec(source)) !== null) {
    if (match[1]) imports.push(match[1]);
  }
  return imports;
}

export async function evaluateC6(root: string, files: FileEntry[]): Promise<RuleResult> {
  const sourceFiles = files.filter(
    f => !f.isGenerated && ENTRY_FILE_RE.test(f.relativePath)
  );

  if (sourceFiles.length === 0) {
    return {
      id: 'C6',
      passed: true,
      severity: 'recommendation',
      confidence: 'low',
      scoreImpact: 0,
      message: 'No entry files detected that need local boundary-surface checks',
    };
  }

  const violations: Array<{ path: string; detail: string }> = [];

  for (const file of sourceFiles) {
    let source: string;
    try {
      source = await readFile(join(root, file.relativePath), 'utf-8');
    } catch {
      continue;
    }

    const imports = extractImports(source);
    const relativeImports = imports.filter(imp => imp.startsWith('.'));
    const infraImports = relativeImports.filter(imp => INFRA_IMPORT_RE.test(imp));
    const hasBoundarySurface = relativeImports.some(imp => BOUNDARY_IMPORT_RE.test(imp));
    const needsBoundarySurface =
      imports.length >= C6_IMPORT_THRESHOLD || infraImports.length >= C6_INFRA_THRESHOLD;

    if (needsBoundarySurface && !hasBoundarySurface) {
      violations.push({
        path: file.relativePath,
        detail: `${imports.length} imports, ${infraImports.length} infrastructure-style relative imports, no local boundary surface`,
      });
    }
  }

  if (violations.length === 0) {
    return {
      id: 'C6',
      passed: true,
      severity: 'recommendation',
      confidence: 'medium',
      scoreImpact: 0,
      message: 'Entry files that coordinate multiple dependencies expose a local boundary surface',
    };
  }

  return {
    id: 'C6',
    passed: false,
    severity: 'recommendation',
    confidence: 'medium',
    scoreImpact: 0,
    message: `${violations.length} entry file${violations.length > 1 ? 's' : ''} appear to coordinate data/state directly without a local boundary surface`,
    remediation: 'Introduce a page-local boundary such as a view-model, presenter, facade, or adapter so entry files can stop at one explicit surface instead of tracing hooks, queries, and types.',
    locations: violations.slice(0, 10),
  };
}
