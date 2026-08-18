import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { scanFilesystem } from '../analyzers/filesystem.js';

// Files are written in deliberately non-alphabetical order: on a filesystem
// that returns entries in creation order, an unsorted readdir would reproduce
// this sequence rather than the sorted one.
const CREATION_ORDER = [
  'src/zebra.ts',
  'src/alpha.ts',
  'src/middle/omega.ts',
  'src/middle/beta.ts',
  'README.md',
  'package.json',
];

const ROOT = join(tmpdir(), `clarx-determinism-${Date.now()}`);

async function write(rel: string, content: string): Promise<void> {
  const abs = join(ROOT, rel);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, content, 'utf-8');
}

beforeAll(async () => {
  await mkdir(ROOT, { recursive: true });
  for (const rel of CREATION_ORDER) {
    await write(rel, `// ${rel}\nexport const x = 1;\n`);
  }
});

afterAll(async () => {
  await rm(ROOT, { recursive: true, force: true });
});

describe('scanFilesystem determinism', () => {
  it('returns files in a platform-independent sorted order', async () => {
    const { files } = await scanFilesystem(ROOT, { ignore: [], manifest: null });
    const paths = files.map(f => f.relativePath);

    // Depth-first, entries sorted by name at each level. This exact sequence
    // must hold on APFS and ext4 alike — it is what makes corpus snapshots
    // (packages/corpus) diffable across a dev machine and Linux CI.
    expect(paths).toEqual([
      'README.md',
      'package.json',
      join('src', 'alpha.ts'),
      join('src', 'middle', 'beta.ts'),
      join('src', 'middle', 'omega.ts'),
      join('src', 'zebra.ts'),
    ]);
  });

  it('produces identical output across repeated scans', async () => {
    const a = await scanFilesystem(ROOT, { ignore: [], manifest: null });
    const b = await scanFilesystem(ROOT, { ignore: [], manifest: null });
    expect(a.files.map(f => f.relativePath)).toEqual(b.files.map(f => f.relativePath));
  });
});
