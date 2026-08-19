import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Task definitions and the checks that keep them honest.
 *
 * Phase 3 names the danger plainly: "tasks can unconsciously drift toward what a
 * manifest happens to surface." An author who writes tasks while looking at
 * twin_high will tend to ask about things the manifest makes easy to find, and
 * the study then measures the author rather than the treatment.
 *
 * A warning in a document does not prevent that. These checks do:
 *
 * 1. **Tasks are authored against `base`** — the repo before adoption, which is
 *    neither twin. You cannot bias toward a manifest you have not seen.
 * 2. **No manifest-only vocabulary.** A task that says `highFanOut` or quotes a
 *    workspace description is leaking the treatment into the prompt. Checked
 *    mechanically against the twin_high manifest.
 * 3. **Every referenced path must exist**, so a task cannot be answerable in one
 *    twin and not the other.
 * 4. **An objective check is mandatory** — a command, or an explicit rubric
 *    where no test exists. A task without one is graded by opinion.
 */

export type TaskKind = 'bug_fix' | 'small_feature' | 'refactor' | 'cross_file'
export type Difficulty = 'easy' | 'moderate' | 'hard'

export interface Task {
  id: string
  repo: string
  kind: TaskKind
  difficulty: Difficulty
  /** Shown to the agent verbatim, identical in both twins. */
  prompt: string
  /** Shell command that must exit 0, or null when a rubric is used instead. */
  checkCommand: string | null
  /** Required when checkCommand is null. Each item is independently judgeable. */
  rubric: string[] | null
  /** Paths the task is about. Asserted to exist; never shown to the agent. */
  touches: string[]
  /** Why this task is not answerable from memory of the repo's history. */
  contaminationNote: string
}

export interface TaskViolation {
  taskId: string
  rule: string
  detail: string
}

/**
 * Vocabulary that exists only because a manifest exists. A task prompt
 * containing any of it has imported the treatment into the question.
 */
const MANIFEST_ONLY_TERMS = [
  'clarx-manifest', 'highFanIn', 'highFanOut', 'verificationCommands',
  'commonTasks', 'workspaces field', 'generated field', 'clarx score',
  'AI-readiness', 'manifest',
]

export function validateTask(task: Task, repoRoot: string, manifestJson: string | null): TaskViolation[] {
  const violations: TaskViolation[] = []
  const v = (rule: string, detail: string) => violations.push({ taskId: task.id, rule, detail })

  const prompt = task.prompt.toLowerCase()
  for (const term of MANIFEST_ONLY_TERMS) {
    if (prompt.includes(term.toLowerCase())) {
      v('manifest-vocabulary', `prompt contains "${term}" — that word exists in twin_high and not in twin_low, so the prompt itself carries the treatment`)
    }
  }

  // Values lifted verbatim from the manifest are the subtler version of the
  // same leak: no Clarx jargon, but a phrase only one twin presents as a unit.
  if (manifestJson) {
    for (const value of manifestValues(manifestJson)) {
      if (value.length >= 12 && prompt.includes(value.toLowerCase())) {
        v('manifest-value-leak', `prompt quotes "${value}" verbatim from the manifest`)
      }
    }
  }

  if (!task.checkCommand && (!task.rubric || task.rubric.length === 0)) {
    v('no-objective-check', 'a task needs a command that exits 0 or an explicit rubric; otherwise it is graded by opinion')
  }
  if (task.checkCommand && task.rubric) {
    v('ambiguous-check', 'specify a command or a rubric, not both — two graders means two results')
  }
  if (task.touches.length === 0) {
    v('no-touch-paths', 'declare the paths the task is about so their presence can be asserted in both twins')
  }
  for (const path of task.touches) {
    if (!existsSync(join(repoRoot, path))) {
      v('missing-path', `${path} does not exist in the repo`)
    }
  }
  if (!task.contaminationNote.trim()) {
    v('no-contamination-note', 'state why this is not recoverable from the repo history or issue tracker')
  }
  if (task.prompt.trim().length < 40) {
    v('prompt-too-thin', 'a one-line prompt leaves the agent guessing at scope, which adds variance without adding signal')
  }

  return violations
}

function manifestValues(manifestJson: string): string[] {
  const out: string[] = []
  const walk = (node: unknown): void => {
    if (typeof node === 'string') out.push(node)
    else if (Array.isArray(node)) node.forEach(walk)
    else if (node && typeof node === 'object') Object.values(node).forEach(walk)
  }
  try {
    walk(JSON.parse(manifestJson))
  } catch {
    // An unparseable manifest is caught elsewhere; not this check's business.
  }
  return out
}

export function validateSuite(tasks: Task[], repoRoot: string, manifestJson: string | null): TaskViolation[] {
  const violations = tasks.flatMap(task => validateTask(task, repoRoot, manifestJson))

  const kinds = new Set(tasks.map(t => t.kind))
  for (const required of ['bug_fix', 'small_feature', 'refactor', 'cross_file'] as TaskKind[]) {
    if (!kinds.has(required)) {
      violations.push({ taskId: '(suite)', rule: 'missing-kind', detail: `no ${required} task — Phase 3 requires all four kinds` })
    }
  }
  const ids = tasks.map(t => t.id)
  if (new Set(ids).size !== ids.length) {
    violations.push({ taskId: '(suite)', rule: 'duplicate-id', detail: 'task ids must be unique' })
  }
  return violations
}

export async function loadTasks(dir: string): Promise<Task[]> {
  if (!existsSync(dir)) return []
  const files = (await readdir(dir)).filter(f => f.endsWith('.json')).sort()
  const tasks: Task[] = []
  for (const file of files) {
    tasks.push(JSON.parse(await readFile(join(dir, file), 'utf-8')) as Task)
  }
  return tasks
}
