import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildImportGraph } from '../analyzers/import-graph.js';
import { makeFile } from './file-fixtures.js';

async function setupDir(): Promise<string> {
  const root = join(tmpdir(), `clarx-ig-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await mkdir(root, { recursive: true });
  return root;
}

async function write(root: string, relativePath: string, content: string): Promise<void> {
  const relDir = relativePath.split('/').slice(0, -1).join('/');
  if (relDir) await mkdir(join(root, relDir), { recursive: true });
  await writeFile(join(root, relativePath), content, 'utf-8');
}

// ── SQL template literal false positives ─────────────────────────────────────
// Regression: unanchored FROM_RE matched `FROM 'table'` inside template
// literals and inflated C3 import counts.

describe('buildImportGraph — SQL template literals not counted as imports', () => {
  let root: string;
  beforeEach(async () => { root = await setupDir(); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it('does not count FROM inside a template literal as an import', async () => {
    await write(root, 'src/data.ts', [
      'export async function getUsers() {',
      "  const sql = `SELECT id, name FROM 'users' WHERE active = true`;",
      '  return sql;',
      '}',
    ].join('\n'));
    const graph = await buildImportGraph(root, [makeFile('src/data.ts')], null);
    expect(graph.importCount.get('src/data.ts') ?? 0).toBe(0);
  });

  it('does not count FROM inside a multi-line template literal', async () => {
    await write(root, 'src/queries.ts', [
      'const sql = `',
      '  SELECT *',
      "  FROM 'orders'",
      "  JOIN 'users' ON orders.user_id = users.id",
      '`;',
    ].join('\n'));
    const graph = await buildImportGraph(root, [makeFile('src/queries.ts')], null);
    expect(graph.importCount.get('src/queries.ts') ?? 0).toBe(0);
  });

  it('still counts a real import in a file that also contains a template literal', async () => {
    await write(root, 'src/db.ts', 'export const db = {};');
    await write(root, 'src/data.ts', [
      "import { db } from './db';",
      'export async function getUsers() {',
      "  const sql = `SELECT * FROM 'users'`;",
      '  return db.execute(sql);',
      '}',
    ].join('\n'));
    const graph = await buildImportGraph(root, [makeFile('src/data.ts'), makeFile('src/db.ts')], null);
    expect(graph.importCount.get('src/data.ts')).toBe(1);
  });
});

// ── @/ path alias resolution ──────────────────────────────────────────────────
// Regression: @/components/* and @/lib/* were not resolved to internal files
// so they were counted as package imports, inflating the "pkg" label in C3.

describe('buildImportGraph — @/ path alias resolution', () => {
  let root: string;
  beforeEach(async () => {
    root = await setupDir();
    await write(root, 'tsconfig.json', JSON.stringify({
      compilerOptions: { baseUrl: '.', paths: { '@/*': ['./src/*'] } },
    }));
  });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it('resolves @/lib/* imports as internal edges', async () => {
    await write(root, 'src/lib/api.ts', 'export function fetchData() {}');
    await write(root, 'src/components/Page.tsx', "import { fetchData } from '@/lib/api';");
    const files = [makeFile('src/components/Page.tsx'), makeFile('src/lib/api.ts')];
    const graph = await buildImportGraph(root, files, null);

    expect(graph.edges.get('src/components/Page.tsx')?.has('src/lib/api.ts')).toBe(true);
    expect(graph.fanIn.get('src/lib/api.ts')).toBe(1);
  });

  it('resolves @/components/* imports as internal edges', async () => {
    await write(root, 'src/components/ui/Button.tsx', 'export function Button() {}');
    await write(root, 'src/app/page.tsx', "import { Button } from '@/components/ui/Button';");
    const files = [makeFile('src/app/page.tsx'), makeFile('src/components/ui/Button.tsx')];
    const graph = await buildImportGraph(root, files, null);

    expect(graph.edges.get('src/app/page.tsx')?.has('src/components/ui/Button.tsx')).toBe(true);
  });

  it('does not add to edges when @/ resolves to a file not in the file set', async () => {
    await write(root, 'src/components/Page.tsx', "import { x } from '@/lib/missing';");
    const files = [makeFile('src/components/Page.tsx')];
    const graph = await buildImportGraph(root, files, null);

    expect(graph.edges.get('src/components/Page.tsx')?.size).toBe(0);
    // Import statement was real, so importCount still increments
    expect(graph.importCount.get('src/components/Page.tsx')).toBe(1);
  });

  it('mixes resolved @/ and bare package imports correctly', async () => {
    await write(root, 'src/lib/utils.ts', 'export const x = 1;');
    await write(root, 'src/components/Page.tsx', [
      "import React from 'react';",         // external package
      "import { x } from '@/lib/utils';",   // @/ alias → internal
    ].join('\n'));
    const files = [makeFile('src/components/Page.tsx'), makeFile('src/lib/utils.ts')];
    const graph = await buildImportGraph(root, files, null);

    // Total raw import count = 2
    expect(graph.importCount.get('src/components/Page.tsx')).toBe(2);
    // Only the resolved internal file is in edges
    expect(graph.edges.get('src/components/Page.tsx')?.has('src/lib/utils.ts')).toBe(true);
    expect(graph.edges.get('src/components/Page.tsx')?.size).toBe(1);
  });
});

// ── General import counting ───────────────────────────────────────────────────

describe('buildImportGraph — import counting', () => {
  let root: string;
  beforeEach(async () => { root = await setupDir(); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it('counts named, side-effect, and dynamic import forms', async () => {
    await write(root, 'src/foo.ts', 'export const foo = 1;');
    await write(root, 'src/side-effect.ts', "console.log('loaded');");
    await write(root, 'src/bar.ts', 'export const bar = 2;');
    await write(root, 'src/entry.ts', [
      "import { foo } from './foo';",
      "import './side-effect';",
      "const bar = await import('./bar');",
    ].join('\n'));
    const files = [
      makeFile('src/entry.ts'),
      makeFile('src/foo.ts'),
      makeFile('src/side-effect.ts'),
      makeFile('src/bar.ts'),
    ];
    const graph = await buildImportGraph(root, files, null);
    expect(graph.importCount.get('src/entry.ts')).toBe(3);
  });

  it('counts re-exports as imports', async () => {
    await write(root, 'src/Button.ts', 'export const Button = () => null;');
    await write(root, 'src/Input.ts', 'export const Input = () => null;');
    await write(root, 'src/index.ts', [
      "export { Button } from './Button';",
      "export { Input } from './Input';",
    ].join('\n'));
    const files = [makeFile('src/index.ts'), makeFile('src/Button.ts'), makeFile('src/Input.ts')];
    const graph = await buildImportGraph(root, files, null);
    expect(graph.importCount.get('src/index.ts')).toBe(2);
  });

  it('correctly tracks fan-in across multiple importers', async () => {
    await write(root, 'src/shared.ts', 'export const x = 1;');
    await write(root, 'src/a.ts', "import { x } from './shared';");
    await write(root, 'src/b.ts', "import { x } from './shared';");
    await write(root, 'src/c.ts', "import { x } from './shared';");
    const files = [
      makeFile('src/shared.ts'),
      makeFile('src/a.ts'),
      makeFile('src/b.ts'),
      makeFile('src/c.ts'),
    ];
    const graph = await buildImportGraph(root, files, null);
    expect(graph.fanIn.get('src/shared.ts')).toBe(3);
  });
});
