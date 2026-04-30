import type { AnalysisResult, PillarName } from '@clarxai/engine';

const PILLAR_LABELS: Record<PillarName, string> = {
  discoverability: 'Discoverability',
  boundary_clarity: 'Boundary Clarity',
  context_efficiency: 'Context Efficiency',
  operational_guidance: 'Operational Guidance',
  edit_safety: 'Edit Safety',
};

export function formatText(result: AnalysisResult, opts: { verbose?: boolean } = {}): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(`Clarx AI-First Score — v${result.version}`);
  lines.push(`Confidence: ${result.confidence}`);
  lines.push('');
  lines.push(`  Overall         ${scoreBar(result.score)}`);
  lines.push('');

  for (const [pillarKey, pillar] of Object.entries(result.pillars) as [PillarName, typeof result.pillars[PillarName]][]) {
    const label = PILLAR_LABELS[pillarKey].padEnd(22);
    const flag = pillar.score < 70 ? '  ⚠' : '';
    lines.push(`  ${label} ${scoreBar(pillar.score)}${flag}`);
  }

  const warnings = Object.values(result.rules).filter(r => !r.passed && r.severity === 'warning');
  const hardFailures = Object.values(result.rules).filter(r => !r.passed && r.severity === 'hard_failure');
  const recommendations = Object.values(result.rules).filter(r => !r.passed && r.severity === 'recommendation');

  if (hardFailures.length > 0) {
    lines.push('');
    lines.push(`Hard Failures (${hardFailures.length}):`);
    for (const rule of hardFailures) {
      lines.push(`  ${rule.id}  ${rule.message}`);
      if (rule.locations) {
        for (const loc of rule.locations) {
          lines.push(`        ${loc.path}${loc.detail ? ` (${loc.detail})` : ''}`);
        }
      }
    }
  }

  if (warnings.length > 0) {
    lines.push('');
    lines.push(`Warnings (${warnings.length}):`);
    for (const rule of warnings) {
      lines.push(`  ${rule.id}  ${rule.message}`);
      if (rule.locations) {
        for (const loc of rule.locations) {
          lines.push(`        ${loc.path}${loc.detail ? ` (${loc.detail})` : ''}`);
        }
      }
    }
  }

  if (recommendations.length > 0) {
    lines.push('');
    lines.push(`Recommendations (${recommendations.length}):`);
    for (const rule of recommendations) {
      lines.push(`  ${rule.id}  ${rule.message}`);
    }
  }

  if (warnings.length > 0 || recommendations.length > 0) {
    lines.push('');
    lines.push("Run `clarx explain <rule>` for guidance on any rule.");
  }

  lines.push('');
  return lines.join('\n');
}

function scoreBar(score: number): string {
  const s = String(score).padStart(3);
  return `${s} / 100`;
}
