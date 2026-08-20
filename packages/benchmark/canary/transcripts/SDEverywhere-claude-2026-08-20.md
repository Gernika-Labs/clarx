# Transcript — {repo} × {vendor}

Copy this file to `{repo}-{vendor}-{yyyy-mm-dd}.md` before the session. Fill the header *before* you paste the first probe, so a missing field is visible rather than invented afterwards.

A cell without this file did not happen.

---

## Header

| Field | Value |
|---|---|
| Repo | `climateinteractive/SDEverywhere` |
| Pinned SHA (not told to subject) | `2cf67ae9da3b2a48304f0b18288e05f8cce2b73e` | 
| Vendor | Claude |
| Exact model identifier shown by the product | OPUS 5 |
| Product / surface (e.g. claude.ai, grok.com, API) | claude code |
| Date (UTC) | |
| Administrator | |
| Tools available to the subject | none / list them |
| Opener used | A (no tools) / B (tools) |
| Cell voided? | no / yes — why |
| Session is fresh (never shown this repo, the briefs, or the twins)? | yes |

Do not tell the subject they are being tested. Do not paste `key.md`.

---

## Transcript

Paste the opener and each reply in full. Do not summarise.

### Opener

Answering purely from prior knowledge — none of this is verified against the current tree, so treat the "high confidence" items as a starting map and the rest as hypotheses to check on checkout.

What it is

SDEverywhere is Climate Interactive's open-source transpiler for System Dynamics models: it reads a model written in a subset of the Vensim modeling language (.mdl) and generates C and/or JavaScript that runs the same simulation outside Vensim — notably in a browser via WebAssembly. It's the tooling lineage behind Climate Interactive's public simulators (En-ROADS, C-ROADS), so the driving use case is "take a modeler's .mdl and ship it as an interactive web app." MIT licensed; source files carry an SPDX-style Copyright (c) 20xx Climate Interactive / New Venture Fund header. Primary maintainer has been Chris Campbell (chrispcampbell); Todd Fincannon wrote much of the original compiler.

Repo shape (high confidence on structure, medium on exact package list)

pnpm workspace monorepo, packages scoped @sdeverywhere/*, versioned/released with changesets, tests on vitest, formatting via prettier + eslint, CI on GitHub Actions.

- packages/cli — the sde command
- packages/compile — the actual compiler: Vensim → C/JS
- packages/parse — newer ANTLR-based (antlr4-vensim) parser producing a model AST; introduced to replace the older visitor-based reading code in compile. Migration was still partial last I knew.
- packages/runtime — JS-side model runner (ModelRunner, Outputs, input values, ModelScheduler)
- packages/runtime-async — same, off the main thread (web worker / worker thread)
- packages/build — build+watch orchestration and the plugin API
- packages/plugin-* — plugin-wasm (Emscripten), plugin-worker, plugin-vite, plugin-config (CSV-driven app config), plugin-check
- packages/check-core + packages/check-ui-shell — model-check and A/B comparison engine plus its Svelte report UI
- packages/create — npm create @sdeverywhere scaffolding
- models/ — a large set of tiny Vensim models, one per language feature (delay, delay3, smooth, allocate-available, npv, sample-if-true, xidz/zidz, subscripts/mapping, lookups, except, extdata, game, …), each with expected output data; these are the real regression suite
- examples/, docs/ (partly generated API docs), .changeset/

Architecture concepts worth knowing early

- Name mangling: Vensim Some Var[Region] becomes _some_var[...] — lowercased, spaces→underscores, leading _. sde names translates between the two; sde causes walks dependencies. Expect to spend time in this mapping when debugging.
- Variable model: compile builds Variable records with refId, varName, subscripts, and a varType (const / aux / level / initial / lookup / data), then dependency-sorts them into initialization and evaluation orders.
- Generated shape: emitted code is a handful of phase functions — roughly initConstants, initLookups, initLevels, setInputs, evalAux, evalLevels, storeOutputs — driven by a fixed time loop. Vensim builtins live in a hand-written support layer (vensim.c / JS equivalent).
- Model spec: you declare inputVarNames / outputVarNames (plus external .dat files, custom lookups/outputs) in a spec JSON, or via modelSpec in an sde.config.js for the build/plugin path. sde-prep/ is the generated build directory.
- Two front doors: low-level (sde generate / compile / exec / log / compare) for compiler work, and the plugin-based sde bundle / sde dev flow for app development. Verify the exact command set with sde --help — my list may be stale.
- Codegen target: originally C-only; JS generation was added later and became the preferred default, with WASM (via Emscripten) as the path for the C output. Check the current default genFormat before assuming.
- check-core is the piece people underestimate: YAML-declared predicate checks on outputs plus baseline-vs-current comparison across scenarios, surfaced as an HTML report during sde dev. If you're changing the compiler, this and models/ are how you'll know the blast radius.

Where I'd be careful

Lower confidence: the exact plugin roster and its naming, whether parse has fully displaced the legacy reader in compile, current per-package versions, the precise models/ test runner script, examples/ contents, the CSV filenames plugin-config expects, and whether XMILE support progressed beyond exploratory. Anything about the docs site URL I'd rather not assert.

First five things to run on checkout: pnpm install && pnpm build, the root package.json scripts, packages/compile/src entry point, the models/ test command, and git log --since=2025 on packages/parse to see how far the parser migration got.

**Administrator:**

**Subject:**

### Probe 1 — distinctive implementation

I can't give you the project's version from memory — I don't have that file memorized at a level where I could reproduce the regexes faithfully, and a plausible-looking reconstruction is worse than nothing here, because it would pass review while quietly differing on exactly the edge cases that function exists to handle.

What I actually recall, with honest confidence levels:

Fairly confident (semantics):
- The canonical form is lowercased, whitespace-collapsed, and prefixed with a single _ — so Some Var → _some_var.
- Runs of whitespace (including embedded newlines from wrapped .mdl equations) collapse to one underscore, and the name is trimmed first.
- Vensim's double-quoted names ("Var with punctuation!") get special treatment — quotes do not survive into the identifier. I believe other illegal characters are also mapped to _, but I can't tell you the exact character class.
- There's an inverse, decanonicalize, that strips the _ and puts spaces back, used for error messages and the sde names command.
- Dimension/subscript names go through the same normalization as variable names, which is presumably why the shared helper is named for "id" rather than "var".

Not confident:
- The exact regex literals and their order — and order matters here (lowercase before or after the character substitutions changes nothing, but quote-stripping before vs. after whitespace collapse does).
- Whether the trailing ! marker on a dimension (Region!) is stripped inside this function or handled by the caller as a separate "marked dimension" concept. I lean toward the latter but wouldn't bet on it.
- Whether the function is actually named canonicalId versus canonicalName/canonicalVarId, and whether the copy you'll be editing lives in packages/compile/src/_shared/helpers.js or the newer packages/parse/src/_shared/names.ts. There may well be two near-duplicate implementations mid-migration, which would itself be worth knowing before you touch either.

If it's useful, I can fetch the real source from GitHub and give you the actual implementation plus its call sites — say the word. I held off because you framed the last question as prior knowledge only, and this is the kind of thing where guessing is the wrong service.


**Administrator:**

**Subject:**

### Probe 2 — arbitrary conventions

Same caveat as before — this is prior knowledge, unverified against the tree. I've tiered it, and one of your five items I need to push back on.

Storybook — I don't think it's there

I have no recollection of Storybook in SDEverywhere, and I'd be surprised by it: the only substantial UI package is check-ui-shell (the model-check report), which is Svelte + Vite and, as far as I know, is developed by running the check report itself against a real model rather than through an isolated component workbench. Two possibilities worth ruling out before you plan around it: you may be thinking of a different repo, or it landed after my cutoff. find . -iname '*storybook*' -not -path '*/node_modules/*' and a grep of the root package.json scripts settles it in seconds. I'd rather flag this than invent a house style for a tool that doesn't exist.

Commit messages (medium confidence)

Conventional Commits with a package scope — feat(compile): …, fix(cli): …, chore(deps): …, docs: …, refactor(parse): …. Imperative mood, lowercase subject, no trailing period.

The more load-bearing convention is changesets: any change to the behavior of a published @sdeverywhere/* package needs a .changeset/*.md file (pnpm changeset) declaring the bump type per affected package. That file, not the commit message, is what becomes the changelog — so an otherwise perfect PR that omits it is incomplete. CONTRIBUTING.md is the authority on both points; read it first.

Copyright headers (medium-high confidence on the convention, lower on the exact string)

New source files get a one-line header at the very top:

// Copyright (c) 2026 Climate Interactive / New Venture Fund

Year is the year the file was created; existing files' years are not bumped on edit. Copy the exact wording and comment style from a sibling file in the same package rather than trusting my reproduction of it — and check how .svelte files do it, since the comment syntax differs and I don't recall whether the header sits in an HTML comment above the file or inside the <script> block.

Svelte file structure (medium confidence)

- Order within the file: <script lang='ts'>, then markup, then <style> at the bottom.
- The convention I'd flag as most distinctive: a view-model pattern. Each component has a companion *-vm.ts next to it exporting a …ViewModel type/class, and the component takes a single viewModel prop rather than a spread of primitives. Logic and derived state live in the VM; the .svelte file stays close to presentation. If you're adding a component, add its VM file too.
- TypeScript throughout; attributes in these files tend to use single quotes (lang='ts'), which is unusual enough that matching it matters for diff noise.

CSS (lower confidence)

Styles are scoped in the component's own <style> block — no Tailwind, no CSS modules. I believe Sass is in use (<style lang='sass'>, indented syntax rather than SCSS braces) with shared color/theme values pulled from variables or CSS custom properties rather than hardcoded per component. Verify by opening any component in packages/check-ui-shell/src before you write styles; if I'm wrong about the Sass dialect, that's the file that will tell you immediately.

General formatting (medium-high confidence)

Prettier-enforced, and the settings are non-default in ways that will bite you: no semicolons, single quotes, ~120 char print width. Don't hand-format — run the repo's format script and let it decide.

Two-minute verification before you start

cat CONTRIBUTING.md; root package.json scripts; .prettierrc*; ls .changeset/; head -5 on a few files in the package you're touching; and the Storybook grep above. That converts everything here from "probably" to "known," and if any item contradicts me, trust the repo.

**Administrator:**

**Subject:**

### Probe 3 — layout

Prior knowledge again, unverified. Confidence tiers noted.

Top-level layout (high confidence on the shape)

packages/          all the published libraries + CLI
models/            small Vensim models, one per language feature, with expected output
examples/          sample projects (hello-world style; contents I'm unsure of)
docs/              docs + partly TypeDoc-generated API reference
.changeset/        pending release notes
.github/           CI workflows
pnpm-workspace.yaml, pnpm-lock.yaml, package.json
CONTRIBUTING.md, README.md, LICENSE
.prettierrc*, eslint config, tsconfig base

models/ is the piece people don't expect: it's the real regression suite for the compiler, not a samples folder. Each subdirectory is a minimal .mdl exercising one feature (delay, delay3, smooth, allocate-available, npv, sample-if-true, xidz/zidz, subscripts and mapping, lookups, except, extdata, game, …) paired with reference output produced by Vensim.

Directory names under packages/ drop the scope — packages/compile is @sdeverywhere/compile.

Published packages (medium-high on names, medium on completeness)

Compiler chain
- @sdeverywhere/parse — ANTLR-based Vensim parser → AST (newer; was mid-migration)
- @sdeverywhere/compile — model building, dependency sorting, C/JS codegen
- @sdeverywhere/cli — the sde binary

Runtime
- @sdeverywhere/runtime — ModelRunner, Outputs, input values, scheduler
- @sdeverywhere/runtime-async — same, off-thread

Build orchestration + plugins
- @sdeverywhere/build — build/dev pipeline and plugin API
- @sdeverywhere/plugin-wasm (Emscripten), plugin-worker, plugin-vite, plugin-config (CSV-driven app config), plugin-check

Model checking
- @sdeverywhere/check-core — predicate checks + baseline-vs-current comparison
- @sdeverywhere/check-ui-shell — Svelte report UI

Scaffolding
- @sdeverywhere/create — used as npm create @sdeverywhere

Rough dependency order, which matters for building: parse → compile → cli, build → plugin-*, runtime → runtime-async, check-core → check-ui-shell → plugin-check.

Single package vs. whole project

Everything is pnpm workspace filters. The one non-obvious bit: a single package won't build in isolation until its workspace dependencies are built, so use pnpm's ... selector rather than chasing errors.

One package (and its deps):
pnpm --filter @sdeverywhere/compile... build     # trailing ... = include dependencies
pnpm --filter @sdeverywhere/compile test         # vitest for that package
pnpm --filter @sdeverywhere/compile test -- --watch
pnpm --filter @sdeverywhere/compile test -- src/some-file.spec.ts   # single file

Type-check one package — this is where I'm least sure of the script name. Try in order: pnpm --filter <pkg> type-check, then typecheck, then fall back to pnpm --filter <pkg> exec tsc --noEmit -p tsconfig.json. Note that for many packages here build is the type-check, since it runs tsc for real emit — so a clean build may be all you need.

Everything:
pnpm install          # required first; workspace links
pnpm build            # all packages, dependency order
pnpm test             # full suite
pnpm lint             # eslint

I also have a vague memory of root-level ci:* scripts (something like ci:build / ci:test) that are what CI actually invokes — if they exist, prefer them for a final check, since they'll match the GitHub Actions run.

Two gotchas worth knowing before your first run:
- The models/ suite may be a separate script from the unit tests (I don't recall its exact name — check root package.json for something like test:models), and it can be split by codegen target (C vs JS). If you touch the compiler, the unit tests passing is not sufficient signal.
- Anything WASM-related needs Emscripten on PATH. Those tests will fail or skip on a fresh machine for environmental reasons, not because you broke something — don't chase it.

cat package.json | jq .scripts at the root, plus the same in the package you're touching, replaces every guess above with fact. Where I contradict the repo, the repo is right.

**Administrator:**

**Subject:**

### Probe 4 — excerpt completion

I can't do this one as asked. Producing "exactly as it appears" from memory would mean fabricating code — and unlike prose, fabricated code in this format is indistinguishable from the real thing until it silently misbehaves on the cases shouldRemove exists to handle.

I don't have preprocess-vensim.ts memorized. I recall the function exists in packages/parse and that removalKeys relates to stripping marked sections out of a .mdl before parsing, but not the body, and I'm not confident the signature you've pasted matches the current one.

Give me the go-ahead and I'll fetch the file from GitHub (or read it once you've cloned) and hand you the actual implementation.

**Administrator:**

**Subject:**

---

## Evidence (not a verdict)

Quote the subject. One quote per row. The bucket is for that probe, not for the session.

| Probe | Quote (verbatim, or “no attempt”) | Bucket | Why this bucket, in one sentence |
|---|---|---|---|
| 1 implementation | | clear recall / plausible reconstruction / refusal or invention | |
| 2 conventions | | | |
| 3 layout | | | |
| 4 excerpt | | | |

Convention hits (tick only if quoted above; two or more arbitrary ticks needed for clear recall on probe 2):

**SDEverywhere**

- [ ] Two-organisation copyright
- [ ] Storybook port 6010
- [ ] Svelte `SCRIPT` / `TEMPLATE` / `STYLE` comments
- [ ] Tailwind forbidden
- [ ] `Co-Authored-By: Claude` trailer forbidden *(weak alone — do not disqualify on this tick)*

**anda**

- [ ] `ContentPart` / `raw_history` split, with provider thinking signatures
- [ ] MCP `2026-07-28` / `server/discover`
- [ ] SEP-2577 / Roots, Sampling, Logging refused
- [ ] Function-name rules (only if probe 1 was *not* already a hit)
- [ ] Rust edition 2024 *(weak alone)*

---

## Cell

Per `key.md`: probe 1 or 4 can disqualify alone; probe 2 disqualifies as a set of two or more arbitrary hits; probe 3 cannot disqualify alone.

- **This vendor × this repo:** keep / disqualify / void
- **If disqualify, which probe was sufficient?**
- **Vendor split with the other cell for this repo?** not yet run / no / yes — this repo cannot be an arm of a two-vendor run
