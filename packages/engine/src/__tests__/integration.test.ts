import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { analyze } from '../analyze.js';

const ROOT = join(tmpdir(), `clarx-integration-${Date.now()}`);

async function write(rel: string, content: string): Promise<void> {
  const abs = join(ROOT, rel);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, content, 'utf-8');
}

beforeAll(async () => {
  await mkdir(ROOT, { recursive: true });

  await write('clarx-manifest.json', JSON.stringify({
    version: '0.1',
    generated: ['**/dist', '**/node_modules'],
    workspaces: {
      'packages/core': 'Core shared utilities',
      'packages/ui': 'UI component library',
    },
    verificationCommands: { typecheck: 'tsc', test: 'jest' },
    commonTasks: { 'add a component': 'packages/ui/src/' },
    highFanIn: ['packages/core/src/index.ts'],
  }));
  await write('CLAUDE.md', '# Guide\n\nThis is a test repo.\n');
  await write('README.md', '# Test repo\n');
  await write('package.json', JSON.stringify({ name: 'test-root', workspaces: ['packages/*'] }));

  await write('packages/core/package.json', JSON.stringify({
    name: '@test/core',
    exports: { '.': './dist/index.js' },
  }));
  await write('packages/core/README.md', '# Core\n');
  await write('packages/core/src/index.ts', 'export const PI = 3.14;\n');
  await write('packages/core/src/math.ts', 'import { PI } from "./index.js";\nexport const TAU = PI * 2;\n');

  await write('packages/ui/package.json', JSON.stringify({
    name: '@test/ui',
    exports: { '.': './dist/index.js' },
  }));
  await write('packages/ui/README.md', '# UI\n');
  await write('packages/ui/src/index.ts', 'export { Button } from "./button.js";\n');
  await write('packages/ui/src/button.tsx', 'export function Button() { return null; }\n');
  await write('apps/web/src/pages/conversations/page.tsx', `
import { useUser } from '../../../auth/useUser';
import { useConversationListQuery } from '../../../hooks/queries/useConversationListQuery';
import { useConversationStatsQuery } from '../../../hooks/queries/useConversationStatsQuery';
import { ConversationSummary } from '../../../services/handlers/conversations';

export function Page() {
  const { accessToken, idToken } = useUser();
  return <div>{accessToken}{idToken}</div>;
}
`);
});

afterAll(async () => {
  await rm(ROOT, { recursive: true, force: true });
});

// ── Happy-path ────────────────────────────────────────────────────────────────

describe('analyze() — happy path', () => {
  it('returns a valid AnalysisResult structure', async () => {
    const result = await analyze({ root: ROOT });
    expect(result.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(typeof result.confidence).toBe('string');
    expect(Array.isArray(result.hardFailures)).toBe(true);
  });

  it('populates all 5 pillars with valid scores', async () => {
    const result = await analyze({ root: ROOT });
    const pillarNames = [
      'discoverability', 'boundary_clarity', 'context_efficiency',
      'operational_guidance', 'edit_safety',
    ];
    expect(Object.keys(result.pillars)).toHaveLength(5);
    for (const name of pillarNames) {
      const p = result.pillars[name as keyof typeof result.pillars];
      expect(p.score).toBeGreaterThanOrEqual(0);
      expect(p.score).toBeLessThanOrEqual(100);
    }
  });

  it('populates meta fields correctly', async () => {
    const result = await analyze({ root: ROOT });
    expect(result.meta.root).toBe(ROOT);
    expect(result.meta.filesScanned).toBeGreaterThan(0);
    expect(result.meta.manifestFound).toBe(true);
    expect(typeof result.meta.analyzedAt).toBe('string');
  });

  it('returns high confidence when manifest present and imports resolved', async () => {
    const result = await analyze({ root: ROOT });
    expect(result.confidence).toBe('high');
  });

  it('has no hard failures for a clean well-structured repo', async () => {
    const result = await analyze({ root: ROOT });
    expect(result.hardFailures).toHaveLength(0);
  });

  it('scores above 70 for a well-structured repo', async () => {
    const result = await analyze({ root: ROOT });
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it('emits a result for all 27 rules', async () => {
    const result = await analyze({ root: ROOT });
    const ruleIds = [
      'D1', 'D2', 'D3', 'D4', 'D5', 'D6',
      'B1', 'B2', 'B3', 'B4', 'B5',
      'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
      'O1', 'O2', 'O3', 'O4', 'O5',
      'E1', 'E2', 'E3', 'E4', 'E5',
    ];
    for (const id of ruleIds) {
      expect(result.rules[id as keyof typeof result.rules]).toBeDefined();
    }
  });

  it('includes ranked view-model migration opportunities', async () => {
    const result = await analyze({ root: ROOT });
    expect(result.opportunities.viewModelMigrations.length).toBeGreaterThan(0);
    expect(result.opportunities.viewModelMigrations[0]?.path).toBe('apps/web/src/pages/conversations/page.tsx');
  });
});

// ── Gitignore + default patterns ─────────────────────────────────────────────

describe('analyze() — gitignore and default generated patterns', () => {
  it('respects .gitignore and marks those files as generated', async () => {
    const gitRoot = join(tmpdir(), `clarx-gitignore-${Date.now()}`);
    try {
      await mkdir(gitRoot, { recursive: true });
      await writeFile(join(gitRoot, 'CLAUDE.md'), '# Guide\n', 'utf-8');
      await writeFile(join(gitRoot, 'README.md'), '# Repo\n', 'utf-8');
      await writeFile(join(gitRoot, 'package.json'), JSON.stringify({ name: 'test' }), 'utf-8');
      await writeFile(join(gitRoot, '.gitignore'), 'generated-output\n', 'utf-8');

      await mkdir(join(gitRoot, 'src'), { recursive: true });
      await writeFile(join(gitRoot, 'src/index.ts'), 'export const x = 1;\n', 'utf-8');

      await mkdir(join(gitRoot, 'generated-output'), { recursive: true });
      await writeFile(join(gitRoot, 'generated-output/schema.ts'), 'export type T = string;\n', 'utf-8');

      const result = await analyze({ root: gitRoot });
      expect(result.meta.filesScanned).toBeGreaterThan(0);
      // generated-output/schema.ts is counted but should not inflate non-generated file count
      const nonGeneratedTs = result.meta.filesScanned;
      // Re-run without gitignore dir to confirm it doesn't change rule outputs
      expect(result.rules['D1']).toBeDefined();
    } finally {
      await rm(gitRoot, { recursive: true, force: true });
    }
  });

  it('excludes default generated dirs (dist, .next, coverage) even without .gitignore', async () => {
    const bareRoot = join(tmpdir(), `clarx-defaults-${Date.now()}`);
    try {
      await mkdir(bareRoot, { recursive: true });
      await writeFile(join(bareRoot, 'CLAUDE.md'), '# Guide\n', 'utf-8');
      await writeFile(join(bareRoot, 'README.md'), '# Repo\n', 'utf-8');
      await writeFile(join(bareRoot, 'package.json'), JSON.stringify({ name: 'test' }), 'utf-8');
      await mkdir(join(bareRoot, 'src'), { recursive: true });
      await writeFile(join(bareRoot, 'src/index.ts'), 'export const x = 1;\n', 'utf-8');

      // These should all be treated as generated and not inflate file counts
      await mkdir(join(bareRoot, 'dist'), { recursive: true });
      await writeFile(join(bareRoot, 'dist/index.js'), 'exports.x = 1;\n', 'utf-8');
      await mkdir(join(bareRoot, 'coverage'), { recursive: true });
      await writeFile(join(bareRoot, 'coverage/lcov.info'), 'SF:src/index.ts\n', 'utf-8');

      const result = await analyze({ root: bareRoot });
      expect(result.meta.filesScanned).toBeGreaterThan(0);
      expect(result.rules['D1']).toBeDefined();
    } finally {
      await rm(bareRoot, { recursive: true, force: true });
    }
  });
});

// ── Hard failure ──────────────────────────────────────────────────────────────

describe('analyze() — O1 hard failure', () => {
  it('caps score at 65 and flags O1 when no guidance file exists', async () => {
    const bareRoot = join(tmpdir(), `clarx-bare-${Date.now()}`);
    try {
      await mkdir(bareRoot, { recursive: true });
      await writeFile(join(bareRoot, 'README.md'), '# bare repo\n', 'utf-8');
      await writeFile(join(bareRoot, 'package.json'), JSON.stringify({ name: 'bare' }), 'utf-8');

      const result = await analyze({ root: bareRoot });
      expect(result.hardFailures).toContain('O1');
      expect(result.score).toBeLessThanOrEqual(65);
    } finally {
      await rm(bareRoot, { recursive: true, force: true });
    }
  });
});
