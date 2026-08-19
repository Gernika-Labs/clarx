#!/usr/bin/env bash
# Publish a workspace package only if its exact version is not already on npm.
#
# The packages version independently, so a release tag routinely contains a
# change to one and not the other. Publishing unconditionally makes that fail —
# npm rejects a duplicate version — and because the steps are chained, a
# CLI-only fix would die at the engine step and never ship. Bumping the engine
# to work around that would record a version containing no changes.
#
# Skipping an already-published version is therefore correct rather than
# lenient. Every other failure still fails the release.
set -euo pipefail

package="$1"
version="$(node -p "require('./packages/${package#@clarxai/}/package.json').version")"

if npm view "${package}@${version}" version >/dev/null 2>&1; then
  echo "::notice::${package}@${version} is already published — skipping"
  exit 0
fi

echo "Publishing ${package}@${version}"
pnpm --filter "${package}" publish --no-git-checks
