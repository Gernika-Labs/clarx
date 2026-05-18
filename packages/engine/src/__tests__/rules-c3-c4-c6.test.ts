import { describe, it, expect } from '@jest/globals';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { evaluateC3, evaluateC4, evaluateC6 } from '../analyzers/rules-c3-c4-c5.js';
import { makeFanInGraph, makeFile, makeImportGraph, makeManifest } from './helpers.js';

describe('C4 — high fan-in files are documented', () => {
  it('passes when no file exceeds the threshold', () => {
    const graph = makeFanInGraph([{ file: 'src/utils.ts', callers: 5 }]);
    expect(evaluateC4(graph, makeManifest()).passed).toBe(true);
  });

  it('fails when a file exceeds the threshold and is not declared', () => {
    const graph = makeFanInGraph([{ file: 'src/db.ts', callers: 15 }]);
    const result = evaluateC4(graph, makeManifest());
    expect(result.passed).toBe(false);
    expect(result.message).toContain('src/db.ts');
  });

  it('passes when the high fan-in file is declared in manifest.highFanIn', () => {
    const graph = makeFanInGraph([{ file: 'src/db.ts', callers: 15 }]);
    const manifest = makeManifest({ highFanIn: ['src/db.ts'] });
    expect(evaluateC4(graph, manifest).passed).toBe(true);
  });

  it('auto-exempts files in ui/ directories — foundational UI primitives are designed to have many callers', () => {
    const graph = makeFanInGraph([
      { file: 'components/ui/text.tsx', callers: 84 },
      { file: 'components/ui/button.tsx', callers: 26 },
      { file: 'src/ui/index.ts', callers: 40 },
    ]);
    expect(evaluateC4(graph, makeManifest()).passed).toBe(true);
  });

  it('does not exempt high fan-in files outside ui/ directories', () => {
    const graph = makeFanInGraph([
      { file: 'components/ui/text.tsx', callers: 84 },
      { file: 'src/lib/db.ts', callers: 20 },
    ]);
    const result = evaluateC4(graph, makeManifest());
    expect(result.passed).toBe(false);
    expect(result.message).toContain('src/lib/db.ts');
    expect(result.message).not.toContain('text.tsx');
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
      await writeFile(
        join(root, 'src/training/useTrainingPageViewModel.ts'),
        'export function useTrainingPageViewModel() { return {}; }\n',
        'utf-8'
      );

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

      const result = await evaluateC6(root, [makeFile('src/training/page.tsx')]);

      expect(result.passed).toBe(false);
      expect(result.locations?.[0]?.path).toBe('src/training/page.tsx');
      expect(result.locations?.[0]?.detail).toContain('no local boundary surface');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe('C3 — import breadth', () => {
  it('passes when all files have ≤ 15 imports', () => {
    const graph = makeImportGraph([
      { file: 'src/a.tsx', count: 10 },
      { file: 'src/b.tsx', count: 15 },
    ]);
    expect(evaluateC3(graph, null).passed).toBe(true);
  });

  it('fails when a file exceeds 15 imports', () => {
    const graph = makeImportGraph([{ file: 'src/heavy.tsx', count: 16 }]);
    const result = evaluateC3(graph, null);
    expect(result.passed).toBe(false);
    expect(result.locations).toHaveLength(1);
    expect(result.locations?.[0]?.path).toBe('src/heavy.tsx');
  });

  it('sorts violations by import count descending', () => {
    const graph = makeImportGraph([
      { file: 'src/a.tsx', count: 20 },
      { file: 'src/b.tsx', count: 25 },
    ]);
    expect(evaluateC3(graph, null).locations?.[0]?.path).toBe('src/b.tsx');
  });

  it('auto-exempts actions.ts regardless of import count', () => {
    const graph = makeImportGraph([{ file: 'src/app/actions.ts', count: 30 }]);
    expect(evaluateC3(graph, null).passed).toBe(true);
  });

  it('auto-exempts other aggregation filenames (mutations, resolvers, handlers, routes)', () => {
    for (const name of ['mutations.ts', 'resolvers.ts', 'commands.ts', 'handlers.ts', 'routes.ts']) {
      const graph = makeImportGraph([{ file: `src/${name}`, count: 25 }]);
      expect(evaluateC3(graph, null).passed).toBe(true);
    }
  });

  it('respects manifest.highFanOut path exemptions', () => {
    const graph = makeImportGraph([{ file: 'src/store.ts', count: 20 }]);
    const manifest = makeManifest({ highFanOut: ['store.ts'] });
    expect(evaluateC3(graph, manifest).passed).toBe(true);
  });

  it('shows lib and components as distinct internal domains, not pkg', () => {
    const graph = makeImportGraph([{
      file: 'src/components/Page.tsx',
      count: 17,
      deps: [
        'src/lib/auth.ts',
        'src/lib/api.ts',
        'src/lib/data.ts',
        'src/components/Button.tsx',
        'src/components/Input.tsx',
      ],
    }]);
    const detail = evaluateC3(graph, null).locations?.[0]?.detail ?? '';
    expect(detail).toContain('lib');
    expect(detail).toContain('components');
    expect(detail).not.toMatch(/\+5 pkg/);
  });
});
