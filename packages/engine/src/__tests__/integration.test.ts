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
});

afterAll(async () => {
  await rm(ROOT, { recursive: true, force: true });
});

// ── Happy-path ────────────────────────────────────────────────────────────────

describe('analyze() — happy path', () => {
  it('returns a valid AnalysisResult structure', async () => {
    const result = await analyze({ root: ROOT });
    expect(result.version).toBe('0.1');
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

  it('emits a result for all 25 rules', async () => {
    const result = await analyze({ root: ROOT });
    const ruleIds = [
      'D1', 'D2', 'D3', 'D4', 'D5',
      'B1', 'B2', 'B3', 'B4', 'B5',
      'C1', 'C2', 'C3', 'C4', 'C5',
      'O1', 'O2', 'O3', 'O4', 'O5',
      'E1', 'E2', 'E3', 'E4', 'E5',
    ];
    for (const id of ruleIds) {
      expect(result.rules[id as keyof typeof result.rules]).toBeDefined();
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
