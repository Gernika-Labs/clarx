import type { AnalysisResult } from '@clarxai/engine';
import { BAR_TOTAL, type BarTone } from './tokens.js';

type Pillar = AnalysisResult['pillars'][keyof AnalysisResult['pillars']];
type Rule = NonNullable<Pillar['rules'][keyof Pillar['rules']]>;

export function barTone(pillar: Pillar): BarTone {
  const rules = Object.values(pillar.rules).filter(Boolean) as Rule[];
  if (rules.some(r => !r.passed && r.severity === 'hard_failure')) return 'bad';
  if (rules.some(r => !r.passed && r.severity === 'warning')) return 'warn';
  return 'ok';
}

export function renderBarUnits(score: number, tone: BarTone): { filled: number; dots: number; tone: BarTone } {
  const filled = Math.round((score / 100) * BAR_TOTAL);
  return { filled, dots: BAR_TOTAL - filled, tone };
}

export function primaryNote(pillar: Pillar): { text: string; tone: BarTone | 'ok' } {
  const rules = Object.values(pillar.rules).filter(Boolean) as Rule[];
  const failing = rules.filter(r => !r.passed);
  if (failing.length === 0) return { text: '✓', tone: 'ok' };

  const top =
    failing.find(r => r.severity === 'hard_failure') ??
    failing.find(r => r.severity === 'warning') ??
    failing[0]!;

  const tone = barTone(pillar);
  return { text: top.message, tone };
}