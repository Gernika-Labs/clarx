import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FileEntry } from './filesystem.js';
import type { Manifest, RuleResult } from '../types.js';
import { DEFAULT_THRESHOLDS, type Thresholds } from '../thresholds.js';

// Names that are always noise regardless of extension
const UTILITY_DUMP_NAMES = new Set([
  'utils', 'util', 'helpers', 'helper', 'misc', 'common',
  'shared', 'tools', 'tool', 'lib',
]);

// D1 — root directory has ≤N meaningful entries
// Limits live in thresholds.ts (d1RootEntries / d1RootEntriesNextjs / d1RootEntriesMonorepo).

// Exact-match names that don't count as meaningful
const D1_IGNORED_EXACT = new Set([
  'node_modules', '.git', '.github', '.turbo', '.next', '.cache',
  'dist', 'build', 'out', 'coverage',
  '.gitignore', '.gitattributes', '.npmrc', '.nvmrc', '.node-version',
  '.prettierrc', '.prettierignore', '.eslintrc', '.eslintignore',
  'LICENSE', 'LICENSE.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md',
  'pnpm-lock.yaml', 'yarn.lock', 'package-lock.json', 'bun.lockb',
  'pnpm-workspace.yaml', 'lerna.json', 'nx.json', 'turbo.json', 'rush.json',
  'components.json', // shadcn/ui config
  'storybook-static',
  // Universal project files — every repo has these; they carry no structural signal
  'package.json', 'README.md', 'README',
  // AI agent guidance files — infrastructure, not part of source layout
  'AGENTS.md', 'CLAUDE.md', 'Makefile',
]);

// Pattern-match for tooling config files with variable names
const D1_IGNORED_PATTERNS = [
  /^tsconfig(\..+)?\.json$/,
  /^vite\.config\./,
  /^vitest\.config\./,
  /^jest\.config\./,
  /^babel\.config\./,
  /^postcss\.config\./,
  /^tailwind\.config\./,
  /^webpack\.config\./,
  /^rollup\.config\./,
  /^alias\.config\./,
  /^eslint\.config\./,
  /^prettier\.config\./,
  /^svelte\.config\./,
  /^next\.config\./,
  /^nuxt\.config\./,
  /^astro\.config\./,
  /^remix\.config\./,
  /^wrangler\.toml$/,
  /^\.env(\..+)?$/,
];

const MONOREPO_SIGNALS = new Set([
  'pnpm-workspace.yaml', 'lerna.json', 'nx.json', 'turbo.json', 'rush.json',
]);

// next.config.* at the root is the definitive Next.js signal
const NEXTJS_CONFIG_RE = /^next\.config\./;

function isIgnored(entry: string): boolean {
  if (entry.startsWith('.')) return true;
  if (D1_IGNORED_EXACT.has(entry)) return true;
  return D1_IGNORED_PATTERNS.some(p => p.test(entry));
}

// Check whether a root-level entry is covered by a manifest generated pattern.
// Handles exact names ("dist"), glob prefixes ("**/dist", "**/dist/**"), and
// dotfiles that manifest authors sometimes declare explicitly (".source").
function isGeneratedEntry(entry: string, generated: string[]): boolean {
  return generated.some(pattern => {
    if (pattern === entry) return true;
    // Strip leading **/ and trailing /** or /**/* to get the bare name
    const bare = pattern.replace(/^\*\*\//, '').replace(/\/\*\*.*$/, '');
    return bare === entry;
  });
}

export async function evaluateD1(
  root: string,
  manifest: Manifest | null,
  thresholds: Thresholds = DEFAULT_THRESHOLDS
): Promise<RuleResult> {
  let entries: string[];
  try {
    entries = await readdir(root);
  } catch {
    return { id: 'D1', passed: true, severity: 'warning', confidence: 'low', scoreImpact: 25, message: 'Could not read root directory' };
  }

  const generated = manifest?.generated ?? [];
  const isMonorepo = entries.some(e => MONOREPO_SIGNALS.has(e));
  const isNextJs = !isMonorepo && entries.some(e => NEXTJS_CONFIG_RE.test(e));
  const limit = isMonorepo ? thresholds.d1RootEntriesMonorepo : isNextJs ? thresholds.d1RootEntriesNextjs : thresholds.d1RootEntries;
  const meaningful = entries.filter(e => !isIgnored(e) && !isGeneratedEntry(e, generated));

  if (meaningful.length <= limit) {
    return {
      id: 'D1',
      passed: true,
      severity: 'warning',
      confidence: 'medium',
      scoreImpact: 25,
      message: `Root directory has ${meaningful.length} meaningful entries (≤${limit}${isMonorepo ? ', monorepo' : isNextJs ? ', next.js' : ''})`,
    };
  }

  return {
    id: 'D1',
    passed: false,
    severity: 'warning',
    confidence: 'medium',
    scoreImpact: 25,
    message: `Root directory has ${meaningful.length} meaningful entries (limit: ${limit}${isMonorepo ? ', monorepo' : isNextJs ? ', next.js' : ''})`,
    locations: meaningful.map(e => ({ path: e })),
  };
}

// D4 — no utility dumping ground files
// Only flag if the file is large enough to actually be a dump (≥ d4MinLines,
// see thresholds.ts). Small focused helpers (e.g. a single cn() utility) are
// not a problem.

async function isTypeOnlyFile(filePath: string): Promise<boolean> {
  try {
    const content = await readFile(filePath, 'utf-8');
    // Function declarations (function foo() or async function foo())
    if (/^\s*(export\s+)?(default\s+)?(async\s+)?function\s+\w/m.test(content)) return false;
    // Class implementations (not just `type X = class...` which doesn't exist anyway)
    if (/^\s*(export\s+)?(default\s+)?class\s+\w/m.test(content)) return false;
    // Arrow functions or function expressions assigned to variables
    if (/^\s*(export\s+)?(const|let|var)\s+\w[\w\s,:<>[\]]*=\s*(async\s*)?\(/m.test(content)) return false;
    return true;
  } catch {
    return false;
  }
}

export function evaluateD4(files: FileEntry[], thresholds: Thresholds = DEFAULT_THRESHOLDS): RuleResult {
  const violations = files.filter(f => {
    if (f.isGenerated) return false;
    if (f.lines === undefined || f.lines < thresholds.d4MinLines) return false;
    const basename = f.relativePath.split('/').pop() ?? '';
    const name = basename.includes('.') ? basename.slice(0, basename.lastIndexOf('.')) : basename;
    return UTILITY_DUMP_NAMES.has(name.toLowerCase());
  });

  if (violations.length === 0) {
    return {
      id: 'D4',
      passed: true,
      severity: 'warning',
      confidence: 'medium',
      scoreImpact: 25,
      message: 'No utility dumping ground files found',
    };
  }

  return {
    id: 'D4',
    passed: false,
    severity: 'warning',
    confidence: 'medium',
    scoreImpact: 25,
    message: `${violations.length} utility dumping ground file${violations.length > 1 ? 's' : ''} found`,
    locations: violations.map(f => ({ path: f.relativePath, detail: 'Rename to a domain-specific file' })),
  };
}

export async function evaluateD4WithRoot(
  root: string,
  files: FileEntry[],
  thresholds: Thresholds = DEFAULT_THRESHOLDS
): Promise<RuleResult> {
  const candidates = files.filter(f => {
    if (f.isGenerated) return false;
    if (f.lines === undefined || f.lines < thresholds.d4MinLines) return false;
    const basename = f.relativePath.split('/').pop() ?? '';
    const name = basename.includes('.') ? basename.slice(0, basename.lastIndexOf('.')) : basename;
    return UTILITY_DUMP_NAMES.has(name.toLowerCase());
  });

  const violations: FileEntry[] = [];
  for (const f of candidates) {
    const typeOnly = await isTypeOnlyFile(join(root, f.relativePath));
    if (!typeOnly) violations.push(f);
  }

  if (violations.length === 0) {
    return {
      id: 'D4',
      passed: true,
      severity: 'warning',
      confidence: 'medium',
      scoreImpact: 25,
      message: 'No utility dumping ground files found',
    };
  }

  return {
    id: 'D4',
    passed: false,
    severity: 'warning',
    confidence: 'medium',
    scoreImpact: 25,
    message: `${violations.length} utility dumping ground file${violations.length > 1 ? 's' : ''} found`,
    locations: violations.map(f => ({ path: f.relativePath, detail: 'Rename to a domain-specific file' })),
  };
}
