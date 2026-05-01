# Clarx

AI-first codebase standard, analysis engine, and design system.

## What's in here

| Package           | Name              | Description                                                        |
| ----------------- | ----------------- | ------------------------------------------------------------------ |
| `packages/ui`     | `@clarxai/ui`     | Semantic React component library for AI interfaces                 |
| `packages/engine` | `@clarxai/engine` | Codebase analysis engine — scores repos against the Clarx standard |
| `packages/cli`    | `@clarxai/cli`    | CLI tool: `clarx score`, `clarx init`, `clarx explain`             |
| `apps/docs`       | —                 | Documentation site (Next.js 15 + fumadocs)                         |
| `standard/`       | —                 | Versioned Clarx AI-First Standard spec and rubric                  |

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) 10+ (`npm install -g pnpm`)

## Install

```bash
git clone https://github.com/clarxai/clarx
cd clarx
pnpm install
```

## Development

Run everything in watch mode:

```bash
pnpm dev
```

Run a specific workspace:

```bash
pnpm --filter @clarxai/cli dev        # CLI in watch mode
pnpm --filter @clarxai/engine build   # build the engine
pnpm --filter docs dev                # docs site at localhost:3000
```

## Build

```bash
pnpm build
```

## Lint / typecheck

```bash
pnpm lint
pnpm typecheck
```

## Format

```bash
pnpm format
```

---

## CLI (`clarx`)

### Install globally (after building)

```bash
cd packages/cli
pnpm build
npm link
```

### Commands

```
clarx score [path] [options]    Score a codebase against the AI-First Standard
clarx init [path]               Generate a starter clarx-manifest.json
clarx explain <rule-id>         Explain a specific rule (e.g. clarx explain C2)
```

### Score options

| Flag                            | Description                              |
| ------------------------------- | ---------------------------------------- |
| `--format text\|json\|markdown` | Output format (default: `text`)          |
| `--min-score <n>`               | Exit 1 if overall score is below n       |
| `--min-pillar-score <n>`        | Exit 1 if any pillar score is below n    |
| `--ignore <globs>`              | Comma-separated glob patterns to exclude |
| `--verbose`                     | Include passing rules in output          |

### Examples

```bash
clarx score                                        # score current directory
clarx score ./my-repo --min-score 70               # fail CI if score < 70
clarx score --format json > report.json            # machine-readable output
clarx init                                         # scaffold clarx-manifest.json
clarx explain O1                                   # explain rule O1
```

---

## UI components (`@clarxai/ui`)

Copy-and-own model — no npm publish, you copy the source into your project.

Components: `Badge`, `Button`, `Alert`, `Text`, `StatusIndicator`, `ChatMessage`, `ChatInput`, `ToolCall`, `StreamingText`, `AgentStatus`.

Read `packages/ui/src/badge.tsx` as the reference pattern. Every component follows the same shape:

1. Types from `tokens.ts` (`Intent`, `Appearance`, `Size`)
2. CVA variants mapping semantic props → Tailwind classes
3. Pure function, no side effects, no context

---

## Monorepo layout

```
packages/ui/src/          — UI components
packages/engine/src/      — analysis engine
packages/cli/src/         — CLI
apps/docs/                — documentation site
apps/docs/content/docs/   — MDX page content
apps/docs/components/demos/ — live demo components used in MDX
standard/                 — AI-First Standard spec (v0.1)
standard/v0.1.md          — full standard document
standard/rubric/          — scoring rubric
journal/                  — architecture decisions and audits
clarx-manifest.json       — machine-readable repo guidance
```

---

## Contributing

### Add a UI component

1. Create `packages/ui/src/[name].tsx` — follow `badge.tsx` pattern
2. Export from `packages/ui/src/index.ts`
3. Create `apps/docs/components/demos/[name]-demo.tsx`
4. Register the demo in `apps/docs/lib/mdx-components.ts`
5. Create `apps/docs/content/docs/components/[name].mdx`
6. Add to `apps/docs/content/docs/meta.json`

### Add a doc page

1. Create MDX file in `apps/docs/content/docs/`
2. Add it to `apps/docs/content/docs/meta.json`

### Add an engine rule

1. Add rule evaluation to `packages/engine/src/scoring/rules.ts`
2. Update pillar score calculation in `packages/engine/src/scoring/overall.ts` if needed
3. Add rule explanation to `packages/cli/src/commands/explain.ts`
4. Document in `apps/docs/content/docs/standard/pillars.mdx`

### Add a CLI command

1. Create `packages/cli/src/commands/[name].ts`
2. Wire it up in `packages/cli/src/cli.ts`
3. Document in `apps/docs/content/docs/cli/commands.mdx`
