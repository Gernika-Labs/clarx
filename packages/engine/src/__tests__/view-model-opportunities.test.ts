import { describe, it, expect } from '@jest/globals';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { makeFile } from './file-fixtures.js';
import { findViewModelMigrationOpportunities } from '../analyzers/view-model-opportunities.js';

describe('findViewModelMigrationOpportunities', () => {
  it('ranks query-heavy pages without a boundary surface as strong candidates', async () => {
    const root = join(tmpdir(), `clarx-vm-opp-${Date.now()}`);
    try {
      await mkdir(join(root, 'src/app/training'), { recursive: true });
      await writeFile(join(root, 'src/app/training/page.tsx'), `
import { useUser } from '../../auth/useUser';
import { useTrainingFeedbackQuery } from '../../hooks/queries/useTrainingFeedbackQuery';
import { useTrainingSummaryQuery } from '../../hooks/queries/useTrainingSummaryQuery';
import { useBackendPagination } from '../../hooks/useBackendPagination';
import { TrainingSummary } from '../../services/handlers/training';

export function Page() {
  const { accessToken, idToken } = useUser();
  return <div>{accessToken}{idToken}</div>;
}
`, 'utf-8');

      const opportunities = await findViewModelMigrationOpportunities(root, [
        makeFile('src/app/training/page.tsx', 360),
      ]);

      expect(opportunities).toHaveLength(1);
      expect(opportunities[0]?.rating).toBe('high');
      expect(opportunities[0]?.signals.queryHookImports).toBeGreaterThanOrEqual(2);
      expect(opportunities[0]?.signals.handlerTypeImports).toBe(1);
      expect(opportunities[0]?.scores.tracingRoi).toBeGreaterThan(0);
      expect(opportunities[0]?.scores.simplificationRoi).toBeGreaterThan(0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('records limiting factors when inline-derived fields reduce expected gain', async () => {
    const root = join(tmpdir(), `clarx-vm-opp-limit-${Date.now()}`);
    try {
      await mkdir(join(root, 'src/app/members'), { recursive: true });
      await writeFile(join(root, 'src/app/members/page.tsx'), `
import { useMembersQuery } from '../../hooks/queries/useMembersQuery';
import { useMembersSummaryQuery } from '../../hooks/queries/useMembersSummaryQuery';
import { useUser } from '../../auth/useUser';
import { MembersResponse } from '../../services/handlers/members';

export function Page() {
  const { accessToken, idToken } = useUser();
  const isAdmin = true;
  const canManage = isAdmin;
  const periodLabel = 'Today';
  const selected = null;
  const [open, setOpen] = [false, () => {}];
  return <div>{open}{setOpen}{selected}{periodLabel}{canManage}{accessToken}{idToken}</div>;
}
`, 'utf-8');

      const opportunities = await findViewModelMigrationOpportunities(root, [
        makeFile('src/app/members/page.tsx', 360),
      ]);

      expect(opportunities).toHaveLength(1);
      expect(opportunities[0]?.limits.some(limit => limit.includes('inline-derived fields'))).toBe(true);
      expect(opportunities[0]?.limits.some(limit => limit.includes('mutation-heavy page'))).toBe(true);
      expect(opportunities[0]?.signals.inlineDerivedSignals).toBeGreaterThanOrEqual(2);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('skips pages that already use a view-model boundary', async () => {
    const root = join(tmpdir(), `clarx-vm-opp-skip-${Date.now()}`);
    try {
      await mkdir(join(root, 'src/app/usage'), { recursive: true });
      await writeFile(join(root, 'src/app/usage/page.tsx'), `
import { useUsagePageViewModel } from './useUsagePageViewModel';

export function Page() {
  const vm = useUsagePageViewModel();
  return <div>{vm.status}</div>;
}
`, 'utf-8');

      const opportunities = await findViewModelMigrationOpportunities(root, [
        makeFile('src/app/usage/page.tsx', 120),
      ]);

      expect(opportunities).toHaveLength(0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
