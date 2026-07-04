import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Manifest } from './types.js';

const DEFAULT_MANIFEST_PATH = 'clarx-manifest.json';

const KNOWN_KEYS = new Set<string>([
  'version', 'generated', 'workspaces', 'highFanIn', 'highFanOut',
  'verificationCommands', 'commonTasks', 'thresholds',
]);

export type ManifestLoadResult = {
  manifest: Manifest | null;
  unknownKeys: string[];
};

export async function loadManifest(root: string, manifestPath?: string): Promise<ManifestLoadResult> {
  const target = resolve(root, manifestPath ?? DEFAULT_MANIFEST_PATH);
  try {
    const raw = await readFile(target, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const unknownKeys = Object.keys(parsed).filter(k => !KNOWN_KEYS.has(k));
    return { manifest: parsed as Manifest, unknownKeys };
  } catch {
    return { manifest: null, unknownKeys: [] };
  }
}
