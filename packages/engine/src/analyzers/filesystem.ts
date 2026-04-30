import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { minimatch } from 'minimatch';
import type { Manifest } from '../types.js';

const ALWAYS_EXCLUDED = [
  '**/node_modules/**',
  '**/.git/**',
];

export type FileEntry = {
  path: string;
  relativePath: string;
  lines?: number;
  isGenerated: boolean;
};

export type ScanStats = {
  filesScanned: number;
};

export async function scanFilesystem(
  root: string,
  options: { ignore: string[]; manifest: Manifest | null }
): Promise<{ files: FileEntry[]; stats: ScanStats }> {
  const generatedPatterns = [
    ...ALWAYS_EXCLUDED,
    ...(options.manifest?.generated ?? []),
    ...options.ignore,
  ];

  const files: FileEntry[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const rel = relative(root, fullPath);

      const isExcluded = generatedPatterns.some(p => minimatch(rel, p, { dot: true }));

      if (entry.isDirectory()) {
        if (!isExcluded) await walk(fullPath);
      } else if (entry.isFile()) {
        files.push({
          path: fullPath,
          relativePath: rel,
          isGenerated: isExcluded,
        });
      }
    }
  }

  await walk(root);

  return {
    files,
    stats: { filesScanned: files.length },
  };
}
