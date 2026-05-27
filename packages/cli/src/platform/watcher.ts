import { watch } from 'node:fs';

export function createRecursiveWatcher(
  root: string,
  onChange: (filename: string) => void,
) {
  return watch(root, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    if (/node_modules|[/\\]dist[/\\]|\.git|\.next/.test(filename)) return;
    onChange(filename);
  });
}
