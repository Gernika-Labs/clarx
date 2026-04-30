import { resolve, join } from 'node:path';
import { writeFile, readdir, access } from 'node:fs/promises';

const COMMON_GENERATED = [
  '**/.next',
  '**/dist',
  '**/build',
  '**/.source',
  '**/coverage',
  '**/node_modules',
];

export async function initCommand(args: string[]) {
  const pathArg = args.find(a => !a.startsWith('--')) ?? '.';
  const root = resolve(pathArg);
  const dryRun = args.includes('--dry-run');
  const overwrite = args.includes('--overwrite');

  const manifestPath = join(root, 'clarx-manifest.json');

  if (!overwrite) {
    try {
      await access(manifestPath);
      console.error('clarx-manifest.json already exists. Use --overwrite to replace it.');
      return;
    } catch {
      // file doesn't exist, proceed
    }
  }

  const workspaces = await detectWorkspaces(root);
  const generated = await detectGenerated(root);

  const manifest = {
    version: '0.1',
    generated: [...new Set([...COMMON_GENERATED, ...generated])],
    workspaces: workspaces.length > 0 ? Object.fromEntries(workspaces.map(w => [w, ''])) : undefined,
    verificationCommands: {
      typecheck: 'pnpm typecheck',
      test: 'pnpm test',
      lint: 'pnpm lint',
    },
    commonTasks: {},
  };

  const output = JSON.stringify(manifest, null, 2);

  if (dryRun) {
    console.log('Would write clarx-manifest.json:');
    console.log(output);
    return;
  }

  await writeFile(manifestPath, output + '\n', 'utf-8');
  console.log('Created clarx-manifest.json');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Add one-line purpose statements to the workspaces field');
  console.log('  2. Update verificationCommands to match your actual scripts');
  console.log('  3. Add entries to commonTasks for your most frequent change types');
  console.log('  4. Run `clarx score` to check your current score');
}

async function detectWorkspaces(root: string): Promise<string[]> {
  try {
    const entries = await readdir(root, { withFileTypes: true });
    const workspaceDirs = ['packages', 'apps', 'libs', 'services'];
    const result: string[] = [];
    for (const entry of entries) {
      if (entry.isDirectory() && workspaceDirs.includes(entry.name)) {
        const sub = await readdir(join(root, entry.name), { withFileTypes: true });
        for (const s of sub) {
          if (s.isDirectory()) result.push(`${entry.name}/${s.name}`);
        }
      }
    }
    return result;
  } catch {
    return [];
  }
}

async function detectGenerated(root: string): Promise<string[]> {
  const generated: string[] = [];
  try {
    const entries = await readdir(root, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name === '.next') generated.push('.next');
      if (entry.isDirectory() && entry.name === 'dist') generated.push('dist');
      if (entry.isDirectory() && entry.name === '.source') generated.push('.source');
    }
  } catch {}
  return generated;
}
