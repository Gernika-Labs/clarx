import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Manifest } from './types.js';

const DEFAULT_MANIFEST_PATH = 'clarx-manifest.json';

export async function loadManifest(root: string, manifestPath?: string): Promise<Manifest | null> {
  const target = resolve(root, manifestPath ?? DEFAULT_MANIFEST_PATH);
  try {
    const raw = await readFile(target, 'utf-8');
    return JSON.parse(raw) as Manifest;
  } catch {
    return null;
  }
}
