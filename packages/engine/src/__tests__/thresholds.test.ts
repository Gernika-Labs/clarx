import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { DEFAULT_THRESHOLDS, resolveThresholds } from '../thresholds.js';
import { analyze } from '../analyze.js';
import type { Manifest } from '../types.js';

describe('resolveThresholds', () => {
  it('returns defaults when there is no manifest', () => {
    expect(resolveThresholds(null)).toEqual(DEFAULT_THRESHOLDS);
  });

  it('returns defaults when the manifest declares no thresholds', () => {
    expect(resolveThresholds({ version: '0.1' })).toEqual(DEFAULT_THRESHOLDS);
  });

  it('merges valid overrides onto defaults', () => {
    const manifest: Manifest = { thresholds: { c2FileLines: 500, c3ImportLimit: 20 } };
    const resolved = resolveThresholds(manifest);
    expect(resolved.c2FileLines).toBe(500);
    expect(resolved.c3ImportLimit).toBe(20);
    expect(resolved.e1RouteFileLines).toBe(DEFAULT_THRESHOLDS.e1RouteFileLines);
  });

  it('ignores non-finite, non-positive, and non-numeric overrides', () => {
    const manifest = {
      thresholds: {
        c2FileLines: -1,
        c3ImportLimit: Infinity,
        c4FanInThreshold: NaN,
        e3UtilityExports: '30',
      },
    } as unknown as Manifest;
    expect(resolveThresholds(manifest)).toEqual(DEFAULT_THRESHOLDS);
  });

  it('never mutates the defaults', () => {
    const before = { ...DEFAULT_THRESHOLDS };
    resolveThresholds({ thresholds: { c2FileLines: 999 } });
    expect(DEFAULT_THRESHOLDS).toEqual(before);
  });
});

// ── Integration: manifest threshold overrides + inapplicable rules ───────────

const ROOT = join(tmpdir(), `clarx-thresholds-${Date.now()}`);
const NON_JS_ROOT = join(tmpdir(), `clarx-nonjs-${Date.now()}`);

async function write(root: string, rel: string, content: string): Promise<void> {
  const abs = join(root, rel);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, content, 'utf-8');
}

beforeAll(async () => {
  // JS repo with one 450-line file and a manifest raising c2FileLines to 500
  await mkdir(ROOT, { recursive: true });
  await write(ROOT, 'clarx-manifest.json', JSON.stringify({
    version: '0.1',
    generated: ['dist'],
    verificationCommands: { test: 'jest' },
    thresholds: { c2FileLines: 500 },
  }));
  await write(ROOT, 'src/big.ts', Array.from({ length: 450 }, (_, i) => `export const v${i} = ${i};`).join('\n'));

  // Non-JS repo: no resolvable JS/TS sources at all
  await mkdir(NON_JS_ROOT, { recursive: true });
  await write(NON_JS_ROOT, 'main.py', 'print("hello")\n');
  await write(NON_JS_ROOT, 'README.md', '# Python repo\n');
});

afterAll(async () => {
  await rm(ROOT, { recursive: true, force: true });
  await rm(NON_JS_ROOT, { recursive: true, force: true });
});

describe('manifest threshold overrides', () => {
  it('a 450-line file passes C2 when c2FileLines is raised to 500', async () => {
    const result = await analyze({ root: ROOT });
    expect(result.rules.C2?.passed).toBe(true);
    expect(result.rules.C2?.message).toContain('500');
  });
});

describe('inapplicable rules on non-JS stacks', () => {
  it('marks import-graph rules as inapplicable instead of silently passing', async () => {
    const result = await analyze({ root: NON_JS_ROOT });
    for (const id of ['B1', 'C3', 'C4', 'C5', 'C6'] as const) {
      expect(result.rules[id]?.inapplicable).toBe(true);
      expect(result.rules[id]?.passed).toBe(true); // never moves the score
      expect(result.rules[id]?.scoreImpact).toBe(0);
      expect(result.rules[id]?.message).toContain('Not evaluated');
    }
    expect(result.meta.importGraphResolved).toBe(false);
  });

  it('does not mark rules inapplicable when a JS import graph exists', async () => {
    const result = await analyze({ root: ROOT });
    for (const id of ['B1', 'C3', 'C4', 'C5', 'C6'] as const) {
      expect(result.rules[id]?.inapplicable).toBeUndefined();
    }
    expect(result.meta.importGraphResolved).toBe(true);
  });
});
