import { describe, it, expect } from '@jest/globals';
import { evaluateB4, evaluateE2 } from '../analyzers/rules-remaining.js';
import { evaluateO5 } from '../analyzers/rules-o5.js';
import { makeFile, makeGenerated, makeManifest } from './helpers.js';

// ── B4 ────────────────────────────────────────────────────────────────────────

describe('B4 — UI primitives and app logic in separate directories', () => {
  it('passes when primitives and pages live in different directories', () => {
    const files = [
      makeFile('src/components/Button.tsx'),
      makeFile('src/pages/dashboard.page.tsx'),
    ];
    expect(evaluateB4(files).passed).toBe(true);
  });

  it('fails when a single directory contains both a primitive and a page file', () => {
    const files = [
      makeFile('src/Button.tsx'),
      makeFile('src/dashboard.page.tsx'),
    ];
    expect(evaluateB4(files).passed).toBe(false);
  });

  it('fails when a primitive and a screen share the same directory', () => {
    const files = [
      makeFile('src/Badge.tsx'),
      makeFile('src/home.screen.tsx'), // matches /screen\.[jt]sx?$/
    ];
    expect(evaluateB4(files).passed).toBe(false);
  });

  it('passes when only primitives are present', () => {
    const files = [
      makeFile('src/Button.tsx'),
      makeFile('src/Badge.tsx'),
    ];
    expect(evaluateB4(files).passed).toBe(true);
  });

  it('ignores generated files', () => {
    const files = [makeGenerated('dist/Button.js'), makeGenerated('dist/home.page.js')];
    expect(evaluateB4(files).passed).toBe(true);
  });
});

// ── E2 ────────────────────────────────────────────────────────────────────────

describe('E2 — component files have co-located companions', () => {
  it('passes when no tsx files exist', () => {
    const files = [makeFile('src/index.ts')];
    expect(evaluateE2(files).passed).toBe(true);
  });

  it('passes when most components have test files', () => {
    const files = [
      makeFile('src/A.tsx'), makeFile('src/A.test.tsx'),
      makeFile('src/B.tsx'), makeFile('src/B.test.tsx'),
      makeFile('src/C.tsx'), makeFile('src/C.test.tsx'),
      makeFile('src/D.tsx'), // no test — minority
    ];
    expect(evaluateE2(files).passed).toBe(true);
  });

  it('fails when the majority of components have no companion files', () => {
    const files = [
      makeFile('src/A.tsx'),
      makeFile('src/B.tsx'),
      makeFile('src/C.tsx'),
      makeFile('src/D.tsx'),
    ];
    expect(evaluateE2(files).passed).toBe(false);
  });

  it('passes when companion is a types file', () => {
    const files = [
      makeFile('src/A.tsx'), makeFile('src/A.types.ts'),
      makeFile('src/B.tsx'), makeFile('src/B.types.ts'),
      makeFile('src/C.tsx'), makeFile('src/C.types.ts'),
    ];
    expect(evaluateE2(files).passed).toBe(true);
  });
});

// ── O5 ────────────────────────────────────────────────────────────────────────

describe('O5 — high-risk files identified', () => {
  it('passes when manifest.highFanIn is non-empty', () => {
    const manifest = makeManifest({ highFanIn: ['src/tokens.ts', 'src/utils.ts'] });
    const result = evaluateO5([], manifest);
    expect(result.passed).toBe(true);
    expect(result.message).toContain('2 high fan-in files');
  });

  it('passes when ARCHITECTURE.md exists at the root', () => {
    const files = [makeFile('ARCHITECTURE.md')];
    expect(evaluateO5(files, null).passed).toBe(true);
  });

  it('passes for alternate architecture doc names', () => {
    const files = [makeFile('docs/ARCHITECTURE.md')];
    expect(evaluateO5(files, null).passed).toBe(true);
  });

  it('fails when neither manifest highFanIn nor arch doc exist', () => {
    const manifest = makeManifest({ highFanIn: undefined });
    expect(evaluateO5([], manifest).passed).toBe(false);
  });

  it('fails when highFanIn is an empty array', () => {
    const manifest = makeManifest({ highFanIn: [] });
    expect(evaluateO5([], manifest).passed).toBe(false);
  });
});
