import { describe, it, expect } from '@jest/globals';
import { evaluateD4 } from '../analyzers/rules-d.js';
import { evaluateD2, evaluateD3, evaluateD5 } from '../analyzers/rules-d2-d3-d5.js';
import { makeFile, makeGenerated, makeManifest } from './helpers.js';

describe('D4 — no utility dumping ground files', () => {
  it('passes when no dump-named files exist', () => {
    const files = [makeFile('src/auth.ts'), makeFile('src/formatting.ts')];
    expect(evaluateD4(files).passed).toBe(true);
  });

  it('fails when a large utils.ts exists', () => {
    const files = [makeFile('src/utils.ts', 60)];
    const result = evaluateD4(files);
    expect(result.passed).toBe(false);
    expect(result.locations?.[0]?.path).toBe('src/utils.ts');
  });

  it('fails for helpers, misc, common names', () => {
    const files = [
      makeFile('src/helpers.ts', 40),
      makeFile('src/misc.ts', 50),
      makeFile('src/common.ts', 60),
    ];
    expect(evaluateD4(files).passed).toBe(false);
    expect(evaluateD4(files).locations).toHaveLength(3);
  });

  it('does not flag small utility files under 30 lines', () => {
    const files = [makeFile('src/utils.ts', 10)];
    expect(evaluateD4(files).passed).toBe(true);
  });

  it('does not flag utility files without a line count', () => {
    // line count is undefined when extension is not in the list
    const files = [makeFile('src/utils.md')];
    expect(evaluateD4(files).passed).toBe(true);
  });

  it('ignores generated files', () => {
    const files = [makeGenerated('dist/utils.js')];
    expect(evaluateD4(files).passed).toBe(true);
  });
});

// ── D2 ────────────────────────────────────────────────────────────────────────

describe('D2 — workspace purpose statements', () => {
  it('passes when all manifest workspaces have descriptions', async () => {
    const manifest = makeManifest({ workspaces: { 'packages/a': 'Package A', 'packages/b': 'Package B' } });
    const result = await evaluateD2('/root', manifest, []);
    expect(result.passed).toBe(true);
  });

  it('fails when a workspace has an empty description', async () => {
    const manifest = makeManifest({ workspaces: { 'packages/a': 'Package A', 'packages/b': '' } });
    const result = await evaluateD2('/root', manifest, []);
    expect(result.passed).toBe(false);
    expect(result.locations?.[0]?.path).toBe('packages/b');
  });

  it('falls back to README check per package when no manifest workspaces', async () => {
    // D2 fallback looks for package.json at depth 1: <name>/package.json
    const files = [
      makeFile('api/package.json'),
      makeFile('web/package.json'),
      makeFile('api/README.md'),
    ];
    const result = await evaluateD2('/root', null, files);
    expect(result.passed).toBe(false);
    expect(result.locations?.[0]?.path).toBe('web');
  });

  it('passes fallback when all packages have a README', async () => {
    const files = [
      makeFile('api/package.json'),
      makeFile('api/README.md'),
    ];
    const result = await evaluateD2('/root', null, files);
    expect(result.passed).toBe(true);
  });

  it('passes for a single-package repo with a root README', async () => {
    const files = [makeFile('README.md')];
    const result = await evaluateD2('/root', null, files);
    expect(result.passed).toBe(true);
  });
});

// ── D3 ────────────────────────────────────────────────────────────────────────

describe('D3 — source and config files segregated', () => {
  it('passes when config files are only at package roots', () => {
    const manifest = makeManifest({ workspaces: { 'packages/a': 'A' } });
    const files = [
      makeFile('packages/a/next.config.ts'),
      makeFile('packages/a/src/index.ts'),
    ];
    expect(evaluateD3(files, manifest).passed).toBe(true);
  });

  it('fails when a config file leaks into a src subdirectory', () => {
    const manifest = makeManifest({ workspaces: { 'packages/a': 'A' } });
    const files = [
      makeFile('packages/a/src/index.ts'),
      makeFile('packages/a/src/vitest.config.ts'),
    ];
    const result = evaluateD3(files, manifest);
    expect(result.passed).toBe(false);
    expect(result.locations?.[0]?.path).toBe('packages/a/src');
  });

  it('does not flag test co-location as a violation', () => {
    const files = [
      makeFile('src/Button.tsx'),
      makeFile('src/Button.test.tsx'),
    ];
    expect(evaluateD3(files, null).passed).toBe(true);
  });
});

describe('D5 — directory depth ≤5', () => {
  it('passes for shallow file trees', () => {
    const files = [makeFile('packages/a/src/index.ts')];
    const manifest = makeManifest({ workspaces: { 'packages/a': 'A' } });
    expect(evaluateD5(files, manifest).passed).toBe(true);
  });

  it('fails when a file is more than 5 levels deep within its workspace', () => {
    const files = [makeFile('packages/a/src/one/two/three/four/five/deep.ts')];
    const manifest = makeManifest({ workspaces: { 'packages/a': 'A' } });
    const result = evaluateD5(files, manifest);
    expect(result.passed).toBe(false);
  });

  it('counts depth relative to workspace root not repo root', () => {
    // packages/a/ is the workspace root; src/components/atoms/Button.tsx = 3 levels — fine
    const files = [makeFile('packages/a/src/components/atoms/Button.tsx')];
    const manifest = makeManifest({ workspaces: { 'packages/a': 'A' } });
    expect(evaluateD5(files, manifest).passed).toBe(true);
  });
});
