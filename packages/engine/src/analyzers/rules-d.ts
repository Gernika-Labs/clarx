import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { FileEntry } from './filesystem.js';
import type { Manifest, RuleResult } from '../types.js';

// Names that are always noise regardless of extension
const UTILITY_DUMP_NAMES = new Set([
  'utils', 'util', 'helpers', 'helper', 'misc', 'common',
  'shared', 'tools', 'tool', 'lib',
]);

// D1 — root directory has ≤10 meaningful entries
const D1_LIMIT = 10;

// Entries that don't count as meaningful (config/tooling clutter)
const D1_IGNORED = new Set([
  'node_modules', '.git', '.github', '.turbo', '.next', '.cache',
  'dist', 'build', 'out', 'coverage',
  '.gitignore', '.gitattributes', '.npmrc', '.nvmrc', '.node-version',
  '.prettierrc', '.prettierignore', '.eslintrc', '.eslintignore',
  'LICENSE', 'LICENSE.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md',
  'pnpm-lock.yaml', 'yarn.lock', 'package-lock.json', 'bun.lockb',
]);

export async function evaluateD1(root: string): Promise<RuleResult> {
  let entries: string[];
  try {
    entries = await readdir(root);
  } catch {
    return { id: 'D1', passed: true, severity: 'warning', scoreImpact: 25, message: 'Could not read root directory' };
  }

  const meaningful = entries.filter(e => !D1_IGNORED.has(e) && !e.startsWith('.'));

  if (meaningful.length <= D1_LIMIT) {
    return {
      id: 'D1',
      passed: true,
      severity: 'warning',
      scoreImpact: 25,
      message: `Root directory has ${meaningful.length} meaningful entries (≤${D1_LIMIT})`,
    };
  }

  return {
    id: 'D1',
    passed: false,
    severity: 'warning',
    scoreImpact: 25,
    message: `Root directory has ${meaningful.length} meaningful entries (limit: ${D1_LIMIT})`,
    locations: meaningful.map(e => ({ path: e })),
  };
}

// D4 — no utility dumping ground files
// Only flag if the file is large enough to actually be a dump (≥30 lines).
// Small focused helpers (e.g. a single cn() utility) are not a problem.
const D4_MIN_LINES = 30;

export function evaluateD4(files: FileEntry[]): RuleResult {
  const violations = files.filter(f => {
    if (f.isGenerated) return false;
    if (f.lines === undefined || f.lines < D4_MIN_LINES) return false;
    const basename = f.relativePath.split('/').pop() ?? '';
    const name = basename.includes('.') ? basename.slice(0, basename.lastIndexOf('.')) : basename;
    return UTILITY_DUMP_NAMES.has(name.toLowerCase());
  });

  if (violations.length === 0) {
    return {
      id: 'D4',
      passed: true,
      severity: 'warning',
      scoreImpact: 25,
      message: 'No utility dumping ground files found',
    };
  }

  return {
    id: 'D4',
    passed: false,
    severity: 'warning',
    scoreImpact: 25,
    message: `${violations.length} utility dumping ground file${violations.length > 1 ? 's' : ''} found`,
    locations: violations.map(f => ({ path: f.relativePath, detail: 'Rename to a domain-specific file' })),
  };
}
