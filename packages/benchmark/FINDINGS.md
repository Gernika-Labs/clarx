# Pilot findings

Recorded as they happen, before pre-registration. The point of a pilot is to
find the problems that would have wasted the confirmatory run.

---

## 1. The degradation does not move the Clarx score at all

**Date:** 2026-08-19 · **Status:** RESOLVED — see finding 2

Ran the unmodified degradation script over four pinned public repositories:

| Repo | Language | twin_high | twin_low | Gap |
|---|---|---:|---:|---:|
| SDEverywhere | typescript | 65 | 65 | **0** |
| gqloom | typescript | 50 | 50 | **0** |
| fuse-backend-rs | rust | 50 | 50 | **0** |
| neocmakelsp | rust | 50 | 50 | **0** |

Between 1,100 and 1,700 lines of documentation changed per repo. **Not a single
rule flips.** Score, confidence, and every individual rule result are identical
across the twins.

### Why

Two compounding reasons:

1. **None of these repos has a `clarx-manifest.json`.** The manifest → prose
   transformation is the largest structural change the script makes, and it
   never fired. There was nothing to convert.
2. **The engine does not score documentation *structure*.** Rules check whether
   a README or manifest *exists*, file sizes, export counts, and the import
   graph. Flattening every heading and bullet into continuous prose touches
   none of that. D1 and D3 pass in both twins; O1 depends on a manifest being
   present, not on how it reads.

### What it means

The design assumes `twin_high` is "the repo with Clarx-checked signals present
and well-structured". Real repositories in the wild do not have those signals,
so `twin_high` cannot be the repo as it is — **it has to be authored**, and
`twin_low` degraded from that authored version.

That is a bigger change than it sounds, because authoring `twin_high` per repo
reintroduces exactly the hand-tuning risk the design is built to exclude. If a
human decides how good the good twin is, the measured gap is partly a measure of
that human's effort.

There is also a sharper question underneath, and it is about the product rather
than the experiment. If rewriting every heading and list in a repository's
documentation moves the Clarx score by **zero**, then either the score is not
measuring the thing the degradation manipulates, or the degradation is not
manipulating the thing the score measures. The experiment as designed would
compare two repositories that are, to Clarx, identical — the independent
variable would not vary.

### Options

1. **Author `twin_high` mechanically.** Add a manifest and structured docs to
   each repo with a published script, then degrade with the existing one. Keeps
   the causal story, but the authoring script becomes as load-bearing as the
   degradation script and needs the same scrutiny.
2. **Manipulate what Clarx actually scores.** Would mean changing code —
   splitting oversized files, adding entry points — which breaks the
   byte-identical-source guarantee that makes the twins credible.
3. **Reframe the claim.** Measure whether documentation *structure* helps agents
   independent of the Clarx score. Honest, cheaper, and still publishable — but
   it is a different paper, and it does not support "raising your Clarx score
   lowers your agent costs".

**Not chosen unilaterally.** This decision determines what the study can claim,
and it must be settled before pre-registration.

### What already works

The machinery is sound and stayed sound while producing this null result: pinned
SHAs, real git checkouts, mechanical degradation, a saved `twin_diff.patch` per
repo asserted to contain no source files, and drift accounting. The pipeline
reported a zero gap honestly instead of being tuned until it showed one — which
is the behaviour the whole design is built around.


---

## 2. Resolved: `twin_high` is built by `clarx init`, not by hand

**Date:** 2026-08-19 · **Status:** resolved, pipeline rewired

Adoption is now performed by the shipped CLI. `twin_high` is the repo after
`clarx init`; `twin_low` degrades that manifest back to prose. Source files stay
byte-identical throughout.

This removes the objection that sank the hand-authoring option: nobody decides
how good the good twin is. The transformation is mechanical, published, applied
identically to every repo, and is exactly what a user gets from thirty seconds
of adoption. It is also the conservative floor — `clarx init` emits a thin
manifest with empty workspace descriptions, so an effect visible here is
stronger than one that needed a polished manifest to appear.

| Repo | Base | twin_high | twin_low | Gap |
|---|---:|---:|---:|---:|
| SDEverywhere | 65 | 65 | 65 | **0** |
| gqloom | 50 | 65 | 50 | **+15** |
| fuse-backend-rs | 50 | 65 | 50 | **+15** |
| neocmakelsp | 50 | 65 | 50 | **+15** |

The manipulation is symmetric: adoption adds 15, degradation removes exactly the
same 15. That is the behaviour a clean instrument should show.

### The score gap is partly definitional — say so first

O1 and O2 check whether a manifest exists, so adding one necessarily moves them.
A skeptic will point this out, and they will be right about the *score*. The
answer is that the score is the **treatment label**, not the outcome. The
outcome is agent token cost and task success, and nothing about that is
definitional. Put this in the paper before someone asks.

### Adoption is not a pure gain

Two rules moved the wrong way on every repo: B2 and C4 flip pass → fail once a
manifest exists, because the engine can finally evaluate things it previously
could not. Net +15 despite two new failures. Report it — a treatment that only
ever helps looks rigged, and this one visibly does not.

## 3. A hard failure can mask adoption entirely

**Date:** 2026-08-19 · **Status:** affects the analysis plan

SDEverywhere scores 65 before adoption and 65 after. It looks like a null case,
and it is not: **confidence rises medium → high and three rules flip (B2, C4,
O2)**. It already passed O1 without a `clarx-manifest.json`, and it carries a C2
hard failure whose cap dominates the score.

So a repo can be genuinely treated while its score does not move, because the
hard-failure floor absorbs the change.

**Consequence for the analysis:** the independent variable must be the
**assignment** (twin_high vs twin_low), not the observed score gap. Analysing by
score gap would silently drop SDEverywhere's data while keeping its cost, and
would let the engine's capping behaviour decide which repos count. Assignment is
also the cleaner paired design.

Per the design's own instruction, SDEverywhere stays in. A repo whose honest
degradation produces no score movement is data about where the score is
sensitive, and dropping it would be the first step toward a corpus selected for
agreeable results.


---

## 4. Independent review — verdict and what it found

**Date:** 2026-08-19 · **Reviewer:** independent model, following `REVIEW_BRIEF.md`
**Verdict:** *redesign; do not run this form*

Every falsifiable claim in the review was checked against the artifacts. All held.

### Defects confirmed and fixed

| Finding | Status |
|---|---|
| `.git` present in `twin_high`, deleted from `twin_low` | **Fixed.** A tooling confound, not a documentation one — one arm had working `git log`/`blame`/`grep` and the other did not. The source-identity assertion could not see it, because `.git` paths carry no source extension. |
| `flattenMarkdown` destroyed fenced code | **Fixed.** A final newline-joining pass collapsed every fence onto one line. The test asserted only that ``` and one word survived — so it passed while every code sample in the corpus was destroyed. Rewritten block-based. A second instance of the same bug (a global `/ {2,}/` collapse eating fence indentation) was then caught by the new test. |
| Tasks were not gradeable | **Fixed.** `checkCommand` ran the repo's own suite, which by construction does not cover the change being requested — gqloom-01 passed on unfixed code. `checkSpec` is now required alongside `checkCommand`, and the validator rejects a task without one. |
| `clarx init` fabricated verification commands | **Fixed and released** as CLI 0.1.13. A product bug, not a benchmark bug. |
| "B2 and C4 flip on every repo… net +15 despite two new failures" | **Corrected** in finding 2. Both halves false; generalised from one repo. |

### The finding that ends this design

**The contrast stacks two treatments, and the larger one is not Clarx.** `twin_low`
both gained a prose `NOTES.md` and lost its structured `README`, `AGENTS.md`, and
`docs/`. A positive result reads most naturally as "wrecking the README hurts
agents" — undisputed, and no support for adopting Clarx.

**The score movement is an existence check under a cap.** Every selected repo
carries a `C2` hard failure, so all are capped at 65. The +15 is entirely
`{C2, O1} → {C2}` on the graduated floor, and `O1` passes when
`CLAUDE.md`, `AGENTS.md`, or `clarx-manifest.json` exists. There is no
high-scoring repository in the corpus; `twin_high` is the floor after buying O1.

Finding 1 already contained this answer. When flattening moved the score by
zero, the honest conclusion was that a documentation-only twin cannot test a
score claim. Instead the manipulation was changed until the score moved — by
adding the file the score checks for. That is circular, and it was not noticed
from the inside.

### Direction taken

Option B from the review: **structure-only contrast**. SDEverywhere already
ships a substantial `AGENTS.md` stating non-obvious project facts — the
`pnpm -F {package}` filter form, `type-check` rather than `typecheck`, tests in
`.spec.ts`, tests-first workflow. The contrast flattens **that file and nothing
else**:

- one file changed, measured drift **1.2%**
- `.git` present in both twins
- no Clarx artifacts in the treatment
- Clarx score identical at 65 → 65, recorded as a **covariate, not the treatment**

Clarx is the instrument again, which is what the original design specified.

### Per-task verdicts on the gqloom suite (carried, not yet acted on)

The reviewer's judgement, recorded so it is not lost if the suite is revisited:
gqloom-01 revise (prompt names both converters), gqloom-02 drop (the grader
cannot distinguish a no-op from a success), gqloom-03 revise or move (same file
again; the hidden test requires an export name the prompt never states),
gqloom-04 drop until the grader matches the prompt (it accepts an unused helper
and never inspects the call sites the task is about). The suite is also four
tasks in one module, which is not a sample of work.
