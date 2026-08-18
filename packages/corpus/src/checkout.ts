import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import type { CorpusRepo } from './types.js';

export interface Checkout {
  root: string;
  sha: string | null;
  /** Count of git-tracked paths. Zero means rule behaviour is silently degraded. */
  gitTrackedFiles: number;
}

export class SkippedRepo extends Error {}

function git(args: string[], cwd: string): { ok: boolean; stdout: string; stderr: string } {
  const r = spawnSync('git', args, { cwd, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0 && !r.error, stdout: r.stdout ?? '', stderr: r.stderr ?? String(r.error ?? '') };
}

/**
 * Materialize a corpus entry and return its root.
 *
 * Every path here produces a real git checkout on purpose. `analyze()` calls
 * `getGitTrackedPaths()`, which shells out to `git ls-files` — a tree without a
 * `.git` directory silently returns an empty set and scores differently. That
 * failure is invisible in the output, so it is asserted here instead.
 */
export async function checkout(repo: CorpusRepo, cacheDir: string): Promise<Checkout> {
  const src = repo.source;

  if (src.kind === 'local') {
    const root = resolve(src.path);
    if (!existsSync(root)) {
      throw new SkippedRepo(`local path not present: ${root}`);
    }
    return { root, sha: null, gitTrackedFiles: countTracked(root) };
  }

  const root = join(cacheDir, repo.id);

  if (src.kind === 'fixture') {
    // Rebuilt every run: fixtures are defined in code, so the tree must never
    // drift from the definition.
    await rm(root, { recursive: true, force: true });
    await mkdir(root, { recursive: true });
    for (const [rel, content] of Object.entries(src.files)) {
      const abs = join(root, rel);
      await mkdir(dirname(abs), { recursive: true });
      await writeFile(abs, content, 'utf-8');
    }
    initFixtureRepo(root);
    return { root, sha: null, gitTrackedFiles: countTracked(root) };
  }

  if (!existsSync(join(root, '.git'))) {
    await mkdir(root, { recursive: true });
    if (!git(['init', '--quiet'], root).ok) throw new Error(`git init failed for ${repo.id}`);
    git(['remote', 'add', 'origin', src.url], root);
  }

  const head = git(['rev-parse', 'HEAD'], root);
  if (!head.ok || head.stdout.trim() !== src.sha) {
    // Fetch exactly the pinned commit at depth 1 — no history, no other refs.
    // GitHub allows fetching a SHA directly; if a host does not, this is where
    // it fails loudly rather than silently scoring the wrong tree.
    const fetched = git(['fetch', '--depth', '1', '--quiet', 'origin', src.sha], root);
    if (!fetched.ok) {
      throw new Error(`could not fetch ${src.sha} from ${src.url}: ${fetched.stderr.trim()}`);
    }
    const checkedOut = git(['checkout', '--quiet', '--force', src.sha], root);
    if (!checkedOut.ok) {
      throw new Error(`could not check out ${src.sha}: ${checkedOut.stderr.trim()}`);
    }
    git(['clean', '-qfdx'], root);
  }

  return { root, sha: src.sha, gitTrackedFiles: countTracked(root) };
}

function initFixtureRepo(root: string): void {
  git(['init', '--quiet'], root);
  git(['add', '-A'], root);
  // Identity is passed per-command so the harness never depends on, or writes
  // to, the machine's global git config.
  git([
    '-c', 'user.email=corpus@clarx.local',
    '-c', 'user.name=Clarx Corpus',
    '-c', 'commit.gpgsign=false',
    'commit', '--quiet', '-m', 'fixture',
  ], root);
}

function countTracked(root: string): number {
  const r = git(['ls-files'], root);
  if (!r.ok) return 0;
  return r.stdout.split('\n').filter(Boolean).length;
}
