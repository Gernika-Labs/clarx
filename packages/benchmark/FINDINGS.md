# Pilot findings

Recorded as they happen, before pre-registration. The point of a pilot is to
find the problems that would have wasted the confirmatory run.

---

## 1. The degradation does not move the Clarx score at all

**Date:** 2026-08-19 · **Status:** blocking, needs a design decision

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
