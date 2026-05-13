import { readFile } from 'node:fs/promises';
import { join, dirname, normalize } from 'node:path';
import type { FileEntry } from './filesystem.js';

export type ImportGraph = {
  /** file → set of files it imports (resolved relative paths) */
  edges: Map<string, Set<string>>;
  /** file → count of files that import it */
  fanIn: Map<string, number>;
  /** file → count of distinct imports (for C3) */
  importCount: Map<string, number>;
  /** package name → workspace dir (e.g. "@clarxai/engine" → "packages/engine") */
  packageIndex: Map<string, string>;
};

// Matches `import ... from 'mod'` and `export ... from 'mod'` anchored to line starts.
// Using [^'"\n]* (no newlines, no quotes) prevents false matches on SQL 'FROM "table"'
// patterns inside template literals or string bodies. Multi-line imports where 'from'
// is on a separate line from the keyword are rare and the miss is less harmful than
// inflated counts from unanchored matching.
const FROM_RE = /(?:^|[\r\n])\s*(?:import|export)\b[^'"\n]*\bfrom\s*['"]([^'"]+)['"]/g;
// Matches side-effect imports: `import 'mod'` (no `from` clause).
const SIDE_EFFECT_RE = /(?:^|[\r\n])\s*import\s+['"]([^'"]+)['"]/g;
const REQUIRE_RE = /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const DYNAMIC_RE = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

const RESOLVABLE_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const INDEX_NAMES = RESOLVABLE_EXTS.map(e => `index${e}`);

function extractRawImports(source: string): string[] {
  const results = new Set<string>();
  for (const re of [FROM_RE, SIDE_EFFECT_RE, REQUIRE_RE, DYNAMIC_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      if (m[1]) results.add(m[1]);
    }
  }
  return [...results];
}

function resolveRelative(
  fromFile: string,
  importPath: string,
  fileSet: Set<string>
): string | null {
  const base = dirname(fromFile);
  // Normalize path separators
  const joined = normalize(join(base, importPath)).replace(/\\/g, '/');

  // Exact match (already has extension)
  if (fileSet.has(joined)) return joined;

  // Try adding known extensions
  for (const ext of RESOLVABLE_EXTS) {
    const candidate = joined + ext;
    if (fileSet.has(candidate)) return candidate;
  }

  // Try as directory with index file
  for (const index of INDEX_NAMES) {
    const candidate = joined + '/' + index;
    if (fileSet.has(candidate)) return candidate;
  }

  return null;
}

type AliasEntry = { prefix: string; dir: string };

async function readPathAliases(root: string): Promise<AliasEntry[]> {
  try {
    const raw = await readFile(join(root, 'tsconfig.json'), 'utf-8');
    const tsconfig = JSON.parse(raw) as {
      compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> };
    };
    const baseUrl = tsconfig.compilerOptions?.baseUrl ?? '.';
    const paths = tsconfig.compilerOptions?.paths ?? {};
    const aliases: AliasEntry[] = [];
    for (const [alias, targets] of Object.entries(paths)) {
      if (!Array.isArray(targets) || targets.length === 0) continue;
      const target = targets[0]!;
      if (!alias.endsWith('/*') || !target.endsWith('/*')) continue;
      const prefix = alias.slice(0, -1); // '@/' or '~/'
      const dir = normalize(join(baseUrl, target.slice(0, -1))).replace(/\\/g, '/').replace(/\/$/, '');
      aliases.push({ prefix, dir });
    }
    return aliases;
  } catch {
    return [];
  }
}

export async function buildImportGraph(
  root: string,
  files: FileEntry[],
  manifest: Record<string, string> | null // workspaces: dir → name
): Promise<ImportGraph> {
  const sourceFiles = files.filter(
    f => !f.isGenerated && RESOLVABLE_EXTS.some(e => f.relativePath.endsWith(e))
  );
  const fileSet = new Set(sourceFiles.map(f => f.relativePath));

  // Build package name → workspace dir index from workspace package.json files
  const packageIndex = new Map<string, string>();
  for (const wsDir of Object.keys(manifest ?? {})) {
    const pkgJsonPath = join(root, wsDir, 'package.json');
    try {
      const raw = await readFile(pkgJsonPath, 'utf-8');
      const pkg = JSON.parse(raw) as Record<string, unknown>;
      if (typeof pkg['name'] === 'string') {
        packageIndex.set(pkg['name'], wsDir);
      }
    } catch {
      // skip
    }
  }

  const pathAliases = await readPathAliases(root);

  const edges = new Map<string, Set<string>>();
  const fanIn = new Map<string, number>();
  const importCount = new Map<string, number>();

  for (const file of sourceFiles) {
    edges.set(file.relativePath, new Set());
    fanIn.set(file.relativePath, 0);
  }

  for (const file of sourceFiles) {
    let source: string;
    try {
      source = await readFile(join(root, file.relativePath), 'utf-8');
    } catch {
      continue;
    }

    const rawImports = extractRawImports(source);
    const resolved = new Set<string>();

    for (const imp of rawImports) {
      if (imp.startsWith('.')) {
        // Relative import — resolve within the same package
        const target = resolveRelative(file.relativePath, imp, fileSet);
        if (target) resolved.add(target);
      } else {
        // Check tsconfig path aliases before falling through to package specifiers
        let aliasMatched = false;
        for (const { prefix, dir } of pathAliases) {
          if (imp.startsWith(prefix)) {
            const rest = imp.slice(prefix.length);
            const target = resolveRelative(`${dir}/__alias__`, `./${rest}`, fileSet);
            if (target) resolved.add(target);
            aliasMatched = true;
            break;
          }
        }
        if (aliasMatched) continue;
        // Bare specifier — check if it maps to a known workspace package
        const pkgName = imp.startsWith('@')
          ? imp.split('/').slice(0, 2).join('/')
          : imp.split('/')[0]!;
        const wsDir = packageIndex.get(pkgName);
        if (wsDir) {
          // Record a virtual edge to the workspace root for cross-package cycle detection
          resolved.add(`${wsDir}/__entry__`);
        }
      }
    }

    edges.get(file.relativePath)!.forEach(() => {});
    for (const t of resolved) {
      edges.get(file.relativePath)!.add(t);
      fanIn.set(t, (fanIn.get(t) ?? 0) + 1);
    }
    importCount.set(file.relativePath, rawImports.length);
  }

  return { edges, fanIn, importCount, packageIndex };
}

// ── Cycle detection ───────────────────────────────────────────────────────────

type CycleResult = { hasCycle: boolean; cycles: string[][] };

export function detectCycles(graph: ImportGraph, workspaceDirs: string[]): CycleResult {
  // Build a package-level graph: package → set of packages it imports
  const pkgGraph = new Map<string, Set<string>>();

  for (const wsDir of workspaceDirs) {
    pkgGraph.set(wsDir, new Set());
  }

  for (const [from, targets] of graph.edges) {
    const fromPkg = workspaceDirs.find(d => from.startsWith(d + '/'));
    if (!fromPkg) continue;

    for (const to of targets) {
      if (!to.endsWith('/__entry__')) continue;
      const toPkg = to.replace('/__entry__', '');
      if (toPkg !== fromPkg) {
        pkgGraph.get(fromPkg)?.add(toPkg);
      }
    }
  }

  // DFS cycle detection on the package graph
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(node: string, path: string[]): void {
    visited.add(node);
    inStack.add(node);

    for (const neighbor of pkgGraph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path, neighbor]);
      } else if (inStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        cycles.push(cycleStart >= 0 ? path.slice(cycleStart) : [...path, neighbor]);
      }
    }

    inStack.delete(node);
  }

  for (const node of pkgGraph.keys()) {
    if (!visited.has(node)) dfs(node, [node]);
  }

  return { hasCycle: cycles.length > 0, cycles };
}
