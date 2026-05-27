import type { AnalysisResult } from '@clarxai/engine';
import { resolve } from 'node:path';
import { exit } from 'node:process';
import { bucketFindings } from '../app/score/findings.js';
import { buildCopyAllText } from '../app/score/copy-text.js';
import { runScan, startWatchSession } from '../app/score/runtime.js';
import type { ScoreOptions } from '../app/score/types.js';
import { formatJson, formatMarkdown, formatText, runInkScoreApp } from '../presentation/index.js';
import { formatExplanation, getRuleCopyText } from './explain.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { Spinner } from '../utils/spinner.js';
import { showDisclosureIfNeeded, track } from '../utils/telemetry.js';

const isTTY = process.stdout.isTTY;
const dim = (s: string) => isTTY ? `\x1b[2m${s}\x1b[0m` : s;
const bold = (s: string) => isTTY ? `\x1b[1m${s}\x1b[0m` : s;
const cyan = (s: string) => isTTY ? `\x1b[36m${s}\x1b[0m` : s;
const magenta = (s: string) => isTTY ? `\x1b[95m${s}\x1b[0m` : s;
const red = (s: string) => isTTY ? `\x1b[91m${s}\x1b[0m` : s;
const yellow = (s: string) => isTTY ? `\x1b[93m${s}\x1b[0m` : s;
const divider = isTTY ? `\x1b[2m${'─'.repeat(52)}\x1b[0m` : '─'.repeat(52);

export async function scoreCommand(args: string[]) {
  const pathArg = args.find(a => !a.startsWith('--')) ?? '.';
  const root = resolve(pathArg);
  const watchMode = args.includes('--watch') || args.includes('-w');
  const uiMode = getFlagValue(args, '--ui') ?? 'ink';
  const useInk = uiMode === 'ink' && optsFormatAllowsInk(args) && isTTY;

  const opts: ScoreOptions = {
    root,
    format: getFlagValue(args, '--format') ?? 'text',
    ignore: (getFlagValue(args, '--ignore') ?? '').split(',').filter(Boolean),
    verbose: args.includes('--verbose'),
    minScore: getFlag(args, '--min-score'),
    minPillarScore: getFlag(args, '--min-pillar-score'),
    copyAll: args.includes('--copy-all'),
  };

  await showDisclosureIfNeeded();

  if (watchMode && !useInk) {
    await runWatch(opts);
  } else {
    const { result, code } = await runOnce(opts, { renderOutput: !useInk });

    if (useInk) {
      const inkCode = await runInkScoreApp({ opts, result, code, watchMode });
      exit(inkCode);
    }

    if (opts.format === 'text') showFooter(result, false);
    if (opts.copyAll) {
      const text = buildCopyAllText(result);
      const ok = copyToClipboard(text);
      console.log(ok ? `  \x1b[92m✓\x1b[0m \x1b[2mAll failing rules copied to clipboard\x1b[0m\n` : `  \x1b[2mClipboard not available on this system\x1b[0m\n`);
    }
    exit(code);
  }
}

async function runOnce(
  opts: ScoreOptions,
  renderBehavior: { renderOutput?: boolean } = {},
): Promise<{ result: AnalysisResult; code: number }> {
  const spinner = new Spinner(`Scanning ${opts.root} …`);
  spinner.start();

  let scan;
  try {
    scan = await runScan(opts);
  } finally {
    spinner.stop();
  }

  const { result, code } = scan;
  const shouldRenderOutput = renderBehavior.renderOutput ?? true;

  if (shouldRenderOutput) {
    switch (opts.format) {
      case 'json':
        console.log(formatJson(result));
        break;
      case 'markdown':
      case 'md':
        console.log(formatMarkdown(result, { verbose: opts.verbose }));
        break;
      default:
        console.log(formatText(result, { verbose: opts.verbose }));
    }
  }

  track({
    action: 'score',
    score: result.score,
    hardFailures: result.hardFailures.length,
    confidence: result.confidence,
    filesScanned: result.meta.filesScanned,
    manifestFound: result.meta.manifestFound,
    pillarScores: Object.fromEntries(
      Object.entries(result.pillars).map(([k, v]) => [k, v.score]),
    ),
  });

  return { result, code };
}

function showFooter(result: AnalysisResult, watching: boolean) {
  const buckets = bucketFindings(result);
  const hard = buckets.hardFailures.map(rule => red(rule.id));
  const warns = buckets.warnings.map(rule => yellow(rule.id));
  const recs = buckets.recommendations.map(rule => cyan(rule.id));

  const parts: string[] = [];
  if (hard.length) parts.push(`${dim('Failures')}  ${hard.join('  ')}`);
  if (warns.length) parts.push(`${dim('Warnings')}  ${warns.join('  ')}`);
  if (recs.length) parts.push(`${dim('Recs')}  ${recs.join('  ')}`);

  console.log(`\n  ${divider}`);

  if (parts.length > 0) {
    console.log(`  ${parts.join('    ')}`);
    console.log(`  ${dim('Type a rule ID for details')}  ${dim('·')}  ${dim('copy <rule>, copy all, or copy warnings/failures/recs')}  ${dim('·')}  ${magenta("e.g. 'C1'")}  ${magenta("'C'")}  ${magenta("'copy E2'")}  ${magenta("'copy w'")}  ${magenta("'copy all'")}  ${magenta("'show all'")}`);
  }

  if (watching) {
    console.log(`  ${dim('↺  Watching for changes')}  ${dim('·')}  ${magenta('h')} ${dim('home')}  ${dim('·')}  ${magenta('r')} ${dim('refresh')}  ${dim('·')}  ${magenta('Ctrl+C')} ${dim('to stop')}`);
  }

  console.log('');
}

async function runWatch(opts: ScoreOptions) {
  try {
    await startWatchSession(opts, {
      runScan: runOnce,
      showFooter,
      formatExplanation,
      getRuleCopyText,
      copyToClipboard,
      track,
      dim,
      promptPrefix: `  ${bold('›')} `,
      isTTY,
      onStop: () => {
        console.log(`\n  ${dim('Stopped.')}\n`);
      },
    });
  } catch {
    console.error('  Watch mode is not supported on this platform.');
    exit(1);
  }
}

function getFlag(args: string[], flag: string): number | null {
  const i = args.indexOf(flag);
  if (i === -1) return null;
  const val = args[i + 1];
  return val ? Number(val) : null;
}

function getFlagValue(args: string[], flag: string): string | null {
  const i = args.indexOf(flag);
  if (i === -1) return null;
  return args[i + 1] ?? null;
}

function optsFormatAllowsInk(args: string[]): boolean {
  const format = getFlagValue(args, '--format') ?? 'text';
  return format === 'text';
}
