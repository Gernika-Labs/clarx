# Clarx Improvement Plan

**Created:** 2026-07-03
**Status:** Active — single source of truth for the roadmap. Shipped work is recorded in [2026-07-04-trust-and-calibration-changes.md](./2026-07-04-trust-and-calibration-changes.md).
**Goal:** Make Clarx a trusted, stack-honest **repo health linter for the AI era** — with clear score meaning, reliable publishing, fewer false positives, and honest breadth across stacks.

Origin: an external product review ("promising, differentiated, early — and more credible now that it's just the standard and the scorer") plus a codebase audit that anchored each critique to specific files. Verdicts from the review that shape this plan: the standard is the moat, the CLI is the wedge, the manifest is the best idea in the product, and the main risk is **clarity and trust**, not technology.

Sizing is relative (**S / M / L**), not calendar-based — sequence is committed, dates are not.

---

## North star

Clarx measures **structural AI-readiness**: how easily an agent can orient, bound context, follow repo conventions, and contain edit blast radius. It does **not** measure code quality, security, correctness, or test coverage.

The standard is the moat. The CLI is the wedge. The manifest is the highest-leverage artifact.

---

## Phase 1 — Trust & correctness

*Fix "what does this score mean?" before adding rules or features. Everything here is S except 1.2 (M).*

### 1.1 Score semantics on every surface — **S**

**Problem:** `83/100` reads as "good codebase," but Clarx scores agent ergonomics of structure. The first time a well-tested, secure repo scores 61 and the owner feels insulted, we lose them.

**Evidence:**
- The number is labeled inconsistently and always generically — never with a qualifier:
  - `packages/cli/src/presentation/tui/components/score-header.ts:5` — `score · ${score} / 100`
  - `packages/cli/src/presentation/score-report/format.ts:56` — `Overall score` / `${view.score} / 100`
- A grep of the entire CLI + engine finds **no disclaimer anywhere** — no "not code quality/security/correctness" statement in any user-facing output or README.
- Rule copy leans on quality-adjacent words ("hazard," "load-bearing," "blast radius") that *reinforce* the misread.

**Actions:**
- Standardize on one label everywhere: **"AI-readiness"** (or "AI-readiness score"), never bare "score." Audit all reporters: `tui`, `score-report/format.ts`, `reporters/markdown.ts`.
- One-line definition next to the headline number: *"How easily an AI agent can navigate and safely edit this repo — not a measure of code quality, security, or correctness."*
- `clarx explain` overview mode: a "What Clarx does not measure" block naming the excluded layers (tests, types, security, runtime correctness, business logic).
- One sentence in the default `clarx score` footer pointing to it.
- New docs page: **What Clarx measures / What it doesn't** — same sentence on landing + README.

**Done when:** A new user can explain the score in one sentence without reading the full standard.

### 1.2 Confidence honesty in the UX — **M**

**Problem:** Import-graph rules (B1, C3, C4, C5) are JS/TS-shaped. On a Python/Go repo they can't fire; they pass silently and overall confidence just degrades to "low." The user is scored on rules that effectively didn't run, with no visible note. Silent thinness reads as a bug; declared thinness reads as integrity.

**Evidence:**
- Only a single **overall** confidence is surfaced, derived from manifest presence + import-graph resolution — `packages/engine/src/scoring/overall.ts:50-54`.
- **Per-rule confidence already exists in engine data** (e.g. `packages/engine/src/analyzers/rules-c3-c4-c5.ts` sets high/medium/low per rule) but is **computed and then discarded at the presentation layer** — no reporter displays it. Cheapest win in this plan.
- `confidenceCaveat` (`packages/engine/src/types.ts:74`) and `importGraphResolved` (`types.ts:83`) exist but are undocumented.
- There is **no "N/A for this stack" rule state** — inapplicable rules are indistinguishable from passes.

**Actions:**
- Introduce an explicit `inapplicable` / `not-evaluated` rule state distinct from "pass."
- Surface the per-rule confidence that already exists; add per-pillar rollup. When a pillar leans on rules that couldn't fire, say so: *"Context Efficiency: partial — import-graph rules (C3–C5) require a resolvable JS/TS import graph."*
- Always surface confidence + caveat in CLI/TUI (partially exists; make unavoidable).
- Document `confidence`, `confidenceCaveat`, `importGraphResolved` in output-format docs.
- Docs page: **Scoring non-JS repos** — full vs. partial analysis, and how to raise confidence (manifest + guidance).

**Done when:** A Python repo owner understands partial scoring and how to raise confidence — and can see which rules did not evaluate.

### 1.3 Fix `clarx explain D6` — **S** (real bug, ship immediately)

**Problem:** D6 is a real, scored rule (Discoverability is D1–D6 per `PILLAR_RULES`, `packages/engine/src/scoring/overall.ts:3-9`), but `explain.ts` defines only 26 of 27 explanations — the map at `packages/cli/src/commands/explain.ts:5-32` jumps D5→B1. Its own usage message still claims "Valid rules: D1–D6" (`explain.ts:99`). So `clarx explain D6` prints "Unknown rule" for a rule the tool actively scores. This directly undermines "fixing rule X is worth an afternoon" — you can't even read what D6 is.

**Actions:**
- Add the D6 explanation.
- Add a test asserting every rule in `PILLAR_RULES` has a matching `explain.ts` entry so this can't regress.

**Done when:** `clarx explain <id>` works for all 27 rules and a test guards the invariant.

### 1.4 Release & install reliability — **S**

**Problem:** npm publish failed on CI (`NPM_TOKEN`); install path ambiguous (`clarx` vs `@clarxai/cli`). Ops, not product — but the public on-ramp (`npx clarx score .`) is what adoption rides on.

**Actions:**
- Fix `NPM_TOKEN` and verify publish on tag push (see [release-practice-guide.md](./release-practice-guide.md)).
- Release checklist: bump `packages/cli/package.json` → tag `v*-cli` → CI → confirm npm.
- Docs install section: `npm i -g @clarxai/cli` as canonical.
- Verify the cold path: `npx clarx score .` on a fresh repo with no install, no config, sensible output on a non-JS repo. Treat as an adoption gate.
- Optional: `workflow_dispatch` on `.github/workflows/release.yml` for manual retries (not present today).
- Docs landing version already reads from `packages/cli/package.json` via `apps/docs/lib/version.ts` — done.

**Done when:** `npm view @clarxai/cli` matches the latest tag within minutes of release, and cold `npx clarx score .` works first try.

### 1.5 Positioning cleanup (finish the pivot) — **S**

**Problem:** Orphan component MDX still discoverable; mixed product story. The review: "the old UI-kit positioning diluted the message."

**Actions:**
- Remove component/pattern pages from search index (or `noindex` + redirect); redirect old component URLs → adoption guide or standard overview.
- Trim AI-rules templates if they still read like a public design-system pitch.
- README one-liner: *"Score any codebase for AI-first structure."*
- `packages/ui` stays internal — already `"private": true` (`packages/ui/package.json:4`); no public nav or npm publish.

**Done when:** Public site has one story: standard + tool.

---

## Phase 2 — Rule quality & calibration

*Reduce "this rule is wrong for my repo" — the main adoption killer. The review predicts "repos will argue" about thresholds; the defense is provenance + configurability, not better defaults.*

### 2.1 Threshold provenance & centralization — **M**

**Problem:** Thresholds are scattered file-local `const`s, mostly bare numbers, no central home, no override path, no documented rationale. This is the difference between "cited in PRs like ESLint" and "bikeshedded."

**Evidence:**
- `C3_LIMIT = 15` — `packages/engine/src/analyzers/rules-c3-c4-c5.ts:11`; `C4_THRESHOLD = 10`, `C5_LIMIT = 8`, `C6_IMPORT_THRESHOLD = 8` — same file.
- `C2_LIMIT = 400`, `C2_HARD_LIMIT = 600` — `packages/engine/src/analyzers/rules-c.ts:76,78`.
- `E1_LIMIT = 300`, `E3_EXPORT_LIMIT = 20` — `packages/engine/src/analyzers/rules-e.ts:8,48`.
- The one good pattern to generalize — stack-aware tiers: `D1_LIMIT_DEFAULT = 10`, `D1_LIMIT_NEXTJS = 17`, `D1_LIMIT_MONOREPO = 20` — `packages/engine/src/analyzers/rules-d.ts:13-15`.
- Only a couple carry rationale (e.g. `EXPORT_DENSITY_THRESHOLD` at `rules-c.ts:162-165`).

**Actions:**
- Centralize thresholds into one constants module with a short rationale comment each.
- Allow overrides via `clarx-manifest.json`; log when a threshold was overridden.
- Publish a calibration-provenance note in `standard/` once the corpus audit (2.2) lands — "derived from a corpus of N repos" is the single highest-leverage credibility investment in this plan.

**Done when:** Every threshold has one home, a written rationale, and a manifest override path.

### 2.2 False-positive audit program — **M**

**Actions:**
- Run `clarx score` on 10–15 diverse public repos (Next monorepo, Django, Go CLI, Rust lib, small app).
- Log disputed rules in `journal/rule-calibration.md` (create on first audit).
- Per noisy rule: exemption, threshold tweak, or severity downgrade. Prioritize **D1, C2, C3, D4, E3**.
- This audit is the input to 2.1's provenance note and to the numeric targets below.

**Done when:** Baseline established, then: <20% of rules fire as warnings on 3 designated "healthy" reference repos.

### 2.3 Manifest as first-class fix path — **M**

**Why:** The reviewer called `clarx-manifest.json` "the best idea in the product" — high-leverage, stack-agnostic, the part that works equally on any repo. It should be the lead story, not one rule (O1) among 27. It also flips the "solo dev / tiny repo: overhead > benefit" segment the review wrote off.

**Actions:**
- Richer `clarx init` defaults (verification commands from `package.json` scripts) — `packages/cli/src/commands/init.ts` exists; evaluate its starter manifest.
- `clarx explain <rule>` → "Add to manifest:" hint when applicable (`highFanIn`, `generated`, `commonTasks`).
- New: `clarx score --suggest-manifest` (diff vs. current manifest).
- Docs: manifest field ↔ rule mapping table.
- Restructure getting started so the manifest is the first concrete thing a user creates; frame the score as "what the manifest unlocks."

**Done when:** Fixing a warning often means editing the manifest, not only refactoring — and getting started leads with `clarx init`.

### 2.4 Graduated severity storytelling — **S**

**Problem:** Hard failures cap the score; users need a fix order. The floor is real and graduated — `Math.max(65 - (count - 1) * 15, 25)` (`packages/engine/src/scoring/overall.ts:11-13`): 1 → 65, 2 → 50, 3 → 35, 4+ → 25 — but undocumented.

**Actions:**
- TUI/text: **"Fix first"** section — hard failures ranked by leverage.
- Docs: hard-failure playbook (B1, C1, C2, O1 — detect → fix → verify).
- Document the graduated floor on the scoring page.

**Done when:** A repo at 35/100 has an obvious 1–2 item fix list.

### 2.5 Test corpus expansion — **M**

**Actions:**
- Fixture repos under `standard/examples/` (compliant, messy, monorepo, python-only).
- Integration tests: score fixtures, assert expected rule IDs + confidence.
- Regression tests required for any threshold change (pairs with 2.1).
- (The `PILLAR_RULES` ↔ `explain.ts` assertion ships earlier, in 1.3.)

**Done when:** Rule changes require updating fixtures, not hoping.

---

## Phase 3 — Depth & distribution

*Gated: do not start 3.3/3.4 distribution work until Phase 2 calibration lands — don't market a rubric you haven't calibrated. 3.1/3.2 can proceed in parallel with late Phase 2.*

### 3.1 Stack honesty → stack depth

**Problem:** Import graph is JS/TS-only; "any codebase" is fully true only at the guidance/filesystem layer.

| Path | Effort | Impact |
|------|--------|--------|
| **A. Manifest-first mode** | S | Explicit "partial analysis" for non-JS; lean on O + D + filesystem (delivered via 1.2) |
| **B. Python import graph** | M | `import` / `from` parsing — unlocks B1, C3 on a large audience |
| **C. Go module graph** | M | `go list` or AST |
| **D. Generic tree-sitter** | L | Long-term moat |

**Recommendation:** **A now** (via 1.2), **B next** if the 2.2 audit shows demand, defer C/D.

### 3.2 CI & team workflows — **M**

**Status correction:** SARIF output is **already built and unit-tested** (`packages/cli/src/presentation/reporters/sarif.ts` + `sarif.test.ts`) — what remains is end-to-end GitHub Code Scanning wiring + docs, not building the format. `--baseline`/`--diff` do not exist yet.

**Actions:**
- GitHub Action: `clarxai/clarx-action` with PR score comment.
- Wire SARIF → GitHub Code Scanning end-to-end; document it.
- `--baseline` / `--diff`: fail only on *new* violations vs. main.
- Optional: score-trend artifact in CI (`clarx-score.json` committed or uploaded).

**Done when:** A team adds Clarx to CI in <10 minutes and sees PR feedback.

### 3.3 Rule evolution process — **S** *(gated on Phase 2)*

**Actions:**
- Version `standard/CHANGELOG.md` with rule ID changes.
- Policy: rule IDs never reused; severity changes logged.
- `journal/rule-rfc.md` template for community proposals.

**Done when:** Standard v0.2 feels governed, not ad hoc.

### 3.4 Distribution & proof — **M** *(gated on Phase 2)*

**Actions:**
- README badge: Clarx self-score (dogfood).
- 2–3 case studies: before/after score + what changed.
- Doc: *"We ran Clarx on X OSS repo."*
- Evaluate npm `clarx` package alias if `@clarxai/cli` confuses install docs.

**Done when:** External devs cite Clarx without direct outreach.

---

## Cross-cutting (ongoing)

| Area | Recommendation |
|------|----------------|
| Telemetry | Keep opt-out; optional quarterly "top failing rules" summary for calibration |
| Engine vs CLI versions | Publish engine when changed; document coupling in release notes |
| UI kit | Internal only (`private: true`); no public promotion |
| Docs | One tutorial: zero → `clarx init` → CI gate in 15 minutes |

---

## Prioritized backlog (if only 8 things)

1. Quick-win trio, ship together: AI-readiness label + "what it doesn't measure" (1.1) + D6 explain fix (1.3)
2. Fix npm publish + release checklist + cold `npx` path (1.4)
3. Confidence / inapplicable UX + non-JS scoring guide (1.2)
4. False-positive audit on 10 repos (2.2) → threshold centralization + provenance (2.1)
5. Manifest suggest / explain-to-manifest hints, manifest-first getting started (2.3)
6. Remove component pages from search + redirects (1.5)
7. PR GitHub Action / SARIF end-to-end (3.2)
8. Python import graph spike (3.1B — only if the audit shows demand)

---

## Acceptance criteria vs. success metrics

"Done when" lines above are binary and self-contained. The numeric targets below are aspirations that **require a baseline first** — measure current values before treating them as targets.

| Metric | Target | Baseline status |
|--------|--------|-----------------|
| npm weekly downloads | Week-over-week growth | ⚠️ establish baseline |
| Non-JS `clarx score` feedback | "Useful" not "broken" | qualitative |
| False-positive reports | Down after calibration pass | ⚠️ needs 2.2 audit as baseline |
| Rules firing on healthy reference repos | <20% | ⚠️ needs 2.2 audit as baseline |
| Time to first CI gate | <15 min from docs | measurable once 3.2 ships |
| Clarx repo self-score | ≥80 with high confidence | ⚠️ record current self-score first |

---

## Explicitly NOT doing (yet)

- More pillars or rules (27 is enough until calibration lands)
- SaaS dashboard / cloud scoring (CLI + CI first)
- Re-promoting the UI kit as a public product
- Perfect multi-language support before the JS/TS + manifest path is bulletproof — declare the gap (1.2) instead of papering over it
- Code quality, security, or correctness checks — different products; dilutes the "structural AI-readiness" thesis

---

## Execution sequence

```
1.1 + 1.3        →  Trust framing + D6 fix (quick-win trio, ship together)
1.4              →  npm publish reliability + cold npx path
1.2              →  Confidence honesty (inapplicable state, surface per-rule confidence)
1.5              →  Positioning cleanup (mostly done)
2.2 → 2.1        →  Corpus audit → threshold centralization + provenance
2.3 + 2.4        →  Manifest-first UX + fix-first storytelling
2.5              →  Fixture repos + regression tests
3.2              →  GitHub Action + SARIF end-to-end        (parallel with late Phase 2)
3.1B             →  Python import graph (if audit shows demand)
3.3 + 3.4        →  Governance + distribution               (gated on Phase 2 landing)
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-03 | Initial plan from external product review; links to review-response doc |
| 2026-07-03 | Merged review-response doc into this plan as single source of truth: inlined file:line evidence, promoted D6 bug to Phase 1 shippable (1.3), corrected SARIF status (built + unit-tested), replaced week-range timelines with S/M/L sizing, split binary "Done when" from baseline-required metrics, gated Phase 3 distribution on Phase 2 calibration |
| 2026-07-04 | **Shipped 1.1, 1.2, 1.3, 2.1, 2.4, and parts of 1.4** — (1.1) "AI-readiness" label + disclaimer on text/TUI/markdown surfaces; `clarx explain` with no args now prints a measurement-scope overview incl. "What Clarx does NOT measure". (1.2) New `inapplicable` rule state: B1/C3/C4/C5/C6 report "not evaluated" on non-JS stacks instead of silently passing; `meta.importGraphResolved` now computed from the actual graph (was hardcoded `true`); per-rule confidence surfaced in verbose text + markdown output. (1.3) D6 explanation added + coverage test asserting every `PILLAR_RULES` rule has an explain entry. (2.1) All thresholds centralized in `packages/engine/src/thresholds.ts` with per-key rationale; overridable via new manifest `thresholds` key (validated, can't disable rules). (2.4) "Fix first" section in text report + graduated-floor text corrected in markdown reporter (was "caps at 50") + floor rationale documented. (1.4) `workflow_dispatch` added to release workflow; **fixed broken install docs** (`npm i -g clarx` 404s — canonical is `@clarxai/cli`). New docs pages: `standard/what-clarx-measures`, `cli/non-js-repos`; manifest/scoring/output-format docs updated. Also fixed: CLI `pnpm test` glob only ran 4 of 57 tests (unquoted `**`). Verified: engine 144 tests, CLI 57 tests, all typechecks, full build + docs build, live smoke tests on this repo + a Python-only fixture. |
