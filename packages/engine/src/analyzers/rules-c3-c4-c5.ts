import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FileEntry } from './filesystem.js';
import type { ImportGraph } from './import-graph.js';
import type { Manifest, RuleResult } from '../types.js';

// C3 — no file imports from more than 15 distinct modules
// Files declared in manifest.highFanOut are intentional aggregation points and are exempt.
// Common mutation/command layer filenames (actions.ts, mutations.ts, etc.) are also auto-exempted
// because they reach into many domains by design — the coupling is intentional, not accidental.
const C3_LIMIT = 15;

const AGGREGATION_FILENAME_RE = /(?:^|\/)(?:actions|mutations|resolvers|commands|handlers|routes)\.[jt]sx?$/;

function dirOf(p: string): string {
  const idx = p.lastIndexOf('/');
  return idx >= 0 ? p.slice(0, idx) : '';
}

// A single-domain barrel imports exclusively from its own directory.
// These are not navigation problems — they're the right pattern for index files
// that aggregate many small sibling files (e.g. components/svgs/index.ts).
function isSingleDomainBarrel(path: string, graph: ImportGraph): boolean {
  const edges = [...(graph.edges.get(path) ?? new Set<string>())]
    .filter(p => !p.endsWith('/__entry__'));
  if (edges.length === 0) return false;
  const fileDir = dirOf(path);
  return edges.every(e => dirOf(e) === fileDir);
}

// Extracts a human-readable domain label from a resolved internal file path.
// Tries to strip common boilerplate prefixes (src/, packages/foo/src/) so
// the first meaningful segment is the domain name.
function domainFromPath(resolvedPath: string): string | null {
  const parts = resolvedPath.split('/');
  const srcIdx = parts.indexOf('src');
  const start = srcIdx >= 0 ? srcIdx + 1 : 0;
  const remaining = parts.slice(start);
  // Next.js app-router: app/[domain]/... → use the second segment
  if (remaining[0] === 'app' && remaining.length > 1) {
    const seg = remaining[1]!;
    return seg.startsWith('(') ? (remaining[2] ?? remaining[0] ?? null) : seg;
  }
  return remaining[0] ?? null;
}

function clusterDetail(path: string, totalCount: number, graph: ImportGraph): string {
  const internalEdges = [...(graph.edges.get(path) ?? new Set<string>())]
    .filter(p => !p.endsWith('/__entry__'));
  const externalCount = totalCount - internalEdges.length;

  const domains = new Map<string, number>();
  for (const imp of internalEdges) {
    const domain = domainFromPath(imp);
    if (domain) domains.set(domain, (domains.get(domain) ?? 0) + 1);
  }

  const top = [...domains.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([d, n]) => `${d} (${n})`)
    .join(', ');

  if (!top) return `${totalCount} imports`;
  return externalCount > 0
    ? `${totalCount} imports — ${top} +${externalCount} pkg`
    : `${totalCount} imports — ${top}`;
}

export function evaluateC3(graph: ImportGraph, manifest: Manifest | null): RuleResult {
  const declared = new Set(manifest?.highFanOut ?? []);
  const violations = [...graph.importCount.entries()]
    .filter(([path, count]) => {
      if (count <= C3_LIMIT) return false;
      if ([...declared].some(d => path === d || path.endsWith('/' + d))) return false;
      if (AGGREGATION_FILENAME_RE.test(path)) return false;
      if (isSingleDomainBarrel(path, graph)) return false;
      return true;
    })
    .sort((a, b) => b[1] - a[1]);

  if (violations.length === 0) {
    return {
      id: 'C3',
      passed: true,
      severity: 'warning',
      confidence: 'high',
      scoreImpact: 25,
      message: `No file has a large import surface (more than ${C3_LIMIT} distinct modules)`,
    };
  }

  return {
    id: 'C3',
    passed: false,
    severity: 'warning',
    confidence: 'high',
    scoreImpact: 25,
    message: `${violations.length} file${violations.length > 1 ? 's' : ''} ${violations.length > 1 ? 'have' : 'has'} a large import surface (more than ${C3_LIMIT} modules) — harder to navigate and expensive for LLM context windows`,
    remediation: 'The domain breakdown in each finding shows which concerns are already clustered — extract the largest clusters into their own files first. If a file is an intentional aggregation point (e.g. a Server Actions file or API layer), declare it in manifest.highFanOut to suppress this finding.',
    locations: violations.slice(0, 10).map(([path, count]) => ({
      path,
      detail: clusterDetail(path, count, graph),
    })),
  };
}

// C4 — high fan-in files are documented
const C4_THRESHOLD = 10;

// Files in a conventionally-named UI component library directory are designed
// to have many callers — that's their purpose. Exempting them avoids requiring
// a manifest.highFanIn entry for every button, text, icon, etc.
const UI_LIB_DIR_RE = /(?:^|\/)ui(?:\/|$)/i;

export function evaluateC4(
  graph: ImportGraph,
  manifest: Manifest | null
): RuleResult {
  if (manifest === null) {
    return {
      id: 'C4',
      passed: true,
      severity: 'recommendation',
      confidence: 'low',
      scoreImpact: 0,
      message: 'Add a clarx-manifest.json to document high fan-in files once adopted',
    };
  }

  const highFanIn = [...graph.fanIn.entries()]
    .filter(([path, count]) => count >= C4_THRESHOLD && !path.endsWith('/__entry__') && !UI_LIB_DIR_RE.test(path))
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

  // List all file paths in the message so reviewers and agents don't need to
  // grep for the "N more" files. Use full paths (not basenames) so they can
  // be copied directly into manifest.highFanIn without ambiguity.
  const pathList = undocumented.map(([path, count]) => `${path} (${count})`).join(', ');
  return {
    id: 'C4',
    passed: false,
    severity: 'recommendation',
    confidence: 'medium',
    scoreImpact: 0,
    message: `${undocumented.length} files not in manifest.highFanIn: ${pathList}`,
    remediation: 'Add these paths to manifest.highFanIn. Documenting them signals to every editor that changes here have a wide blast radius — callers will break silently if the exported API changes.',
    locations: undocumented.slice(0, 10).map(([path, count]) => ({
      path,
      detail: `blast radius: ${count} direct callers`,
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
        if (!visited.has(neighbor) && !neighbor.endsWith('/__entry__')) {
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
