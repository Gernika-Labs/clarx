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
  manifest: Manifest | null,
  gitTrackedPaths: Set<string>
): RuleResult {
  const declaredPatterns = manifest?.generated ?? [];

  // Find top-level dirs that look generated but are NOT covered by any declared pattern
  const leakedDirs = [...new Set(
    files
      .filter(f => {
        if (f.isGenerated) return false;
        const topDir = f.relativePath.split('/')[0];
        const looksGenerated = GENERATED_PATTERNS.some(p => topDir === p || topDir?.startsWith(`.${p}`));
        if (!looksGenerated) return false;
        return !declaredPatterns.some(p => minimatch(f.relativePath, p, { dot: true }));
      })
      .map(f => f.relativePath.split('/')[0]!)
  )];

  if (leakedDirs.length === 0) {
    return {
      id: 'C1',
      passed: true,
      severity: 'hard_failure',
      scoreImpact: 100,
      message: 'Generated artifacts are excluded from the source tree',
    };
  }

  // Hard failure only if generated files are actually committed to git.
  // If git info is unavailable or dirs are gitignored, downgrade to warning —
  // never hard-fail without positive evidence of committed generated output.
  const committedDirs = gitTrackedPaths.size > 0
    ? leakedDirs.filter(dir => [...gitTrackedPaths].some(p => p === dir || p.startsWith(dir + '/')))
    : []; // can't confirm tracking status — warn, don't hard-fail

  if (committedDirs.length > 0) {
    return {
      id: 'C1',
      passed: false,
      severity: 'hard_failure',
      scoreImpact: 100,
      message: `Generated artifacts committed to source control: ${committedDirs.join(', ')}`,
      locations: committedDirs.map(d => ({ path: d, detail: 'Remove from git tracking and add to .gitignore' })),
    };
  }

  // Gitignored but present in working tree — agent noise, not a hard failure
  return {
    id: 'C1',
    passed: false,
    severity: 'warning',
    scoreImpact: 25,
    message: `Generated directories in working tree but not committed: ${leakedDirs.join(', ')}`,
    locations: leakedDirs.map(d => ({ path: d, detail: 'Add to .gitignore to reduce agent noise' })),
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
