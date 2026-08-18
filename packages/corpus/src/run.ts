import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { argv, exit } from 'node:process';

import { analyze } from '@clarxai/engine';

import { CASES } from './cases.js';
import { SkippedRepo, checkout } from './checkout.js';
import { loadCorpus } from './corpus.js';
import { diffSnapshots } from './diff.js';
import { normalize, serialize } from './normalize.js';
import type { CorpusRepo, DiffEntry, Snapshot } from './types.js';

const CACHE_DIR = new URL('../.cache/', import.meta.url).pathname;
const SNAPSHOT_DIR = new URL('../snapshots/', import.meta.url).pathname;

/**
 * Advisory snapshots for `local` entries, kept out of git.
 *
 * A local checkout is not a pinned artifact: it changes every time you edit the
 * repo. Gating on it would red CI on every PR that adds a file — which is
 * exactly what the first run of this harness did. Local entries are still
 * scored and diffed, because watching your own repo's score move is the point
 * of dogfooding, but their differences never fail the run and their snapshots
 * never enter the committed set. That also keeps `snapshots/` purely
 * reproducible, which is what the benchmark needs in order to publish it.
 */
const ADVISORY_SNAPSHOT_DIR = new URL('../.cache/advisory-snapshots/', import.meta.url).pathname;

const isAdvisory = (repo: CorpusRepo): boolean => repo.source.kind === 'local';

const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;

interface Options {
  update: boolean;
  only: string[];
}

function parseArgs(args: string[]): Options {
  const only: string[] = [];
  let update = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    // pnpm forwards script args after a bare `--`; ignore it so both
    // `pnpm corpus -- --update` and `node dist/run.js --update` work.
    if (arg === '--') continue;
    if (arg === '--update' || arg === '-u') update = true;
    else if (arg === '--only') { const v = args[++i]; if (v) only.push(v); }
    else if (arg === '--help' || arg === '-h') { printHelp(); exit(0); }
    else if (arg) { console.error(`Unknown option: ${arg}`); printHelp(); exit(2); }
  }
  return { update, only };
}

function printHelp(): void {
  console.log(`
clarx corpus — score pinned repositories and diff against committed snapshots

Usage:
  pnpm --filter @clarxai/corpus corpus [options]

Options:
  --update, -u        Regenerate snapshots instead of diffing (review the commit)
  --only <id>         Restrict the run to one corpus entry (repeatable)
  --help, -h          Show this help

Exit codes:
  0  no failing differences
  1  at least one failing difference, or a repo could not be scored
  2  bad usage
`);
}

async function scoreOne(repo: CorpusRepo): Promise<{ snapshot: Snapshot; warnings: string[] }> {
  const warnings: string[] = [];
  const co = await checkout(repo, CACHE_DIR);

  // A tree with no git-tracked files scores differently, because rule
  // evaluation consults `git ls-files`. Failing here beats publishing a
  // confidently wrong baseline.
  if (co.gitTrackedFiles === 0) {
    throw new Error(
      `${repo.id}: git ls-files returned nothing at ${co.root}. ` +
      `Rule behaviour depends on it — the tree must be a real checkout, not a vendored copy.`,
    );
  }

  const result = await analyze({ root: co.root, ignore: repo.ignore ?? [] });

  if (repo.maxFiles !== undefined && result.meta.filesScanned > repo.maxFiles) {
    warnings.push(
      `scanned ${result.meta.filesScanned} files, over the declared cap of ${repo.maxFiles} — ` +
      `raise maxFiles deliberately or narrow the entry; the corpus runs on every PR`,
    );
  }

  return { snapshot: normalize(result, { repo: repo.id, sha: co.sha, gitTrackedFiles: co.gitTrackedFiles }), warnings };
}

function reportDiffs(entries: DiffEntry[]): void {
  for (const e of entries) {
    const marker = e.fails ? red('✗') : yellow('!');
    console.log(`  ${marker} ${dim(e.class.padEnd(10))} ${e.field}`);
    console.log(`      before: ${format(e.before)}`);
    console.log(`      after:  ${format(e.after)}`);
    if (e.note) console.log(`      ${dim(e.note)}`);
  }
}

function format(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (text === undefined) return 'undefined';
  return text.length > 160 ? text.slice(0, 157) + '…' : text;
}

async function main(): Promise<void> {
  const opts = parseArgs(argv.slice(2));
  const corpus = await loadCorpus();
  const selected = opts.only.length ? corpus.filter(r => opts.only.includes(r.id)) : corpus;

  if (opts.only.length && selected.length !== opts.only.length) {
    const missing = opts.only.filter(id => !corpus.some(r => r.id === id));
    console.error(`Unknown corpus id(s): ${missing.join(', ')}`);
    exit(2);
  }

  await mkdir(CACHE_DIR, { recursive: true });
  await mkdir(SNAPSHOT_DIR, { recursive: true });
  await mkdir(ADVISORY_SNAPSHOT_DIR, { recursive: true });

  console.log(bold(`\nclarx corpus — ${selected.length} entries, ${opts.update ? 'updating snapshots' : 'diffing'}`));

  const snapshots = new Map<string, Snapshot>();
  const failing: DiffEntry[] = [];
  const advisory: DiffEntry[] = [];
  const warned: string[] = [];
  const skipped: string[] = [];
  const errored: string[] = [];
  let engineVersion = 'unknown';
  let unchanged = 0;
  let written = 0;

  for (const repo of selected) {
    let snapshot: Snapshot;
    let warnings: string[];
    try {
      ({ snapshot, warnings } = await scoreOne(repo));
    } catch (err) {
      if (err instanceof SkippedRepo) {
        skipped.push(`${repo.id} — ${err.message}`);
        console.log(`  ${dim('skip')}  ${repo.id} ${dim(`(${err.message})`)}`);
        continue;
      }
      errored.push(`${repo.id} — ${err instanceof Error ? err.message : String(err)}`);
      console.log(`  ${red('fail')}  ${repo.id}`);
      console.log(`        ${red(err instanceof Error ? err.message : String(err))}`);
      continue;
    }

    engineVersion = snapshot.engineVersion;
    snapshots.set(repo.id, snapshot);
    for (const w of warnings) warned.push(`${repo.id} — ${w}`);

    const advisoryEntry = isAdvisory(repo);
    const path = join(advisoryEntry ? ADVISORY_SNAPSHOT_DIR : SNAPSHOT_DIR, `${repo.id}.json`);
    const summary = `score ${snapshot.score} · ${snapshot.confidence} confidence · ${snapshot.filesScanned} files`;

    if (opts.update || !existsSync(path)) {
      await writeFile(path, serialize(snapshot), 'utf-8');
      written++;
      console.log(`  ${green('write')} ${repo.id} ${dim(summary)}`);
      continue;
    }

    const previous = JSON.parse(await readFile(path, 'utf-8')) as Snapshot;
    const entries = diffSnapshots(previous, snapshot).map(e =>
      advisoryEntry ? { ...e, fails: false } : e,
    );

    if (entries.length === 0) {
      unchanged++;
      console.log(`  ${green('ok')}    ${repo.id} ${dim(summary)}`);
      continue;
    }

    if (advisoryEntry) {
      // Refreshed in place: an advisory snapshot is a "last seen" marker, not a
      // gate, so it should track the working tree rather than accumulate noise.
      await writeFile(path, serialize(snapshot), 'utf-8');
      advisory.push(...entries);
      console.log(`  ${dim('moved')} ${repo.id} ${dim(summary)} ${dim(`(advisory, ${entries.length} change${entries.length === 1 ? '' : 's'})`)}`);
      continue;
    }

    const fails = entries.filter(e => e.fails);
    failing.push(...fails);
    console.log(`  ${fails.length ? red('diff') : yellow('warn')}  ${repo.id} ${dim(summary)}`);
    reportDiffs(entries);
  }

  // Cases run against the snapshots just computed, not the committed files, so
  // they judge the engine as it is right now rather than as it was recorded.
  const caseResults = CASES
    .filter(c => snapshots.has(c.repo))
    .map(c => ({ case: c, result: c.assert(snapshots.get(c.repo)!) }));

  const regressedCases = caseResults.filter(r => r.case.status === 'holds' && !r.result.ok);
  const openCases = caseResults.filter(r => r.case.status === 'open' && !r.result.ok);
  const promotable = caseResults.filter(r => r.case.status === 'open' && r.result.ok);
  const heldCases = caseResults.filter(r => r.case.status === 'holds' && r.result.ok);

  if (caseResults.length) {
    console.log('');
    console.log(bold('Regression cases'));
    console.log(`  ${green('held')}          ${heldCases.length}/${heldCases.length + regressedCases.length} verified behaviours still true`);
    for (const r of regressedCases) {
      console.log(`  ${red('✗ broken')}      ${r.case.id} ${r.case.title}`);
      console.log(`      ${r.result.detail}`);
      console.log(`      ${dim(`repo: ${r.case.repo} · ${r.case.source}`)}`);
    }
    for (const r of openCases) {
      console.log(`  ${yellow('· open')}        ${r.case.id} ${r.case.title}`);
      console.log(`      ${dim(r.result.detail)}`);
    }
    for (const r of promotable) {
      console.log(`  ${green('↑ fixed')}       ${r.case.id} ${r.case.title}`);
      console.log(`      ${dim('This case now passes. Promote it to status \'holds\' in cases.ts to lock the fix in.')}`);
    }
  }

  const orphans = (await readdir(SNAPSHOT_DIR))
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''))
    .filter(id => !corpus.some(r => r.id === id && !isAdvisory(r)));

  console.log('');
  console.log(bold('Summary'));
  console.log(`  engine        ${engineVersion}`);
  console.log(`  unchanged     ${unchanged}`);
  if (written) console.log(`  written       ${written}`);
  if (skipped.length) console.log(`  skipped       ${skipped.length} ${dim('(local entries not present)')}`);
  if (advisory.length) {
    console.log(`  advisory      ${advisory.length} ${dim('(local checkouts moved — never gates the run)')}`);
    for (const e of advisory.slice(0, 8)) {
      console.log(`     ${dim('·')} ${e.repo} ${dim(e.field)}: ${format(e.before)} → ${format(e.after)}`);
    }
    if (advisory.length > 8) console.log(`     ${dim(`… and ${advisory.length - 8} more`)}`);
  }
  if (warned.length) {
    console.log(`  ${yellow('warnings')}      ${warned.length}`);
    for (const w of warned) console.log(`     ${yellow('!')} ${w}`);
  }
  if (orphans.length) {
    console.log(`  ${yellow('orphans')}       ${orphans.join(', ')} ${dim('(snapshot with no corpus entry)')}`);
  }
  if (errored.length) {
    console.log(`  ${red('errors')}        ${errored.length}`);
    for (const e of errored) console.log(`     ${red('✗')} ${e}`);
  }
  if (regressedCases.length) {
    console.log(`  ${red('broken cases')}  ${regressedCases.length}`);
  }
  if (openCases.length) {
    console.log(`  open cases    ${openCases.length} ${dim('(known gaps — reported, never gating)')}`);
  }
  if (failing.length) {
    console.log(`  ${red('regressions')}   ${failing.length}`);
    console.log(dim(`\n  If these changes are intended, re-run with --update and commit the snapshot diff.`));
  }
  console.log('');

  exit(failing.length || errored.length || regressedCases.length ? 1 : 0);
}

main().catch(err => {
  console.error(err);
  exit(1);
});
