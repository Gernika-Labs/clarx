# Changelog

All notable changes to this project will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com). Versioning follows [Semantic Versioning](https://semver.org).

---

## [Unreleased]

---

## [0.1.0] - 2026-05-01

### Added

**Standard**
- AI-First Standard v0.1 — 5 pillars × 5 rules = 25 rules total
- Three severity levels: `hard_failure`, `warning`, `recommendation`
- Hard failure floor: B1 (circular imports), C1 (generated artifacts in source), O1 (no guidance file) cap the overall score at 50
- Confidence levels: `high` (manifest + import graph), `medium` (import graph only), `low` (filesystem only)
- Machine-readable rubric at `standard/rubric/scoring.json`

**Engine (`@clarxai/engine`)**
- `analyze()` — full pipeline: filesystem scan → import graph → 25 rule evaluations → scored result
- Import graph builder with cycle detection (cross-package DFS)
- Manifest loading from `clarx-manifest.json`
- All 25 rules implemented with zero stubs
- 81 unit and integration tests

**CLI (`@clarxai/cli`)**
- `clarx score [path]` — score any repo with `--format text|json|markdown`, `--min-score`, `--min-pillar-score`, `--ignore`, `--verbose`
- `clarx explain <rule>` — full rationale and remediation for any rule
- `clarx init [path]` — generates a starter `clarx-manifest.json` with workspace and generated-dir detection
- Exit codes: `0` pass, `1` threshold not met, `2` hard failure

**Docs**
- Documentation site at `apps/docs` (Next.js 15 + fumadocs)
- Sections: Philosophy, Getting Started, Primitives, AI-Native, Patterns, AI Rules Layer, Standard, CLI, Engine
