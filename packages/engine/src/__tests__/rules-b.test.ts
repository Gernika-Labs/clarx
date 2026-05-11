import { describe, it, expect } from '@jest/globals';
import { evaluateB2 } from '../analyzers/rules-b1-b2.js';
import { evaluateB5 } from '../analyzers/rules-remaining.js';
import { detectCycles } from '../analyzers/import-graph.js';
import type { ImportGraph } from '../analyzers/import-graph.js';
import { makeFile, makeGenerated, makeManifest } from './helpers.js';

// ── B1 cycle detection ────────────────────────────────────────────────────────

function makeGraph(edges: Record<string, string[]>): ImportGraph {
  const edgeMap = new Map<string, Set<string>>();
  const fanIn = new Map<string, number>();
  const importCount = new Map<string, number>();
  const packageIndex = new Map<string, string>();

  for (const [from, targets] of Object.entries(edges)) {
    edgeMap.set(from, new Set(targets));
    importCount.set(from, targets.length);
    for (const t of targets) {
      fanIn.set(t, (fanIn.get(t) ?? 0) + 1);
    }
  }
  return { edges: edgeMap, fanIn, importCount, packageIndex };
}

describe('B1 — circular imports between packages (detectCycles)', () => {
  it('returns no cycles for a clean dependency tree', () => {
    const graph = makeGraph({
      'packages/a/src/index.ts': ['packages/b/__entry__'],
      'packages/b/src/index.ts': [],
    });
    const result = detectCycles(graph, ['packages/a', 'packages/b']);
    expect(result.hasCycle).toBe(false);
    expect(result.cycles).toHaveLength(0);
  });

  it('detects a direct A→B→A cycle', () => {
    const graph = makeGraph({
      'packages/a/src/index.ts': ['packages/b/__entry__'],
      'packages/b/src/index.ts': ['packages/a/__entry__'],
    });
    const result = detectCycles(graph, ['packages/a', 'packages/b']);
    expect(result.hasCycle).toBe(true);
    expect(result.cycles.length).toBeGreaterThan(0);
  });

  it('detects a transitive A→B→C→A cycle', () => {
    const graph = makeGraph({
      'packages/a/src/index.ts': ['packages/b/__entry__'],
      'packages/b/src/index.ts': ['packages/c/__entry__'],
      'packages/c/src/index.ts': ['packages/a/__entry__'],
    });
    const result = detectCycles(graph, ['packages/a', 'packages/b', 'packages/c']);
    expect(result.hasCycle).toBe(true);
  });

  it('passes when packages are independent (no cross-package imports)', () => {
    const graph = makeGraph({
      'packages/a/src/index.ts': [],
      'packages/b/src/index.ts': [],
    });
    const result = detectCycles(graph, ['packages/a', 'packages/b']);
    expect(result.hasCycle).toBe(false);
  });
});

// ── B2 ────────────────────────────────────────────────────────────────────────

describe('B2 — shared code lives in a declared package', () => {
  it('passes when no files are duplicated', () => {
    const files = [
      makeFile('packages/a/src/auth.ts'),
      makeFile('packages/b/src/logging.ts'),
    ];
    expect(evaluateB2(files, makeManifest()).passed).toBe(true);
  });

  it('fails when the same logical path exists in two packages', () => {
    const files = [
      makeFile('packages/a/src/formatting.ts'),
      makeFile('packages/b/src/formatting.ts'),
    ];
    const result = evaluateB2(files, makeManifest());
    expect(result.passed).toBe(false);
    // Locations now point to the actual file paths (one per duplicate occurrence)
    const paths = result.locations?.map(l => l.path) ?? [];
    expect(paths).toContain('packages/a/src/formatting.ts');
    expect(paths).toContain('packages/b/src/formatting.ts');
    expect(result.locations?.[0]?.detail).toContain('Duplicated across');
  });

  it('ignores index.ts and types.ts duplicates (expected pattern)', () => {
    const files = [
      makeFile('packages/a/src/index.ts'),
      makeFile('packages/b/src/index.ts'),
      makeFile('packages/a/src/types.ts'),
      makeFile('packages/b/src/types.ts'),
    ];
    expect(evaluateB2(files, makeManifest()).passed).toBe(true);
  });

  it('passes for a single-workspace repo', () => {
    const files = [makeFile('src/utils.ts')];
    const manifest = makeManifest({ workspaces: { 'packages/a': 'A' } });
    expect(evaluateB2(files, manifest).passed).toBe(true);
  });
});

// ── B5 ────────────────────────────────────────────────────────────────────────

describe('B5 — test files co-located or mirrored', () => {
  it('passes when tests are co-located with source', () => {
    const files = [
      makeFile('src/Button.tsx'),
      makeFile('src/Button.test.tsx'),
    ];
    expect(evaluateB5(files).passed).toBe(true);
  });

  it('passes when tests are in a __tests__ directory', () => {
    const files = [
      makeFile('src/Button.tsx'),
      makeFile('src/__tests__/Button.test.tsx'),
    ];
    expect(evaluateB5(files).passed).toBe(true);
  });

  it('passes when there are no test files at all', () => {
    const files = [makeFile('src/Button.tsx')];
    expect(evaluateB5(files).passed).toBe(true);
  });

  it('fails when test files are in a random unrelated directory', () => {
    const files = [
      makeFile('src/Button.tsx'),
      makeFile('test-output/Button.test.tsx'),
    ];
    const result = evaluateB5(files);
    expect(result.passed).toBe(false);
  });
});
