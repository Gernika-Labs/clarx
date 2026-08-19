import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { validateTask, validateSuite, type Task } from '../tasks.js'

const ROOT = join(tmpdir(), `clarx-tasks-${Date.now()}`)
const SPECS = join(ROOT, 'checks')

const MANIFEST = JSON.stringify({
  workspaces: { 'packages/core': 'Shared domain logic and schema building' },
  highFanOut: ['src/app/actions.ts'],
})

function task(over: Partial<Task> = {}): Task {
  return {
    id: 'demo-01',
    repo: 'demo',
    kind: 'bug_fix',
    difficulty: 'moderate',
    prompt: 'Two of the string converters disagree about separators at the start of a string. Make them agree, without changing behaviour for any other input.',
    checkSpec: 'demo.spec.ts',
    checkCommand: 'pnpm vitest run .clarx-bench/demo.spec.ts',
    rubric: null,
    touches: ['src/index.ts'],
    contaminationNote: 'Found by executing the converters during authoring, not from the issue tracker.',
    ...over,
  }
}

beforeAll(async () => {
  await mkdir(join(ROOT, 'src'), { recursive: true })
  await writeFile(join(ROOT, 'src/index.ts'), 'export const x = 1\n', 'utf-8')
  await mkdir(SPECS, { recursive: true })
  await writeFile(join(SPECS, 'demo.spec.ts'), '// hidden grader\n', 'utf-8')
})

afterAll(async () => {
  await rm(ROOT, { recursive: true, force: true })
})

describe('task validation', () => {
  it('accepts a well-formed task', () => {
    expect(validateTask(task(), ROOT, MANIFEST, SPECS)).toEqual([])
  })

  it('rejects a prompt that names Clarx vocabulary', () => {
    // The prompt would carry the treatment: "manifest" is a word twin_high has
    // and twin_low does not, so mentioning it tells the agent what to look for.
    const violations = validateTask(task({ prompt: 'Update the manifest so the converters agree about separators at the start of a string.' }), ROOT, MANIFEST, SPECS)
    expect(violations.map(v => v.rule)).toContain('manifest-vocabulary')
  })

  it('rejects a prompt quoting a manifest value verbatim', () => {
    // Subtler leak: no Clarx jargon, but a phrase only twin_high presents as a unit.
    const violations = validateTask(
      task({ prompt: 'The package described as Shared domain logic and schema building has two converters that disagree about leading separators; make them agree.' }),
      ROOT,
      MANIFEST,
    )
    expect(violations.map(v => v.rule)).toContain('manifest-value-leak')
  })

  it('rejects a checkCommand with no hidden spec', () => {
    // The original tasks ran the repository's own suite, which by construction
    // does not cover the change being requested — gqloom-01 passed on unfixed
    // code because no existing test exercised the input in the prompt.
    const violations = validateTask(task({ checkSpec: null }), ROOT, MANIFEST, SPECS)
    expect(violations.map(v => v.rule)).toContain('check-without-spec')
  })

  it('rejects a checkSpec that does not exist', () => {
    const violations = validateTask(task({ checkSpec: 'nope.spec.ts' }), ROOT, MANIFEST, SPECS)
    expect(violations.map(v => v.rule)).toContain('missing-check-spec')
  })

  it('rejects a task with no objective check', () => {
    const violations = validateTask(task({ checkCommand: null, checkSpec: null, rubric: null }), ROOT, MANIFEST, SPECS)
    expect(violations.map(v => v.rule)).toContain('no-objective-check')
  })

  it('rejects a task with both a command and a rubric', () => {
    const violations = validateTask(task({ rubric: ['does the thing'] }), ROOT, MANIFEST, SPECS)
    expect(violations.map(v => v.rule)).toContain('ambiguous-check')
  })

  it('rejects a task referencing a path that does not exist', () => {
    // A task answerable in one twin and not the other would be a confound; the
    // paths are identical in both, so a missing one means the task is simply wrong.
    const violations = validateTask(task({ touches: ['src/nope.ts'] }), ROOT, MANIFEST, SPECS)
    expect(violations.map(v => v.rule)).toContain('missing-path')
  })

  it('rejects a task with no contamination note', () => {
    const violations = validateTask(task({ contaminationNote: '  ' }), ROOT, MANIFEST, SPECS)
    expect(violations.map(v => v.rule)).toContain('no-contamination-note')
  })

  it('rejects a one-line prompt', () => {
    const violations = validateTask(task({ prompt: 'Fix the bug.' }), ROOT, MANIFEST, SPECS)
    expect(violations.map(v => v.rule)).toContain('prompt-too-thin')
  })

  it('requires all four task kinds in a suite', () => {
    const violations = validateSuite([task(), task({ id: 'demo-02' })], ROOT, MANIFEST, SPECS)
    const missing = violations.filter(v => v.rule === 'missing-kind').map(v => v.detail)
    expect(missing.join(' ')).toMatch(/small_feature/)
    expect(missing.join(' ')).toMatch(/refactor/)
    expect(missing.join(' ')).toMatch(/cross_file/)
  })

  it('rejects duplicate task ids', () => {
    const violations = validateSuite([task(), task()], ROOT, MANIFEST, SPECS)
    expect(violations.map(v => v.rule)).toContain('duplicate-id')
  })
})
