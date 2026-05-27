import type { ScoreOptions, ScoreResult } from './types.js';

export function getScoreExitCode(
  result: ScoreResult,
  opts: Pick<ScoreOptions, 'minScore' | 'minPillarScore'>,
): number {
  if (result.hardFailures.length > 0) return 2;

  if (opts.minScore !== null && result.score < opts.minScore) return 1;

  if (opts.minPillarScore !== null) {
    const scores = Object.values(result.pillars).map(pillar => pillar.score);
    if (scores.some(score => score < opts.minPillarScore!)) return 1;
  }

  return 0;
}
