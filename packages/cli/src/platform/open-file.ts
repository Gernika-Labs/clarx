import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

export function openFile(root: string, relativePath: string): boolean {
  const fullPath = join(root, relativePath);
  const editor = process.env.EDITOR ?? process.env.VISUAL ?? (process.platform === 'win32' ? 'notepad' : 'nano');

  try {
    const result = spawnSync(editor, [fullPath], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    return result.status === 0 || result.status === null;
  } catch {
    return false;
  }
}