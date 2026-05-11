import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import ignore, { type Ignore } from 'ignore';
import type { Manifest } from '../types.js';

const ALWAYS_EXCLUDED = ['node_modules', '.git'];

const DEFAULT_GENERATED_PATTERNS = [
  'dist', 'build', 'out',
  '.next', '.nuxt', '.output',
  'coverage', '.nyc_output',
  '.turbo', '.cache',
  'storybook-static',
  '__pycache__', '*.pyc', '*.pyo',
];

const LINE_COUNT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.go', '.rs', '.rb', '.java', '.cs', '.cpp', '.c', '.h',
  '.vue', '.svelte',
]);

export type FileEntry = {
  path: string;
  relativePath: string;
  lines?: number;
  isGenerated: boolean;
};

export type ScanStats = {
  filesScanned: number;
};

async function countLines(filePath: string): Promise<number> {
  const content = await readFile(filePath, 'utf-8');
  return content.split('\n').length;
}

function shouldCountLines(filePath: string): boolean {
  const ext = filePath.slice(filePath.lastIndexOf('.'));
  return LINE_COUNT_EXTENSIONS.has(ext);
}

async function buildIgnoreFilter(root: string, extraPatterns: string[]): Promise<Ignore> {
  const ig = ignore().add([...ALWAYS_EXCLUDED, ...DEFAULT_GENERATED_PATTERNS, ...extraPatterns]);
  try {
    const content = await readFile(join(root, '.gitignore'), 'utf-8');
    ig.add(content);
  } catch {
    // no .gitignore — fine
  }
  return ig;
}

export async function scanFilesystem(
  root: string,
  options: { ignore: string[]; manifest: Manifest | null }
): Promise<{ files: FileEntry[]; stats: ScanStats }> {
  const extraPatterns = [
    ...(options.manifest?.generated ?? []),
    ...options.ignore,
  ];

  const ignoreFilter = await buildIgnoreFilter(root, extraPatterns);

  const files: FileEntry[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const rel = relative(root, fullPath);

      const isGenerated = rel.length > 0 && ignoreFilter.ignores(rel);

      if (entry.isDirectory()) {
        if (!isGenerated) await walk(fullPath);
      } else if (entry.isFile()) {
        const lines = (!isGenerated && shouldCountLines(fullPath))
          ? await countLines(fullPath)
          : undefined;
        files.push({ path: fullPath, relativePath: rel, lines, isGenerated });
      }
    }
  }

  await walk(root);

  return {
    files,
    stats: { filesScanned: files.length },
  };
}
