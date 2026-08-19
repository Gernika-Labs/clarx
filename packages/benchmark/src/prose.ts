/**
 * Structure → prose transformations.
 *
 * The experiment's claim is that *structure* makes agent work cheaper, so the
 * degraded twin must carry the same facts in a form an agent cannot parse. Any
 * transformation that drops information turns the study into "documentation
 * helps", which nobody disputes and which the twins were built to rule out.
 *
 * Every function here is therefore information-preserving by construction: it
 * restates values in sentences rather than removing them. The word-count
 * assertion in degrade.ts is the mechanical check that this held.
 */

export interface ClarxManifest {
  version?: string
  generated?: string[]
  workspaces?: Record<string, string>
  highFanIn?: string[]
  highFanOut?: string[]
  verificationCommands?: { typecheck?: string; test?: string; lint?: string }
  commonTasks?: Record<string, string>
  thresholds?: Record<string, number>
}

function sentenceList(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]!
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/**
 * A machine-readable manifest restated as prose paragraphs.
 *
 * Deliberately verbose: a JSON key carries meaning in three characters that
 * prose needs a clause to convey, so a terse restatement would leave twin_low
 * shorter and hand the experiment a word-count confound instead of a structure
 * one.
 */
export function manifestToProse(manifest: ClarxManifest): string {
  const paragraphs: string[] = []

  if (manifest.generated?.length) {
    paragraphs.push(
      `The paths ${sentenceList(manifest.generated)} hold generated output, rebuilt by the ` +
      `build rather than edited by hand.`,
    )
  }

  if (manifest.workspaces && Object.keys(manifest.workspaces).length) {
    const described = Object.entries(manifest.workspaces)
      .map(([dir, purpose]) => `the code under ${dir} is responsible for ${purpose.toLowerCase()}`)
    paragraphs.push(
      `The code is split into separate areas: ${sentenceList(described)}.`,
    )
  }

  if (manifest.highFanIn?.length) {
    paragraphs.push(
      `${sentenceList(manifest.highFanIn)} ` +
      `${manifest.highFanIn.length === 1 ? 'is depended on' : 'are depended on'} by many other ` +
      `files, so changes there are felt widely.`,
    )
  }

  if (manifest.highFanOut?.length) {
    paragraphs.push(
      `${sentenceList(manifest.highFanOut)} ` +
      `${manifest.highFanOut.length === 1 ? 'pulls' : 'pull'} in many modules on purpose; that ` +
      `breadth is intentional.`,
    )
  }

  const commands = manifest.verificationCommands ?? {}
  const named = Object.entries(commands).filter(([, v]) => typeof v === 'string' && v.length > 0)
  if (named.length) {
    const described = named.map(([kind, cmd]) => `${kind} is done by running ${cmd}`)
    paragraphs.push(
      `Changes are checked before they are finished: ${sentenceList(described)}.`,
    )
  }

  if (manifest.commonTasks && Object.keys(manifest.commonTasks).length) {
    const described = Object.entries(manifest.commonTasks)
      .map(([task, where]) => `if you need to ${task}, the place to start is ${where}`)
    paragraphs.push(
      `For work that comes up often: ${sentenceList(described)}.`,
    )
  }

  return paragraphs.join('\n\n')
}

/**
 * Flattens structured markdown into continuous prose.
 *
 * Headings become ordinary sentences and list items are joined into running
 * text. The words survive; the scannable shape does not — which is precisely
 * the variable under test.
 *
 * Fenced code blocks are left intact: turning a command into prose would
 * destroy information rather than restructure it, and the manifest prose above
 * already covers commands in sentence form.
 */
export function flattenMarkdown(markdown: string): string {
  const lines = markdown.split('\n')
  const out: string[] = []
  let pendingList: string[] = []
  let inFence = false

  const flushList = () => {
    if (pendingList.length === 0) return
    out.push(`${sentenceList(pendingList)}.`)
    pendingList = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (/^\s*```/.test(line)) {
      flushList()
      inFence = !inFence
      out.push(line)
      continue
    }
    if (inFence) {
      out.push(line)
      continue
    }

    const heading = line.match(/^\s*#{1,6}\s+(.*)$/)
    if (heading) {
      flushList()
      const text = heading[1]!.replace(/[.:]\s*$/, '')
      // Kept as a sentence rather than dropped: the heading text is
      // information, and removing it would shorten the twin.
      out.push(`${text}.`)
      continue
    }

    const item = line.match(/^\s*(?:[-*+]|\d+\.)\s+(.*)$/)
    if (item) {
      pendingList.push(item[1]!.replace(/[.]\s*$/, ''))
      continue
    }

    flushList()
    out.push(line)
  }
  flushList()

  // Collapse the blank lines that separated the removed structure, so the
  // result reads as continuous prose rather than a list with the bullets shaved
  // off.
  return out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n(?!\n)(?![`])/g, ' ').replace(/ {2,}/g, ' ').trim() + '\n'
}

/**
 * Words, for the ±15% information-volume assertion.
 *
 * Tokens with no alphanumeric character are skipped, so markdown scaffolding —
 * `#`, `-`, `|`, `---` — does not count as information. Otherwise removing a
 * heading marker would register as losing a word, and the assertion would be
 * measuring markup rather than how much the twins actually say.
 */
export function wordCount(text: string): number {
  return text.split(/\s+/).filter(token => /[A-Za-z0-9]/.test(token)).length
}
