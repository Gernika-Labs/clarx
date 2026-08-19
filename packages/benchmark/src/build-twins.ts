import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { analyze } from '@clarxai/engine'

import { CANDIDATES, type Candidate } from './candidates.js'
import { degradeRepo, DegradationError, type DegradeResult } from './degrade.js'

/**
 * Phases 1 and 2 end to end: pin, score, twin, score again.
 *
 * Every number here is an observation. The design is explicit that a repo whose
 * honest degradation produces a small score gap stays in the study and the
 * analysis speaks — tuning until the gap looks convincing is how a self-run
 * benchmark dies, and the author of this experiment sells the product under
 * test, so the bar for not touching the scales is higher than usual.
 */

export interface TwinReport {
  candidate: Candidate
  qualified: boolean
  disqualifiedBecause?: string
  /** The repo exactly as published, before adoption. */
  baseScore?: number
  highScore?: number
  lowScore?: number
  scoreGap?: number
  /** What adopting Clarx moved on its own, before any degradation. */
  adoptionDelta?: number
  degrade?: DegradeResult
  filesScanned?: number
}

const CACHE = new URL('../.twins/', import.meta.url).pathname

function git(args: string[], cwd: string): boolean {
  const r = spawnSync('git', args, { cwd, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 })
  return r.status === 0 && !r.error
}

const CLI = new URL('../../cli/dist/cli.js', import.meta.url).pathname

/**
 * twin_high is the repo *after adopting Clarx*, and adoption is performed by the
 * shipped CLI rather than by hand.
 *
 * This is the load-bearing choice in the whole design. Authoring a "good" twin
 * manually would make the measured gap partly a measure of the author's effort —
 * and the author sells the product under test. Running `clarx init` removes the
 * judgement entirely: the transformation is mechanical, published, identical for
 * every repo, and is literally what a user gets from thirty seconds of adoption.
 *
 * The manifest it emits is thin — empty workspace descriptions, generic
 * defaults. That is deliberate. It is the conservative floor, not a polished
 * ceiling, so an effect visible here is stronger than one that needed a
 * hand-tuned manifest to appear.
 */
function adoptClarx(dir: string): void {
  const result = spawnSync('node', [CLI, 'init', '.'], { cwd: dir, encoding: 'utf-8' })
  if (result.status !== 0) {
    throw new Error(`clarx init failed in ${dir}: ${result.stderr || result.stdout}`)
  }
}

async function fetchAtSha(candidate: Candidate): Promise<string> {
  const dir = join(CACHE, candidate.id, 'base')
  await mkdir(dir, { recursive: true })
  if (!existsSync(join(dir, '.git'))) {
    if (!git(['init', '--quiet'], dir)) throw new Error(`git init failed for ${candidate.id}`)
    git(['remote', 'add', 'origin', candidate.url], dir)
  }
  // Real checkouts, not tarballs: the engine consults `git ls-files`, and a tree
  // without .git scores differently.
  if (!git(['fetch', '--depth', '1', '--quiet', 'origin', candidate.sha], dir)) {
    throw new Error(`could not fetch ${candidate.sha} from ${candidate.url}`)
  }
  if (!git(['checkout', '--quiet', '--force', candidate.sha], dir)) {
    throw new Error(`could not check out ${candidate.sha}`)
  }
  return dir
}

export async function buildTwins(candidate: Candidate): Promise<TwinReport> {
  let base: string
  try {
    base = await fetchAtSha(candidate)
  } catch (err) {
    return { candidate, qualified: false, disqualifiedBecause: err instanceof Error ? err.message : String(err) }
  }

  const baseResult = await analyze({ root: base })

  // The contrast decides what twin_high is, which is what makes it impossible to
  // apply both manipulations at once. A structure contrast never runs
  // `clarx init`; an adoption contrast never flattens.
  const high = join(CACHE, candidate.id, 'twin_high')
  const low = join(CACHE, candidate.id, 'twin_low')
  await rm(high, { recursive: true, force: true })
  await cp(base, high, { recursive: true })

  if (candidate.contrast.kind === 'adoption') {
    try {
      adoptClarx(high)
    } catch (err) {
      return {
        candidate,
        qualified: false,
        disqualifiedBecause: err instanceof Error ? err.message : String(err),
        baseScore: baseResult.score,
      }
    }
  }

  const highResult = await analyze({ root: high })

  let degrade: DegradeResult
  try {
    if (candidate.contrast.kind === 'structure') {
      degrade = await degradeRepo(high, low, { onlyFlatten: candidate.contrast.flatten })
    } else {
      // Adoption: low is the repo as published. No flattening — degrading
      // existing documentation here is the second manipulation that invalidated
      // the first design.
      await rm(low, { recursive: true, force: true })
      await cp(base, low, { recursive: true })
      degrade = {
        highRewrittenWords: 0, lowRewrittenWords: 0, rewriteDrift: 0,
        manifestProseWords: 0, highTotalWords: 0, lowTotalWords: 0, totalDrift: 0,
        changedFiles: ['clarx-manifest.json (added to high)'], patch: '',
      }
    }
  } catch (err) {
    if (err instanceof DegradationError) {
      // Recorded, not hidden. Which repos cannot be twinned honestly is a
      // finding about where the standard applies, not a nuisance to route around.
      return {
        candidate,
        qualified: false,
        disqualifiedBecause: err.message,
        baseScore: baseResult.score,
        highScore: highResult.score,
        filesScanned: highResult.meta.filesScanned,
      }
    }
    throw err
  }

  await writeFile(join(CACHE, candidate.id, 'twin_diff.patch'), degrade.patch, 'utf-8')
  assertContrastAsDeclared(candidate, high, low)
  const lowResult = await analyze({ root: low })

  return {
    candidate,
    qualified: true,
    baseScore: baseResult.score,
    highScore: highResult.score,
    lowScore: lowResult.score,
    scoreGap: highResult.score - lowResult.score,
    adoptionDelta: highResult.score - baseResult.score,
    degrade,
    filesScanned: highResult.meta.filesScanned,
  }
}

/**
 * Confirms the trees on disk are the contrast the candidate declared.
 *
 * This exists because the pipeline once claimed to build a structure-only
 * contrast while still running `clarx init` and flattening every document — the
 * write-up described one experiment and the code produced another, and nothing
 * caught it. Reading the built trees is the only check that cannot be satisfied
 * by intent.
 */
export function assertContrastAsDeclared(candidate: Candidate, high: string, low: string): void {
  // Checked first: it is a precondition, and a missing .git makes the diff list
  // every object under it, which would surface as a confusing file-set mismatch.
  for (const dir of [high, low]) {
    if (!existsSync(join(dir, '.git'))) {
      throw new Error(`${candidate.id}: ${dir} has no .git — both twins must expose the same version-control tooling`)
    }
  }

  const differing = spawnSync('git', ['diff', '--no-index', '--name-only', '--', high, low], {
    encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024,
  }).stdout ?? ''
  const names = [...new Set(
    differing.split('\n')
      .filter(Boolean)
      // `git diff --no-index` writes /dev/null for a file present on one side
      // only; without this it arrives as a file named "null".
      .filter(line => line !== '/dev/null')
      .map(p => p.split('/').pop()!)
      .filter(name => name !== 'null'),
  )].sort()

  if (candidate.contrast.kind === 'structure') {
    const expected = [...candidate.contrast.flatten].map(f => f.split('/').pop()!).sort()
    if (names.join(',') !== expected.join(',')) {
      throw new Error(
        `${candidate.id}: declared a structure contrast over ${expected.join(', ')} but the twins differ in ${names.join(', ') || 'nothing'}. ` +
        `A structure contrast must change exactly the named documents.`,
      )
    }
    if (existsSync(join(high, 'clarx-manifest.json'))) {
      throw new Error(`${candidate.id}: structure contrast must carry no Clarx artifacts, but twin_high has a clarx-manifest.json`)
    }
  }
}

export function renderManifest(reports: TwinReport[]): string {
  const lines: string[] = [
    '# Benchmark repositories',
    '',
    'Generated by `pnpm --filter @clarxai/benchmark twins`. Every number is an observation.',
    'A small score gap is data, not a defect: repos are not tuned until the gap is satisfying.',
    '',
    '## Qualified',
    '',
'Each repository declares its **contrast**, and the two manipulations are never combined:',
    '',
    '- **structure** — high is the repo as published; low has the named documents flattened and',
    '  nothing else. No Clarx artifacts on either side. The Clarx score is a **covariate**, and an',
    '  unchanged score is the expected, correct outcome.',
    '- **adoption** — high is the repo plus `clarx init`; low is the repo as published. No',
    '  flattening. Quarantined: its score movement is definitional, because `init` writes the file',
    '  two scoring rules check for.',
    '',
    '| Repo | Contrast | Language | Base | twin_high | twin_low | Score delta | Changed | Drift |',
    '| --- | --- | --- | ---: | ---: | ---: | ---: | --- | ---: |',
  ]
  for (const r of reports.filter(r => r.qualified)) {
    const d = r.degrade!
    lines.push(
      `| [${r.candidate.id}](${r.candidate.url}) | ${r.candidate.contrast.kind} | ${r.candidate.language} | ` +
      `${r.baseScore} | ${r.highScore} | ${r.lowScore} | ${(r.scoreGap ?? 0) >= 0 ? '+' : ''}${r.scoreGap} | ` +
      `${d.changedFiles.join(', ') || '—'} | ${(d.rewriteDrift * 100).toFixed(1)}% |`,
    )
  }
  const disqualified = reports.filter(r => !r.qualified)
  if (disqualified.length) {
    lines.push('', '## Disqualified', '',
      'Recorded rather than dropped — which repos cannot be twinned honestly says something',
      'about where the standard applies.', '')
    for (const r of disqualified) {
      lines.push(`- **${r.candidate.id}** (${r.candidate.language}) — ${r.disqualifiedBecause}`)
    }
  }
  lines.push('', '## Selection rationale', '')
  for (const r of reports) {
    lines.push(`- **${r.candidate.id}** — pinned \`${r.candidate.sha.slice(0, 12)}\`, ${r.candidate.license}. ${r.candidate.rationale}`)
  }
  return lines.join('\n') + '\n'
}

async function main(): Promise<void> {
  await mkdir(CACHE, { recursive: true })
  // Adoption is quarantined behind a flag. Two contrasts in one package is how
  // the rejected one gets run by accident.
  const includeAdoption = process.argv.includes('--include-adoption')
  const selected = CANDIDATES.filter(c => includeAdoption || c.contrast.kind === 'structure')
  if (selected.length === 0) {
    console.log('No structure-contrast candidates. Pass --include-adoption to build the quarantined contrast.')
  }

  const reports: TwinReport[] = []
  for (const candidate of selected) {
    process.stdout.write(`${candidate.id}… `)
    const report = await buildTwins(candidate)
    reports.push(report)
    process.stdout.write(
      report.qualified
        ? `[${report.candidate.contrast.kind}] high ${report.highScore} → low ${report.lowScore} · changed ${report.degrade?.changedFiles.join(', ') || '—'}\n`
        : `DISQUALIFIED — ${report.disqualifiedBecause?.slice(0, 90)}\n`,
    )
  }
  const manifest = renderManifest(reports)
  await writeFile(new URL('../MANIFEST.md', import.meta.url).pathname, manifest, 'utf-8')
  console.log(`\n${reports.filter(r => r.qualified).length}/${reports.length} qualified — MANIFEST.md written`)
}

if (process.argv[1] && process.argv[1].endsWith('build-twins.js')) {
  main().catch(err => { console.error(err); process.exit(1) })
}
