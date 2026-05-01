import { exit } from 'node:process';
import { setEnabled, getStatus } from '../utils/telemetry.js';

const isTTY  = process.stdout.isTTY;
const dim    = (s: string) => isTTY ? `\x1b[2m${s}\x1b[0m` : s;
const cyan   = (s: string) => isTTY ? `\x1b[36m${s}\x1b[0m` : s;
const green  = (s: string) => isTTY ? `\x1b[92m${s}\x1b[0m` : s;
const yellow = (s: string) => isTTY ? `\x1b[93m${s}\x1b[0m` : s;

export async function telemetryCommand(args: string[]) {
  const sub = args[0];

  if (sub === 'off') {
    await setEnabled(false);
    console.log(`\n  ${yellow('◉')}  ${dim('Telemetry disabled. No data will be sent.')}\n`);
    return;
  }

  if (sub === 'on') {
    await setEnabled(true);
    console.log(`\n  ${green('◉')}  ${dim('Telemetry enabled. Thank you for helping improve Clarx.')}\n`);
    return;
  }

  if (!sub || sub === 'status') {
    const { enabled, session } = await getStatus();
    const env = process.env['NO_CLARX_TELEMETRY'] || process.env['DO_NOT_TRACK'];
    const active = enabled && !env;

    console.log(`
  ${dim('Clarx Telemetry')}
  ${dim('─'.repeat(40))}
  Status   ${active ? green('enabled') : yellow('disabled')}${env ? dim('  (overridden by env)') : ''}
  Session  ${dim(session)}

  ${dim('What is sent:')}
  ${dim('·')} Which rules were scored, explained, or copied
  ${dim('·')} Overall score and pillar breakdown
  ${dim('·')} Stack signals (monorepo, manifest found, files scanned range)
  ${dim('·')} Anonymous session ID — never linked to you or your code

  ${dim('What is never sent:')}
  ${dim('·')} Code, file contents, file paths, or repo name
  ${dim('·')} Any identifying information

  ${dim('Commands:')}
  ${cyan('clarx telemetry off')}   ${dim('Disable telemetry')}
  ${cyan('clarx telemetry on')}    ${dim('Re-enable telemetry')}
  ${dim('Or set')} ${cyan('NO_CLARX_TELEMETRY=1')} ${dim('in your environment.')}
`);
    return;
  }

  console.error(`Unknown subcommand: ${sub}. Use: clarx telemetry [on|off|status]`);
  exit(3);
}
