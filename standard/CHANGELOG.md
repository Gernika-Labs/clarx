# Clarx Standard — Changelog

## Unreleased

- **Score renamed to "AI-readiness"** on all surfaces, with an explicit
  disclaimer: not a measure of code quality, security, or correctness.
- **New rule state: `inapplicable`** — rules that cannot run on a repo's stack
  (B1, C3, C4, C5, C6 without a resolvable JS/TS import graph) are reported as
  *not evaluated* instead of silently passing. They never move the score.
- **Manifest v0.1 gains a `thresholds` key** — per-repo overrides for all 13
  numeric thresholds in the standard, validated (finite positive numbers only;
  overrides can never disable a rule). Defaults and rationale live in the
  engine's `thresholds.ts`.
- Retroactive corrections to this changelog's v0.1 entry, which had drifted
  from the implementation:
  - **D6** (shadow routes at multiple URL depths) is part of the standard —
    27 rules, Discoverability is D1–D6.
  - The hard-failure floor is **graduated** (1 → 65, 2 → 50, 3 → 35, 4+ → 25),
    not a flat 50.
  - **C2** escalates from warning to hard failure above the hard line limit
    (default 600 lines).

## v0.1 — 2026-04-30

Initial release.

- Five pillars with equal 20% weighting
- 26 rules across all pillars (D1–D5, B1–B5, C1–C6, O1–O5, E1–E5)
- Three hard failures: B1 (circular imports), C1 (generated in source), O1 (no guidance file)
- Severity model: hard_failure, warning, recommendation
- Confidence levels: high, medium, low
- Manifest format v0.1 (`clarx-manifest.json`)
- Scoring floor of 50 for any repo with a hard failure
