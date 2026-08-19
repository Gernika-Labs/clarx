import { describe, it, expect, afterAll } from '@jest/globals'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { assertContrastAsDeclared } from '../build-twins.js'
import type { Candidate } from '../candidates.js'

const ROOT = join(tmpdir(), `clarx-contrast-${Date.now()}`)

async function twin(name: string, files: Record<string, string>): Promise<string> {
  const dir = join(ROOT, name)
  await mkdir(join(dir, '.git'), { recursive: true })
  await writeFile(join(dir, '.git', 'HEAD'), 'ref: refs/heads/main\n', 'utf-8')
  for (const [rel, content] of Object.entries(files)) {
    await mkdir(join(dir, rel, '..'), { recursive: true })
    await writeFile(join(dir, rel), content, 'utf-8')
  }
  return dir
}

const candidate = (flatten: string[]): Candidate => ({
  id: 'demo', url: 'https://example.com/demo', sha: 'a'.repeat(40),
  language: 'typescript', license: 'mit',
  contrast: { kind: 'structure', flatten },
  rationale: 'test fixture',
})

afterAll(async () => { await rm(ROOT, { recursive: true, force: true }) })

describe('assertContrastAsDeclared', () => {
  it('passes when exactly the declared document differs', async () => {
    const high = await twin('ok-high', { 'AGENTS.md': '# Guide\n\n- one\n', 'README.md': '# R\n' })
    const low = await twin('ok-low', { 'AGENTS.md': 'Guide. one.\n', 'README.md': '# R\n' })
    expect(() => assertContrastAsDeclared(candidate(['AGENTS.md']), high, low)).not.toThrow()
  })

  it('fails when a second document also differs', async () => {
    // The exact failure that shipped: the write-up said one file, the pipeline
    // changed five, and nothing read the built trees to notice.
    const high = await twin('extra-high', { 'AGENTS.md': '# Guide\n', 'README.md': '# R\n' })
    const low = await twin('extra-low', { 'AGENTS.md': 'Guide.\n', 'README.md': 'R.\n' })
    expect(() => assertContrastAsDeclared(candidate(['AGENTS.md']), high, low)).toThrow(/README\.md|differ/)
  })

  it('fails when a structure contrast carries Clarx artifacts', async () => {
    const high = await twin('clarx-high', { 'AGENTS.md': '# Guide\n', 'clarx-manifest.json': '{}' })
    const low = await twin('clarx-low', { 'AGENTS.md': 'Guide.\n', 'clarx-manifest.json': '{}' })
    expect(() => assertContrastAsDeclared(candidate(['AGENTS.md']), high, low)).toThrow(/clarx-manifest/)
  })

  it('fails when one twin has no .git', async () => {
    const high = await twin('git-high', { 'AGENTS.md': '# Guide\n' })
    const low = await twin('git-low', { 'AGENTS.md': 'Guide.\n' })
    await rm(join(low, '.git'), { recursive: true, force: true })
    expect(() => assertContrastAsDeclared(candidate(['AGENTS.md']), high, low)).toThrow(/\.git/)
  })
})
