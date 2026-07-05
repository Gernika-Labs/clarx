/**
 * Plain-language, one-line descriptions of every rule in the standard.
 * Used by <RuleRef /> tooltips so docs pages can reference rule codes
 * (C3, O1, …) without assuming the reader knows them.
 *
 * Voice: conversational, no jargon — these are for people meeting a rule
 * code for the first time. The technical definitions live in
 * /docs/standard/pillars; the CLI's `clarx explain` has the full rationale.
 */
export type RuleDescription = {
  /** Short human name, e.g. "No junk-drawer utility files" */
  title: string
  /** One conversational sentence saying what it checks and why it matters */
  hint: string
}

export const RULE_DESCRIPTIONS: Record<string, RuleDescription> = {
  D1: {
    title: 'Tidy root directory',
    hint: 'The repo root is the first thing anyone — human or AI — sees. Too many files and folders there makes the whole project harder to skim.',
  },
  D2: {
    title: 'Every package says what it is for',
    hint: 'Each workspace or package should have a one-line purpose statement, so nobody has to open files just to figure out what it owns.',
  },
  D3: {
    title: 'Source, tests, and config live apart',
    hint: 'When source, tests, config, and generated files are mixed together, every reader has to classify each file before they can use it.',
  },
  D4: {
    title: 'No junk-drawer utility files',
    hint: 'Files named utils.ts or helpers.ts say nothing about what is inside — you have to read the whole file to find anything.',
  },
  D5: {
    title: 'Shallow folder nesting',
    hint: 'Folders nested more than five levels deep without a clear module boundary make code hard to locate.',
  },
  D6: {
    title: 'No duplicate route names',
    hint: 'When the same route name exists at different URL depths, it is unclear which endpoint is the real one.',
  },
  B1: {
    title: 'No circular imports',
    hint: 'When two packages import each other, no change to either one is safe — you cannot reason about what a change affects.',
  },
  B2: {
    title: 'Shared code has one home',
    hint: 'Logic copy-pasted across packages drifts apart silently. A declared shared package keeps one canonical copy.',
  },
  B3: {
    title: 'Packages declare a public API',
    hint: 'An index file that exports the public surface makes it clear what outsiders may use and what is internal.',
  },
  B4: {
    title: 'UI building blocks live apart from app logic',
    hint: 'Generic components (buttons, inputs) should be separate from screen-specific code, so it is obvious what is safe to reuse.',
  },
  B5: {
    title: 'Tests are easy to find',
    hint: 'Tests should sit next to the code they cover, or mirror its folder structure — one pattern, applied consistently.',
  },
  C1: {
    title: 'No generated files in source',
    hint: 'Build output committed to the repo invites edits to files that the next build will overwrite.',
  },
  C2: {
    title: 'Files stay a readable size',
    hint: 'A file past ~400 lines usually holds more than one job, and every edit pays the cost of all of them.',
  },
  C3: {
    title: 'Files do not import the world',
    hint: 'A file that imports from more than ~15 different modules is coordinating too many concerns — work that belongs in several smaller files.',
  },
  C4: {
    title: 'Widely-used files are labeled',
    hint: 'A file imported by ten or more others is load-bearing. Labeling it warns every editor that changes here ripple widely.',
  },
  C5: {
    title: 'Short import chains',
    hint: 'If following one call means opening eight-plus files in a row, the structure is a maze.',
  },
  C6: {
    title: 'Pages do not wire up plumbing directly',
    hint: 'Entry files (pages, screens, routes) should consume one local surface instead of coordinating hooks, queries, and services themselves.',
  },
  O1: {
    title: 'The repo has an AI guidance file',
    hint: 'A CLAUDE.md, AGENTS.md, or clarx-manifest.json gives AI agents a declared starting point instead of guesswork.',
  },
  O2: {
    title: 'Generated folders are declared',
    hint: 'Telling agents which folders are generated stops them from editing files a build will overwrite.',
  },
  O3: {
    title: 'How to verify changes is written down',
    hint: 'Declared test, typecheck, and lint commands let an agent — or a new teammate — check their own work.',
  },
  O4: {
    title: 'Common changes have a declared home',
    hint: '"Add a component → packages/ui/src" written down once saves every contributor a guess.',
  },
  O5: {
    title: 'High-risk files are called out',
    hint: 'Naming the files where changes ripple widely makes everyone slow down in the right places.',
  },
  E1: {
    title: 'Route handlers stay small',
    hint: 'A route file mixing auth, validation, and business logic means any edit risks breaking an unrelated concern.',
  },
  E2: {
    title: 'Related files sit together',
    hint: 'A component, its types, and its tests in one place means no hunting for context.',
  },
  E3: {
    title: 'Utility files do not hoard exports',
    hint: 'A grab-bag file with 20+ unrelated exports has no safe place to make a change.',
  },
  E4: {
    title: 'Boundaries are enforced by tooling',
    hint: 'A boundary that is only a convention is a boundary someone will cross by accident.',
  },
  E5: {
    title: 'One front door per package',
    hint: 'Consumers should import the package name, never reach into its internal file paths.',
  },
}
