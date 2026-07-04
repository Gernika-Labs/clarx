import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { minimatch } from 'minimatch';
import type { FileEntry } from './filesystem.js';
import type { Manifest, RuleResult } from '../types.js';
import { DEFAULT_THRESHOLDS, type Thresholds } from '../thresholds.js';

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
      confidence: 'medium',
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
      confidence: 'high',
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
    confidence: 'medium',
    scoreImpact: 25,
    message: `Generated directories in working tree but not committed: ${leakedDirs.join(', ')}`,
    locations: leakedDirs.map(d => ({ path: d, detail: 'Add to .gitignore to reduce agent noise' })),
  };
}

// C2 — no source file exceeds the line limit (c2FileLines / c2FileLinesHard in
// thresholds.ts; files above the hard limit escalate to hard failure).

// Files whose names signal static data — exempt from the line-count limit
// regardless of whether they contain a small incidental helper.
const DATA_FILENAME_RE = /[-.](?:content|data|seed|fixture|mock|stub|constants?)(?:\.[^.]+)*\.[jt]sx?$/i;

// SVG illustration/icon files: line count is path data, not code complexity.
// Detect by directory convention AND content — a file in svgs/ that is mostly
// SVG element lines (path, rect, circle, etc.) is graphics, not logic.
const SVG_CONTENT_DIR_RE = /(?:^|\/)(?:svgs?|icons?|illustrations?)(?:\/|$)/i;
const SVG_ELEMENT_LINE_RE = /^\s*<(?:path|rect|circle|polygon|polyline|ellipse|line|g\b|defs|mask|clipPath)\b/;

function isSvgGraphicsFile(relativePath: string, content: string): boolean {
  if (!SVG_CONTENT_DIR_RE.test(relativePath)) return false;
  const lines = content.split('\n');
  const svgLineCount = lines.filter(l => SVG_ELEMENT_LINE_RE.test(l)).length;
  return svgLineCount / lines.length > 0.15;
}

// Shadcn/ui components are vendor-installed files, not app code — exempt from C2.
// Detect by directory convention (components/ui/) OR by two content fingerprints:
// "use client" + @radix-ui import. Both signals together are specific enough to
// identify vendor UI components — cva isn't used in all shadcn components (e.g. sidebar).
const SHADCN_DIR_RE = /(?:^|\/)components\/ui\//;
const RADIX_IMPORT_RE = /from ['"]@radix-ui\//;
const USE_CLIENT_DIRECTIVE_RE = /^\s*['"]use client['"]/m;

function isShadcnComponent(relativePath: string, content: string): boolean {
  if (SHADCN_DIR_RE.test(relativePath)) return true;
  return USE_CLIENT_DIRECTIVE_RE.test(content) && RADIX_IMPORT_RE.test(content);
}

// Detects files with meaningful executable logic (functions, classes, arrow
// functions). Pure data/type files that happen to have one small helper are
// caught by DATA_FILENAME_RE above; this check handles everything else.
const FN_RE = /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+\w/m;
const CLASS_RE = /^\s*(?:export\s+)?(?:default\s+)?class\s+\w/m;
const ARROW_RE = /^\s*(?:export\s+)?(?:const|let|var)\s+\w[\w\s,:<>[\]]*=\s*(?:async\s*)?\(/m;

function hasExecutableLogic(content: string): boolean {
  return FN_RE.test(content) || CLASS_RE.test(content) || ARROW_RE.test(content);
}

// Counts exported symbols, not export statements.
// The critical distinction: `export { A, B, C }` is one statement but three symbols.
// Files that collect all exports in a single grouped block (common in shadcn/ui and
// barrel-style components) would otherwise show "1 export" regardless of how many
// symbols they actually export.
//
// `export * from './X'` re-exports cannot be counted without resolving the module,
// so they are tracked separately as `starExports` and shown in the detail string.
function countTopLevelExports(content: string): { total: number; types: number; starExports: number } {
  let total = 0;
  let types = 0;

  // Direct named exports: export const/function/class/type/interface/enum/default
  // Excludes export { } blocks and export * re-exports, handled separately below.
  for (const m of content.matchAll(/^export\s+(?!\*|(?:type\s+)?\{)/gm)) {
    total++;
    if (/^export\s+(?:type\b|interface\s+\w|enum\s+\w)/.test(m[0])) types++;
  }

  // Grouped exports: `export { A, B, C }` or `export type { A, B }` — possibly multi-line.
  // [^}]* matches newlines (negated char class), so this handles multi-line blocks.
  for (const m of content.matchAll(/^export\s+(type\s+)?\{([^}]*)\}/gm)) {
    const isTypeBlock = !!m[1];
    const symbols = (m[2] ?? '')
      .split(',')
      .map(s => s.replace(/\/\/.*$/, '').trim()) // strip inline comments
      .filter(s => s.length > 0);
    total += symbols.length;
    if (isTypeBlock) {
      types += symbols.length;
    } else {
      types += symbols.filter(s => /^type\s+/.test(s)).length;
    }
  }

  // Star re-exports: `export * from './X'` — counted by module, not by symbol.
  const starExports = (content.match(/^export\s+\*\s+(?:as\s+\w+\s+)?from\b/gm) ?? []).length;

  return { total, types, starExports };
}

// Export density threshold: >= 1 export per 100 lines signals co-located concerns.
// A low-density file (e.g. 10 exports / 1462 lines ≈ 0.68) is more likely a single
// coherent concern (all Prisma queries, all Drizzle schema) than a grab-bag.
const EXPORT_DENSITY_THRESHOLD = 1.0; // exports per 100 lines
const TYPE_MAJORITY_MIN = 5; // minimum type exports before "extract types" fires

function exportDetail(lines: number, total: number, types: number, starExports: number, softLimit: number): string {
  const effectiveTotal = total + starExports;
  const density = lines > 0 ? (effectiveTotal * 100) / lines : 0;
  const overage = lines > softLimit ? Math.round(((lines - softLimit) / softLimit) * 100) : 0;
  const overageTag = overage > 0 ? ` (${overage}% over)` : '';
  const starTag = starExports > 0 ? ` +${starExports} re-export module${starExports > 1 ? 's' : ''}` : '';
  if (density >= EXPORT_DENSITY_THRESHOLD) {
    const values = total - types;
    if (types >= TYPE_MAJORITY_MIN && types > values) {
      return `${lines} lines${overageTag}, ${total} exports (${types} types, ${values} values)${starTag} — extract type definitions to a separate types file; do not restructure logic functions`;
    }
    return `${lines} lines${overageTag}, ${total} exports${starTag} — co-located concerns, consider splitting by domain`;
  }
  return `${lines} lines${overageTag}, ${total} export${total === 1 ? '' : 's'}${starTag} — single complex component, consider reducing internal complexity rather than splitting`;
}

export async function evaluateC2(
  root: string,
  files: FileEntry[],
  thresholds: Thresholds = DEFAULT_THRESHOLDS
): Promise<RuleResult> {
  const candidates = files.filter(f => !f.isGenerated && f.lines !== undefined && f.lines > thresholds.c2FileLines);

  const violations: Array<{ file: FileEntry; total: number; types: number; starExports: number }> = [];
  for (const f of candidates) {
    if (DATA_FILENAME_RE.test(f.relativePath)) continue;
    try {
      const content = await readFile(join(root, f.relativePath), 'utf-8');
      if (isSvgGraphicsFile(f.relativePath, content)) continue;
      if (isShadcnComponent(f.relativePath, content)) continue;
      if (hasExecutableLogic(content)) {
        const counts = countTopLevelExports(content);
        violations.push({ file: f, total: counts.total, types: counts.types, starExports: counts.starExports });
      }
    } catch {
      violations.push({ file: f, total: 0, types: 0, starExports: 0 });
    }
  }
  violations.sort((a, b) => (b.file.lines ?? 0) - (a.file.lines ?? 0));

  if (violations.length === 0) {
    return {
      id: 'C2',
      passed: true,
      severity: 'warning',
      confidence: 'high',
      scoreImpact: 25,
      message: `No source file exceeds ${thresholds.c2FileLines} lines`,
    };
  }

  const hasHardViolation = violations.some(v => (v.file.lines ?? 0) > thresholds.c2FileLinesHard);

  return {
    id: 'C2',
    passed: false,
    severity: hasHardViolation ? 'hard_failure' : 'warning',
    confidence: 'high',
    scoreImpact: 25,
    message: `${violations.length} source file${violations.length > 1 ? 's' : ''} exceed${violations.length === 1 ? 's' : ''} ${thresholds.c2FileLines} lines`,
    locations: violations.slice(0, 10).map(({ file: f, total, types, starExports }) => ({
      path: f.relativePath,
      detail: exportDetail(f.lines ?? 0, total, types, starExports, thresholds.c2FileLines),
    })),
  };
}
