import type { AnalysisResult } from '@clarxai/engine';

export function formatJson(result: AnalysisResult): string {
  return JSON.stringify(result, null, 2);
}
