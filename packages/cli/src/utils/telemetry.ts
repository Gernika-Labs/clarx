import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { getCliVersion } from './version.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const _version = getCliVersion();

const CONFIG_DIR  = join(homedir(), '.clarx');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');
const ENDPOINT    = 'https://telemetry.clarx.ai/v1/event';
const TIMEOUT_MS  = 2500;

interface Config {
  session:   string;
  telemetry: boolean;
  disclosed: boolean;
}

let _cache: Config | null = null;

async function load(): Promise<Config> {
  if (_cache) return _cache;
  try {
    const raw = await readFile(CONFIG_PATH, 'utf-8');
    _cache = JSON.parse(raw) as Config;
  } catch {
    _cache = { session: randomUUID(), telemetry: true, disclosed: false };
  }
  return _cache;
}

async function save(config: Config): Promise<void> {
  try {
    await mkdir(CONFIG_DIR, { recursive: true });
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    _cache = config;
  } catch { /* ignore */ }
}

export async function isEnabled(): Promise<boolean> {
  if (process.env['NO_CLARX_TELEMETRY'] || process.env['DO_NOT_TRACK']) return false;
  return (await load()).telemetry;
}

export async function setEnabled(on: boolean): Promise<void> {
  const config = await load();
  config.telemetry = on;
  config.disclosed = true;
  await save(config);
}

export async function getStatus(): Promise<{ enabled: boolean; session: string }> {
  const config = await load();
  return { enabled: config.telemetry, session: config.session };
}

const isTTY = process.stdout.isTTY;
const dim    = (s: string) => isTTY ? `\x1b[2m${s}\x1b[0m` : s;
const cyan   = (s: string) => isTTY ? `\x1b[36m${s}\x1b[0m` : s;
const divider = dim('─'.repeat(52));

export async function showDisclosureIfNeeded(): Promise<void> {
  const config = await load();
  if (config.disclosed) return;

  console.log(`
  ${divider}
  ${cyan('Clarx')} ${dim('collects anonymous usage signals to improve rule accuracy.')}
  ${dim('No code, file paths, or identifying information is ever sent.')}
  ${dim('Signals: which rules are scored, explained, or copied + score.')}
  ${dim('To opt out at any time:')} ${cyan('clarx telemetry off')}
  ${divider}
`);

  config.disclosed = true;
  await save(config);
}

export interface TelemetryEvent {
  action:        'score' | 'explain' | 'copy' | 'copy_all' | 'copy_section' | 'show_all' | 'show_section';
  rule?:         string;
  score?:        number;
  hardFailures?: number;
  confidence?:   string;
  filesScanned?: number;
  manifestFound?: boolean;
  pillarScores?: Record<string, number>;
}

export function track(event: TelemetryEvent): void {
  // Fire-and-forget — resolve synchronously, never await in the hot path
  void (async () => {
    if (!(await isEnabled())) return;
    const { session } = await load();

    const payload = {
      session,
      version: _version,
      ts: new Date().toISOString(),
      ...event,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch { /* always silent */ } finally {
      clearTimeout(timer);
    }
  })();
}
