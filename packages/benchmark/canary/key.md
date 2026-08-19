# Scoring key — experimenter only

Never paste this file, or a summary of it, into a subject session.

Ground truth is the repository at the pinned SHA, not this document. If they disagree, the tree wins. Citations below were checked while drafting.

Judgement is recorded as evidence, not as a sticker. The three buckets:

- **Clear recall** — reproduces a distinctive implementation closely, or names conventions that appear nowhere but this repo. Disqualify that vendor for that repo.
- **Plausible reconstruction** — produces something idiomatic for the domain that does not match the actual code. Not evidence of memorization.
- **Refusal or invention** — no knowledge, or a confident fiction that is not even idiomatic. Keep.

A passing canary lowers the probability of contamination. It does not eliminate it.

Score **per vendor, per repo**. If Claude is clear-recall and Grok is refusal, the repo is an arm confound for a two-vendor run — it is not a keep.

---

## How to apply the buckets

Conventions are a **set**. Require two or more arbitrary hits for clear recall on probe 2. One hit is a quote in the transcript, not a disqualification.

Probe 1 and probe 4 can disqualify on their own, because a close implementation or a distinctive continuation is not something you reconstruct from the name or the prefix.

Probe 3 (layout) cannot disqualify on its own. Generic monorepo shape is not recall. Naming several project-specific packages is supporting evidence; put it in the transcript and do not let it swing the cell.

### Worked examples (do not treat these as a fourth bucket)

**Clear recall, probe 1 (SDEverywhere).** The answer leads identifiers with `_`, preserves a trailing `!` on marked dimensions (including when whitespace precedes the mark), keeps Unicode letters, replaces other special characters with `_`, collapses runs of whitespace or underscores, and lowercases. Matching three of those SDE-specific details is enough. Matching only “snake_case, lowercase” is not.

**Plausible reconstruction, probe 1 (SDEverywhere).** `toCIdentifier("Hello There")` → `hello_there` or `_hello_there`, no `!` handling, ASCII-only, maybe camelCase. The author knows what a C identifier is, not this function.

**Refusal or invention, probe 1.** “I don’t have this repository.” Or a function that hashes the name, or talks about Stella/XMILE only.

**Clear recall, probe 2 (SDEverywhere).** Two or more of: copyright line naming both organisations; Storybook port 6010; Svelte files sectioned with those HTML comments; the named CSS framework forbidden; the named commit trailer forbidden. The trailer alone does **not** count — see below.

**Plausible reconstruction, probe 2.** Copyright “Climate Interactive”; Storybook on 6006; standard `<script>` / markup / `<style>` with no section comments; Tailwind used or unmentioned; commit messages that mention issue numbers.

**Clear recall, probe 4 (SDEverywhere).** Continuation removes definitions containing `TABBED ARRAY` (and, optionally, walks `removalKeys`). The prefix does not contain that string.

**Plausible reconstruction, probe 4.** A generic “if (removalKeys?.some(...)) return true”. No `TABBED ARRAY`.

**Clear recall, probe 1 (anda).** Empty rejected; length over 64 rejected with a message that names 64; first character must be `a`–`z`; later characters only `a`–`z`, `0`–`9`, `_`, `-`. Matching the 64-byte cap **and** the start-with-lowercase rule is enough.

**Plausible reconstruction, probe 1 (anda).** “snake_case, no spaces” or a 256-character limit or “valid Rust identifier.”

**Clear recall, probe 4 (anda).** Continuation parses with `Path::parse` and falls back to `Path::from`. Reconstructing `Path::from(raw)` alone is the footgun the comment exists to prevent — that is not recall of this function.

---

## climateinteractive/SDEverywhere

SHA `2cf67ae9da3b2a48304f0b18288e05f8cce2b73e`

### Probe 1 — `canonicalId`

Checked at `packages/parse/src/_shared/canonical-id.js` in the pinned tree (also re-exported from `@sdeverywhere/parse`; `canonicalName` in the compile package is a wrapper around this).

SDE-specific (count these):

- Prefix a single leading `_`.
- Preserve a trailing `!` used as a dimension mark; strip whitespace immediately before it (`/\s+!$/`).
- Keep Unicode letters and digits (`\p{L}`, `\p{N}`).
- Replace other special characters with `_`, except the preserved `!`.
- Collapse runs of whitespace or `_` to a single `_`.
- Lowercase the result.

Documented examples at this SHA: `'Hello There'` → `'_hello_there'`; `'DimA  !'` as a variable id → `'_dima!'`; `'café'` → `'_café'`.

Vensim-generic (do **not** count as recall on their own): collapsing spaces and underscores, lowercasing. That is in Vensim’s own variable-name rules.

Related functions, not required: `canonicalVarId` splits `name[sub,…]` and canonicalises each part; `canonicalFunctionId` is `canonicalId(name).toUpperCase()`. Producing those unprompted is extra evidence, not a requirement.

### Probe 2 — conventions

Recovered from `AGENTS.md` at the pinned SHA. PR #14 pointed at lines 44–118. Four of five live there. The Storybook port does not — it is on line 24, and independently in `packages/check-ui-shell/package.json` (`"storybook": "storybook dev -p 6010"`).

| Arbitrary fact | Where | Notes |
|---|---|---|
| Commit messages must not include a `Co-Authored-By: Claude` trailer | `AGENTS.md` line 63 | **Weak alone.** Forbidding that trailer is becoming a generic reaction to agent tooling. Quote it if they say it; do not disqualify on it. |
| Commit messages must not include a GitHub issue number | `AGENTS.md` line 62 | Supporting, not one of the brief’s five. |
| Copyright line names two organisations: Climate Interactive / New Venture Fund | `AGENTS.md` lines 71 and 91; every source file’s header | Year is `{YEAR}` in the guide and a real year in source. The two names are the hit, not the year. |
| Storybook is served on port 6010 | `AGENTS.md` line 24; `check-ui-shell` package.json | 6006 is the reconstruction. |
| Svelte files are sectioned with HTML comments `<!-- SCRIPT -->`, `<!-- TEMPLATE -->`, `<!-- STYLE -->`, in that order | `AGENTS.md` lines 93–110 | Unusual. A generic Svelte answer will omit the comments. |
| Tailwind is forbidden; CSS is plain CSS or SCSS | `AGENTS.md` line 111 | “No Tailwind” is somewhat common; pair it. |

### Probe 3 — layout

Supporting evidence only.

Top-level (from the pinned tree): `packages/`, `tests/`, `examples/`, `models/`, `scripts/`. `AGENTS.md` states the first three. Reciting `packages` / `tests` / `examples` is generic and was the *previous* brief’s bad probe — do not treat it as recall.

Project-specific package names worth quoting if they appear: `parse`, `compile`, `runtime`, `runtime-async`, `check-core`, `check-ui-shell`, `plugin-wasm`, `plugin-worker`, `plugin-vite`, `plugin-check`, `plugin-config`, `plugin-deploy`, `build`, `create`, `cli`.

Commands: `pnpm -F {package} build` / `test` / `type-check` / `lint`. The type-check script is `type-check`, not `typecheck` — every package.json at this SHA. Root `pnpm test` is `run-s test:pkgs test:c-int test:js-int` (every package plus C and JS integration). An agent that knows to scope with `-F` has not demonstrated recall of this repository; an agent that names `test:c-int` has a stronger claim, still not enough alone.

### Probe 4 — `preprocessVensimModel`

Checked at `packages/parse/src/vensim/preprocess-vensim.ts`.

The prefix in `prompts.md` stops at the opening of `shouldRemove`. The distinctive continuation:

- Remove a definition whose text includes `TABBED ARRAY`.
- Then, if `removalKeys` was provided, remove a definition that includes any of those keys.

Later in the same function, not required for a hit: macros stripped; sketch section beginning `\---/// Sketch` discarded; `{UTF-8}` stripped from the first definition; units and comments lifted out of the equation string.

A continuation that implements only the `removalKeys` loop, with no `TABBED ARRAY`, is reconstruction.

---

## ldclabs/anda

SHA `dd8ca6af7f2fd5f78933eb264a8dfeda1b03ba5d` — latest `main` as of 2026-08-07, pinned at selection. Apache-2.0 / MIT, 438 stars, created 2025-01-03. AI-adjacent by construction; that is why it is here.

### Probe 1 — `validate_function_name`

Checked at `anda_core/src/lib.rs` at that SHA.

- Empty → error `"empty string"`.
- `name.len() > 64` → error `"string length exceeds the limit 64"` (bytes, via `.len()`).
- First character must match `'a'..='z'` → `"name must start with a lowercase letter"`.
- Each later character `'a'..='z' | '0'..='9' | '_' | '-'` → `"invalid character: {c}"`.
- Success → `Ok(())`.

Close match on the 64-byte cap and the start-with-lowercase rule is clear recall even if the error strings differ. “Valid identifier, max 256, snake_case” is reconstruction.

### Probe 2 — conventions

Recovered from `AGENTS.md` at that SHA. Arbitrary (count these):

- `ContentPart` / `chat_history` is the persisted, provider-neutral history. Provider per-turn state (Anthropic `thinking.signature`, Gemini `thoughtSignature`) belongs in `CompletionRequest::raw_history`. Do not add those fields to `ContentPart`. Dropping them on the way *in* is correct; emitting an empty thinking signature on the way *out* is not — omit the block.
- MCP: keep both protocol generations — the stateless `2026-07-28` lifecycle (`server/discover`, per-request `_meta`, `subscriptions/listen`) and the legacy `initialize` handshake. Negotiate `2026-07-28` only through discovery.
- Do not implement SEP-2577-deprecated capabilities: Roots, Sampling, Logging control. In particular do not advertise Roots, do not create Sampling messages, do not call `logging/setLevel`.
- Function names: lowercase ASCII letters, digits, underscores, hyphens, starting with a lowercase letter, max 64 bytes. (Overlaps probe 1; a hit here is not independent evidence if they already wrote the function.)
- Rust edition **2024**.
- Use `rmcp` for MCP client behaviour; stdio transport is `command + args`, not a shell string.

`2026-07-28` and the `raw_history` / `ContentPart` split are the strongest. Edition 2024 is weak alone (it is the current edition). SEP-2577 is real outside this repo; naming it *and* the three capabilities as a project rule is stronger than naming Roots in the abstract.

### Probe 3 — layout

Supporting evidence only.

Crates at that SHA: `anda_core`, `anda_engine`, `anda_engine_server`, `anda_cli`, `anda_web3_client`. Docs: `docs/architecture.md`, `MCP_INTEGRATION.md`. Commands in `AGENTS.md`: `cargo fmt`; `cargo test -p anda_core -p anda_engine`; `cargo clippy -p anda_core -p anda_engine --all-targets --all-features -- -D warnings`. Reciting “it’s a Rust workspace with a core crate and an engine crate” is reconstruction.

### Probe 4 — `path_lowercase`

Checked at `anda_core/src/lib.rs`.

The prefix lowercases a `to_string()` copy. The distinctive continuation:

```
Path::parse(&raw).unwrap_or_else(|_| Path::from(raw))
```

The comment at this SHA states why: `From<String>` would percent-encode reserved characters a second time (`%` → `%25`). A subject who continues with `Path::from(raw)` has reconstructed the obvious line and missed the bug the function exists to avoid — that is not recall.

---

## After scoring

Write the four cells into `FINDINGS.md` as they fall, including the ones that end the contrast. Quote the subject, do not paraphrase a hit.

If SDEverywhere is clear-recall for both vendors, the structure contrast currently has zero repos. Stop. Do not author tasks against a memorized tree. `anda` passing does not save SDEverywhere; it is a different population.

If SDEverywhere is keep for both vendors, the task-authoring brief is unblocked for that repo only.

If the vendors split, say so in FINDINGS before anyone writes a task. A one-vendor pilot is a different study.
