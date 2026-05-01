# Changelog

All notable changes to this project will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com). Versioning follows [Semantic Versioning](https://semver.org).

---

## [Unreleased]

---

## [0.1.4] - 2026-05-01

### Changed

**Engine — C1 no longer hard-fails without git evidence**
- C1 now only hard-fails when `git ls-files` positively confirms generated files are committed
- If git is unavailable or returns no tracked paths, C1 downgrades to a warning ("agent noise, not committed")
- Removes the "assume worst case" fallback that was causing false hard-failures on gitignored working-tree artifacts

**Engine — D1 monorepo and tooling-aware**
- Monorepo signal detection: if `pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `turbo.json`, or `rush.json` exists at root, D1 threshold raises from 10 → 20
- Pattern-based config file exclusion: `tsconfig.*.json`, `vite.config.*`, `vitest.config.*`, `jest.config.*`, `alias.config.*`, `tailwind.config.*`, `eslint.config.*`, `prettier.config.*`, and other common tooling configs no longer count as "meaningful entries"
- Tooling-heavy frontend stacks and monorepos no longer trip D1 on legitimate config files

---

## [0.1.3] - 2026-05-01

### Changed

**Engine — smarter C1 (git-aware artifact detection)**
- C1 now distinguishes between artifacts *committed to git* (hard failure) and artifacts that are gitignored but present in the working tree (warning — "agent noise, not committed")
- Uses `git ls-files` to determine tracked state; falls back to worst-case (hard failure) when git is unavailable

**Engine — O3/O4 partial credit for CLAUDE.md and AGENTS.md**
- O3 (verification commands) now passes when guidance files contain command patterns (`yarn`, `npm run`, `pnpm`, `make`, `tsc`, `vitest`, etc.) — not just when `clarx-manifest.json` has `verificationCommands`
- O4 (common task locations) now passes when guidance files reference directory paths — not just when manifest has `commonTasks`

**Engine — graduated hard failure floor**
- 1 hard failure: score capped at 65 (was 50)
- 2 hard failures: capped at 50
- 3 hard failures: capped at 35
- Reduces false-catastrophic scores when a single rule fires on an otherwise healthy repo

---

## [0.1.2] - 2026-05-01

### Added

**CLI clipboard support**
- `clarx score --copy-all` — copies all failing rules (grouped by severity) with full fix text to clipboard after scoring
- Watch mode: `copy all` at the prompt copies every failing rule to clipboard
- Watch mode: `copy <rule>` copies a single rule's fix text to clipboard
- `clarx explain <rule> --copy` — prints explanation and copies it to clipboard
- Clipboard support: `pbcopy` (macOS), `clip` (Windows), `xclip`/`xsel` (Linux)

---

## [0.1.1] - 2026-05-01

### Changed

**CLI output polish**
- Recommendations section now renders rule ID and message in cyan, matching the color treatment of Failures (red) and Warnings (yellow)
- Footer hint text (`e.g. C1`, `r`, `Ctrl+C`) rendered in magenta to distinguish them from actionable rule IDs
- Watch mode footer: `r` refresh command added; `Ctrl+C` label updated to match new color scheme
- Score summary always appears at the bottom of output; findings scroll above it naturally

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
