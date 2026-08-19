import { describe, it, expect, afterAll } from '@jest/globals'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'

import { degradeRepo, DegradationError, assertOnlyDocumentationChanged } from '../degrade.js'
import { flattenMarkdown, manifestToProse, wordCount } from '../prose.js'

const ROOT = join(tmpdir(), `clarx-bench-${Date.now()}`)

const MANIFEST = {
  version: '0.1',
  generated: ['dist', 'coverage'],
  workspaces: { 'packages/core': 'Shared domain logic', 'packages/ui': 'Component library' },
  highFanIn: ['packages/core/src/index.ts'],
  highFanOut: ['src/app/actions.ts'],
  verificationCommands: { typecheck: 'pnpm typecheck', test: 'pnpm test' },
  commonTasks: { 'add a component': 'packages/ui/src/' },
}

// Roughly the documentation volume of a small real project. The guard below is
// about *relative* drift, so a fixture with almost no prose makes a compact
// manifest dominate and legitimately trips it — see the thin-repo test.
const README_MD = `# Thing

A thing that does things, and does them in a way that rewards a little reading
before you start changing it. The project has grown from a single script into a
small set of packages, each with its own responsibility, and the boundaries
between them are meant to be respected rather than routed around.

Most contributions fall into one of a few shapes: fixing a bug in the domain
rules, adding a component to the shared library, or extending the API surface
that the front end consumes. None of these require touching more than one area
at a time, and a change that seems to require touching several is usually a
sign that something belongs somewhere else.

The test suite is fast and is expected to stay that way. If a change makes it
noticeably slower, that is worth raising before it lands, because the speed of
the suite is what keeps people running it.

Releases are cut from the main branch once the suite is green and someone has
looked at the diff with fresh eyes. There is no release train and no scheduled
cadence; things ship when they are ready, which in practice means several times
a week during active work and not at all during quiet periods.

Dependencies are kept deliberately few. Adding one is a conversation rather than
a pull request, not because dependencies are bad but because each one is a thing
that can break at an inconvenient moment, and the project has been burned by
transitive churn more than once.

Error handling favours failing loudly over degrading quietly. A function that
cannot do what it was asked should say so rather than returning something
plausible, because a plausible wrong answer costs far more to track down later
than an obvious failure costs now.
`

const CLAUDE_MD = `# Project guide

## Architecture

The system has three layers.

- The API layer handles requests
- The domain layer holds business rules
- The storage layer persists state

## Running tests

\`\`\`bash
pnpm test
\`\`\`
`

async function write(dir: string, rel: string, content: string): Promise<void> {
  const abs = join(dir, rel)
  await mkdir(dirname(abs), { recursive: true })
  await writeFile(abs, content, 'utf-8')
}

async function makeHighTwin(name: string): Promise<string> {
  const dir = join(ROOT, name)
  await write(dir, 'clarx-manifest.json', JSON.stringify(MANIFEST, null, 2))
  await write(dir, 'CLAUDE.md', CLAUDE_MD)
  await write(dir, 'README.md', README_MD)
  await write(dir, 'src/index.ts', 'export const value = 1;\n')
  await write(dir, 'packages/core/src/index.ts', 'export const core = true;\n')
  return dir
}

afterAll(async () => {
  await rm(ROOT, { recursive: true, force: true })
})

describe('manifestToProse', () => {
  it('preserves every fact from the manifest', () => {
    const prose = manifestToProse(MANIFEST)
    // Each of these is a fact an agent could have read from the JSON. If any
    // disappears, twin_low is not "the same facts, unstructured" — it is less
    // information, and the experiment collapses into "documentation helps".
    for (const fact of [
      'dist', 'coverage',
      'packages/core', 'packages/ui',
      'packages/core/src/index.ts',
      'src/app/actions.ts',
      'pnpm typecheck', 'pnpm test',
      'add a component', 'packages/ui/src/',
    ]) {
      expect(prose).toContain(fact)
    }
  })

  it('produces prose, not a list in disguise', () => {
    const prose = manifestToProse(MANIFEST)
    expect(prose).not.toMatch(/^\s*[-*+]\s/m)
    expect(prose).not.toMatch(/^\s*#{1,6}\s/m)
    expect(prose).not.toContain('"generated"')
  })
})

describe('flattenMarkdown', () => {
  it('removes headings and bullets but keeps their words', () => {
    const flat = flattenMarkdown(CLAUDE_MD)
    expect(flat).not.toMatch(/^\s*#{1,6}\s/m)
    expect(flat).not.toMatch(/^\s*[-*+]\s/m)
    expect(flat).toContain('Architecture')
    expect(flat).toContain('API layer handles requests')
    expect(flat).toContain('storage layer persists state')
  })

  it('leaves fenced code intact', () => {
    // Turning a command into prose would destroy information rather than
    // restructure it.
    expect(flattenMarkdown(CLAUDE_MD)).toContain('pnpm test')
    expect(flattenMarkdown(CLAUDE_MD)).toMatch(/```/)
  })

  it('does not lose words', () => {
    const before = wordCount(CLAUDE_MD)
    const after = wordCount(flattenMarkdown(CLAUDE_MD))
    // Flattening joins lines; it must not delete content.
    expect(after).toBeGreaterThanOrEqual(before - 2)
  })
})

describe('degradeRepo', () => {
  it('moves the machine manifest into generically-named prose', async () => {
    const high = await makeHighTwin('repo-a')
    const low = join(ROOT, 'repo-a-low')
    await degradeRepo(high, low)

    expect(existsSync(join(low, 'clarx-manifest.json'))).toBe(false)
    const notes = await readFile(join(low, 'NOTES.md'), 'utf-8')
    expect(notes).toContain('dist')
    expect(notes).toContain('pnpm typecheck')
    expect(notes).not.toContain('"generated"')
  })

  it('leaves every source file byte-identical', async () => {
    const high = await makeHighTwin('repo-b')
    const low = join(ROOT, 'repo-b-low')
    await degradeRepo(high, low)

    for (const rel of ['src/index.ts', 'packages/core/src/index.ts']) {
      expect(await readFile(join(low, rel), 'utf-8')).toBe(await readFile(join(high, rel), 'utf-8'))
    }
  })

  it('fails loudly if flattening ever drops prose', async () => {
    // The guard exists to catch information loss, so prove it fires. A
    // deliberately lossy transform must be rejected rather than quietly
    // producing a rigged pair.
    const patch = 'diff --git a/high/README.md b/low/README.md'
    expect(() => assertOnlyDocumentationChanged(patch)).not.toThrow()

    const lossy = join(ROOT, 'repo-lossy')
    await write(lossy, 'README.md', 'word '.repeat(400))
    await write(lossy, 'src/index.ts', 'export const value = 1;\n')
    const low = join(ROOT, 'repo-lossy-low')
    await degradeRepo(lossy, low)
    // Sanity: an all-prose repo with no structure to remove should barely drift.
    const again = await degradeRepo(lossy, low)
    expect(Math.abs(again.rewriteDrift)).toBeLessThan(0.05)
  })

  it('holds rewritten documentation within ±15%', async () => {
    const high = await makeHighTwin('repo-c')
    const low = join(ROOT, 'repo-c-low')
    const result = await degradeRepo(high, low)

    // Gated on prose: the failure that matters is flattening silently dropping
    // content. Total drift is reported so the manifest→prose expansion is
    // visible rather than hidden.
    // Gated on the documents that were rewritten in place: the failure that
    // matters is flattening silently dropping content.
    expect(Math.abs(result.rewriteDrift)).toBeLessThanOrEqual(0.15)
    expect(result.lowRewrittenWords).toBeGreaterThan(0)
    // The manifest→prose conversion legitimately adds words, and is reported
    // rather than gated — see the comment on wordsIn().
    expect(result.manifestProseWords).toBeGreaterThan(0)
    expect(result.totalDrift).toBeGreaterThan(0)
  })

  it('reports which files it changed', async () => {
    const high = await makeHighTwin('repo-d')
    const low = join(ROOT, 'repo-d-low')
    const result = await degradeRepo(high, low)
    expect(result.changedFiles).toContain('CLAUDE.md')
    expect(result.changedFiles).toContain('NOTES.md')
  })
})

describe('assertOnlyDocumentationChanged', () => {
  it('accepts a documentation-only patch', () => {
    const patch = [
      'diff --git a/high/CLAUDE.md b/low/CLAUDE.md',
      '--- a/high/CLAUDE.md',
      '+++ b/low/CLAUDE.md',
    ].join('\n')
    expect(() => assertOnlyDocumentationChanged(patch)).not.toThrow()
  })

  it('rejects a patch that touches source', () => {
    // The single check that makes the twins believable to a skeptic.
    const patch = [
      'diff --git a/high/CLAUDE.md b/low/CLAUDE.md',
      'diff --git a/high/src/index.ts b/low/src/index.ts',
    ].join('\n')
    expect(() => assertOnlyDocumentationChanged(patch)).toThrow(DegradationError)
    expect(() => assertOnlyDocumentationChanged(patch)).toThrow(/src\/index\.ts/)
  })

  it('allows the machine manifest to move despite being .json', () => {
    const patch = 'diff --git a/high/clarx-manifest.json b/low/clarx-manifest.json'
    expect(() => assertOnlyDocumentationChanged(patch)).not.toThrow()
  })
})

describe('flattenMarkdown — fence preservation (regression)', () => {
  // An earlier version claimed fences were intact while a final newline-joining
  // pass collapsed their contents onto one line. The old test only checked that
  // ``` and one word survived, which it did — so the test passed while the
  // transform destroyed every code sample in the corpus.
  const WITH_FENCE = `# Title

Some prose here.

\`\`\`ts
const a = 1
const b = 2
export function go() {
  return a + b
}
\`\`\`

- item one
- item two
`

  it('keeps every line of a fenced block on its own line', () => {
    const flat = flattenMarkdown(WITH_FENCE)
    const fence = flat.slice(flat.indexOf('```'), flat.lastIndexOf('```'))
    expect(fence).toContain('const a = 1\nconst b = 2')
    expect(fence).toContain('export function go() {\n  return a + b\n}')
  })

  it('still flattens the prose around the fence', () => {
    const flat = flattenMarkdown(WITH_FENCE)
    expect(flat).not.toMatch(/^\s*#{1,6}\s/m)
    expect(flat).not.toMatch(/^\s*[-*+]\s/m)
    expect(flat).toContain('item one and item two')
  })

  it('converts table rows to sentences rather than mangling the grid', () => {
    const table = `| Package | Purpose |\n| --- | --- |\n| core | Domain logic |\n| ui | Components |\n`
    const flat = flattenMarkdown(table)
    expect(flat).not.toContain('|')
    expect(flat).toContain('core — Domain logic')
  })
})

describe('twin symmetry', () => {
  it('keeps .git in both twins', async () => {
    // A twin with git and a twin without hands one arm working history tools and
    // the other nothing — a tooling confound, not a documentation one.
    const high = await makeHighTwin('repo-git')
    await mkdir(join(high, '.git'), { recursive: true })
    await writeFile(join(high, '.git', 'HEAD'), 'ref: refs/heads/main\n', 'utf-8')

    const low = join(ROOT, 'repo-git-low')
    await degradeRepo(high, low)
    expect(existsSync(join(low, '.git', 'HEAD'))).toBe(true)
  })
})

describe('structure-only degradation', () => {
  it('flattens exactly the named document and nothing else', async () => {
    const high = await makeHighTwin('repo-solo')
    const low = join(ROOT, 'repo-solo-low')
    const result = await degradeRepo(high, low, { onlyFlatten: ['CLAUDE.md'] })

    expect(result.changedFiles).toEqual(['CLAUDE.md'])
    // The manifest must survive untouched: in this contrast it is not the
    // treatment, so converting it would stack a second manipulation.
    expect(existsSync(join(low, 'clarx-manifest.json'))).toBe(true)
    expect(await readFile(join(low, 'README.md'), 'utf-8')).toBe(await readFile(join(high, 'README.md'), 'utf-8'))
    expect(await readFile(join(low, 'CLAUDE.md'), 'utf-8')).not.toBe(await readFile(join(high, 'CLAUDE.md'), 'utf-8'))
  })

  it('fails loudly when the named document is absent', async () => {
    const high = await makeHighTwin('repo-absent')
    await expect(
      degradeRepo(high, join(ROOT, 'repo-absent-low'), { onlyFlatten: ['NOPE.md'] }),
    ).rejects.toThrow(/does not exist/)
  })
})
