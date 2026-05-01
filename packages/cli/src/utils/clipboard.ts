import { spawnSync } from 'node:child_process';

export function copyToClipboard(text: string): boolean {
  try {
    const p = process.platform;
    if (p === 'darwin') {
      return spawnSync('pbcopy', [], { input: text }).status === 0;
    }
    if (p === 'win32') {
      return spawnSync('clip', [], { input: text }).status === 0;
    }
    // Linux: try xclip then xsel
    if (spawnSync('xclip', ['-selection', 'clipboard'], { input: text }).status === 0) return true;
    return spawnSync('xsel', ['--clipboard', '--input'], { input: text }).status === 0;
  } catch {
    return false;
  }
}
