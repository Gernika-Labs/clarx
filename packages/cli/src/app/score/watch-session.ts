import * as readline from 'node:readline';
import type { AnalysisResult } from '@clarxai/engine';
import { dispatchScoreCommand, type ScoreCommandDispatchDeps } from './command-dispatch.js';
import { parseScoreCommand } from './command-parser.js';
import type { ScoreOptions } from './types.js';
import { createRecursiveWatcher } from '../../platform/watcher.js';
import { clearScreen } from '../../platform/terminal.js';

export interface WatchSessionDeps extends ScoreCommandDispatchDeps {
  runScan: (opts: ScoreOptions) => Promise<{ result: AnalysisResult; code: number }>;
  showFooter: (result: AnalysisResult, watching: boolean) => void;
  promptPrefix: string;
  isTTY: boolean;
  onStop?: () => void;
  dim: (text: string) => string;
}

export async function startWatchSession(opts: ScoreOptions, deps: WatchSessionDeps): Promise<void> {
  let rl: readline.Interface | null = null;
  let debounce: ReturnType<typeof setTimeout> | null = null;

  const prompt = () => process.stdout.write(deps.promptPrefix);

  const closePrompt = () => {
    if (rl) {
      rl.close();
      rl = null;
    }
  };

  const openPrompt = (result: AnalysisResult, render: () => void) => {
    if (!deps.isTTY) return;
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    prompt();

    rl.on('line', input => {
      const command = parseScoreCommand(input);
      const dispatched = dispatchScoreCommand(result, command, deps);

      if (dispatched.refresh) {
        closePrompt();
        render();
        return;
      }

      for (const line of dispatched.lines) {
        console.log(line);
      }
      prompt();
    });
  };

  const render = async (changedFile?: string) => {
    closePrompt();

    if (changedFile) {
      clearScreen();
      console.log(`\n  ${deps.dim(`↺  ${changedFile} changed — re-analyzing…`)}\n`);
    }

    const { result } = await deps.runScan(opts);
    deps.showFooter(result, true);
    openPrompt(result, () => void render());
  };

  const watcher = createRecursiveWatcher(opts.root, filename => {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => void render(filename), 400);
  });

  process.on('SIGINT', () => {
    closePrompt();
    watcher.close();
    deps.onStop?.();
    process.exit(0);
  });

  await render();
}
