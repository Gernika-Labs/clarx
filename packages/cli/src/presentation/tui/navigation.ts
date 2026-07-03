import type { PillarRowView } from '../score-report/model.js';

export function defaultSelectedPillarIndex(pillars: PillarRowView[]): number {
  const withIssues = pillars.findIndex(p => p.findings.length > 0);
  return withIssues === -1 ? 0 : withIssues;
}

export function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function nextPillarIndex(current: number, delta: number, length: number): number {
  return clampIndex(current + delta, length);
}

export function visiblePillarIndices(pillars: PillarRowView[], filterQuery: string): number[] {
  const query = filterQuery.trim().toLowerCase();
  if (!query) return pillars.map((_, i) => i);

  return pillars
    .map((pillar, i) => ({ pillar, i }))
    .filter(({ pillar }) =>
      pillar.label.toLowerCase().includes(query) ||
      pillar.findings.some(f =>
        f.id.toLowerCase().includes(query) ||
        f.message.toLowerCase().includes(query),
      ),
    )
    .map(({ i }) => i);
}

export function findingsForPillar(pillar: PillarRowView, filterQuery: string) {
  const query = filterQuery.trim().toLowerCase();
  if (!query) return pillar.findings;
  return pillar.findings.filter(f =>
    f.id.toLowerCase().includes(query) ||
    f.message.toLowerCase().includes(query) ||
    pillar.label.toLowerCase().includes(query),
  );
}