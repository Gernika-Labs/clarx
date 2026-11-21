import type { FileEntry } from './filesystem.js';

/**
 * Which source languages a scan saw, and whether the import graph covers
 * enough of them for repo-wide graph rules (B1, C3–C6) to speak for the repo.
 *
 * Why this exists: the import graph only parses JS/TS. A Python repo with one
 * `tailwind.config.js` used to look "resolved" and pass every graph rule over a
 * graph of a single file. Detection (what languages exist) is kept separate
 * from coverage (what the graph actually parsed).
 */

export type SourceLanguage = 'js-ts' | 'python' | 'go' | 'rust' | 'ruby' | 'java' | 'csharp' | 'c-cpp';

export type LanguageCoverage = {
  language: SourceLanguage;
  files: number;
  /** True when the import graph parses this language. Only `js-ts` today. */
  covered: boolean;
};

export type GraphCoverage = {
  /** Detected source languages, most files first. Excludes generated files. */
  languages: LanguageCoverage[];
  /** Share of detected source files the graph covers, 0–1. 0 when none were detected. */
  coveredShare: number;
  /** The minimum share at which graph rules are evaluated (`graphCoverageMin`). */
  minShare: number;
  /** True when graph rules may be evaluated for this repo. */
  eligible: boolean;
};

const EXT_TO_LANGUAGE: Record<string, SourceLanguage> = {
  '.ts': 'js-ts', '.tsx': 'js-ts', '.js': 'js-ts', '.jsx': 'js-ts', '.mjs': 'js-ts', '.cjs': 'js-ts',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.rb': 'ruby',
  '.java': 'java',
  '.cs': 'csharp',
  '.c': 'c-cpp', '.h': 'c-cpp', '.cpp': 'c-cpp',
};
// `.vue` / `.svelte` are deliberately absent: their scripts are JS/TS but the
// graph does not parse them. Counting them either way would misstate coverage,
// so they sit outside the census rather than silently inflating or deflating it.

const COVERED: ReadonlySet<SourceLanguage> = new Set(['js-ts']);

function extensionOf(path: string): string {
  const base = path.slice(path.lastIndexOf('/') + 1);
  const dot = base.lastIndexOf('.');
  return dot <= 0 ? '' : base.slice(dot);
}

export function computeGraphCoverage(files: FileEntry[], minShare: number): GraphCoverage {
  const counts = new Map<SourceLanguage, number>();
  for (const f of files) {
    if (f.isGenerated) continue;
    const language = EXT_TO_LANGUAGE[extensionOf(f.relativePath)];
    if (language) counts.set(language, (counts.get(language) ?? 0) + 1);
  }

  const languages: LanguageCoverage[] = [...counts.entries()]
    .map(([language, n]) => ({ language, files: n, covered: COVERED.has(language) }))
    .sort((a, b) => b.files - a.files || a.language.localeCompare(b.language));

  const total = languages.reduce((sum, l) => sum + l.files, 0);
  const covered = languages.filter(l => l.covered).reduce((sum, l) => sum + l.files, 0);
  const coveredShare = total === 0 ? 0 : covered / total;

  return { languages, coveredShare, minShare, eligible: covered > 0 && coveredShare >= minShare };
}

/** Why graph rules were not evaluated, for the rule message. */
export function describeCoverageGap(coverage: GraphCoverage): string {
  const covered = coverage.languages.find(l => l.covered);
  if (!covered) return 'no resolvable JS/TS import graph for this stack';
  const uncovered = coverage.languages.filter(l => !l.covered).map(l => `${l.language} (${l.files})`).join(', ');
  const pct = Math.round(coverage.coveredShare * 100);
  return `the import graph covers only JS/TS, ${pct}% of source files (needs ${Math.round(coverage.minShare * 100)}%); not covered: ${uncovered}`;
}
