# @clarxai/corpus

Scores pinned real repositories and diffs the result against committed snapshots.

The engine's unit tests cover synthetic fixtures. This covers *real code*: it answers "did that fix
change anything else?" — which nothing else in the repo can answer.

```bash
pnpm --filter @clarxai/corpus corpus              # score and diff (exit 1 on regression)
pnpm --filter @clarxai/corpus corpus -- --update  # regenerate snapshots, then review the diff
pnpm --filter @clarxai/corpus corpus -- --only ts-tiny-lib
```

## What is in the corpus

| Source | Where | Gates the run |
|--------|-------|---------------|
| Public repos pinned by SHA | `corpus.json` | ✅ yes |
| Synthetic fixtures | `src/fixtures.ts` | ✅ yes |
| Local checkouts (your own repos) | `src/fixtures.ts` | ❌ advisory only |

`corpus.json` is the **publishable** list — every entry is public and pinned, so the file can ship
with the benchmark unchanged. Private or customer repositories belong in `src/fixtures.ts` as
`local` entries, never here.

Local entries are advisory because a working tree changes every time you edit it; gating on one
would red CI on every PR that adds a file. They are still scored, and their movement is reported.

## Why entries look the way they do

Each entry carries a `rationale` naming the bug class it covers. Fixtures exist where the wild
provides no clean example — a manifest with invented keys, an oversized shadcn component, a router
importing twenty pages.

Fixtures pad files with **real function declarations**, not constants: C2 skips files without
executable logic, so a fixture padded with `const x = 1` silently never triggers the rule it claims
to test.

## Snapshots

One JSON per entry in `snapshots/`, normalized for determinism:

- `meta.analyzedAt` and `meta.root` are dropped — a timestamp and an absolute path.
- `engineVersion` is recorded but **not diffed**, so an engine bump does not red the whole corpus.
- Object keys are sorted; `locations` are sorted, with the engine's `locations[0]` primary-target
  contract preserved separately in `primary`.
- Every rule is snapshotted, including passing and inapplicable ones. A rule silently flipping to
  `inapplicable` stops moving the score without ever reporting a failure — that is the change this
  is here to catch.

Determinism also depends on `scanFilesystem` sorting its `readdir` results, since APFS and ext4
return entries in different orders. That sort is in the engine, covered by
`packages/engine/src/__tests__/scan-determinism.test.ts`.

## Diff classes

| Class | Fails the run |
|-------|---------------|
| `structural` — a rule flips pass/fail/inapplicable, severity, or confidence | yes |
| `score` — overall, pillar, or rule score impact moves | yes |
| `location` — the file set, or the primary target, changes | yes |
| `message` — wording drift | only if a **number** inside it changed |
| `cosmetic` — file count moved without the SHA moving | yes |

Numbers inside messages are claims, not prose: *"3 files exceed 400 lines, among 26 files"* was
itself the bug in two prior cases.

## Regression cases

`src/cases.ts` holds the engine-layer cases from the two customer feedback logs in `clarx-cloud/docs`
as executable assertions. Status is **observed, not aspirational**:

- `holds` — verified true today. Breaking it fails the run.
- `open` — a known gap. Reported every run, never gating. If it starts passing, the harness tells you
  to promote it.

Roughly half the documented cases are cloud-layer (prompt building, working-set derivation, scan
lifecycle, UI). They belong in `clarx-cloud`, tested against the snapshots this harness produces.

## Adding an entry

1. Resolve a SHA: `git ls-remote https://github.com/owner/repo HEAD`
2. Add it to `corpus.json` with a `rationale` naming the bug class it covers and a `maxFiles` cap.
3. Run with `--update` and review the generated snapshot before committing it.
