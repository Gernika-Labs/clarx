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
