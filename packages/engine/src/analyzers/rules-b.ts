import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FileEntry } from './filesystem.js';
import type { Manifest, RuleResult } from '../types.js';

const INDEX_FILES = ['index.ts', 'index.js', 'index.tsx', 'src/index.ts', 'src/index.js', 'src/index.tsx'];

// B3 — each library package declares a public API surface (index.ts or index.js)
// Apps (apps/*) and CLI tools (packages with a bin field) are exempt.
export async function evaluateB3(
  root: string,
  manifest: Manifest | null,
  files: FileEntry[]
): Promise<RuleResult> {
  const workspaceDirs = manifest?.workspaces
    ? Object.keys(manifest.workspaces)
    : inferWorkspaceDirs(files);

  if (workspaceDirs.length === 0) {
    return {
      id: 'B3',
      passed: true,
      severity: 'warning',
      scoreImpact: 25,
      message: 'No workspaces detected to check for public API surface',
    };
  }

  // Filter to library packages only
  const libraryDirs = (
    await Promise.all(
      workspaceDirs.map(async d => ({ dir: d, isLib: await isLibraryPackage(root, d, files) }))
    )
  )
    .filter(x => x.isLib)
    .map(x => x.dir);

  if (libraryDirs.length === 0) {
    return {
      id: 'B3',
      passed: true,
      severity: 'warning',
      scoreImpact: 25,
      message: 'No library workspaces to check (all are apps or CLI tools)',
    };
  }

  const missing = libraryDirs.filter(wsDir =>
    !INDEX_FILES.some(idx => files.some(f => f.relativePath === `${wsDir}/${idx}` && !f.isGenerated))
  );

  if (missing.length === 0) {
    return {
      id: 'B3',
      passed: true,
      severity: 'warning',
      scoreImpact: 25,
      message: 'All library workspaces declare a public API surface',
    };
  }

  return {
    id: 'B3',
    passed: false,
    severity: 'warning',
    scoreImpact: 25,
    message: `${missing.length} library workspace${missing.length > 1 ? 's' : ''} missing an index file`,
    locations: missing.map(d => ({ path: d, detail: 'Add an index.ts that exports the public API' })),
  };
}

async function isLibraryPackage(root: string, wsDir: string, files: FileEntry[]): Promise<boolean> {
  // apps/* are never library packages
  if (wsDir.startsWith('apps/')) return false;
  // Check for a bin field in package.json — CLI tools are not libraries
  const pkgJsonPath = files.find(f => f.relativePath === `${wsDir}/package.json`);
  if (!pkgJsonPath) return true;
  try {
    const raw = await readFile(join(root, pkgJsonPath.relativePath), 'utf-8');
    const pkg = JSON.parse(raw) as Record<string, unknown>;
    return !pkg['bin'];
  } catch {
    return true;
  }
}

function inferWorkspaceDirs(files: FileEntry[]): string[] {
  return files
    .filter(f => !f.isGenerated && f.relativePath.split('/').length === 2 && f.relativePath.endsWith('package.json'))
    .map(f => f.relativePath.split('/')[0]!);
}
