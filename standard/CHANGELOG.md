# Clarx Standard — Changelog

## v0.1 — 2026-04-30

Initial release.

- Five pillars with equal 20% weighting
- 25 rules across all pillars (D1–D5, B1–B5, C1–C5, O1–O5, E1–E5)
- Three hard failures: B1 (circular imports), C1 (generated in source), O1 (no guidance file)
- Severity model: hard_failure, warning, recommendation
- Confidence levels: high, medium, low
- Manifest format v0.1 (`clarx-manifest.json`)
- Scoring floor of 50 for any repo with a hard failure
