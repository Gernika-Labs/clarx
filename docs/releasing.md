# Releasing

Clarx uses two GitHub Actions workflows and git tags to manage CI and publishing.

---

## Workflows

### CI (`ci.yml`)

Runs on every push to `main` and every pull request targeting `main`.

**Steps:**
1. Install dependencies with `pnpm install --frozen-lockfile` — fails fast if the lockfile is out of sync
2. Build all packages via `turbo build` (engine builds before CLI due to `dependsOn`)
3. Run 81 engine unit and integration tests
4. Typecheck `@clarxai/engine` and `@clarxai/cli`
5. **Dogfood** — runs `clarx score . --min-score 80` on the repo itself; CI fails if the project's own score drops below 80

The dogfood step means every PR is a self-check: if a rule change causes the Clarx repo to regress, the PR won't merge.

### Release (`release.yml`)

Runs when a `v*` tag is pushed (e.g. `v0.1.0`, `v1.2.3`).

**Steps:**
1. Same install + build + test gates as CI
2. Publishes `@clarxai/engine` to npm
3. Publishes `@clarxai/cli` to npm
4. Creates a GitHub release with auto-generated release notes from commit history

**Required secret:** `NPM_TOKEN` must be set in GitHub repo Settings → Secrets → Actions.
It is a granular npm access token scoped to `@clarxai` with read/write package permissions.
The token expires every 90 days — rotate it before expiry or releases will silently fail.

---

## Shipping a release

```bash
# 1. Make sure main is clean and tests pass
pnpm install
pnpm build
pnpm --filter @clarxai/engine test

# 2. Bump versions in both package.json files
#    packages/engine/package.json
#    packages/cli/package.json

# 3. Update CHANGELOG.md (see below)

# 4. Commit the version bump
git add packages/engine/package.json packages/cli/package.json CHANGELOG.md
git commit -m "chore: release v0.2.0"

# 5. Tag and push — this triggers the release workflow
git tag v0.2.0
git push origin main
git push origin v0.2.0
```

The release workflow publishes both packages and creates the GitHub release automatically.

---

## Versioning

Clarx follows [Semantic Versioning](https://semver.org):

| Change | Version bump |
|--------|-------------|
| New rule, new command, new component | Minor (`0.1.0` → `0.2.0`) |
| Bug fix, doc update, test addition | Patch (`0.1.0` → `0.1.1`) |
| Breaking change to engine output schema or standard spec | Major (`0.x.x` → `1.0.0`) |

Both `@clarxai/engine` and `@clarxai/cli` are versioned together — they always ship the same version number. A consumer pinned to `@clarxai/engine@0.2.0` can expect `@clarxai/cli@0.2.0` to match.

---

## Changelog

Keep a `CHANGELOG.md` at the repo root. Use [Keep a Changelog](https://keepachangelog.com) format.

**Why a manual changelog over auto-generated release notes?**
GitHub's auto-generated notes list every commit, which is noise for consumers who just want to know what changed in the public API or rule set. A curated changelog says "D6 rule added", not "fix: typo in D4 message".

Structure:

```markdown
# Changelog

## [Unreleased]

## [0.1.0] - 2026-04-30
### Added
- All 25 AI-First Standard rules (D1–D5, B1–B5, C1–C5, O1–O5, E1–E5)
- `clarx score` with text, JSON, and markdown output
- `clarx explain <rule>` for per-rule guidance
- `clarx init` to generate a starter manifest
- Confidence levels: high / medium / low
- Hard failure floor: B1, C1, O1 cap score at 50
```

The GitHub release notes (auto-generated from commits) complement this — they live on the GitHub releases page and are fine as a raw commit log. The changelog in the repo is the curated human summary.

---

## NPM token rotation

The `NPM_TOKEN` secret expires every 90 days. When it does, the release workflow will fail at the publish step with a 401 error.

Rotation steps:
1. Go to npmjs.com → Account → Access Tokens → New Granular Token
2. Scope: `@clarxai`, permissions: read/write, expiration: 90 days
3. Go to GitHub repo → Settings → Secrets → Actions → update `NPM_TOKEN`
