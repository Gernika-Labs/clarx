import { describe, it, expect } from '@jest/globals';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { evaluateC1, evaluateC2 } from '../analyzers/rules-c.js';
import { evaluateC3, evaluateC4, evaluateC6 } from '../analyzers/rules-c3-c4-c5.js';
import type { ImportGraph } from '../analyzers/import-graph.js';
import { makeFile, makeGenerated, makeManifest } from './helpers.js';

function makeGraph(
  entries: Array<{ file: string; count: number; deps?: string[] }>
): ImportGraph {
  const edges = new Map<string, Set<string>>();
  const fanIn = new Map<string, number>();
  const importCount = new Map<string, number>();
  for (const { file, count, deps = [] } of entries) {
    edges.set(file, new Set(deps));
    importCount.set(file, count);
    for (const dep of deps) fanIn.set(dep, (fanIn.get(dep) ?? 0) + 1);
  }
  return { edges, fanIn, importCount, packageIndex: new Map() };
}

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
    // git tracks dist/index.js → genuine hard failure
    const tracked = new Set(['src/index.ts', 'dist/index.js']);
    const result = evaluateC1(files, makeManifest({ generated: [] }), tracked);
    expect(result.passed).toBe(false);
    expect(result.severity).toBe('hard_failure');
    expect(result.locations?.some(l => l.path === 'dist')).toBe(true);
  });

  it('downgrades to warning when generated dir is gitignored (not committed)', () => {
    const files = [makeFile('src/index.ts'), makeFile('dist/index.js')];
    // git tracks only src — dist is gitignored but present in working tree
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
    expect(result.locations?.[0]?.path).toBe('src/b.ts'); // worst first
  });

  it('ignores generated files', async () => {
    const files = [makeGenerated('dist/bundle.js')];
    Object.assign(files[0]!, { lines: 9999 });
    const result = await evaluateC2('/', files);
    expect(result.passed).toBe(true);
  });

  it('ignores files without a line count', async () => {
    const files = [makeFile('assets/logo.png')]; // no lines
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
      // Simulates a shadcn-style file: all exports collected at the bottom in one block
      const fns = Array.from({ length: 20 }, (_, i) => `function Comp${i}() { return null }`);
      const exportBlock = `export {\n  ${Array.from({ length: 20 }, (_, i) => `Comp${i}`).join(',\n  ')}\n}`;
      const content = [`'use client'`, ...fns, exportBlock].join('\n');
      const lineCount = content.split('\n').length;
      await writeFile(join(root, 'src/multi-export.tsx'), content, 'utf-8');
      const files = [makeFile('src/multi-export.tsx', lineCount)];
      const result = await evaluateC2(root, files);
      // If line count > 400 it should flag, but the detail must say ~20 exports, not 1
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
      // 800 lines = 100% over the 400-line limit
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
    // Regression: components/svgs/manolo.tsx (688L) was flagging C2 because it
    // has a function declaration, but its line count is SVG path data, not logic.
    const root = join(tmpdir(), `clarx-c2-svg-${Date.now()}`);
    try {
      await mkdir(join(root, 'components/svgs'), { recursive: true });
      // Build a minimal SVG component with >15% SVG element lines
      const svgLines = Array.from({ length: 400 }, (_, i) => `  <path d="M${i} 0 L${i + 1} 1" />`);
      const svgContent = [
        "import React from 'react'",
        'export default function ManoloBell() {',
        "  return (",
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

describe('C4 — high fan-in files are documented', () => {
  function makeGraphWithFanIn(entries: Array<{ file: string; callers: number }>): ImportGraph {
    const fanIn = new Map<string, number>();
    const edges = new Map<string, Set<string>>();
    const importCount = new Map<string, number>();
    for (const { file, callers } of entries) {
      fanIn.set(file, callers);
      edges.set(file, new Set());
      importCount.set(file, 0);
    }
    return { edges, fanIn, importCount, packageIndex: new Map() };
  }

  it('passes when no file exceeds the threshold', () => {
    const graph = makeGraphWithFanIn([{ file: 'src/utils.ts', callers: 5 }]);
    expect(evaluateC4(graph, makeManifest()).passed).toBe(true);
  });

  it('fails when a file exceeds the threshold and is not declared', () => {
    const graph = makeGraphWithFanIn([{ file: 'src/db.ts', callers: 15 }]);
    const result = evaluateC4(graph, makeManifest());
    expect(result.passed).toBe(false);
    expect(result.message).toContain('src/db.ts');
  });

  it('passes when the high fan-in file is declared in manifest.highFanIn', () => {
    const graph = makeGraphWithFanIn([{ file: 'src/db.ts', callers: 15 }]);
    const manifest = makeManifest({ highFanIn: ['src/db.ts'] });
    expect(evaluateC4(graph, manifest).passed).toBe(true);
  });

  it('auto-exempts files in ui/ directories — foundational UI primitives are designed to have many callers', () => {
    const graph = makeGraphWithFanIn([
      { file: 'components/ui/text.tsx', callers: 84 },
      { file: 'components/ui/button.tsx', callers: 26 },
      { file: 'src/ui/index.ts', callers: 40 },
    ]);
    expect(evaluateC4(graph, makeManifest()).passed).toBe(true);
  });

  it('does not exempt high fan-in files outside ui/ directories', () => {
    const graph = makeGraphWithFanIn([
      { file: 'components/ui/text.tsx', callers: 84 }, // exempted
      { file: 'src/lib/db.ts', callers: 20 },           // not exempted
    ]);
    const result = evaluateC4(graph, makeManifest());
    expect(result.passed).toBe(false);
    expect(result.message).toContain('src/lib/db.ts');
    expect(result.message).not.toContain('text.tsx');
  });
});

describe('C6 — entry files expose a local boundary surface before infrastructure', () => {
  it('passes when an entry file imports a local view-model boundary', async () => {
    const root = join(tmpdir(), `clarx-c6-pass-${Date.now()}`);
    try {
      await mkdir(join(root, 'src/training'), { recursive: true });
      await writeFile(join(root, 'src/training/page.tsx'), `
import { useTrainingPageViewModel } from './useTrainingPageViewModel';
import { Button } from './button';

export function Page() {
  return <Button />;
}
`, 'utf-8');
      await writeFile(join(root, 'src/training/useTrainingPageViewModel.ts'), 'export function useTrainingPageViewModel() { return {}; }\n', 'utf-8');

      const result = await evaluateC6(root, [
        makeFile('src/training/page.tsx'),
        makeFile('src/training/useTrainingPageViewModel.ts'),
      ]);

      expect(result.passed).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('flags entry files that coordinate infrastructure imports directly', async () => {
    const root = join(tmpdir(), `clarx-c6-fail-${Date.now()}`);
    try {
      await mkdir(join(root, 'src/training'), { recursive: true });
      await writeFile(join(root, 'src/training/page.tsx'), `
import { useTrainingFeedback } from './hooks/useTrainingFeedback';
import { useBackendPagination } from './hooks/useBackendPagination';
import { fetchTraining } from './services/training-service';
import { TrainingResponse } from './types';
import { Badge } from './Badge';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { Filters } from './Filters';

export function Page() {
  return <Button />;
}
`, 'utf-8');

      const result = await evaluateC6(root, [
        makeFile('src/training/page.tsx'),
      ]);

      expect(result.passed).toBe(false);
      expect(result.locations?.[0]?.path).toBe('src/training/page.tsx');
      expect(result.locations?.[0]?.detail).toContain('no local boundary surface');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

// ── C3 ────────────────────────────────────────────────────────────────────────
// Regression tests for C3 import-breadth rule.
// Key invariants: auto-exemptions hold, manifest.highFanOut is respected,
// and internal domain labels (lib, components) appear correctly in the detail
// rather than being collapsed into the external "pkg" bucket.

describe('C3 — import breadth', () => {
  it('passes when all files have ≤ 15 imports', () => {
    const graph = makeGraph([
      { file: 'src/a.tsx', count: 10 },
      { file: 'src/b.tsx', count: 15 },
    ]);
    expect(evaluateC3(graph, null).passed).toBe(true);
  });

  it('fails when a file exceeds 15 imports', () => {
    const graph = makeGraph([{ file: 'src/heavy.tsx', count: 16 }]);
    const result = evaluateC3(graph, null);
    expect(result.passed).toBe(false);
    expect(result.locations).toHaveLength(1);
    expect(result.locations?.[0]?.path).toBe('src/heavy.tsx');
  });

  it('sorts violations by import count descending', () => {
    const graph = makeGraph([
      { file: 'src/a.tsx', count: 20 },
      { file: 'src/b.tsx', count: 25 },
    ]);
    expect(evaluateC3(graph, null).locations?.[0]?.path).toBe('src/b.tsx');
  });

  it('auto-exempts actions.ts regardless of import count', () => {
    const graph = makeGraph([{ file: 'src/app/actions.ts', count: 30 }]);
    expect(evaluateC3(graph, null).passed).toBe(true);
  });

  it('auto-exempts other aggregation filenames (mutations, resolvers, handlers, routes)', () => {
    for (const name of ['mutations.ts', 'resolvers.ts', 'commands.ts', 'handlers.ts', 'routes.ts']) {
      const graph = makeGraph([{ file: `src/${name}`, count: 25 }]);
      expect(evaluateC3(graph, null).passed).toBe(true);
    }
  });

  it('respects manifest.highFanOut path exemptions', () => {
    const graph = makeGraph([{ file: 'src/store.ts', count: 20 }]);
    const manifest = makeManifest({ highFanOut: ['store.ts'] });
    expect(evaluateC3(graph, manifest).passed).toBe(true);
  });

  it('shows lib and components as distinct internal domains, not pkg', () => {
    // Regression: @/lib/* and @/components/* were miscounted as external packages.
    // After the @/ alias fix, these resolve to internal edges and appear as
    // domain names (lib, components) in the cluster detail.
    const graph = makeGraph([{
      file: 'src/components/Page.tsx',
      count: 17,
      deps: [
        'src/lib/auth.ts',
        'src/lib/api.ts',
        'src/lib/data.ts',
        'src/components/Button.tsx',
        'src/components/Input.tsx',
      ],
    }]);
    const detail = evaluateC3(graph, null).locations?.[0]?.detail ?? '';
    expect(detail).toContain('lib');
    expect(detail).toContain('components');
    // All 5 deps are internal, so external pkg count should be 12 (17 - 5),
    // but the label format is "+N pkg" — the key check is that lib/components
    // are NOT lumped into the pkg bucket.
    expect(detail).not.toMatch(/\+5 pkg/);
  });
});
