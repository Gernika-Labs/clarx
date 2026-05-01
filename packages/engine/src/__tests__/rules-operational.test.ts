import { describe, it, expect } from '@jest/globals';
import { evaluateC3 } from '../analyzers/rules-c3-c4-c5.js';
import { evaluateE1, evaluateE3 } from '../analyzers/rules-e.js';
import type { ImportGraph } from '../analyzers/import-graph.js';
import { makeFile, makeManifest } from './helpers.js';

// ── C3 ────────────────────────────────────────────────────────────────────────

function makeImportGraph(importCounts: Record<string, number>): ImportGraph {
  const edges = new Map<string, Set<string>>();
  const fanIn = new Map<string, number>();
  const importCount = new Map(Object.entries(importCounts));
  const packageIndex = new Map<string, string>();
  return { edges, fanIn, importCount, packageIndex };
}

describe('C3 — no file imports from more than 15 distinct modules', () => {
  it('passes when all files are within the limit', () => {
    const graph = makeImportGraph({ 'src/index.ts': 10, 'src/utils.ts': 5 });
    expect(evaluateC3(graph, null).passed).toBe(true);
  });

  it('fails when a file exceeds 15 imports', () => {
    const graph = makeImportGraph({ 'src/god.ts': 20 });
    const result = evaluateC3(graph, null);
    expect(result.passed).toBe(false);
    expect(result.locations?.[0]?.path).toBe('src/god.ts');
    expect(result.locations?.[0]?.detail).toBe('20 imports');
  });

  it('exempts files declared in manifest.highFanIn', () => {
    const graph = makeImportGraph({ 'src/registry.ts': 20 });
    const manifest = makeManifest({ highFanIn: ['src/registry.ts'] });
    expect(evaluateC3(graph, manifest).passed).toBe(true);
  });

  it('does not exempt files not in highFanIn', () => {
    const graph = makeImportGraph({ 'src/registry.ts': 20, 'src/other.ts': 18 });
    const manifest = makeManifest({ highFanIn: ['src/registry.ts'] });
    const result = evaluateC3(graph, manifest);
    expect(result.passed).toBe(false);
    expect(result.locations).toHaveLength(1);
    expect(result.locations?.[0]?.path).toBe('src/other.ts');
  });
});

// ── E1 ────────────────────────────────────────────────────────────────────────

describe('E1 — no route/controller files exceeding 300 lines', () => {
  it('passes when no route files exist', () => {
    const files = [makeFile('src/index.ts', 100)];
    expect(evaluateE1(files).passed).toBe(true);
  });

  it('passes when route files are under 300 lines', () => {
    const files = [makeFile('src/routes.ts', 200)];
    expect(evaluateE1(files).passed).toBe(true);
  });

  it('fails when a routes file exceeds 300 lines', () => {
    const files = [makeFile('src/routes.ts', 350)];
    const result = evaluateE1(files);
    expect(result.passed).toBe(false);
    expect(result.locations?.[0]?.path).toBe('src/routes.ts');
  });

  it('flags controller files', () => {
    const files = [makeFile('api/userController.ts', 400)];
    expect(evaluateE1(files).passed).toBe(false);
  });

  it('flags handler files', () => {
    const files = [makeFile('api/handlers.ts', 310)];
    expect(evaluateE1(files).passed).toBe(false);
  });

  it('does not flag a large non-route file', () => {
    const files = [makeFile('src/schema.ts', 500)];
    expect(evaluateE1(files).passed).toBe(true);
  });
});

// ── E3 (sync part via export count) ─────────────────────────────────────────

describe('evaluateE3 — countExports helper (indirectly via file content)', () => {
  // E3 reads actual files so we test it via the CLI integration test instead.
  // Here we verify the rule passes gracefully when no utility files exist.
  it('passes when no utility-named files are present', async () => {
    const files = [makeFile('src/auth.ts', 50), makeFile('src/schema.ts', 80)];
    const result = await (await import('../analyzers/rules-e.js')).evaluateE3('/nonexistent', files);
    expect(result.passed).toBe(true);
  });
});
