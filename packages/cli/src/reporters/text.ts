import chalk from 'chalk';
import type { AnalysisResult, PillarName } from '@clarxai/engine';

const PILLAR_LABELS: Record<PillarName, string> = {
  discoverability:      'Discoverability',
  boundary_clarity:     'Boundary clarity',
  context_efficiency:   'Context efficiency',
  operational_guidance: 'Operational guidance',
  edit_safety:          'Edit safety',
};

const BAR_TOTAL = 28;
const NAME_W    = 22;

type Pillar = AnalysisResult['pillars'][PillarName];
type Rule   = NonNullable<Pillar['rules'][keyof Pillar['rules']]>;

function barTone(pillar: Pillar): 'bad' | 'warn' | 'ok' {
  const rules = Object.values(pillar.rules).filter(Boolean) as Rule[];
  if (rules.some(r => !r.passed && r.severity === 'hard_failure')) return 'bad';
  if (rules.some(r => !r.passed && r.severity === 'warning'))      return 'warn';
  return 'ok';
}

function renderBar(score: number, tone: 'bad' | 'warn' | 'ok'): string {
  const filled = Math.round((score / 100) * BAR_TOTAL);
  const dots   = BAR_TOTAL - filled;
  const fill   = ' '.repeat(filled);
  const dot    = '⠂'.repeat(dots);

  let filledStr: string;
  switch (tone) {
    case 'bad':  filledStr = chalk.bgRgb(185, 100, 100)(fill); break;
    case 'warn': filledStr = chalk.bgRgb(185, 160, 75)(fill);  break;
    default:     filledStr = chalk.bgRgb(205, 205, 210)(fill); break;
  }

  return filledStr + chalk.dim(dot);
}

function primaryNote(pillar: Pillar, tone: 'bad' | 'warn' | 'ok'): string {
  const rules = Object.values(pillar.rules).filter(Boolean) as Rule[];
  const failing = rules.filter(r => !r.passed);
  if (failing.length === 0) return chalk.green('✓');
  const top =
    failing.find(r => r.severity === 'hard_failure') ??
    failing.find(r => r.severity === 'warning') ??
    failing[0]!;
  if (tone === 'bad')  return chalk.red(top.message);
  if (tone === 'warn') return chalk.yellow(top.message);
  return chalk.dim(top.message);
}

export const divider = chalk.dim('─'.repeat(52));

export function formatText(result: AnalysisResult, opts: { verbose?: boolean } = {}): string {
  const lines: string[] = [''];

  // ── Header ───────────────────────────────────────────────────────────────────
  lines.push(chalk.dim(`clarx v${result.version} · scoring ${result.meta.filesScanned} files…`));
  lines.push('');

  // ── Pillar bars ───────────────────────────────────────────────────────────────
  for (const [key, pillar] of Object.entries(result.pillars) as [PillarName, Pillar][]) {
    const tone  = barTone(pillar);
    const name  = PILLAR_LABELS[key].padEnd(NAME_W);
    const bar   = renderBar(pillar.score, tone);
    const score = chalk.bold(String(pillar.score).padStart(4));
    const note  = primaryNote(pillar, tone);
    lines.push(`${name}  ${bar}  ${score}  ${note}`);
    lines.push('');
  }

  lines.push('');

  // ── Overall ───────────────────────────────────────────────────────────────────
  const confLabel = result.confidenceCaveat
    ? chalk.yellow(`⚠ confidence: ${result.confidence}`)
    : chalk.green(`(confidence: ${result.confidence})`);
  lines.push(`${'Overall score'.padEnd(NAME_W)}  ${chalk.bold(`${result.score} / 100`)}  ${confLabel}`);

  if (result.confidenceCaveat) {
    lines.push(chalk.yellow(`  Scan confidence is low — hard failures are real findings but may shift`));
    lines.push(chalk.yellow(`  once a clarx-manifest.json is added. Treat as soft-critical for now.`));
  }
  lines.push('');

  // ── Summary ───────────────────────────────────────────────────────────────────
  const allRules  = Object.values(result.rules).filter(Boolean) as Rule[];
  const hardFails = allRules.filter(r => !r.passed && r.severity === 'hard_failure');
  const warnings  = allRules.filter(r => !r.passed && r.severity === 'warning');
  const recs      = allRules.filter(r => !r.passed && r.severity === 'recommendation');

  const parts: string[] = [];
  if (hardFails.length) parts.push(chalk.red(`${hardFails.length} hard ${hardFails.length === 1 ? 'failure' : 'failures'}`));
  if (warnings.length)  parts.push(chalk.yellow(`${warnings.length} ${warnings.length === 1 ? 'warning' : 'warnings'}`));
  if (recs.length)      parts.push(chalk.dim(`${recs.length} ${recs.length === 1 ? 'recommendation' : 'recommendations'}`));
  if (parts.length)     lines.push(parts.join(chalk.dim(' · ')));

  // ── Hint ──────────────────────────────────────────────────────────────────────
  const topRule = hardFails[0] ?? warnings[0];
  if (topRule) {
    lines.push(`${chalk.dim('Run')} ${chalk.cyan(`clarx explain ${topRule.id}`)} ${chalk.dim('for details')}`);
  }

  if (result.tip) {
    lines.push(`${chalk.dim('→')} ${chalk.cyan(result.tip)}`);
  }

  lines.push('');

  if (result.opportunities.viewModelMigrations.length > 0) {
    lines.push(chalk.bold('View-model migration opportunities'));
    for (const item of result.opportunities.viewModelMigrations.slice(0, 5)) {
      const tone = item.rating === 'high' ? chalk.yellow : item.rating === 'medium' ? chalk.cyan : chalk.dim;
      lines.push(`  ${tone(item.rating.toUpperCase().padEnd(6))} ${item.path} ${chalk.dim(`(${item.score})`)}`);
      lines.push(`         ${item.summary}`);
      lines.push(`         ${chalk.dim(`Tracing ROI ${item.scores.tracingRoi} · Simplification ROI ${item.scores.simplificationRoi}`)}`);
      for (const reason of item.reasons.slice(0, 3)) {
        lines.push(`         ${chalk.dim('•')} ${reason}`);
      }
      for (const limit of item.limits.slice(0, 2)) {
        lines.push(`         ${chalk.dim('◦')} ${limit}`);
      }
    }
    lines.push('');
  }

  // ── Verbose findings ──────────────────────────────────────────────────────────
  if (opts.verbose) {
    for (const [label, group, color] of [
      ['Hard failures',    hardFails, chalk.red]    as const,
      ['Warnings',         warnings,  chalk.yellow] as const,
      ['Recommendations',  recs,      chalk.dim]    as const,
    ]) {
      if (!group.length) continue;
      lines.push(color(`${label} (${group.length})`));
      for (const r of group) {
        lines.push(`  ${chalk.bold(r.id)}  ${color(r.message)}`);
        if (r.locations) {
          for (const loc of r.locations.slice(0, 5)) {
            lines.push(`      ${chalk.dim('→')} ${loc.path}${loc.detail ? chalk.dim(` — ${loc.detail}`) : ''}`);
          }
          if (r.locations.length > 5) lines.push(`      ${chalk.dim(`… and ${r.locations.length - 5} more`)}`);
        }
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}
