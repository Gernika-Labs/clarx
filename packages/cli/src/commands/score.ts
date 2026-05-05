import { analyze } from '@clarxai/engine';
import type { AnalysisResult } from '@clarxai/engine';
import { watch } from 'node:fs';
import * as readline from 'node:readline';
import { resolve } from 'node:path';
import { exit } from 'node:process';
import { formatText } from '../reporters/text.js';
import { formatMarkdown } from '../reporters/markdown.js';
import { formatExplanation, getRuleCopyText } from './explain.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { Spinner } from '../utils/spinner.js';
import { showDisclosureIfNeeded, track } from '../utils/telemetry.js';

const isTTY = process.stdout.isTTY;
const dim   = (s: string) => isTTY ? `\x1b[2m${s}\x1b[0m` : s;
const bold  = (s: string) => isTTY ? `\x1b[1m${s}\x1b[0m` : s;
const cyan    = (s: string) => isTTY ? `\x1b[36m${s}\x1b[0m` : s;
const magenta = (s: string) => isTTY ? `\x1b[95m${s}\x1b[0m` : s;
const red     = (s: string) => isTTY ? `\x1b[91m${s}\x1b[0m` : s;
const yellow = (s: string) => isTTY ? `\x1b[93m${s}\x1b[0m` : s;
const divider = isTTY ? `\x1b[2m${'─'.repeat(52)}\x1b[0m` : '─'.repeat(52);

interface ScoreOpts {
  root: string;
  format: string;
  ignore: string[];
  verbose: boolean;
  minScore: number | null;
  minPillarScore: number | null;
  copyAll: boolean;
}

export async function scoreCommand(args: string[]) {
  const pathArg = args.find(a => !a.startsWith('--')) ?? '.';
  const root = resolve(pathArg);
  const watchMode = args.includes('--watch') || args.includes('-w');

  const opts: ScoreOpts = {
    root,
    format: getFlagValue(args, '--format') ?? 'text',
    ignore: (getFlagValue(args, '--ignore') ?? '').split(',').filter(Boolean),
    verbose: args.includes('--verbose'),
    minScore: getFlag(args, '--min-score'),
    minPillarScore: getFlag(args, '--min-pillar-score'),
    copyAll: args.includes('--copy-all'),
  };

  await showDisclosureIfNeeded();

  if (watchMode) {
    await runWatch(opts);
  } else {
    const { result, code } = await runOnce(opts);
    if (opts.format === 'text') showFooter(result, false);
    if (opts.copyAll) {
      const text = buildCopyAllText(result);
      const ok = copyToClipboard(text);
      console.log(ok ? `  \x1b[92m✓\x1b[0m \x1b[2mAll failing rules copied to clipboard\x1b[0m\n` : `  \x1b[2mClipboard not available on this system\x1b[0m\n`);
    }
    exit(code);
  }
}

async function runOnce(opts: ScoreOpts): Promise<{ result: AnalysisResult; code: number }> {
  const spinner = new Spinner(`Scanning ${opts.root} …`);
  spinner.start();

  let result: AnalysisResult;
  try {
    result = await analyze({ root: opts.root, ignore: opts.ignore });
  } finally {
    spinner.stop();
  }

  switch (opts.format) {
    case 'json':
      console.log(JSON.stringify(result, null, 2));
      break;
    case 'markdown':
    case 'md':
      console.log(formatMarkdown(result, { verbose: opts.verbose }));
      break;
    default:
      console.log(formatText(result, { verbose: opts.verbose }));
  }

  track({
    action: 'score',
    score: result.score,
    hardFailures: result.hardFailures.length,
    confidence: result.confidence,
    filesScanned: result.meta.filesScanned,
    manifestFound: result.meta.manifestFound,
    pillarScores: Object.fromEntries(
      Object.entries(result.pillars).map(([k, v]) => [k, v.score])
    ),
  });

  let code = 0;
  if (result.hardFailures.length > 0) code = 2;
  else if (opts.minScore !== null && result.score < opts.minScore) code = 1;
  else if (opts.minPillarScore !== null) {
    const scores = Object.values(result.pillars).map(p => p.score);
    if (scores.some(s => s < opts.minPillarScore!)) code = 1;
  }

  return { result, code };
}

function showFooter(result: AnalysisResult, watching: boolean) {
  const rules = Object.values(result.rules).filter(Boolean) as NonNullable<(typeof result.rules)[keyof typeof result.rules]>[];

  const hard  = rules.filter(r => !r.passed && r.severity === 'hard_failure').map(r => red(r.id));
  const warns = rules.filter(r => !r.passed && r.severity === 'warning').map(r => yellow(r.id));
  const recs  = rules.filter(r => !r.passed && r.severity === 'recommendation').map(r => cyan(r.id));

  const parts: string[] = [];
  if (hard.length)  parts.push(`${dim('Failures')}  ${hard.join('  ')}`);
  if (warns.length) parts.push(`${dim('Warnings')}  ${warns.join('  ')}`);
  if (recs.length)  parts.push(`${dim('Recs')}  ${recs.join('  ')}`);

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

async function runWatch(opts: ScoreOpts) {
  const clear = () => process.stdout.write('\x1b[2J\x1b[H');

  let rl: readline.Interface | null = null;
  let debounce: ReturnType<typeof setTimeout> | null = null;

  const render = async (changedFile?: string) => {
    if (rl) { rl.close(); rl = null; }
    if (changedFile) {
      clear();
      console.log(`\n  ${dim(`↺  ${changedFile} changed — re-analyzing…`)}\n`);
    }

    const { result } = await runOnce(opts);
    showFooter(result, true);
    startPrompt(result);
  };

  const startPrompt = (result: AnalysisResult) => {
    if (!isTTY) return;
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const prompt = () => process.stdout.write(`  ${bold('›')} `);
    prompt();

    rl.on('line', (input) => {
      // Normalize '01'–'05' → 'O1'–'O5': zero and letter-O are visually identical in most mono fonts
      const id = input.trim().toUpperCase().replace(/^0([1-5])$/, 'O$1');
      if (!id) { prompt(); return; }

      if (id === 'R' || id === 'H') {
        rl!.close();
        rl = null;
        render();
        return;
      }

      if (id === 'SHOW ALL') {
        const allRules = Object.values(result.rules).filter(Boolean) as NonNullable<(typeof result.rules)[keyof typeof result.rules]>[];
        const failing = allRules.filter(r => !r.passed);
        if (failing.length === 0) {
          console.log(`  ${dim('No issues found.')}\n`);
        } else {
          for (const r of failing) {
            const explanation = formatExplanation(r.id);
            if (explanation) console.log(explanation);
          }
          track({ action: 'show_all', score: result.score });
        }
        prompt();
        return;
      }

      if (/^[DBCOE]$/.test(id)) {
        const allRules = Object.values(result.rules).filter(Boolean) as NonNullable<(typeof result.rules)[keyof typeof result.rules]>[];
        const failing = allRules.filter(r => !r.passed && r.id.startsWith(id));
        if (failing.length === 0) {
          console.log(`  ${dim(`No issues in pillar ${id}`)}\n`);
        } else {
          for (const r of failing) {
            const explanation = formatExplanation(r.id);
            if (explanation) console.log(explanation);
          }
          track({ action: 'show_section', rule: id, score: result.score });
        }
        prompt();
        return;
      }

      if (id === 'COPY ALL') {
        const text = buildCopyAllText(result);
        const ok = copyToClipboard(text);
        console.log(ok
          ? `  \x1b[92m✓\x1b[0m \x1b[2mAll failing rules copied to clipboard\x1b[0m`
          : `  \x1b[2mClipboard not available on this system\x1b[0m`
        );
        track({ action: 'copy_all', score: result.score });
        console.log('');
        prompt();
        return;
      }

      if (id.startsWith('COPY ')) {
        const target = id.slice(5).trim();
        const sectionText = buildCopySectionText(result, target);
        if (sectionText) {
          const ok = copyToClipboard(sectionText);
          console.log(ok
            ? `  \x1b[92m✓\x1b[0m \x1b[2mCopied ${target.toLowerCase()} section to clipboard\x1b[0m`
            : `  \x1b[2mClipboard not available on this system\x1b[0m`
          );
          track({ action: 'copy_section', rule: target, score: result.score });
          console.log('');
          prompt();
          return;
        }

        const ruleId = target;
        const text = getRuleCopyText(ruleId);
        if (text) {
          const ok = copyToClipboard(text);
          console.log(ok
            ? `  \x1b[92m✓\x1b[0m \x1b[2mCopied fix for ${ruleId} to clipboard\x1b[0m`
            : `  \x1b[2mClipboard not available on this system\x1b[0m`
          );
          track({ action: 'copy', rule: ruleId, score: result.score });
        } else {
          console.log(`  ${dim(`Unknown rule or section "${ruleId}". Valid rules: D1–D5, B1–B5, C1–C6, O1–O5, E1–E5. Sections: failures/f, warnings/w, recs/recommendations`)}`);
        }
        console.log('');
        prompt();
        return;
      }

      const explanation = formatExplanation(id);
      if (explanation) {
        console.log(explanation);
        track({ action: 'explain', rule: id, score: result.score });
      } else {
        console.log(`  ${dim(`Unknown: "${input.trim()}". Try a rule ID (e.g. 'C1'), a section letter ('C'), 'show all', or 'copy all'`)}`);
        console.log('');
      }
      prompt();
    });
  };

  let watcher: ReturnType<typeof watch>;
  try {
    watcher = watch(opts.root, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      if (/node_modules|[/\\]dist[/\\]|\.git|\.next/.test(filename)) return;
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => render(filename), 400);
    });
  } catch {
    console.error('  Watch mode is not supported on this platform.');
    exit(1);
  }

  process.on('SIGINT', () => {
    if (rl) rl.close();
    watcher.close();
    console.log(`\n  ${dim('Stopped.')}\n`);
    process.exit(0);
  });

  await render();
}

function buildCopyAllText(result: AnalysisResult): string {
  const rules = Object.values(result.rules).filter(Boolean) as NonNullable<(typeof result.rules)[keyof typeof result.rules]>[];
  const failing = rules.filter(r => !r.passed);
  if (failing.length === 0) return `Clarx AI-First Score: ${result.score}/100 — No issues found.`;

  const sep = '─'.repeat(56);
  const sections: string[] = [
    `Clarx AI-First Score: ${result.score}/100`,
    `Confidence: ${result.confidence}`,
    '',
  ];

  for (const severity of ['hard_failure', 'warning', 'recommendation'] as const) {
    const group = failing.filter(r => r.severity === severity);
    if (group.length === 0) continue;
    const label = severity === 'hard_failure' ? 'HARD FAILURES' : severity === 'warning' ? 'WARNINGS' : 'RECOMMENDATIONS';
    sections.push(label);
    sections.push(sep);
    for (const rule of group) {
      const copy = getRuleCopyText(rule.id);
      if (copy) sections.push(copy);
      sections.push('');
    }
  }

  return sections.join('\n');
}

function buildCopySectionText(result: AnalysisResult, target: string): string | null {
  const rules = Object.values(result.rules).filter(Boolean) as NonNullable<(typeof result.rules)[keyof typeof result.rules]>[];
  const normalized = target.trim().toUpperCase();
  const severity = normalized === 'FAILURES' || normalized === 'FAILURE' || normalized === 'F'
    ? 'hard_failure'
    : normalized === 'WARNINGS' || normalized === 'WARNING' || normalized === 'W'
    ? 'warning'
    : normalized === 'RECS' || normalized === 'REC' || normalized === 'RECOMMENDATIONS' || normalized === 'RECOMMENDATION'
    ? 'recommendation'
    : null;

  if (!severity) return null;

  const group = rules.filter(r => !r.passed && r.severity === severity);
  if (group.length === 0) {
    const label = severity === 'hard_failure' ? 'failures' : severity === 'warning' ? 'warnings' : 'recommendations';
    return `Clarx AI-First Score: ${result.score}/100 — No ${label}.`;
  }

  const sep = '─'.repeat(56);
  const label = severity === 'hard_failure' ? 'HARD FAILURES' : severity === 'warning' ? 'WARNINGS' : 'RECOMMENDATIONS';
  const sections: string[] = [
    `Clarx AI-First Score: ${result.score}/100`,
    `Confidence: ${result.confidence}`,
    '',
    label,
    sep,
  ];

  for (const rule of group) {
    const copy = getRuleCopyText(rule.id);
    if (copy) sections.push(copy);
    sections.push('');
  }

  return sections.join('\n');
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
