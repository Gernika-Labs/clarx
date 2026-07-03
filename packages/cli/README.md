# @clarxai/cli

Clarx CLI — score any codebase against the AI-First Standard.

## Install

```bash
npm install -g @clarxai/cli
# or
npx clarx
```

## Usage

```bash
clarx score                    # score current directory
clarx score --min-score 70     # CI gate
clarx score --ui text          # force plain text UI instead of interactive TUI
clarx init                     # generate starter manifest
clarx explain C2               # explain a rule
```

Interactive `clarx score` runs use the TUI by default when stdout is a TTY.
Use `--ui text` to force the plain text interface. Non-TTY and machine-readable runs
continue to use the plain reporter path.

See [CLI docs](../../apps/docs/content/docs/cli/) for full command reference.
