import type { PillarName } from '@clarxai/engine';

export const PILLAR_LABELS: Record<PillarName, string> = {
  discoverability: 'Discoverability',
  boundary_clarity: 'Boundary clarity',
  context_efficiency: 'Context efficiency',
  operational_guidance: 'Operational guidance',
  edit_safety: 'Edit safety',
};

export const BAR_TOTAL = 28;
export const NAME_W = 22;
export const DIVIDER_WIDTH = 52;

export type BarTone = 'bad' | 'warn' | 'ok';