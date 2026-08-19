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

  // twin_high = the repo with Clarx adopted, built by the product's own tooling.
  const high = join(CACHE, candidate.id, 'twin_high')
  await rm(high, { recursive: true, force: true })
  await cp(base, high, { recursive: true })
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

  const highResult = await analyze({ root: high })
  const low = join(CACHE, candidate.id, 'twin_low')

  let degrade: DegradeResult
  try {
    degrade = await degradeRepo(high, low)
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

export function renderManifest(reports: TwinReport[]): string {
  const lines: string[] = [
    '# Benchmark repositories',
    '',
    'Generated by `pnpm --filter @clarxai/benchmark twins`. Every number is an observation.',
    'A small score gap is data, not a defect: repos are not tuned until the gap is satisfying.',
    '',
    '## Qualified',
    '',
    '`twin_high` is the repo after running `clarx init` — adoption performed by the shipped CLI,',
    'not by hand, so the gap is not a measure of how hard someone tried.',
    '',
    '| Repo | Language | Base | twin_high | twin_low | **Gap** | Adoption | Rewrite drift | Files |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ]
  for (const r of reports.filter(r => r.qualified)) {
    const d = r.degrade!
    lines.push(
      `| [${r.candidate.id}](${r.candidate.url}) | ${r.candidate.language} | ${r.baseScore} | ${r.highScore} | ` +
      `${r.lowScore} | **${(r.scoreGap ?? 0) >= 0 ? '+' : ''}${r.scoreGap}** | ` +
      `${(r.adoptionDelta ?? 0) >= 0 ? '+' : ''}${r.adoptionDelta} | ${(d.rewriteDrift * 100).toFixed(1)}% | ${r.filesScanned} |`,
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
  const reports: TwinReport[] = []
  for (const candidate of CANDIDATES) {
    process.stdout.write(`${candidate.id}… `)
    const report = await buildTwins(candidate)
    reports.push(report)
    process.stdout.write(
      report.qualified
        ? `base ${report.baseScore} → high ${report.highScore} → low ${report.lowScore} · gap ${report.scoreGap}\n`
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
