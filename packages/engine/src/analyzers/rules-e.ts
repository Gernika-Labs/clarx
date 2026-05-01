import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FileEntry } from './filesystem.js';
import type { Manifest, RuleResult } from '../types.js';

// ── E1 — no route/controller files exceeding 300 lines ───────────────────────

const E1_LIMIT = 300;
const ROUTE_PATTERNS = [
  /route[s]?\.[jt]sx?$/i,
  /router[s]?\.[jt]sx?$/i,
  /controller[s]?\.[jt]sx?$/i,
  /handler[s]?\.[jt]sx?$/i,
  /endpoint[s]?\.[jt]sx?$/i,
];

export function evaluateE1(files: FileEntry[]): RuleResult {
  const violations = files.filter(f => {
    if (f.isGenerated || f.lines === undefined) return false;
    const name = f.relativePath.split('/').pop() ?? '';
    return ROUTE_PATTERNS.some(p => p.test(name)) && f.lines > E1_LIMIT;
  });

  if (violations.length === 0) {
    return {
      id: 'E1',
      passed: true,
      severity: 'warning',
      confidence: 'medium',
      scoreImpact: 25,
      message: 'No route or controller files exceed 300 lines',
    };
  }

  return {
    id: 'E1',
    passed: false,
    severity: 'warning',
    confidence: 'medium',
    scoreImpact: 25,
    message: `${violations.length} route/controller file${violations.length > 1 ? 's' : ''} exceed 300 lines`,
    locations: violations.map(f => ({ path: f.relativePath, detail: `${f.lines} lines` })),
  };
}

// ── E3 — no utility file exports more than 20 unrelated functions ─────────────

const E3_EXPORT_LIMIT = 20;
const UTILITY_NAMES = new Set(['utils', 'util', 'helpers', 'helper', 'misc', 'common', 'shared', 'lib']);

export async function evaluateE3(root: string, files: FileEntry[]): Promise<RuleResult> {
  const utilityFiles = files.filter(f => {
    if (f.isGenerated) return false;
    const basename = f.relativePath.split('/').pop() ?? '';
    const name = basename.includes('.') ? basename.slice(0, basename.lastIndexOf('.')) : basename;
    return UTILITY_NAMES.has(name.toLowerCase());
  });

  const violations: Array<{ path: string; exports: number }> = [];

  for (const f of utilityFiles) {
    const count = await countExports(join(root, f.relativePath));
    if (count > E3_EXPORT_LIMIT) violations.push({ path: f.relativePath, exports: count });
  }

  if (violations.length === 0) {
    return {
      id: 'E3',
      passed: true,
      severity: 'warning',
      confidence: 'medium',
      scoreImpact: 25,
      message: 'No utility files exceed 20 exports',
    };
  }

  return {
    id: 'E3',
    passed: false,
    severity: 'warning',
    confidence: 'medium',
    scoreImpact: 25,
    message: `${violations.length} utility file${violations.length > 1 ? 's' : ''} exceed 20 exports`,
    locations: violations.map(v => ({ path: v.path, detail: `${v.exports} exports` })),
  };
}

async function countExports(filePath: string): Promise<number> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const matches = content.match(/^export\s+(function|const|let|var|class|type|interface|enum|async\s+function)/gm);
    return matches?.length ?? 0;
  } catch {
    return 0;
  }
}

// ── E5 — each package has a single declared entry point ──────────────────────

export async function evaluateE5(
  root: string,
  files: FileEntry[],
  manifest: Manifest | null
): Promise<RuleResult> {
  // Use manifest workspaces if available; otherwise find all nested package.json files
  const workspaceDirs = manifest?.workspaces
    ? Object.keys(manifest.workspaces)
    : files
        .filter(f => !f.isGenerated && f.relativePath.endsWith('package.json') && f.relativePath.split('/').length > 1)
        .map(f => f.relativePath.split('/').slice(0, -1).join('/'));

  // Only check library packages (not apps or CLI tools)
  const libraryDirs = (
    await Promise.all(
      workspaceDirs.map(async d => {
        if (d.startsWith('apps/')) return null;
        try {
          const pkgPath = files.find(f => f.relativePath === `${d}/package.json`);
          if (!pkgPath) return null;
          const raw = await readFile(join(root, pkgPath.relativePath), 'utf-8');
          const pkg = JSON.parse(raw) as Record<string, unknown>;
          if (pkg['bin']) return null; // CLI tools are exempt
          return d;
        } catch {
          return null;
        }
      })
    )
  ).filter((d): d is string => d !== null);

  if (libraryDirs.length === 0) {
    return {
      id: 'E5',
      passed: true,
      severity: 'warning',
      confidence: 'medium',
      scoreImpact: 25,
      message: 'No library packages to check',
    };
  }

  const missing: string[] = [];
  for (const d of libraryDirs) {
    try {
      const pkgPath = files.find(f => f.relativePath === `${d}/package.json`);
      if (!pkgPath) continue;
      const raw = await readFile(join(root, pkgPath.relativePath), 'utf-8');
      const pkg = JSON.parse(raw) as Record<string, unknown>;
      if (pkg['exports'] == null && pkg['main'] == null) missing.push(d);
    } catch {
      // ignore
    }
  }

  if (missing.length === 0) {
    return {
      id: 'E5',
      passed: true,
      severity: 'warning',
      confidence: 'medium',
      scoreImpact: 25,
      message: 'All library packages declare an entry point',
    };
  }

  return {
    id: 'E5',
    passed: false,
    severity: 'warning',
    confidence: 'medium',
    scoreImpact: 25,
    message: `${missing.length} library package${missing.length > 1 ? 's' : ''} missing a declared entry point`,
    locations: missing.map(d => ({ path: d, detail: 'Add an "exports" or "main" field to package.json' })),
  };
}
