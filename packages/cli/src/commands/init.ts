import { resolve, join } from 'node:path';
import { writeFile, readdir, access } from 'node:fs/promises';

import { detect } from './init-detect.js';

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
  const detection = await detect(root);

  // verificationCommands is omitted entirely when nothing could be derived.
  // A manifest that says nothing about how to verify a change is honest; one
  // that names commands the project does not have is worse than no manifest,
  // because an agent cannot tell an invented field from a true one.
  const manifest = {
    version: '0.1',
    generated: detection.generated,
    workspaces: workspaces.length > 0 ? Object.fromEntries(workspaces.map(w => [w, ''])) : undefined,
    ...(detection.verificationCommands ? { verificationCommands: detection.verificationCommands } : {}),
    commonTasks: {},
  };

  const output = JSON.stringify(manifest, null, 2);

  if (dryRun) {
    console.log('Would write clarx-manifest.json:');
    console.log(output);
    return;
  }

  await writeFile(manifestPath, output + '\n', 'utf-8');
  console.log(`Created clarx-manifest.json (detected: ${detection.ecosystem})`);
  console.log('');
  console.log('Next steps:');
  let step = 1;
  if (workspaces.length > 0) {
    console.log(`  ${step++}. Add one-line purpose statements to the workspaces field`);
  }
  if (detection.verificationCommands) {
    console.log(`  ${step++}. Check verificationCommands — these were read from your project, not assumed`);
  } else {
    console.log(`  ${step++}. Add verificationCommands — none could be derived, so the field was left out rather than guessed`);
  }
  console.log(`  ${step++}. Add entries to commonTasks for your most frequent change types`);
  console.log(`  ${step++}. Run \`clarx score\` to check your current score`);
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
