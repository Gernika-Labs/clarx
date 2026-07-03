import type { AnalysisResult } from '@clarxai/engine';
import { buildScoreReportView } from '../score-report/model.js';
import { formatScoreReport } from '../score-report/format.js';

export { divider } from '../score-report/format.js';

export function formatText(result: AnalysisResult, opts: { verbose?: boolean } = {}): string {
  return formatScoreReport(buildScoreReportView(result, opts));
}