import { spawnSync } from 'node:child_process'
import { cp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

import { flattenMarkdown, manifestToProse, wordCount, type ClarxManifest } from './prose.js'

/**
 * Builds `twin_low` from `twin_high` mechanically.
 *
 * The whole causal claim rests on this being a script rather than a judgement
 * call. If twins are hand-tuned until the score gap looks convincing, the
 * experiment measures the author's persistence, and no reviewer should believe
 * it. So: one script, applied identically to every repo, published alongside
 * the results, with assertions that fail loudly rather than producing a quietly
 * rigged pair.
 */

/** Extensions that must never differ between twins. */
const SOURCE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.go', '.rs', '.rb', '.java', '.cs', '.cpp', '.c', '.h',
  '.vue', '.svelte', '.json', '.yml', '.yaml', '.toml', '.lock',
])

/** Documentation the degradation is allowed to touch. */
const AGENT_MANIFESTS = ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md']
const MACHINE_MANIFEST = 'clarx-manifest.json'
const NOTES_FILE = 'NOTES.md'

export interface DegradeResult {
  /** Words in the documents that were rewritten in place — what the guard gates on. */
  highRewrittenWords: number
  lowRewrittenWords: number
  rewriteDrift: number
  /** Words the manifest contributed as prose — reported, never gated. */
  manifestProseWords: number
  /** Everything, both sides — reported so the trade is visible. */
  highTotalWords: number
  lowTotalWords: number
  totalDrift: number
  changedFiles: string[]
  patch: string
}

export class DegradationError extends Error {}

const WORD_DRIFT_TOLERANCE = 0.15

async function markdownFiles(root: string): Promise<string[]> {
  const found: string[] = []
  async function walk(dir: string): Promise<void> {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (entry.name.endsWith('.md')) found.push(full)
    }
  }
  await walk(root)
  return found.sort()
}

/**
 * Word counts, measured three ways because they answer different questions.
 *
 * The guard gates on **rewritten documents only** — the files that exist in both
 * twins and were flattened in place. That is the failure which would actually
 * void the experiment: flattening silently dropping content, leaving twin_low
 * genuinely less informative rather than differently shaped.
 *
 * It deliberately does NOT gate on the manifest→prose conversion. Restating
 * `"generated": ["dist"]` faithfully takes a sentence where JSON took four
 * tokens, so any faithful restatement inflates the count. Failing a repo for
 * that would mean failing it for the exact substitution under test, and would
 * quietly bias selection toward documentation-heavy repos — a selection effect
 * introduced by the measuring instrument.
 *
 * All three numbers go into MANIFEST.md so a reader judges the trade themselves
 * instead of taking the script's word for it.
 */
async function wordsIn(root: string, relPaths: string[]): Promise<number> {
  let total = 0
  for (const rel of relPaths) {
    const path = join(root, rel)
    if (!existsSync(path)) continue
    total += wordCount(await readFile(path, 'utf-8'))
  }
  return total
}

async function allDocWords(root: string): Promise<number> {
  let total = 0
  for (const file of await markdownFiles(root)) total += wordCount(await readFile(file, 'utf-8'))
  const manifestPath = join(root, MACHINE_MANIFEST)
  if (existsSync(manifestPath)) total += wordCount(await readFile(manifestPath, 'utf-8'))
  return total
}

export interface DegradeOptions {
  /**
   * Structure-only contrast: flatten exactly these documents and touch nothing
   * else — no manifest conversion, no other files.
   *
   * The default whole-repo mode applies two manipulations at once (a manifest
   * becomes prose AND every other document is flattened), which cannot support
   * a claim about either one. This mode exists so a single, named document is
   * the only thing that differs between twins.
   */
  onlyFlatten?: string[]
}

export async function degradeRepo(
  highDir: string,
  lowDir: string,
  options: DegradeOptions = {},
): Promise<DegradeResult> {
  await rm(lowDir, { recursive: true, force: true })
  await cp(highDir, lowDir, { recursive: true })

  // .git is deliberately KEPT. An earlier version deleted it from twin_low
  // only, which handed one arm a working `git log`, `git blame`, and `git grep`
  // and the other nothing. That is a tooling difference, not a documentation
  // one, and it would have been the most plausible explanation for any measured
  // effect. The source-identity assertion could not see it either, because .git
  // paths do not carry source extensions.

  const changedFiles: string[] = []
  /** Files rewritten in place — the set the drift guard is computed over. */
  const rewritten: string[] = []
  let manifestProseWords = 0

  if (options.onlyFlatten) {
    for (const rel of options.onlyFlatten) {
      const path = join(lowDir, rel)
      if (!existsSync(path)) {
        throw new DegradationError(`${rel} does not exist in ${highDir} — a structure-only contrast needs the document it is degrading`)
      }
      await writeFile(path, flattenMarkdown(await readFile(path, 'utf-8')), 'utf-8')
      changedFiles.push(rel)
      rewritten.push(rel)
    }
  } else {

  // 1. The machine-readable manifest becomes prose in a generically-named file.
  //    Nothing is deleted: an agent can still learn every fact, just not by
  //    parsing a known filename into a known shape.
  const manifestPath = join(lowDir, MACHINE_MANIFEST)
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf-8')) as ClarxManifest
    const prose = manifestToProse(manifest)
    const notesPath = join(lowDir, NOTES_FILE)
    const existing = existsSync(notesPath) ? await readFile(notesPath, 'utf-8') : ''
    manifestProseWords = wordCount(prose)
    await writeFile(notesPath, `${existing}${existing ? '\n\n' : ''}${prose}\n`, 'utf-8')
    await rm(manifestPath)
    changedFiles.push(MACHINE_MANIFEST, NOTES_FILE)
  }

  // 2. Structured agent manifests are flattened into continuous prose. The file
  //    keeps its conventional name: renaming it would remove a discoverability
  //    signal as well as the structure, and the experiment isolates structure.
  for (const name of AGENT_MANIFESTS) {
    const path = join(lowDir, name)
    if (!existsSync(path)) continue
    await writeFile(path, flattenMarkdown(await readFile(path, 'utf-8')), 'utf-8')
    changedFiles.push(name)
    rewritten.push(name)
  }

  // 3. Everything else in docs/ is flattened too, so the comparison is not
  //    decided by a single file.
  for (const file of await markdownFiles(lowDir)) {
    const rel = relative(lowDir, file)
    if (changedFiles.includes(rel) || rel === NOTES_FILE) continue
    if (!rel.startsWith('docs/') && rel !== 'README.md') continue
    await writeFile(file, flattenMarkdown(await readFile(file, 'utf-8')), 'utf-8')
    changedFiles.push(rel)
    rewritten.push(rel)
  }
  }

  const highRewrittenWords = await wordsIn(highDir, rewritten)
  const lowRewrittenWords = await wordsIn(lowDir, rewritten)
  const rewriteDrift = highRewrittenWords === 0 ? 0 : (lowRewrittenWords - highRewrittenWords) / highRewrittenWords

  const highTotalWords = await allDocWords(highDir)
  const lowTotalWords = await allDocWords(lowDir)
  const totalDrift = highTotalWords === 0 ? 0 : (lowTotalWords - highTotalWords) / highTotalWords

  const patch = diffTwins(highDir, lowDir)
  assertOnlyDocumentationChanged(patch)

  if (Math.abs(rewriteDrift) > WORD_DRIFT_TOLERANCE) {
    throw new DegradationError(
      `Rewritten documentation drifted ${(rewriteDrift * 100).toFixed(1)}% ` +
      `(limit ±${WORD_DRIFT_TOLERANCE * 100}%): ${highRewrittenWords} words became ${lowRewrittenWords} ` +
      `across ${rewritten.join(', ')}. Flattening must change shape, not content — a twin that says ` +
      `less is a different experiment, and one nobody disputes the result of.`,
    )
  }

  return {
    highRewrittenWords,
    lowRewrittenWords,
    rewriteDrift,
    manifestProseWords,
    highTotalWords,
    lowTotalWords,
    totalDrift,
    changedFiles: [...new Set(changedFiles)].sort(),
    patch,
  }
}

function diffTwins(highDir: string, lowDir: string): string {
  const result = spawnSync(
    'git',
    ['diff', '--no-index', '--no-color', '--', highDir, lowDir],
    { encoding: 'utf-8', maxBuffer: 128 * 1024 * 1024 },
  )
  // git diff --no-index exits 1 when the trees differ, which is the normal case.
  if (result.status !== 0 && result.status !== 1) {
    throw new DegradationError(`git diff failed: ${result.stderr}`)
  }
  return result.stdout ?? ''
}

/**
 * The audit that makes the twins believable: if a source file appears in the
 * diff, the comparison is no longer about documentation and the run is void.
 */
export function assertOnlyDocumentationChanged(patch: string): void {
  const offenders = new Set<string>()
  for (const line of patch.split('\n')) {
    const match = line.match(/^diff --git a\/(\S+) b\/(\S+)/)
    if (!match) continue
    for (const path of [match[1]!, match[2]!]) {
      if (SOURCE_EXTENSIONS.has(extname(path)) && !path.endsWith(MACHINE_MANIFEST)) {
        offenders.add(path)
      }
    }
  }
  if (offenders.size > 0) {
    throw new DegradationError(
      `Degradation touched source files, which voids the comparison: ${[...offenders].sort().join(', ')}. ` +
      `Only documentation may differ between twins.`,
    )
  }
}
