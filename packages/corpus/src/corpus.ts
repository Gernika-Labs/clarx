import { readFile } from 'node:fs/promises';

import { FIXTURE_REPOS } from './fixtures.js';
import type { CorpusRepo } from './types.js';

const CORPUS_PATH = new URL('../corpus.json', import.meta.url);

interface CorpusFile {
  repos: CorpusRepo[];
}

/**
 * The full run list: the publishable corpus first, then fixtures and local
 * checkouts. Ordered so a failure in the published set is never buried under
 * local noise.
 */
export async function loadCorpus(): Promise<CorpusRepo[]> {
  const raw = await readFile(CORPUS_PATH, 'utf-8');
  const parsed = JSON.parse(raw) as CorpusFile;
  const repos = [...parsed.repos, ...FIXTURE_REPOS];

  const seen = new Set<string>();
  for (const repo of repos) {
    if (seen.has(repo.id)) {
      throw new Error(`duplicate corpus id: ${repo.id} — ids are snapshot filenames and must be unique`);
    }
    seen.add(repo.id);
    if (repo.source.kind === 'git' && !/^[0-9a-f]{40}$/.test(repo.source.sha)) {
      throw new Error(`${repo.id}: source.sha must be a full 40-character SHA, got "${repo.source.sha}"`);
    }
  }

  return repos;
}
