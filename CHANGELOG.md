# Changelog

All notable changes to this project will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com). Versioning follows [Semantic Versioning](https://semver.org).

---

## [Unreleased]

---

## [0.1.12] - 2026-08-18

Ships as **CLI 0.1.12** and **engine 0.1.10**. Three scan-quality corrections, all
found or measured by the new corpus regression harness.

### Fixed

**Engine**
- **C1 can now fail.** A repo with `dist/bundle.js` committed and no `.gitignore` used to
  report "Generated artifacts are excluded from the source tree". `scanFilesystem` strips
  `dist`, `build`, `out`, `.next`, `coverage` and the rest before rules run, so C1 only ever
  saw `.mypy_cache`, `target`, and `.gradle` — a hard-failure rule that was structurally
  unable to fail for the JS ecosystem, asserting a pass it had not verified. It now asks git,
  which is where the answer lives.
- **C1 no longer reports config dotfiles as build artifacts.** `.coveragerc` matched the
  `.coverage` prefix and was reported as committed generated output at hard-failure severity,
  costing `psf/requests` 15 points and telling maintainers to delete their coverage config.
  Matching is exact, and root-level files no longer contribute their own filename as a
  "directory".
- **A `build/` directory of build scripts is not build output.** `build` names output in some
  repos and tooling in others; committed `.ts`/`.tsx` means tooling. Without this, making C1
  reachable would have hard-failed `honojs/hono` for committing `build/build.ts`.
- **Router files are exempt from C3.** A file that binds `Switch`/`Route`/`Routes` from
  `wouter` / `react-router-dom` / `react-router` and spends most of its imports on
  `pages`/`views`/`screens`/`routes` is structurally a router, not a fan-out problem. It no
  longer needs a `manifest.highFanOut` entry.
- **Scan output is deterministic across platforms.** `readdir` results are now sorted, so
  `locations[]` ordering no longer differs between macOS (APFS) and Linux CI (ext4).

### Added

**Engine**
- `packages/corpus` — a regression harness that scores 18 pinned entries (public repos at
  fixed SHAs, synthetic fixtures, local checkouts) and diffs against committed snapshots.
  11 regression cases from the customer feedback logs run as executable assertions. Wired
  into CI.

### Changed

**Release**
- The engine publishes before the CLI, and neither step is `continue-on-error`. A failed
  engine publish used to leave the release green while npm kept an older engine — how
  engine 0.1.8 and CLI 0.1.10 came to be published out of step.

### Score impact

Measured across the corpus: **no pinned public repository changes score.** Repos that commit
build output will newly hard-fail C1 — correctly, and for the first time. Repos with a
`.coveragerc`-shaped dotfile gain back what a false hard failure was costing them (15 points
on `psf/requests`), and SPAs with a router file lose a spurious C3 finding.

---

## [0.1.10] - 2026-07-03

### Added

**CLI**
- `--version` / `-v` flag prints the CLI package version; help text reads version from `package.json` instead of a hardcoded value

**CLI — interactive TUI overhaul**
- Scrollable body with pinned footer: pillar summary, issue cards, and command transcript stay navigable on small terminals
- Rule detail view (`Enter` on an issue) with full explanation, remediation, and copy support
- Body scroll (`↑`/`↓`, `PgUp`/`PgDn`) with edge-aware pillar navigation
- Context-aware footer hints that adapt to main vs. detail view and filter/command mode
- New TUI docs page at `/docs/cli/tui`

### Changed

**CLI**
- TUI layout refactored into pure ANSI components (`layout`, `body-scroll`, `views`, `rule-detail-view`)
- `explain` command copy text aligned with TUI rule detail rendering
- Removed unused `open-file` platform helper

**Docs**
- CLI, engine, and standard docs updated for TUI workflow, output formats, and scoring behavior
- Landing page version bumped to v0.1.10

---

## [0.1.5] - 2026-05-01

### Added

**CLI — anonymous telemetry (opt-out)**
- First-run disclosure shown once before the first score run; explains exactly what is and isn't sent
- `clarx telemetry status` — shows current state, session ID, and what data is collected
- `clarx telemetry off` / `clarx telemetry on` — toggle at any time; preference stored in `~/.clarx/config.json`
- `NO_CLARX_TELEMETRY=1` or `DO_NOT_TRACK=1` env vars disable telemetry without touching config
- Implicit signals tracked: `score` runs, `explain` and `copy` actions per rule — no code, paths, or identity ever sent
- All telemetry is fire-and-forget with a 2.5s timeout; the CLI never blocks on it

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
