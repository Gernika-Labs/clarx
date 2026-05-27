import { analyze } from '@clarxai/engine';
import type { AnalysisResult } from '@clarxai/engine';
import { getScoreExitCode } from './exit-code.js';
import type { ScoreOptions } from './types.js';

export interface RunScanResult {
  result: AnalysisResult;
  code: number;
}

export async function runScan(opts: ScoreOptions): Promise<RunScanResult> {
  const result = await analyze({ root: opts.root, ignore: opts.ignore });
  const code = getScoreExitCode(result, opts);
  return { result, code };
}
