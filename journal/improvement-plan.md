# Clarx Improvement Plan

**Created:** 2026-07-03  
**Status:** Active  
**Goal:** Make Clarx a trusted, stack-honest **repo health linter for the AI era** — with clear score meaning, reliable publishing, fewer false positives, and honest breadth across stacks.

**Related:** [2026-07-03-review-response-improvements.md](./2026-07-03-review-response-improvements.md) — codebase-anchored P0/P1/P2 items with file references.

---

## North star

Clarx measures **structural AI-readiness**: how easily an agent can orient, bound context, follow repo conventions, and contain edit blast radius. It does **not** measure code quality, security, correctness, or test coverage.

The standard is the moat. The CLI is the wedge. The manifest is the highest-leverage artifact.

---

## Phase 1 — Trust & clarity (4–6 weeks)

*Fix “what does this score mean?” before adding rules or features.*

### 1.1 Score semantics on every surface

**Problem:** `83/100` reads as “good codebase,” but Clarx scores agent ergonomics of structure.

**Actions:**
- Landing + docs: one sentence everywhere — *“Structural score for AI agent ergonomics — not code quality or security.”*
- TUI / text reporters: subtitle under overall score (see review doc item 1: rename toward **AI-readiness**)
- `clarx explain` overview mode: “What Clarx does not measure” block (review doc item 2)
- New docs page: **What Clarx measures / What it doesn’t**

**Done when:** A new user can explain the score in one sentence without reading the full standard.

### 1.2 Confidence model in the UX

**Problem:** Non–JS/TS repos get medium/low confidence; users may not know why.

**Actions:**
- Always surface confidence + caveat in CLI/TUI (partially exists; make unavoidable)
- Document `confidence`, `confidenceCaveat`, `importGraphResolved` in output-format docs
- Introduce `inapplicable` / `not-evaluated` for rules that can’t run on detected stack (review doc item 3)
- Surface per-rule or per-pillar confidence already computed in engine data
- Docs page: **Scoring non-JS repos** — full vs. partial analysis

**Done when:** A Python repo owner understands partial scoring and how to raise confidence (manifest + guidance).

### 1.3 Release & install reliability

**Problem:** npm publish failed on CI (`NPM_TOKEN`); install path ambiguous (`clarx` vs `@clarxai/cli`).

**Actions:**
- Fix `NPM_TOKEN` and verify publish on tag push (see [release-practice-guide.md](./release-practice-guide.md))
- Release checklist: bump `packages/cli/package.json` → tag `v*‑cli` → CI → confirm npm
- Docs install section: `npm i -g @clarxai/cli` as canonical
- Optional: `workflow_dispatch` on `.github/workflows/release.yml` for manual retries
- Docs landing version already reads from `packages/cli/package.json` via `apps/docs/lib/version.ts`

**Done when:** `npm view @clarxai/cli` matches latest tag within minutes of release.

### 1.4 Positioning cleanup (finish the pivot)

**Problem:** Orphan component MDX still discoverable; mixed product story.

**Actions:**
- Remove component/pattern pages from search index (or `noindex` + redirect)
- Redirect old component URLs → adoption guide or standard overview
- Trim AI-rules templates if they still read like a public design-system pitch
- README one-liner: *“Score any codebase for AI-first structure.”*
- Keep `packages/ui` internal (`private: true`); no public nav or npm publish

**Done when:** Public site has one story: standard + tool.

---

## Phase 2 — Rule quality & calibration (6–10 weeks)

*Reduce “this rule is wrong for my repo” — the main adoption killer.*

### 2.1 False-positive audit program

**Problem:** Thresholds (root entries, line counts, import limits) feel arbitrary without evidence.

**Actions:**
- Run `clarx score` on 10–15 diverse public repos (Next monorepo, Django, Go CLI, Rust lib, small app)
- Log disputed rules in `journal/rule-calibration.md` (create on first audit)
- Per noisy rule: exemption, threshold tweak, or severity downgrade
- Prioritize: **D1, C2, C3, D4, E3**
- Centralize thresholds with rationale comments (review doc item 4)
- Allow manifest overrides for team-specific tuning

**Done when:** &lt;20% of rules fire as warnings on 3 “healthy” reference repos we designate.

### 2.2 Manifest as first-class fix path

**Problem:** Manifest helps O-pillar but feels disconnected from B/C/E fixes.

**Actions:**
- Richer `clarx init` defaults (verification commands from `package.json` scripts)
- `clarx explain <rule>` → “Add to manifest:” when applicable (`highFanIn`, `generated`, `commonTasks`)
- New: `clarx score --suggest-manifest` (diff vs. current manifest)
- Docs: manifest field ↔ rule mapping table
- Restructure getting started: manifest first (review doc item 5)

**Done when:** Fixing a warning often means editing manifest, not only refactoring.

### 2.3 Graduated severity storytelling

**Problem:** Hard failures cap score; users need fix order.

**Actions:**
- TUI/text: **“Fix first”** section — hard failures ranked by leverage
- Docs: hard-failure playbook (B1, C1, C2, O1 — detect → fix → verify)
- Document graduated floor in scoring page (1 → 65, 2 → 50, 3 → 35, 4+ → 25)

**Done when:** A repo at 35/100 has an obvious 1–2 item fix list.

### 2.4 Test corpus expansion

**Actions:**
- Fixture repos under `standard/examples/` (compliant, messy, monorepo, python-only)
- Integration tests: score fixtures, assert expected rule IDs + confidence
- Regression tests when changing thresholds
- Assertion: every rule in `PILLAR_RULES` has `explain.ts` entry (review doc item 6 — fix D6 gap)

**Done when:** Rule changes require updating fixtures, not hoping.

---

## Phase 3 — Depth & distribution (10–16 weeks)

*Widen applicability and make Clarx sticky in teams.*

### 3.1 Stack honesty → stack depth

**Problem:** Import graph is JS/TS-only; “any codebase” is fully true only at guidance/filesystem layer.

| Path | Effort | Impact |
|------|--------|--------|
| **A. Manifest-first mode** | Low | Explicit “partial analysis” for non-JS; lean on O + D + filesystem |
| **B. Python import graph** | Medium | `import` / `from` parsing — unlocks B1, C3 on large audience |
| **C. Go module graph** | Medium | `go list` or AST |
| **D. Generic tree-sitter** | High | Long-term moat |

**Recommendation:** **A now** (via item 1.2), **B next**, defer C/D until demand.

### 3.2 CI & team workflows

**Actions:**
- GitHub Action: `clarxai/clarx-action` with PR score comment
- SARIF → GitHub Code Scanning (format exists; document + test end-to-end)
- `--baseline` / `--diff`: fail only on *new* violations vs. main
- Optional: score trend artifact in CI (`clarx-score.json` committed or uploaded)

**Done when:** Team adds Clarx to CI in &lt;10 minutes and sees PR feedback.

### 3.3 Rule evolution process

**Actions:**
- Version `standard/CHANGELOG.md` with rule ID changes
- Policy: rule IDs never reused; severity changes logged
- `journal/rule-rfc.md` template for community proposals

**Done when:** Standard v0.2 feels governed, not ad hoc.

### 3.4 Distribution & proof

**Actions:**
- README badge: Clarx self-score (dogfood)
- 2–3 case studies: before/after score + what changed
- Doc: *“We ran Clarx on X OSS repo”*
- Evaluate npm `clarx` package alias if `@clarxai/cli` confuses install docs

**Done when:** External devs cite Clarx without direct outreach.

---

## Cross-cutting (ongoing)

| Area | Recommendation |
|------|----------------|
| Telemetry | Keep opt-out; optional quarterly “top failing rules” summary for calibration |
| Engine vs CLI versions | Publish engine when changed; document coupling in release notes |
| UI kit | Internal only; no public promotion |
| Docs | One tutorial: zero → `clarx init` → CI gate in 15 minutes |
| Cold path | Verify `npx clarx score .` on fresh repo with no config (review doc item 7) |

---

## Prioritized backlog (if only 8 things)

1. Fix npm publish + release checklist  
2. “What Clarx measures” docs + CLI AI-readiness label  
3. False-positive audit on 10 repos  
4. Manifest suggest / explain → manifest hints  
5. Remove component pages from search + redirects  
6. Non-JS scoring guide + confidence / inapplicable UX  
7. PR GitHub Action / SARIF integration  
8. Python import graph spike (proof of concept)

**Quick wins already identified in review doc:** items 1, 2, 6 (D6 explain bug) — ship together.

---

## Success metrics (3 months)

| Metric | Target |
|--------|--------|
| npm weekly downloads | Week-over-week growth |
| Non-JS `clarx score` feedback | “Useful” not “broken” |
| False positive reports | Down after calibration pass |
| Time to first CI gate | &lt;15 min from docs |
| Clarx repo self-score | ≥80 with high confidence |

---

## Explicitly NOT doing (yet)

- More pillars or rules (27 is enough until calibration lands)  
- SaaS dashboard / cloud scoring (CLI + CI first)  
- Re-promoting UI kit as public product  
- Perfect multi-language support before JS/TS + manifest path is bulletproof  
- Code quality, security, or correctness checks (different products; dilutes thesis)

---

## Suggested execution sequence

```
Phase 1.1–1.2  →  Trust framing + confidence honesty
Phase 1.3      →  npm publish reliability
Phase 1.4      →  Positioning cleanup (mostly done)
Phase 2.1      →  Corpus audit + threshold centralization
Phase 2.2      →  Manifest-first UX
Phase 2.4      →  Fixture repos + explain coverage tests
Phase 3.2      →  GitHub Action + SARIF
Phase 3.1B     →  Python import graph (if audit shows demand)
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-03 | Initial plan from external product review; links to review-response doc |