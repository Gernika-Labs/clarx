import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { minimatch } from 'minimatch';
import type { FileEntry } from './filesystem.js';
import type { Manifest, RuleResult } from '../types.js';

const GENERATED_PATTERNS = [
  'dist', '.next', 'out', 'build', 'coverage', '.turbo', '.cache',
  '__pycache__', '.mypy_cache', 'target', '.gradle',
];

// C1 — generated artifacts excluded from source tree
export function evaluateC1(
  files: FileEntry[],
  manifest: Manifest | null
): RuleResult {
  const declaredPatterns = manifest?.generated ?? [];

  // Find files that look generated but are NOT covered by any declared pattern
  const leaked = files.filter(f => {
    if (f.isGenerated) return false;
    const topDir = f.relativePath.split('/')[0];
    const looksGenerated = GENERATED_PATTERNS.some(p => topDir === p || topDir?.startsWith(`.${p}`));
    if (!looksGenerated) return false;
    const declared = declaredPatterns.some(p => minimatch(f.relativePath, p, { dot: true }));
    return !declared;
  });

  if (leaked.length === 0) {
    return {
      id: 'C1',
      passed: true,
      severity: 'hard_failure',
      scoreImpact: 100,
      message: 'Generated artifacts are excluded from the source tree',
    };
  }

  const dirs = [...new Set(leaked.map(f => f.relativePath.split('/')[0]))];
  return {
    id: 'C1',
    passed: false,
    severity: 'hard_failure',
    scoreImpact: 100,
    message: `Generated artifacts found in source tree: ${dirs.join(', ')}`,
    locations: dirs.map(d => ({ path: d!, detail: 'Declare in manifest.generated or add to .gitignore' })),
  };
}

// C2 — no source file exceeds 400 lines
const C2_LIMIT = 400;

export function evaluateC2(files: FileEntry[]): RuleResult {
  const violations = files
    .filter(f => !f.isGenerated && f.lines !== undefined && f.lines > C2_LIMIT)
    .sort((a, b) => (b.lines ?? 0) - (a.lines ?? 0));

  if (violations.length === 0) {
    return {
      id: 'C2',
      passed: true,
      severity: 'warning',
      scoreImpact: 25,
      message: 'No source file exceeds 400 lines',
    };
  }

  return {
    id: 'C2',
    passed: false,
    severity: 'warning',
    scoreImpact: 25,
    message: `${violations.length} source file${violations.length > 1 ? 's' : ''} exceed${violations.length === 1 ? 's' : ''} 400 lines`,
    locations: violations.slice(0, 10).map(f => ({
      path: f.relativePath,
      detail: `${f.lines} lines`,
    })),
  };
}
