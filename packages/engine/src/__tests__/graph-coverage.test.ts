import { describe, it, expect, afterAll } from '@jest/globals';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { analyze } from '../analyze.js';

const roots: string[] = [];

async function repo(name: string, files: Record<string, string>): Promise<string> {
  const root = join(tmpdir(), `clarx-coverage-${name}-${Date.now()}`);
  roots.push(root);
  for (const [rel, content] of Object.entries(files)) {
    const abs = join(root, rel);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, content, 'utf-8');
  }
  return root;
}

afterAll(async () => {
  await Promise.all(roots.map(r => rm(r, { recursive: true, force: true })));
});

const GRAPH_RULES = ['B1', 'C3', 'C4', 'C5', 'C6'] as const;
const PY = 'import os\n\ndef f():\n    return 1\n';

describe('graph coverage', () => {
  it('Python repo with one stray tailwind.config.js does not pass graph rules', async () => {
    const root = await repo('py-tailwind', {
      'CLAUDE.md': '# Guide\n',
      'tailwind.config.js': 'module.exports = { content: [] };\n',
      'app/a.py': PY, 'app/b.py': PY, 'app/c.py': PY,
    });
    const r = await analyze({ root });
    for (const id of GRAPH_RULES) {
      expect(r.rules[id]?.inapplicable).toBe(true);
      expect(r.rules[id]?.scoreImpact).toBe(0);
    }
    expect(r.rules['B1']?.message).toMatch(/JS\/TS, 25% of source files/);
    expect(r.rules['B1']?.message).toMatch(/python \(3\)/);
    expect(r.meta.importGraphResolved).toBe(false);
    expect(r.confidence).not.toBe('high');
    expect(r.meta.graphCoverage.languages).toEqual([
      { language: 'python', files: 3, covered: false },
      { language: 'js-ts', files: 1, covered: true },
    ]);
  });

  it('single-package JS/TS repo with zero imports is still evaluated', async () => {
    const root = await repo('js-no-imports', {
      'CLAUDE.md': '# Guide\n',
      'package.json': JSON.stringify({ name: 'x' }),
      'src/a.ts': 'export const a = 1;\n',
      'src/b.ts': 'export const b = 2;\n',
    });
    const r = await analyze({ root });
    for (const id of GRAPH_RULES) expect(r.rules[id]?.inapplicable).toBeUndefined();
    expect(r.meta.importGraphResolved).toBe(true);
    expect(r.meta.graphCoverage.eligible).toBe(true);
  });

  it('pure Python repo keeps the original "no resolvable JS/TS graph" message', async () => {
    const root = await repo('py-only', { 'CLAUDE.md': '# Guide\n', 'app/a.py': PY });
    const r = await analyze({ root });
    expect(r.rules['B1']?.inapplicable).toBe(true);
    expect(r.rules['B1']?.message).toMatch(/no resolvable JS\/TS import graph/);
    expect(r.meta.graphCoverage.coveredShare).toBe(0);
  });

  it('a verified failure is kept even when coverage is partial', async () => {
    const imports = Array.from({ length: 20 }, (_, i) => `import m${i} from './m${i}.js';`).join('\n');
    const files: Record<string, string> = {
      'CLAUDE.md': '# Guide\n',
      'src/big.ts': `${imports}\nexport const x = [${Array.from({ length: 20 }, (_, i) => `m${i}`).join(',')}];\n`,
    };
    for (let i = 0; i < 20; i++) files[`src/m${i}.ts`] = `export default ${i};\n`;
    for (let i = 0; i < 100; i++) files[`app/p${i}.py`] = PY;
    const r = await analyze({ root: await repo('mixed-fail', files) });
    // 21 JS/TS of 121 source files = 17%: graph rules are ineligible, but a
    // verified C3 failure is a real finding and must survive.
    expect(r.meta.importGraphResolved).toBe(false);
    expect(r.rules['C3']?.passed).toBe(false);
    expect(r.rules['C3']?.inapplicable).toBeUndefined();
    expect(r.rules['C4']?.inapplicable).toBe(true);
  });

  it('graphCoverageMin in the manifest changes eligibility; values above 1 are ignored', async () => {
    const files = {
      'tailwind.config.js': 'module.exports = {};\n',
      'app/a.py': PY, 'app/b.py': PY, 'app/c.py': PY,
    };
    const lenient = await analyze({
      root: await repo('lenient', {
        ...files,
        'clarx-manifest.json': JSON.stringify({ version: '0.1', thresholds: { graphCoverageMin: 0.2 } }),
      }),
    });
    expect(lenient.meta.importGraphResolved).toBe(true);

    const impossible = await analyze({
      root: await repo('impossible', {
        ...files,
        'clarx-manifest.json': JSON.stringify({ version: '0.1', thresholds: { graphCoverageMin: 5 } }),
      }),
    });
    expect(impossible.meta.graphCoverage.minShare).toBe(0.8);
    expect(impossible.meta.importGraphResolved).toBe(false);
  });
});
