# Brief: author the structure-contrast tasks

**For:** the model not building the benchmark
**Depends on:** the memorization canary passing for at least one repo
**Verified by:** the other model, which will run the validator and read the twins

## The contrast you are writing for

- `twin_high` — `climateinteractive/SDEverywhere` at `2cf67ae9da3b2a48304f0b18288e05f8cce2b73e`, exactly as published
- `twin_low` — identical, except `AGENTS.md` is flattened into continuous prose
- Verified: `git diff --no-index` between the trees names exactly one file
- `.git` present in both; no Clarx artifacts on either side; Clarx score 65 in both

Build them with `pnpm --filter @clarxai/benchmark twins`. Read the twins before
writing anything.

## What makes a task valid here

The hypothesis is that **structure makes a fact cheaper to find**, not that the
fact is absent from one arm. Both twins contain every word of `AGENTS.md`. A task
only measures anything if reading that file is the rational route to solving it.

The previous review established that most of what the file states is recoverable
from the tree anyway:

| Fact in `AGENTS.md` | Also available from |
|---|---|
| pnpm, not npm | `pnpm-lock.yaml`, `pnpm-workspace.yaml` |
| `packages` / `tests` / `examples` | `ls` |
| Vitest, `.spec.ts` | hundreds of files |
| `type-check` not `typecheck` | every package's `package.json` |
| kebab-case filenames | the existing tree |

Writing tasks against those measures nothing: an agent greps and never opens the
file, in either arm.

**The one fact that looked genuinely expensive to recover:** the root
`pnpm test` runs every package plus the C and JS integration suites, while
`AGENTS.md` directs you to `pnpm -F {package} test` and to prefer a single test
file. That changes cost *even when both arms succeed* — which is the only
mechanism identified so far where structure can plausibly do work that grep
cannot. **Verify this before relying on it.**

## Shape to aim for

- A change confined to one package, whose check is that package's own tests or
  type-check.
- The prompt states the **behaviour required**, never the command, never `-F`,
  never `type-check`, never `.spec.ts`.
- Graded by a hidden spec under `tasks/<repo>/checks/`, staged by the harness at
  `<repo>/.clarx-bench/` and named by `checkCommand`.
- Secondary measure, recorded not graded: did the agent run the scoped command or
  the root suite?

Two or three tasks. **Not four for the sake of covering four kinds** — the
previous suite invented a refactor, a feature, and a cross-file change in the
same 23-line module to fill the categories, which is task-author convenience
rather than a sample of work.

## Do not write

- A conventions quiz. "Add a `.spec.ts`, a Storybook `play` function, and a
  copyright header" tests recall of a style guide, and the prompt becomes either
  a laundry list or a quotation of the treatment.
- Anything grading TDD ordering. Whether the agent wrote tests first is
  transcript theatre and cannot be graded honestly.
- A prompt containing `type-check`, `-F`, `.spec.ts`, or `play`. If it does, the
  treatment has been quoted into the question.
- A task whose files can be located by grepping an identifier named in the
  prompt. The previous suite named both functions and the exact failing input,
  so grep did the finding that structure was supposed to do.

## The validator will reject

Run `pnpm --filter @clarxai/benchmark tasks`. It fails on Clarx vocabulary in a
prompt, manifest values quoted verbatim, a `checkCommand` without a `checkSpec`,
paths that do not exist, a missing contamination note, a one-line prompt, and
duplicate ids.

It will *not* catch a conventions quiz, a grep-able identifier, or a grader that
passes on unchanged code. Those are your judgement, and all three shipped last
time.

## Claims to verify rather than accept

- That `pnpm test` at the root really does run everything, and that no package
  defines a `typecheck` alias that makes the file's advice redundant.
- That `CLAUDE.md` is a pointer to `AGENTS.md` and therefore not a second copy of
  the structure in the degraded arm.
- That the twins differ in exactly one file — do not trust this brief, run the
  diff.

## Open

- Is there any fact in `AGENTS.md` besides the command-scoping one that is both
  expensive to recover and gradeable? If not, say so: a contrast resting on a
  single mechanism is worth knowing about before tasks are frozen.
- If the honest answer is that agents will grep regardless and the file is off
  the critical path, that is the pilot's result and it should be written down
  rather than designed around.
