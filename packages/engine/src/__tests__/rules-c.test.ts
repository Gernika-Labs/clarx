import { describe, it, expect } from '@jest/globals';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { evaluateC1, evaluateC2 } from '../analyzers/rules-c.js';
import { evaluateC6 } from '../analyzers/rules-c3-c4-c5.js';
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
  it('passes when all files are under 400 lines', async () => {
    const files = [makeFile('src/a.ts', 100), makeFile('src/b.ts', 399)];
    const result = await evaluateC2('/', files);
    expect(result.passed).toBe(true);
  });

  it('fails when a file exceeds 400 lines', async () => {
    const files = [makeFile('src/a.ts', 100), makeFile('src/b.ts', 401)];
    const result = await evaluateC2('/', files);
    expect(result.passed).toBe(false);
    expect(result.locations).toHaveLength(1);
    expect(result.locations?.[0]?.path).toBe('src/b.ts');
    expect(result.locations?.[0]?.detail).toBe('401 lines');
  });

  it('reports multiple violations sorted by line count descending', async () => {
    const files = [
      makeFile('src/a.ts', 500),
      makeFile('src/b.ts', 800),
      makeFile('src/c.ts', 200),
    ];
    const result = await evaluateC2('/', files);
    expect(result.passed).toBe(false);
    expect(result.locations).toHaveLength(2);
    expect(result.locations?.[0]?.path).toBe('src/b.ts'); // worst first
  });

  it('ignores generated files', async () => {
    const files = [makeGenerated('dist/bundle.js')];
    Object.assign(files[0]!, { lines: 9999 });
    const result = await evaluateC2('/', files);
    expect(result.passed).toBe(true);
  });

  it('ignores files without a line count', async () => {
    const files = [makeFile('assets/logo.png')]; // no lines
    const result = await evaluateC2('/', files);
    expect(result.passed).toBe(true);
  });
});

describe('C6 — entry files expose a local boundary surface before infrastructure', () => {
  it('passes when an entry file imports a local view-model boundary', async () => {
    const root = join(tmpdir(), `clarx-c6-pass-${Date.now()}`);
    try {
      await mkdir(join(root, 'src/training'), { recursive: true });
      await writeFile(join(root, 'src/training/page.tsx'), `
import { useTrainingPageViewModel } from './useTrainingPageViewModel';
import { Button } from './button';

export function Page() {
  return <Button />;
}
`, 'utf-8');
      await writeFile(join(root, 'src/training/useTrainingPageViewModel.ts'), 'export function useTrainingPageViewModel() { return {}; }\n', 'utf-8');

      const result = await evaluateC6(root, [
        makeFile('src/training/page.tsx'),
        makeFile('src/training/useTrainingPageViewModel.ts'),
      ]);

      expect(result.passed).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('flags entry files that coordinate infrastructure imports directly', async () => {
    const root = join(tmpdir(), `clarx-c6-fail-${Date.now()}`);
    try {
      await mkdir(join(root, 'src/training'), { recursive: true });
      await writeFile(join(root, 'src/training/page.tsx'), `
import { useTrainingFeedback } from './hooks/useTrainingFeedback';
import { useBackendPagination } from './hooks/useBackendPagination';
import { fetchTraining } from './services/training-service';
import { TrainingResponse } from './types';
import { Badge } from './Badge';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { Filters } from './Filters';

export function Page() {
  return <Button />;
}
`, 'utf-8');

      const result = await evaluateC6(root, [
        makeFile('src/training/page.tsx'),
      ]);

      expect(result.passed).toBe(false);
      expect(result.locations?.[0]?.path).toBe('src/training/page.tsx');
      expect(result.locations?.[0]?.detail).toContain('no local boundary surface');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
