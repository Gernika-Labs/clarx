# Release Practice Guide

A step-by-step walkthrough to practice the full release cycle on the clarx repo.
Do this once to build muscle memory before the real v0.1.0 ship.

---

## What you'll practice

1. Making a small change
2. Running CI checks locally before pushing
3. Opening a PR and watching CI pass
4. Merging to main
5. Tagging a release and watching the publish workflow run
6. Verifying the packages landed on npm

---

## Step 1 — Make a small change

Pick something real but low-risk. Good candidates:

- Add a line to `CHANGELOG.md` under `[Unreleased]`
- Fix a typo in any `.mdx` doc page
- Add a `description` field to the root `package.json`

For this walkthrough, we'll update `CHANGELOG.md`.

Open `CHANGELOG.md` and add one line under `## [Unreleased]`:

```markdown
## [Unreleased]

- Docs: release process guide added
```

---

## Step 2 — Run CI checks locally

Catch problems before pushing. Run the same steps the CI workflow runs:

```bash
# 1. Make sure deps are in sync
pnpm install --frozen-lockfile

# 2. Build everything
pnpm build

# 3. Run tests
pnpm --filter @clarxai/engine test

# 4. Typecheck
pnpm --filter @clarxai/engine typecheck
pnpm --filter @clarxai/cli typecheck

# 5. Dogfood score (same as CI gate)
node packages/cli/dist/cli.js score . --min-score 80
```

All five should pass cleanly. If any fail, fix before pushing.

---

## Step 3 — Push a branch and open a PR

```bash
git checkout -b practice/release-walkthrough
git add CHANGELOG.md
git commit -m "docs: add release practice guide"
git push origin practice/release-walkthrough
```

Then open a PR on GitHub against `main`. Watch the **CI** workflow appear under the PR checks. It will run:

- Install → Build → Test → Typecheck → Score

The PR should go green within ~2 minutes. If it goes red, click the failing step to read the logs — same logs you'd see locally.

---

## Step 4 — Merge to main

Once CI is green, merge the PR. The CI workflow runs again on `main` after merge — this is expected and normal. Main should always stay green.

---

## Step 5 — Bump versions and tag

This is the release step. Bump the version in both package files to match what you're shipping.

For a practice run, bump patch: `0.1.0` → `0.1.1`.

**`packages/engine/package.json`** — change `"version"` to `"0.1.1"`

**`packages/cli/package.json`** — change `"version"` to `"0.1.1"`

Move the `[Unreleased]` entries into a new versioned block in `CHANGELOG.md`:

```markdown
## [Unreleased]

## [0.1.1] - 2026-05-01
### Added
- Docs: release process guide
```

Commit, tag, and push:

```bash
git add packages/engine/package.json packages/cli/package.json CHANGELOG.md
git commit -m "chore: release v0.1.1"
git tag v0.1.1
git push origin main
git push origin v0.1.1
```

The `git push origin v0.1.1` is what triggers the **Release** workflow.

---

## Step 6 — Watch the release workflow

Go to GitHub → Actions → Release. You'll see:

```
✓ Install dependencies
✓ Build
✓ Test
✓ Publish @clarxai/engine
✓ Publish @clarxai/cli
✓ Create GitHub release
```

If the publish steps fail with 401, the `NPM_TOKEN` secret is wrong or expired — re-check it.

---

## Step 7 — Verify on npm

Once the workflow completes:

```bash
# Check the published versions
npm view @clarxai/engine version
npm view @clarxai/cli version

# Install and run the published CLI against a test repo
npx @clarxai/cli@0.1.1 score .
```

If `npx` runs and scores correctly, the release is good.

---

## What can go wrong

| Problem | Symptom | Fix |
|---------|---------|-----|
| Lockfile out of sync | `--frozen-lockfile` fails | Run `pnpm install`, commit `pnpm-lock.yaml` |
| Engine not built before CLI typecheck | `Cannot find module '@clarxai/engine'` | Run `pnpm build` first |
| NPM token expired | Publish step exits 401 | Rotate token, update GitHub secret |
| Version not bumped | npm rejects with 403 "cannot publish over existing version" | Bump both package.json versions |
| Tag already exists | `git tag` errors | Pick a different patch version or delete the local tag with `git tag -d v0.x.x` |
| Score drops below 80 | Dogfood step fails in CI | Fix the rule violation before merging |

---

## Quick reference

```bash
# Local CI check
pnpm install --frozen-lockfile && pnpm build && pnpm --filter @clarxai/engine test

# Ship a release
git tag v0.X.Y && git push origin main && git push origin v0.X.Y

# Verify published
npm view @clarxai/engine version && npm view @clarxai/cli version
```
