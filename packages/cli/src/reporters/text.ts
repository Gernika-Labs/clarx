import type { AnalysisResult, PillarName } from '@clarxai/engine';

// ── ANSI helpers ──────────────────────────────────────────────────────────────
const useColor = process.stdout.isTTY && !process.env['NO_COLOR'];

const c = {
  reset:   (s: string) => useColor ? `\x1b[0m${s}\x1b[0m` : s,
  bold:    (s: string) => useColor ? `\x1b[1m${s}\x1b[0m` : s,
  dim:     (s: string) => useColor ? `\x1b[2m${s}\x1b[0m` : s,
  red:     (s: string) => useColor ? `\x1b[31m${s}\x1b[0m` : s,
  green:   (s: string) => useColor ? `\x1b[32m${s}\x1b[0m` : s,
  yellow:  (s: string) => useColor ? `\x1b[33m${s}\x1b[0m` : s,
  cyan:    (s: string) => useColor ? `\x1b[36m${s}\x1b[0m` : s,
  white:   (s: string) => useColor ? `\x1b[97m${s}\x1b[0m` : s,
  bRed:    (s: string) => useColor ? `\x1b[91m${s}\x1b[0m` : s,
  bGreen:  (s: string) => useColor ? `\x1b[92m${s}\x1b[0m` : s,
  bYellow: (s: string) => useColor ? `\x1b[93m${s}\x1b[0m` : s,
  bCyan:   (s: string) => useColor ? `\x1b[96m${s}\x1b[0m` : s,
};

function scoreColor(score: number, s: string): string {
  if (score >= 80) return c.bGreen(s);
  if (score >= 50) return c.bYellow(s);
  return c.bRed(s);
}

function confidenceColor(conf: string): string {
  if (conf === 'high')   return c.bGreen(conf);
  if (conf === 'medium') return c.bYellow(conf);
  return c.bRed(conf);
}

const PILLAR_LABELS: Record<PillarName, string> = {
  discoverability:      'Discoverability',
  boundary_clarity:     'Boundary Clarity',
  context_efficiency:   'Context Efficiency',
  operational_guidance: 'Operational Guidance',
  edit_safety:          'Edit Safety',
};

export const divider = useColor
  ? `\x1b[2m${'─'.repeat(52)}\x1b[0m`
  : '─'.repeat(52);

export function formatText(result: AnalysisResult, opts: { verbose?: boolean } = {}): string {
  const lines: string[] = [];

  const warnings        = Object.values(result.rules).filter(r => r && !r.passed && r.severity === 'warning');
  const hardFailures    = Object.values(result.rules).filter(r => r && !r.passed && r.severity === 'hard_failure');
  const recommendations = Object.values(result.rules).filter(r => r && !r.passed && r.severity === 'recommendation');

  // ── Findings first (scroll up naturally) ─────────────────────────────────

  if (hardFailures.length > 0) {
    lines.push('');
    lines.push(`  ${divider}`);
    lines.push(`  ${c.bRed('✗')} ${c.bold(c.red(`Hard Failures (${hardFailures.length})`))}`);
    for (const rule of hardFailures) {
      lines.push('');
      lines.push(`  ${c.bold(c.bRed(rule!.id))}  ${c.red(rule!.message)}`);
      if (rule!.locations) {
        for (const loc of rule!.locations) {
          const detail = loc.detail ? c.dim(` — ${loc.detail}`) : '';
          lines.push(`      ${c.dim('→')} ${loc.path}${detail}`);
        }
      }
    }
  }

  if (warnings.length > 0) {
    lines.push('');
    lines.push(`  ${divider}`);
    lines.push(`  ${c.bYellow('⚠')} ${c.bold(c.yellow(`Warnings (${warnings.length})`))}`);
    for (const rule of warnings) {
      lines.push('');
      lines.push(`  ${c.bold(c.bYellow(rule!.id))}  ${c.yellow(rule!.message)}`);
      if (rule!.locations) {
        for (const loc of rule!.locations) {
          const detail = loc.detail ? c.dim(` — ${loc.detail}`) : '';
          lines.push(`      ${c.dim('→')} ${loc.path}${detail}`);
        }
      }
    }
  }

  if (recommendations.length > 0) {
    lines.push('');
    lines.push(`  ${divider}`);
    lines.push(`  ${c.bCyan('●')} ${c.bold(c.cyan(`Recommendations (${recommendations.length})`))}`);
    for (const rule of recommendations) {
      lines.push('');
      lines.push(`  ${c.bold(c.bCyan(rule!.id))}  ${c.cyan(rule!.message)}`);
      if (rule!.locations) {
        for (const loc of rule!.locations.slice(0, 5)) {
          lines.push(`      ${c.dim('→')} ${loc.path}`);
        }
        if (rule!.locations.length > 5) {
          lines.push(`      ${c.dim(`… and ${rule!.locations.length - 5} more`)}`);
        }
      }
    }
  }

  if (opts.verbose) {
    const passing = Object.values(result.rules).filter(r => r && r.passed && r.scoreImpact > 0);
    if (passing.length > 0) {
      lines.push('');
      lines.push(`  ${divider}`);
      lines.push(`  ${c.bGreen('✓')} ${c.bold(c.green(`Passing (${passing.length})`))}`);
      for (const rule of passing) {
        lines.push(`  ${c.green(rule!.id)}  ${c.dim(rule!.message)}`);
      }
    }
  }

  // ── Score summary at the bottom (always visible) ──────────────────────────

  lines.push('');
  lines.push(`  ${divider}`);
  lines.push(`  ${c.bold(c.white('Clarx AI-First Score'))}  ${c.dim(`v${result.version}`)}`);
  lines.push(`  ${c.dim('Confidence')}  ${confidenceColor(result.confidence)}`);
  lines.push('');

  const overallScore = scoreColor(result.score, String(result.score).padStart(3));
  lines.push(`  ${c.dim('Overall'.padEnd(24))}  ${overallScore} ${c.dim('/ 100')}`);
  lines.push('');

  for (const [key, pillar] of Object.entries(result.pillars) as [PillarName, typeof result.pillars[PillarName]][]) {
    const label = PILLAR_LABELS[key].padEnd(24);
    const score = scoreColor(pillar.score, String(pillar.score).padStart(3));
    const warn  = pillar.score < 70 ? `  ${c.bYellow('⚠')}` : '';
    lines.push(`  ${c.dim(label)}  ${score} ${c.dim('/ 100')}${warn}`);
  }

  lines.push('');
  return lines.join('\n');
}
