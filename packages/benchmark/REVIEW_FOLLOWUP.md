# Follow-up for the independent reviewer

**Reads after:** your review of `REVIEW_BRIEF.md`
**Written by:** the same agent whose work you reviewed
**One question:** is what got built actually your option B, or my convenient reading of it?

Your review concluded *redesign; do not run this form*. Everything below either
acts on that or explains why it did not. The parts I did not do are in §3, and
they are the parts most likely to matter.

---

## 1. Claims you made, checked before acting

I verified each falsifiable claim rather than accepting it. **All held.** Recorded
here so you can see where the verification stopped rather than assume it was
thorough.

| Your claim | Verified how | Result |
|---|---|---|
| `.git` in `twin_high`, absent in `twin_low` | listed both trees, all four repos | true |
| Flattening destroys fenced code | read `twin_low/README.md` | true — a whole TS sample on one line |
| `clarx init` writes `pnpm` commands on Cargo repos | read all four generated manifests | true |
| Repo suite does not cover `_leading`, so unfixed code passes | `grep -c` in `string.spec.ts` → 0 | true |
| "B2 and C4 flip on every repo" is false | re-scored all four | true — B2 moves on 2 of 4; C4's `scoreImpact` is 0 everywhere |
| Score gap is O1 plus the hard-failure floor | compared `hardFailures` across twelve trees | true — every repo `{C2,O1}` → `{C2}` |

Two of those were my errors in a document I wrote confidently. The B2/C4 claim
was a generalisation from one repo; the correction is in `FINDINGS.md` with the
original text kept visible.

## 2. What changed

**Fixed:**

- `.git` is kept in both twins.
- `flattenMarkdown` is block-based; fenced code passes through byte for byte.
  Writing the regression test caught a *second* instance of the same bug — a
  global whitespace collapse eating fence indentation.
- `checkSpec` is required alongside `checkCommand`. Grader specs stage at
  `<repo>/.clarx-bench/`. The validator rejected all four existing tasks the
  moment the rule existed.
- `clarx init` no longer fabricates. Node commands come from the project's own
  `scripts`; Rust and Go get toolchain commands; Python and unknown ecosystems
  get none. Released as CLI 0.1.13 — this was a product bug, and it shipped to
  users for as long as the tool has existed.

**Pivoted:** `degradeRepo` takes `onlyFlatten`, degrading exactly the named
documents and nothing else. Applied to SDEverywhere's published `AGENTS.md`:

| | |
|---|---|
| files changed | 1 |
| information drift | 1.2% |
| `.git` | both twins |
| Clarx artifacts in treatment | none |
| Clarx score | 65 → 65, recorded as covariate |

## 3. What I did not do

Listed because omissions are harder to see than changes.

- **Your per-task verdicts are unacted.** You said drop gqloom-02 and gqloom-04,
  revise 01 and 03. I only wired their hidden specs so validation passes. The
  suite is intact and wrong.
- **The structure-only contrast has no tasks at all.** SDEverywhere had none
  before and still has none. The pivot is unexercised.
- **No memorization canary.** No sampling frame recorded beyond the `gh search`
  line.
- **No `ENVIRONMENT.md`.** Nothing pins CLI/engine versions, offline mode, or
  tool availability.
- **Reversibility unaddressed.** Your §2.10 point — that an agent may reconstruct
  structure cheaply, and that documentation shape is off the critical path when
  tasks are solved by grepping code — is not answered by anything I built.
- **No harness.** Phase 4 does not exist. Nothing has consumed a token.

## 4. The question

Your option B was: *"Take SDEverywhere's existing AGENTS.md. High = as published.
Low = flattened only that file, .git kept, no Clarx files. Tasks that require the
commands and layout that file states. Clarx scores recorded as a covariate."*

I built the twin exactly as written. I have not built the tasks, which is where
the interpretation risk concentrates.

**Is the twin what you meant, and is the following a fair reading of "tasks that
require the commands and layout that file states"?**

The file states things that are project-specific and not guessable: the
`pnpm -F {package} {command}` filter form, `type-check` rather than `typecheck`,
tests in `.spec.ts` under Vitest, a tests-first workflow, Storybook stories in
`.stories.svelte` with `play` functions, and a `packages` / `tests` / `examples`
split.

My intended reading: a task should be one where an agent that has absorbed those
facts proceeds directly, and one that has not must discover them — by reading a
run-on paragraph, or by grepping. Both twins contain every fact.

**Where I expect to get this wrong:** writing a task that is really a
memory-of-conventions test rather than a navigation test, or one so tied to the
stated commands that the prompt effectively quotes the treatment.

## 5. New problems the pivot creates

- **n = 1.** Option B's population is repos that already ship substantial agent
  documentation — which is a population that already cares about agents. That is
  a selection effect introduced by the design, and I do not know how many such
  repos exist at the obscurity level the memorization criterion wants. If the
  answer is "few", this contrast may be unpowerable for a paired test.
- **The score is now constant across arms.** Honest, and it means the study
  cannot say anything about the Clarx score at all. If that makes the result
  commercially useless, that is worth saying plainly before more is spent.
- **Two contrasts now exist in one package**: the old adoption contrast and the
  new structure-only one. I have not decided whether to delete the first.

## 6. What would help most

1. Is §4's twin your option B, or has it drifted?
2. Is the task reading in §4 sound, or does it smell like a conventions quiz?
3. Given §5's n = 1 problem, is option B worth running at all, or does it need a
   different repo population?
4. Anything in §3 you would prioritise over writing tasks.
5. **Same standing invitation as last time:** if the honest answer is that this
   should not be run in any form, say so. Nothing is pre-registered and nothing
   is locked.

Verify rather than trust. Both twins are reproducible with
`pnpm --filter @clarxai/benchmark twins`, and every number above came from a
command you can run.
