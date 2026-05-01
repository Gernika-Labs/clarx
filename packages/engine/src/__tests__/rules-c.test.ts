import { describe, it, expect } from '@jest/globals';
import { evaluateC1, evaluateC2 } from '../analyzers/rules-c.js';
import { makeFile, makeGenerated, makeManifest } from './helpers.js';

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
  it('passes when all files are under 400 lines', () => {
    const files = [makeFile('src/a.ts', 100), makeFile('src/b.ts', 399)];
    const result = evaluateC2(files);
    expect(result.passed).toBe(true);
  });

  it('fails when a file exceeds 400 lines', () => {
    const files = [makeFile('src/a.ts', 100), makeFile('src/b.ts', 401)];
    const result = evaluateC2(files);
    expect(result.passed).toBe(false);
    expect(result.locations).toHaveLength(1);
    expect(result.locations?.[0]?.path).toBe('src/b.ts');
    expect(result.locations?.[0]?.detail).toBe('401 lines');
  });

  it('reports multiple violations sorted by line count descending', () => {
    const files = [
      makeFile('src/a.ts', 500),
      makeFile('src/b.ts', 800),
      makeFile('src/c.ts', 200),
    ];
    const result = evaluateC2(files);
    expect(result.passed).toBe(false);
    expect(result.locations).toHaveLength(2);
    expect(result.locations?.[0]?.path).toBe('src/b.ts'); // worst first
  });

  it('ignores generated files', () => {
    const files = [makeGenerated('dist/bundle.js')];
    Object.assign(files[0]!, { lines: 9999 });
    const result = evaluateC2(files);
    expect(result.passed).toBe(true);
  });

  it('ignores files without a line count', () => {
    const files = [makeFile('assets/logo.png')]; // no lines
    const result = evaluateC2(files);
    expect(result.passed).toBe(true);
  });
});
