# Contributing to Clarx

Thanks for your interest in contributing. This document covers how to get set up, how the project is structured, and what good contributions look like.

---

## Getting started

```bash
git clone https://github.com/Gernika-Labs/clarx.git
cd clarx
pnpm install
pnpm build
```

Run tests:

```bash
pnpm --filter @clarxai/engine test
```

Run the CLI against the repo itself:

```bash
node packages/cli/dist/cli.js score .
```

---

## Project structure

```
packages/engine/   — analysis engine (@clarxai/engine)
packages/cli/      — CLI wrapping the engine (@clarxai/cli)
packages/ui/       — internal reference components (not published)
apps/docs/         — documentation site (Next.js + fumadocs)
standard/          — versioned standard spec and rubric
journal/           — architecture decisions and process docs
```

See `CLAUDE.md` for the full task map.

---

## Types of contributions

### Adding or improving a rule

1. Find the relevant analyzer in `packages/engine/src/analyzers/`
2. Edit the rule logic
3. Add or update tests in `packages/engine/src/__tests__/`
4. Update the rule explanation in `packages/cli/src/commands/explain.ts`
5. Update `apps/docs/content/docs/standard/pillars.mdx`
6. Run `pnpm --filter @clarxai/engine test` — all 81 tests must pass
7. Run `node packages/cli/dist/cli.js score . --min-score 80` — score must stay above 80

### Adding a CLI command

1. Create `packages/cli/src/commands/[name].ts`
2. Wire it up in `packages/cli/src/cli.ts`
3. Document it in `apps/docs/content/docs/cli/commands.mdx`

### Adding an internal UI component

`packages/ui` is internal to this repo (not published). If you need a new reference component for the docs site:

1. Create `packages/ui/src/[name].tsx` — follow `badge.tsx` as the reference pattern
2. Export from `packages/ui/src/index.ts`

### Fixing a bug

- Open an issue first if the bug is non-obvious
- Include a failing test that reproduces it
- The fix should make the test pass without changing other tests

### Improving docs

- MDX pages live in `apps/docs/content/docs/`
- Navigation is controlled by `apps/docs/content/docs/meta.json`
- Demo components live in `apps/docs/components/demos/`

---

## Before opening a PR

Run the same checks CI runs:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm --filter @clarxai/engine test
pnpm --filter @clarxai/engine typecheck
pnpm --filter @clarxai/cli typecheck
node packages/cli/dist/cli.js score . --min-score 80
```

All must pass. PRs that fail CI will not be reviewed.

---

## Commit style

Short, imperative subject line:

```
add E6 rule for missing error boundaries
fix D4 false positive on small utility files
docs: update CI integration guide
```

No ticket numbers, no emoji, no trailing periods.

---

## Opening a PR

- Target `main`
- One concern per PR — don't mix a rule change with a doc rewrite
- Fill in what changed and why, not just what the diff shows
- If it's a new rule, include the rule ID, severity, and score impact in the description

---

## Questions

Open a GitHub Discussion or an issue. We'll respond.
