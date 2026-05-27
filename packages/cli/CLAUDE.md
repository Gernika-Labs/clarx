# @clarxai/cli

Purpose: terminal interface for the Clarx engine. It owns command parsing, interactive score flows, reporter selection, and the Ink/text UI adapters.

## Generated Directories

- `dist/`
- `node_modules/`
- `.turbo/`

Do not edit generated output in `dist/`.

## Verification

- `pnpm --filter @clarxai/cli typecheck`
- `pnpm --filter @clarxai/cli test`
- `pnpm --filter @clarxai/cli build`

## Common Changes

- Add a new CLI command in `src/commands/` and wire it in `src/cli.ts`.
- Update score behavior in `src/app/score/` first, then adapt text/Ink presentation layers.
- Add or adjust machine-readable output in `src/presentation/reporters/`.

## High-Risk Files

- `src/commands/score.ts` — entrypoint tying together score command behavior and UI mode selection.
- `src/app/score/command-core.ts` — shared command semantics used by both the text watch prompt and Ink.
- `src/presentation/ink/app.ts` — default TTY experience; keep command behavior aligned with the shared score core.
