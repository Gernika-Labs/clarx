#!/usr/bin/env node
import { argv, exit } from 'node:process';
import { scoreCommand } from './commands/score.js';
import { initCommand } from './commands/init.js';
import { explainCommand } from './commands/explain.js';
import { telemetryCommand } from './commands/telemetry.js';

const [, , command, ...args] = argv;

async function main() {
  switch (command) {
    case 'score':
      await scoreCommand(args);
      break;
    case 'init':
      await initCommand(args);
      break;
    case 'explain':
      await explainCommand(args);
      break;
    case 'telemetry':
      await telemetryCommand(args);
      break;
    case undefined:
    case '--help':
    case '-h':
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      exit(3);
  }
}

function printHelp() {
  console.log(`
clarx — AI-First Codebase Standard v0.1

Usage:
  clarx score [path] [options]    Score a codebase
  clarx init [path]               Generate a starter clarx-manifest.json
  clarx explain <rule-id> [--copy] Explain a rule and optionally copy the fix to clipboard
  clarx telemetry [on|off|status]  Manage anonymous usage telemetry

Options for score:
  --format text|json|markdown     Output format (default: text)
  --ui text|ink                   UI mode for interactive terminal output (default: ink in TTY, text otherwise)
  --watch, -w                     Re-run on file changes
  --min-score <n>                 Exit 1 if score is below n
  --min-pillar-score <n>          Exit 1 if any pillar score is below n
  --ignore <globs>                Comma-separated glob patterns to exclude
  --verbose                       Include passing rules in output
  --copy-all                      Copy all failing rules and fixes to clipboard

Examples:
  clarx score
  clarx score ./my-repo --min-score 70
  clarx score --format json > report.json
  clarx init
  clarx explain O1
`);
}

main().catch(err => {
  console.error(err);
  exit(3);
});
