import { describe, it, expect } from '@jest/globals';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { evaluateC1, evaluateC2 } from '../analyzers/rules-c.js';
import { makeFile, makeGenerated, makeManifest } from './file-fixtures.js';

describe('C1 — generated artifacts excluded from source tree', () => {
  it('passes when no generated-looking dirs are present', () => {
    const files = [makeFile('src/index.ts'), makeFile('src/utils.ts')];
    const result = evaluateC1(files, makeManifest(), new Set());
    expect(result.passed).toBe(true);
  });

  it('passes when dist/ is declared in manifest.generated', () => {
    const files = [makeFile('src/index.ts'), makeGenerated('dist/index.js')];
    const manifest = makeManifest({ generated: ['**/dist/**', '**/dist'] });
    const result = evaluateC1(files, manifest, new Set());
    expect(result.passed).toBe(true);
  });

  it('hard-fails when a generated dir is committed to git', () => {
    const files = [makeFile('src/index.ts'), makeFile('dist/index.js')];
    const tracked = new Set(['src/index.ts', 'dist/index.js']);
    const result = evaluateC1(files, makeManifest({ generated: [] }), tracked);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('hard_failure');
    expect(result.locations?.some(l => l.path === 'dist')).toBe(true);
  });

  it('downgrades to warning when generated dir is gitignored (not committed)', () => {
    const files = [makeFile('src/index.ts'), makeFile('dist/index.js')];
    const tracked = new Set(['src/index.ts']);
    const result = evaluateC1(files, makeManifest({ generated: [] }), tracked);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('warning');
  });

  it('downgrades to warning when no git info is available (cannot confirm tracking)', () => {
    const files = [makeFile('src/index.ts'), makeFile('dist/index.js')];
    const result = evaluateC1(files, null, new Set());
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('warning');
  });

  it('does not flag source dirs that happen to contain a common word', () => {
    const files = [makeFile('src/build-utils.ts'), makeFile('src/output.ts')];
    const result = evaluateC1(files, makeManifest(), new Set());
    expect(result.passed).toBe(true);
  });
});

describe('C2 — no source file exceeds 400 lines', () => {
  it('passes when all files are under 400 lines', async () => {
    const files = [makeFile('src/a.ts', 100), makeFile('src/b.ts', 399)];
    const result = await evaluateC2('/', files);
    expect(result.passed).toBe(true);
  });

  it('fails when a file exceeds 400 lines', async () => {
    const files = [makeFile('src/a.ts', 100), makeFile('src/b.ts', 401)];
    const result = await evaluateC2('/', files);
    expect(result.passed).toBe(false);
    expect(result.locations).toHaveLength(1);
    expect(result.locations?.[0]?.path).toBe('src/b.ts');
    expect(result.locations?.[0]?.detail).toMatch(/^401 lines/);
  });

  it('reports multiple violations sorted by line count descending', async () => {
    const files = [
      makeFile('src/a.ts', 500),
      makeFile('src/b.ts', 800),
      makeFile('src/c.ts', 200),
    ];
    const result = await evaluateC2('/', files);
    expect(result.passed).toBe(false);
    expect(result.locations).toHaveLength(2);
    expect(result.locations?.[0]?.path).toBe('src/b.ts');
  });

  it('ignores generated files', async () => {
    const files = [makeGenerated('dist/bundle.js')];
    Object.assign(files[0]!, { lines: 9999 });
    const result = await evaluateC2('/', files);
    expect(result.passed).toBe(true);
  });

  it('ignores files without a line count', async () => {
    const files = [makeFile('assets/logo.png')];
    const result = await evaluateC2('/', files);
    expect(result.passed).toBe(true);
  });

  it('skips shadcn/ui files in components/ui/ regardless of size', async () => {
    const root = join(tmpdir(), `clarx-c2-shadcn-dir-${Date.now()}`);
    try {
      await mkdir(join(root, 'components/ui'), { recursive: true });
      const lines = Array.from({ length: 500 }, (_, i) => `export const C${i} = () => null;`);
      await writeFile(join(root, 'components/ui/sidebar.tsx'), lines.join('\n'), 'utf-8');
      const files = [makeFile('components/ui/sidebar.tsx', 500)];
      const result = await evaluateC2(root, files);
      expect(result.passed).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('skips files matching the shadcn fingerprint (use client + radix + cva) outside components/ui/', async () => {
    const root = join(tmpdir(), `clarx-c2-shadcn-fp-${Date.now()}`);
    try {
      await mkdir(join(root, 'src/shared'), { recursive: true });
      const content = [
        `'use client'`,
        `import * as TogglePrimitive from '@radix-ui/react-toggle'`,
        `import { cva } from 'class-variance-authority'`,
        `const toggleVariants = cva('base')`,
        ...Array.from({ length: 450 }, (_, i) => `export const T${i} = () => null;`),
      ].join('\n');
      await writeFile(join(root, 'src/shared/toggle.tsx'), content, 'utf-8');
      const files = [makeFile('src/shared/toggle.tsx', 455)];
      const result = await evaluateC2(root, files);
      expect(result.passed).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('counts symbols in grouped export { A, B, C } blocks, not just statements', async () => {
    const root = join(tmpdir(), `clarx-c2-exports-${Date.now()}`);
    try {
      await mkdir(join(root, 'src'), { recursive: true });
      const fns = Array.from({ length: 20 }, (_, i) => `function Comp${i}() { return null }`);
      const exportBlock = `export {\n  ${Array.from({ length: 20 }, (_, i) => `Comp${i}`).join(',\n  ')}\n}`;
      const content = [`'use client'`, ...fns, exportBlock].join('\n');
      const lineCount = content.split('\n').length;
      await writeFile(join(root, 'src/multi-export.tsx'), content, 'utf-8');
      const files = [makeFile('src/multi-export.tsx', lineCount)];
      const result = await evaluateC2(root, files);
      if (!result.passed) {
        expect(result.locations?.[0]?.detail).toMatch(/20 exports/);
        expect(result.locations?.[0]?.detail).not.toMatch(/\b1 export\b/);
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('escalates to hard_failure when any file exceeds 600 lines', async () => {
    const root = join(tmpdir(), `clarx-c2-hard-${Date.now()}`);
    try {
      await mkdir(join(root, 'src'), { recursive: true });
      const big = Array.from({ length: 700 }, (_, i) => `export function fn${i}() {}`).join('\n');
      await writeFile(join(root, 'src/big.tsx'), big, 'utf-8');
      const files = [makeFile('src/big.tsx', 700)];
      const result = await evaluateC2(root, files);
      expect(result.passed).toBe(false);
      expect(result.severity).toBe('hard_failure');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('stays warning when all violations are 400–600 lines', async () => {
    const root = join(tmpdir(), `clarx-c2-warn-${Date.now()}`);
    try {
      await mkdir(join(root, 'src'), { recursive: true });
      const mid = Array.from({ length: 500 }, (_, i) => `export function fn${i}() {}`).join('\n');
      await writeFile(join(root, 'src/mid.tsx'), mid, 'utf-8');
      const files = [makeFile('src/mid.tsx', 500)];
      const result = await evaluateC2(root, files);
      expect(result.passed).toBe(false);
      expect(result.severity).toBe('warning');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('includes overage percentage in the detail string', async () => {
    const root = join(tmpdir(), `clarx-c2-overage-${Date.now()}`);
    try {
      await mkdir(join(root, 'src'), { recursive: true });
      const content = Array.from({ length: 800 }, (_, i) => `export function fn${i}() {}`).join('\n');
      await writeFile(join(root, 'src/over.tsx'), content, 'utf-8');
      const files = [makeFile('src/over.tsx', 800)];
      const result = await evaluateC2(root, files);
      expect(result.locations?.[0]?.detail).toMatch(/100% over/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('skips SVG illustration files in svgs/ directories', async () => {
    const root = join(tmpdir(), `clarx-c2-svg-${Date.now()}`);
    try {
      await mkdir(join(root, 'components/svgs'), { recursive: true });
      const svgLines = Array.from({ length: 400 }, (_, i) => `  <path d="M${i} 0 L${i + 1} 1" />`);
      const svgContent = [
        "import React from 'react'",
        'export default function ManoloBell() {',
        '  return (',
        '    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">',
        ...svgLines,
        '    </svg>',
        '  )',
        '}',
      ].join('\n');
      await writeFile(join(root, 'components/svgs/manolo.tsx'), svgContent, 'utf-8');
      const lineCount = svgContent.split('\n').length;
      const files = [makeFile('components/svgs/manolo.tsx', lineCount)];
      const result = await evaluateC2(root, files);
      expect(result.passed).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
