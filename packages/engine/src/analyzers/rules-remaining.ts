import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FileEntry } from './filesystem.js';
import type { Manifest, RuleResult } from '../types.js';

// ── B4 — UI primitives and application logic are in separate locations ────────
// Flags if a single directory contains files that look like both generic primitives
// (Button, Input, Badge) and application-specific screens/pages.

const PRIMITIVE_PATTERNS = [/^[A-Z][a-z]+(\.tsx?|\.jsx?)$/, /^(button|input|badge|icon|avatar|card|modal|tooltip)/i];
const APP_LOGIC_PATTERNS = [/page\.[jt]sx?$/, /screen\.[jt]sx?$/, /view\.[jt]sx?$/, /container\.[jt]sx?$/, /layout\.[jt]sx?$/];

export function evaluateB4(files: FileEntry[]): RuleResult {
  const dirContents = new Map<string, { hasPrimitive: boolean; hasAppLogic: boolean }>();

  for (const f of files) {
    if (f.isGenerated) continue;
    const parts = f.relativePath.split('/');
    const dir = parts.slice(0, -1).join('/');
    const filename = parts[parts.length - 1]!;

    const entry = dirContents.get(dir) ?? { hasPrimitive: false, hasAppLogic: false };
    if (PRIMITIVE_PATTERNS.some(p => p.test(filename))) entry.hasPrimitive = true;
    if (APP_LOGIC_PATTERNS.some(p => p.test(filename))) entry.hasAppLogic = true;
    dirContents.set(dir, entry);
  }

  const violations = [...dirContents.entries()]
    .filter(([, c]) => c.hasPrimitive && c.hasAppLogic)
    .map(([dir]) => dir);

  if (violations.length === 0) {
    return {
      id: 'B4',
      passed: true,
      severity: 'recommendation',
      confidence: 'low',
      scoreImpact: 0,
      message: 'UI primitives and application logic are in separate directories',
    };
  }

  return {
    id: 'B4',
    passed: false,
    severity: 'recommendation',
    confidence: 'medium',
    scoreImpact: 0,
    message: `${violations.length} director${violations.length > 1 ? 'ies' : 'y'} mix primitives and application logic`,
    locations: violations.map(d => ({ path: d, detail: 'Separate reusable components from page/screen-specific logic' })),
  };
}

// ── B5 — test files mirror source structure or are co-located ─────────────────

export function evaluateB5(files: FileEntry[]): RuleResult {
  const sourceFiles = files.filter(
    f => !f.isGenerated && /\.[jt]sx?$/.test(f.relativePath) && !/\.(test|spec)\.[jt]sx?$/.test(f.relativePath)
  );
  const testFiles = new Set(
    files
      .filter(f => !f.isGenerated && /\.(test|spec)\.[jt]sx?$/.test(f.relativePath))
      .map(f => f.relativePath)
  );

  if (testFiles.size === 0) {
    return {
      id: 'B5',
      passed: true,
      severity: 'recommendation',
      confidence: 'low',
      scoreImpact: 0,
      message: 'No test files found',
    };
  }

  // Check each test file is either co-located or in a mirrored __tests__/ dir
  const misplaced: string[] = [];
  for (const testPath of testFiles) {
    const parts = testPath.split('/');
    const dir = parts.slice(0, -1).join('/');

    // Co-located: test is in same dir as its source
    const isColocated = sourceFiles.some(f => f.relativePath.split('/').slice(0, -1).join('/') === dir);

    // Mirrored: test is inside any directory named test, tests, or __tests__ at any depth
    const isMirrored = /(?:^|\/)(?:__tests__|tests?)(?:\/|$)/.test(dir);

    if (!isColocated && !isMirrored) {
      misplaced.push(testPath);
    }
  }

  if (misplaced.length === 0) {
    return {
      id: 'B5',
      passed: true,
      severity: 'recommendation',
      confidence: 'low',
      scoreImpact: 0,
      message: 'All test files are co-located or in mirrored test directories',
    };
  }

  return {
    id: 'B5',
    passed: false,
    severity: 'recommendation',
    confidence: 'medium',
    scoreImpact: 0,
    message: `${misplaced.length} test file${misplaced.length > 1 ? 's' : ''} are not co-located or mirrored`,
    locations: misplaced.slice(0, 10).map(p => ({ path: p })),
  };
}

// ── E2 — related files are co-located or grouped ──────────────────────────────

export function evaluateE2(files: FileEntry[]): RuleResult {
  // Look for component files (.tsx) that have no adjacent test or type file.
  // This is a soft recommendation, not a hard check.
  const componentFiles = files.filter(
    f => !f.isGenerated && /\.tsx$/.test(f.relativePath) && !/\.(test|spec)\./.test(f.relativePath)
  );

  if (componentFiles.length === 0) {
    return {
      id: 'E2',
      passed: true,
      severity: 'recommendation',
      confidence: 'low',
      scoreImpact: 0,
      message: 'No component files to check',
    };
  }

  const fileSet = new Set(files.map(f => f.relativePath));

  const lonely = componentFiles.filter(f => {
    const base = f.relativePath.replace(/\.tsx$/, '');
    const dir = f.relativePath.split('/').slice(0, -1).join('/');
    const hasTest = fileSet.has(`${base}.test.tsx`) || fileSet.has(`${base}.test.ts`) || fileSet.has(`${base}.spec.tsx`);
    const hasTypes = fileSet.has(`${base}.types.ts`) || fileSet.has(`${dir}/types.ts`);
    return !hasTest && !hasTypes;
  });

  const pct = Math.round((lonely.length / componentFiles.length) * 100);

  // Only flag if more than half of components are missing companion files
  if (pct < 50) {
    return {
      id: 'E2',
      passed: true,
      severity: 'recommendation',
      confidence: 'low',
      scoreImpact: 0,
      message: `Most component files have co-located companions (${componentFiles.length - lonely.length}/${componentFiles.length})`,
    };
  }

  return {
    id: 'E2',
    passed: false,
    severity: 'recommendation',
    confidence: 'medium',
    scoreImpact: 0,
    message: `${lonely.length}/${componentFiles.length} component files have no co-located test or type file`,
    locations: lonely.slice(0, 10).map(f => ({ path: f.relativePath })),
  };
}

// ── E4 — package boundaries enforced by tooling ───────────────────────────────

export async function evaluateE4(root: string, files: FileEntry[]): Promise<RuleResult> {
  // Check for any of: tsconfig paths, eslint import plugin, package.json exports conditions
  const signals: string[] = [];

  // Check root tsconfig for paths
  const rootTsconfig = files.find(f => f.relativePath === 'tsconfig.json');
  if (rootTsconfig) {
    try {
      const raw = await readFile(join(root, 'tsconfig.json'), 'utf-8');
      const tsconfig = JSON.parse(raw) as Record<string, unknown>;
      const co = tsconfig['compilerOptions'] as Record<string, unknown> | undefined;
      if (co?.['paths']) signals.push('tsconfig paths');
    } catch { /* ignore */ }
  }

  // Check for eslint config with import rules
  const eslintFiles = files.filter(f =>
    !f.isGenerated && (
      f.relativePath === '.eslintrc.js' || f.relativePath === '.eslintrc.ts' ||
      f.relativePath === 'eslint.config.ts' || f.relativePath === 'eslint.config.js' ||
      f.relativePath === '.eslintrc.json'
    )
  );
  if (eslintFiles.length > 0) signals.push('eslint config');

  // Check if workspace package.json files have exports with conditions (strict encapsulation)
  const hasConditionsExports = await (async () => {
    const pkgJsonFiles = files.filter(
      f => !f.isGenerated && f.relativePath.endsWith('package.json') && f.relativePath.split('/').length > 1
    );
    for (const f of pkgJsonFiles) {
      try {
        const raw = await readFile(join(root, f.relativePath), 'utf-8');
        const pkg = JSON.parse(raw) as Record<string, unknown>;
        if (pkg['exports'] && typeof pkg['exports'] === 'object') {
          signals.push('package exports field');
          return true;
        }
      } catch { /* ignore */ }
    }
    return false;
  })();

  if (signals.length >= 1) {
    return {
      id: 'E4',
      passed: true,
      severity: 'recommendation',
      confidence: 'low',
      scoreImpact: 0,
      message: `Package boundaries enforced by tooling: ${signals.join(', ')}`,
    };
  }

  return {
    id: 'E4',
    passed: false,
    severity: 'recommendation',
    confidence: 'medium',
    scoreImpact: 0,
    message: 'No package boundary enforcement detected (no tsconfig paths, eslint import rules, or exports field)',
  };
}
