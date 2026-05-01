#!/usr/bin/env node
import blessed from 'blessed';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ── Strip ANSI escape codes for clipboard copy ────────────────────────────────
const ANSI_RE = /\x1b\[[0-9;]*[a-zA-Z]|\x1b\][^\x07]*\x07|\x1b[^[]/g;
function strip(s) { return s.replace(ANSI_RE, ''); }

function copyToClipboard(text) {
  const plain = strip(text);
  if (process.platform === 'darwin') {
    spawnSync('pbcopy', [], { input: plain });
  } else if (process.platform === 'win32') {
    spawnSync('clip', [], { input: plain, shell: true });
  } else {
    const r = spawnSync('xclip', ['-selection', 'clipboard'], { input: plain });
    if (r.status !== 0) spawnSync('xsel', ['--clipboard', '--input'], { input: plain });
  }
}

// ── Screen ────────────────────────────────────────────────────────────────────
const screen = blessed.screen({ smartCSR: true, title: 'Clarx Dev', fullUnicode: true });

// ── Panel factory ─────────────────────────────────────────────────────────────
function makePanel(label, region) {
  return blessed.log({
    label: ` ${label} `,
    border: { type: 'line' },
    scrollable: true,
    alwaysScroll: true,
    scrollbar: { ch: '│', style: { fg: 'cyan' } },
    keys: true,
    vi: true,
    mouse: true,
    tags: false,
    style: {
      border: { fg: 'blue' },
      label: { fg: 'white', bold: true },
      focus: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
    },
    ...region,
  });
}

// ── Layout: left column (Engine + CLI) | right column (Docs) ─────────────────
const enginePanel = makePanel('Engine  tsc --watch', { top: 0,    left: 0,    width: '34%', height: '50%' });
const cliPanel    = makePanel('CLI  tsc --watch',    { top: '50%', left: 0,    width: '34%', height: '50%' });
const docsPanel   = makePanel('Docs  next dev',      { top: 0,    left: '34%', width: '66%', height: '100%-1' });

const statusBar = blessed.box({
  bottom: 0, left: 0, width: '100%', height: 1,
  content: '  Tab: focus panel   c: copy panel   q / Ctrl+C: quit',
  style: { bg: 'blue', fg: 'white' },
});

screen.append(enginePanel);
screen.append(cliPanel);
screen.append(docsPanel);
screen.append(statusBar);

// ── Focus cycling ─────────────────────────────────────────────────────────────
const panels = [enginePanel, cliPanel, docsPanel];
let focused = 0;

function setFocus(i) {
  focused = i;
  panels[i].focus();
  screen.render();
}
setFocus(0);

screen.key('tab', () => setFocus((focused + 1) % panels.length));

// ── Copy focused panel buffer to clipboard ────────────────────────────────────
// Keep a plain-text buffer per panel so copy always works
const buffers = [[], [], []];

function appendLine(idx, line) {
  buffers[idx].push(line);
  if (buffers[idx].length > 2000) buffers[idx].shift();
}

screen.key('c', () => {
  const text = buffers[focused].join('\n');
  copyToClipboard(text);
  const panel = panels[focused];
  const savedLabel = panel.options.label;
  panel.setLabel(' ✓ copied ');
  screen.render();
  setTimeout(() => { panel.setLabel(savedLabel); screen.render(); }, 1200);
});

// ── Quit ──────────────────────────────────────────────────────────────────────
screen.key(['q', 'C-c'], () => {
  procs.forEach(p => p.kill());
  process.exit(0);
});

// ── Spawn processes ───────────────────────────────────────────────────────────
const commands = [
  { panel: enginePanel, idx: 0, cmd: 'pnpm', args: ['--filter', '@clarxai/engine', 'dev'] },
  { panel: cliPanel,    idx: 1, cmd: 'pnpm', args: ['--filter', '@clarxai/cli', 'dev']    },
  { panel: docsPanel,   idx: 2, cmd: 'pnpm', args: ['--filter', 'docs', 'dev']             },
];

const procs = commands.map(({ panel, idx, cmd, args }) => {
  const proc = spawn(cmd, args, { cwd: root, env: { ...process.env, FORCE_COLOR: '1' } });

  function feed(chunk) {
    const lines = chunk.toString().split(/\r?\n/);
    for (const line of lines) {
      if (line) {
        appendLine(idx, line);
        panel.log(line);
      }
    }
    screen.render();
  }

  proc.stdout.on('data', feed);
  proc.stderr.on('data', feed);

  proc.on('exit', (code) => {
    const msg = `\n[process exited with code ${code}]\n`;
    appendLine(idx, msg);
    panel.log(msg);
    screen.render();
  });

  return proc;
});

screen.render();
