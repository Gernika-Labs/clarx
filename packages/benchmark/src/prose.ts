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
 * Headings become sentences, list items join into running text, and table rows
 * become sentences. The words survive; the scannable shape does not — which is
 * the variable under test.
 *
 * **Fenced code is preserved verbatim, including its line breaks.** An earlier
 * version claimed this and did not do it: a final pass joined every newline not
 * followed by a backtick, which collapsed the inside of every fence too. A
 * README's entire code sample became one line. That is information destruction
 * rather than restructuring, and it would have made any measured effect
 * unattributable — the degraded twin was simply worse, not differently shaped.
 *
 * The transform is therefore block-based: fenced blocks are carried through
 * untouched, and only prose blocks are joined.
 */
export function flattenMarkdown(markdown: string): string {
  const lines = markdown.split('\n')
  const blocks: Array<{ kind: 'fence' | 'prose'; lines: string[] }> = []
  let current: { kind: 'fence' | 'prose'; lines: string[] } = { kind: 'prose', lines: [] }
  let inFence = false

  const pushBlock = () => {
    if (current.lines.length > 0) blocks.push(current)
    current = { kind: inFence ? 'fence' : 'prose', lines: [] }
  }

  for (const raw of lines) {
    if (/^\s*```/.test(raw)) {
      pushBlock()
      inFence = !inFence
      // The fence marker belongs to the fenced block on both sides.
      if (inFence) current = { kind: 'fence', lines: [raw] }
      else { blocks.push({ kind: 'fence', lines: [raw] }); current = { kind: 'prose', lines: [] } }
      continue
    }
    current.lines.push(raw)
  }
  pushBlock()

  const out: string[] = []
  for (const block of blocks) {
    if (block.kind === 'fence') {
      // Untouched, byte for byte. Every normalisation below is applied per
      // prose block rather than to the assembled document, because a global
      // pass cannot tell code from prose: an earlier `/ {2,}/` collapse ate the
      // indentation inside fences even after the newline bug was fixed. Two
      // instances of the same mistake — a whole-document regex is the wrong
      // tool once the document has structure worth keeping.
      out.push(block.lines.join('\n'))
      continue
    }
    const prose = flattenProse(block.lines).replace(/ {2,}/g, ' ').trim()
    if (prose) out.push(prose)
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

/** Prose, lists, headings and tables — everything outside a code fence. */
function flattenProse(lines: string[]): string {
  const out: string[] = []
  let pendingList: string[] = []
  let pendingTable: string[] = []
  let paragraph: string[] = []

  const flushList = () => {
    if (pendingList.length === 0) return
    out.push(`${sentenceList(pendingList)}.`)
    pendingList = []
  }
  const flushTable = () => {
    if (pendingTable.length === 0) return
    out.push(`${sentenceList(pendingTable)}.`)
    pendingTable = []
  }
  const flushParagraph = () => {
    if (paragraph.length === 0) return
    out.push(paragraph.join(' '))
    paragraph = []
  }
  const flushAll = () => { flushList(); flushTable(); flushParagraph() }

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (line.trim() === '') { flushAll(); continue }

    const heading = line.match(/^\s*#{1,6}\s+(.*)$/)
    if (heading) {
      flushAll()
      out.push(`${heading[1]!.replace(/[.:]\s*$/, '')}.`)
      continue
    }

    // Table separator rows (|---|---|) carry no words; the header and body rows
    // become sentences so their content survives without the grid.
    if (/^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes('-')) {
      continue
    }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      flushList(); flushParagraph()
      const cells = line.split('|').map(c => c.trim()).filter(Boolean)
      if (cells.length > 0) pendingTable.push(cells.join(' — '))
      continue
    }

    const item = line.match(/^\s*(?:[-*+]|\d+\.)\s+(.*)$/)
    if (item) {
      flushTable(); flushParagraph()
      pendingList.push(item[1]!.replace(/[.]\s*$/, ''))
      continue
    }

    flushList(); flushTable()
    paragraph.push(line.trim())
  }
  flushAll()
  return out.join(' ')
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
