import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { evaluateD1, evaluateD4 } from '../analyzers/rules-d.js';
import { evaluateD2, evaluateD3, evaluateD5 } from '../analyzers/rules-d2-d3-d5.js';
import { evaluateD6 } from '../analyzers/rules-d6.js';
import { makeFile, makeGenerated, makeManifest } from './file-fixtures.js';

// ── D1 ────────────────────────────────────────────────────────────────────────
// Regression: generated entries in manifest were not excluded from the root
// directory count. Entries matching manifest.generated patterns should not be
// counted as meaningful root entries even if they're not in the hardcoded list.

describe('D1 — root directory meaningful entry count', () => {
  let root: string;

  beforeEach(async () => {
    root = join(tmpdir(), `clarx-d1-${Date.now()}`);
    await mkdir(root, { recursive: true });
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  async function makeEntries(names: string[]) {
    await Promise.all(names.map(name => mkdir(join(root, name), { recursive: true })));
  }

  it('passes when meaningful entries are within the limit', async () => {
    await makeEntries(['src', 'public', 'README.md']);
    const result = await evaluateD1(root, null);
    expect(result.passed).toBe(true);
  });

  it('excludes manifest.generated entries from the count', async () => {
    // Create enough entries to exceed the default limit (10) without generated
    await makeEntries([
      'src', 'public', 'docs', 'scripts', 'tests', 'config',
      'assets', 'types', 'mocks', 'fixtures',
      '.source', // declared in generated — should not be counted
    ]);
    const manifest = makeManifest({ generated: ['.source'] });
    const result = await evaluateD1(root, manifest);
    // With .source excluded, only 10 remain — should pass at the default limit
    expect(result.passed).toBe(true);
  });

  it('excludes glob-style generated patterns like **/.next', async () => {
    await makeEntries([
      'src', 'public', 'docs', 'scripts', 'tests', 'config',
      'assets', 'types', 'mocks', 'fixtures',
      '.next', // matched by '**/.next' glob pattern
    ]);
    const manifest = makeManifest({ generated: ['**/.next', '**/.next/**'] });
    const result = await evaluateD1(root, manifest);
    expect(result.passed).toBe(true);
  });

  it('still fails when non-generated entries exceed the limit', async () => {
    await makeEntries([
      'src', 'public', 'docs', 'scripts', 'tests', 'config',
      'assets', 'types', 'mocks', 'fixtures', 'extra',
    ]);
    const manifest = makeManifest({ generated: [] });
    const result = await evaluateD1(root, manifest);
    expect(result.passed).toBe(false);
  });

  it('does not count package.json or README.md as meaningful entries', async () => {
    // 9 real dirs + package.json + README.md — should stay under the limit of 10
    await makeEntries([
      'src', 'public', 'docs', 'scripts', 'tests', 'config',
      'assets', 'types', 'mocks',
      'package.json', 'README.md',
    ]);
    const result = await evaluateD1(root, null);
    expect(result.passed).toBe(true);
  });

  it('applies a Next.js-specific threshold of 17 when next.config.* is present', async () => {
    // 14 dirs would fail the default limit of 10 but pass the Next.js limit of 17
    await makeEntries([
      'app', 'public', 'docs', 'scripts', 'tests', 'config',
      'assets', 'types', 'mocks', 'fixtures', 'supabase',
      'stories', 'hooks', 'lib',
      'next.config.ts', // signals Next.js — applies threshold of 17
    ]);
    const result = await evaluateD1(root, null);
    // next.config.ts is already filtered by D1_IGNORED_PATTERNS, so it doesn't count.
    // 14 entries remain — would fail at 10 (default) but passes at 17 (Next.js).
    expect(result.passed).toBe(true);
    expect(result.message).toContain('next.js');
  });

  it('still fails a Next.js project that genuinely exceeds 17 meaningful entries', async () => {
    await makeEntries([
      'app', 'public', 'docs', 'scripts', 'tests', 'config',
      'assets', 'types', 'mocks', 'fixtures', 'supabase',
      'stories', 'hooks', 'lib', 'e2e', 'stubs', 'data',
      'next.config.ts',
    ]);
    const result = await evaluateD1(root, null);
    // next.config.ts excluded by pattern → 17 remain → exactly at limit → should pass
    // Add one more to actually fail
    await makeEntries(['overflow']);
    const result2 = await evaluateD1(root, null);
    expect(result2.passed).toBe(false);
  });
});

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

// ── D6 ────────────────────────────────────────────────────────────────────────
// Regression tests for the two bugs found during hanzibit feedback:
// 1. Both shadow paths must appear in the message (old: only one path stored).
// 2. Message must use "no documented distinction" framing (not "likely duplicate").

describe('D6 — shadow routes at multiple URL depths', () => {
  it('passes when no route files exist', () => {
    const files = [makeFile('src/utils.ts'), makeFile('src/components/Button.tsx')];
    expect(evaluateD6(files).passed).toBe(true);
  });

  it('passes when all route leaf names are unique', () => {
    const files = [
      makeFile('app/api/users/route.ts'),
      makeFile('app/api/products/route.ts'),
      makeFile('app/api/mobile/orders/route.ts'),
    ];
    expect(evaluateD6(files).passed).toBe(true);
  });

  it('fails when the same leaf segment appears at different URL depths', () => {
    const files = [
      makeFile('app/api/mnemonic/route.ts'),
      makeFile('app/api/mobile/mnemonic/route.ts'),
    ];
    expect(evaluateD6(files).passed).toBe(false);
  });

  it('names both shadow paths in the message', () => {
    const files = [
      makeFile('app/api/mnemonic/route.ts'),
      makeFile('app/api/mobile/mnemonic/route.ts'),
    ];
    const { message } = evaluateD6(files);
    expect(message).toContain('app/api/mnemonic/route.ts');
    expect(message).toContain('app/api/mobile/mnemonic/route.ts');
  });

  it('uses "no documented distinction" framing', () => {
    const files = [
      makeFile('app/api/mnemonic/route.ts'),
      makeFile('app/api/mobile/mnemonic/route.ts'),
    ];
    expect(evaluateD6(files).message).toMatch(/no documented distinction/i);
  });

  it('populates a location entry for each path in the shadow group', () => {
    const files = [
      makeFile('app/api/mnemonic/route.ts'),
      makeFile('app/api/mobile/mnemonic/route.ts'),
    ];
    const paths = evaluateD6(files).locations?.map(l => l.path) ?? [];
    expect(paths).toContain('app/api/mnemonic/route.ts');
    expect(paths).toContain('app/api/mobile/mnemonic/route.ts');
  });

  it('does not flag dynamic segments like [id] as shadow routes', () => {
    const files = [
      makeFile('app/api/users/route.ts'),
      makeFile('app/api/users/[id]/route.ts'),
    ];
    // [id] is excluded; 'users' appears once — no shadow
    expect(evaluateD6(files).passed).toBe(true);
  });

  it('excludes route-group segments (group) from URL path comparison', () => {
    const files = [
      makeFile('app/(auth)/login/route.ts'),
      makeFile('app/(public)/login/route.ts'),
    ];
    // Both route groups resolve to leaf "login" → shadow route
    const result = evaluateD6(files);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('login');
  });

  it('mentions the count when multiple shadow groups exist', () => {
    const files = [
      makeFile('app/api/mnemonic/route.ts'),
      makeFile('app/api/mobile/mnemonic/route.ts'),
      makeFile('app/api/study/route.ts'),
      makeFile('app/api/web/study/route.ts'),
    ];
    const result = evaluateD6(files);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('2 route names');
  });
});
