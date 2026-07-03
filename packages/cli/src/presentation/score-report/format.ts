import chalk from 'chalk';
import type { ScoreReportView } from './model.js';
import { padName } from './model.js';
import { DIVIDER_WIDTH } from './tokens.js';

function renderBar(view: ScoreReportView['pillars'][number]): string {
  const { filled, dots, tone } = view.bar;
  const fill = ' '.repeat(filled);
  const dot = '⠂'.repeat(dots);

  let filledStr: string;
  switch (tone) {
    case 'bad':
      filledStr = chalk.bgRgb(185, 100, 100)(fill);
      break;
    case 'warn':
      filledStr = chalk.bgRgb(185, 160, 75)(fill);
      break;
    default:
      filledStr = chalk.bgRgb(205, 205, 210)(fill);
  }

  return filledStr + chalk.dim(dot);
}

function renderNote(view: ScoreReportView['pillars'][number]): string {
  const { text, tone } = view.note;
  if (tone === 'ok') return chalk.green(text);
  if (tone === 'bad') return chalk.red(text);
  if (tone === 'warn') return chalk.yellow(text);
  return chalk.dim(text);
}

export const divider = chalk.dim('─'.repeat(DIVIDER_WIDTH));

export function formatScoreReport(view: ScoreReportView): string {
  const lines: string[] = [''];

  lines.push(chalk.dim(`clarx v${view.version} · scoring ${view.filesScanned} files…`));
  lines.push('');

  for (const pillar of view.pillars) {
    const name = padName(pillar.label);
    const bar = renderBar(pillar);
    const score = chalk.bold(String(pillar.score).padStart(4));
    const note = renderNote(pillar);
    lines.push(`${name}  ${bar}  ${score}  ${note}`);
    lines.push('');
  }

  lines.push('');

  const confLabel = view.confidenceCaveat
    ? chalk.yellow(`⚠ confidence: ${view.confidence}`)
    : chalk.green(`(confidence: ${view.confidence})`);
  lines.push(`${padName('Overall score')}  ${chalk.bold(`${view.score} / 100`)}  ${confLabel}`);

  if (view.confidenceCaveat) {
    lines.push(chalk.yellow('  Scan confidence is low — hard failures are real findings but may shift'));
    lines.push(chalk.yellow('  once a clarx-manifest.json is added. Treat as soft-critical for now.'));
  }
  lines.push('');

  const parts: string[] = [];
  if (view.summary.hardFailures) {
    parts.push(chalk.red(`${view.summary.hardFailures} hard ${view.summary.hardFailures === 1 ? 'failure' : 'failures'}`));
  }
  if (view.summary.warnings) {
    parts.push(chalk.yellow(`${view.summary.warnings} ${view.summary.warnings === 1 ? 'warning' : 'warnings'}`));
  }
  if (view.summary.recommendations) {
    parts.push(chalk.dim(`${view.summary.recommendations} ${view.summary.recommendations === 1 ? 'recommendation' : 'recommendations'}`));
  }
  if (parts.length) lines.push(parts.join(chalk.dim(' · ')));

  if (view.topRule) {
    lines.push(`${chalk.dim('Run')} ${chalk.cyan(`clarx explain ${view.topRule.id}`)} ${chalk.dim('for details')}`);
  }

  if (view.tip) {
    lines.push(`${chalk.dim('→')} ${chalk.cyan(view.tip)}`);
  }

  lines.push('');

  if (view.migrations.length > 0) {
    lines.push(chalk.bold('View-model migration opportunities'));
    for (const item of view.migrations) {
      const tone = item.rating === 'high' ? chalk.yellow : item.rating === 'medium' ? chalk.cyan : chalk.dim;
      lines.push(`  ${tone(item.rating.toUpperCase().padEnd(6))} ${item.path} ${chalk.dim(`(${item.score})`)}`);
      lines.push(`         ${item.summary}`);
      lines.push(`         ${chalk.dim(`Tracing ROI ${item.tracingRoi} · Simplification ROI ${item.simplificationRoi}`)}`);
      for (const reason of item.reasons) {
        lines.push(`         ${chalk.dim('•')} ${reason}`);
      }
      for (const limit of item.limits) {
        lines.push(`         ${chalk.dim('◦')} ${limit}`);
      }
    }
    lines.push('');
  }

  for (const group of view.verboseGroups) {
    const color =
      group.label === 'Hard failures'
        ? chalk.red
        : group.label === 'Warnings'
          ? chalk.yellow
          : chalk.dim;
    lines.push(color(`${group.label} (${group.rules.length})`));
    for (const rule of group.rules) {
      lines.push(`  ${chalk.bold(rule.id)}  ${color(rule.message)}`);
      if (rule.locations) {
        for (const loc of rule.locations.slice(0, 5)) {
          lines.push(`      ${chalk.dim('→')} ${loc.path}${loc.detail ? chalk.dim(` — ${loc.detail}`) : ''}`);
        }
        if (rule.locations.length > 5) {
          lines.push(`      ${chalk.dim(`… and ${rule.locations.length - 5} more`)}`);
        }
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}