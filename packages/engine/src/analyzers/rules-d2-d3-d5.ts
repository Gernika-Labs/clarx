import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FileEntry } from './filesystem.js';
import type { Manifest, RuleResult } from '../types.js';

// D2 — every workspace or package has a one-line purpose statement
export async function evaluateD2(
  root: string,
  manifest: Manifest | null,
  files: FileEntry[]
): Promise<RuleResult> {
  // If manifest declares workspaces with descriptions, that satisfies D2
  if (manifest?.workspaces) {
    const empty = Object.entries(manifest.workspaces).filter(([, desc]) => !desc?.trim());
    if (empty.length === 0) {
      return {
        id: 'D2',
        passed: true,
        severity: 'warning',
        scoreImpact: 25,
        message: 'All workspaces have a purpose statement in the manifest',
      };
    }
    return {
      id: 'D2',
      passed: false,
      severity: 'warning',
      scoreImpact: 25,
      message: `${empty.length} workspace${empty.length > 1 ? 's' : ''} missing a purpose statement`,
      locations: empty.map(([dir]) => ({ path: dir, detail: 'Add a description to manifest.workspaces' })),
    };
  }

  // Fall back to checking for README.md in each package dir (one level deep package.json dirs)
  const packageDirs = files
    .filter(f => !f.isGenerated && f.relativePath.split('/').length === 2 && f.relativePath.endsWith('package.json'))
    .map(f => f.relativePath.split('/')[0]!);

  if (packageDirs.length === 0) {
    // Single-package repo — check root README
    const hasReadme = files.some(f => f.relativePath === 'README.md' || f.relativePath === 'readme.md');
    return {
      id: 'D2',
      passed: hasReadme,
      severity: 'warning',
      scoreImpact: 25,
      message: hasReadme ? 'Root README found' : 'No README found at root',
    };
  }

  const missing = (
    await Promise.all(
      packageDirs.map(async dir => {
        const hasReadme = files.some(
          f => f.relativePath === `${dir}/README.md` || f.relativePath === `${dir}/readme.md`
        );
        return hasReadme ? null : dir;
      })
    )
  ).filter((d): d is string => d !== null);

  if (missing.length === 0) {
    return {
      id: 'D2',
      passed: true,
      severity: 'warning',
      scoreImpact: 25,
      message: 'All packages have a README',
    };
  }

  return {
    id: 'D2',
    passed: false,
    severity: 'warning',
    scoreImpact: 25,
    message: `${missing.length} package${missing.length > 1 ? 's' : ''} missing a README`,
    locations: missing.map(d => ({ path: d, detail: 'Add a README.md with at least one sentence describing the package' })),
  };
}

// D3 — source, test, config, and generated directories are segregated
// Only flags config files that have leaked INTO src/ subdirectories.
// Config files at the package root (next.config.ts, vite.config.ts, etc.) are expected and ignored.
const CONFIG_PATTERNS = [/\.config\.[jt]sx?$/, /\.rc\.[jt]sx?$/, /jest\.config/, /vitest\.config/, /webpack\.config/, /vite\.config/, /rollup\.config/, /babel\.config/];

// Directories that are considered package roots (config files belong here)
const PACKAGE_ROOT_DIRS = new Set(['', '.']);

function isPackageRoot(dir: string, packageRoots: Set<string>): boolean {
  return PACKAGE_ROOT_DIRS.has(dir) || packageRoots.has(dir);
}

export function evaluateD3(files: FileEntry[], manifest?: Manifest | null): RuleResult {
  // Collect known package root directories from manifest
  const packageRoots = new Set(manifest?.workspaces ? Object.keys(manifest.workspaces) : []);

  // Also treat any directory containing a package.json as a package root
  for (const f of files) {
    if (!f.isGenerated && f.relativePath.endsWith('package.json')) {
      const dir = f.relativePath.split('/').slice(0, -1).join('/');
      packageRoots.add(dir);
    }
  }

  const dirContents = new Map<string, { hasSource: boolean; hasConfig: boolean }>();

  for (const f of files) {
    if (f.isGenerated) continue;
    const parts = f.relativePath.split('/');
    const dir = parts.slice(0, -1).join('/') || '.';
    const filename = parts[parts.length - 1]!;

    // Config files at package roots are expected — skip them
    if (isPackageRoot(dir, packageRoots) && CONFIG_PATTERNS.some(p => p.test(filename))) continue;

    const entry = dirContents.get(dir) ?? { hasSource: false, hasConfig: false };

    if (CONFIG_PATTERNS.some(p => p.test(filename))) {
      entry.hasConfig = true;
    } else if (/\.[jt]sx?$/.test(filename) && !/\.(test|spec)\.[jt]sx?$/.test(filename)) {
      entry.hasSource = true;
    }

    dirContents.set(dir, entry);
  }

  const violations = [...dirContents.entries()]
    .filter(([, c]) => c.hasSource && c.hasConfig)
    .map(([dir]) => dir);

  if (violations.length === 0) {
    return {
      id: 'D3',
      passed: true,
      severity: 'warning',
      scoreImpact: 25,
      message: 'Source and config files are properly segregated',
    };
  }

  return {
    id: 'D3',
    passed: false,
    severity: 'warning',
    scoreImpact: 25,
    message: `${violations.length} director${violations.length > 1 ? 'ies' : 'y'} mix source and config files`,
    locations: violations.map(d => ({ path: d, detail: 'Move config files to the package root or a dedicated config/ directory' })),
  };
}

// D5 — directory depth does not exceed 5 levels before a module boundary
const D5_LIMIT = 5;

export function evaluateD5(files: FileEntry[], manifest: Manifest | null): RuleResult {
  const workspacePrefixes = manifest?.workspaces
    ? Object.keys(manifest.workspaces).map(d => d + '/')
    : [];

  const deep: string[] = [];

  for (const f of files) {
    if (f.isGenerated) continue;

    // Compute depth relative to the nearest workspace root (or repo root)
    let rel = f.relativePath;
    for (const prefix of workspacePrefixes) {
      if (rel.startsWith(prefix)) {
        rel = rel.slice(prefix.length);
        break;
      }
    }

    const depth = rel.split('/').length - 1; // number of directory levels
    if (depth > D5_LIMIT) deep.push(f.relativePath);
  }

  if (deep.length === 0) {
    return {
      id: 'D5',
      passed: true,
      severity: 'recommendation',
      scoreImpact: 0,
      message: `No files exceed ${D5_LIMIT} directory levels`,
    };
  }

  return {
    id: 'D5',
    passed: false,
    severity: 'recommendation',
    scoreImpact: 0,
    message: `${deep.length} file${deep.length > 1 ? 's' : ''} exceed ${D5_LIMIT} directory levels deep`,
    locations: deep.slice(0, 10).map(p => ({ path: p })),
  };
}
