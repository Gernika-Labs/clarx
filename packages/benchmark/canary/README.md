# Memorization canary

**Status:** drafted, not administered.
**Blocks:** task authoring, and any paid run.
**Subjects:** fresh Claude and Grok sessions. Not this working session, not Claude’s, not any session that has seen this repository, these briefs, or the twins.
**Administrator:** Inaki. The two roles cannot be held at once.

This directory is the artefact the brief asked for. The brief is `briefs/memorization-canary.md`. Do not treat the brief as the prompts.

---

## What this is for

The structure contrast measures whether documentation *shape* changes how expensively an agent navigates an unfamiliar repository. If the agent already knows the repository from training, it is recalling, and the measurement is of something else.

Star count was the selection proxy. It is weak, and known to be weak. This canary is a cheap binary gate in front of writing tasks and spending tokens. It lowers the probability of training contamination. It does not eliminate it. A passing canary is not proof of cleanliness — say that in whatever you write after the run.

## What was decided, and why

- **Instrument:** four probes per repo, then stop. Distinctive implementation, arbitrary conventions, layout, then excerpt-completion. A formal contamination metric would cost more than the pilot it protects. The one scoring refinement: conventions are judged as a *set*. A single hit on a convention that is becoming generic (see key) is not clear recall.
- **Subjects:** both vendors that are candidates for the paid run. A repo one vendor recalls and the other does not is an arm confound, not a weak cell.
- **`ldclabs/anda` is kept**, SHA pinned at selection to `dd8ca6af7f2fd5f78933eb264a8dfeda1b03ba5d` (latest `main` as of 2026-08-07). It ships a substantial `AGENTS.md`, sits in the star band, and is exactly the AI-adjacent population the brief warned is most likely absorbed. That is a reason to *test* it, not a reason to drop it before the test.
- **Excerpt-completion is the one place a prompt contains source.** A completion probe that contains no prefix is not a completion probe. Prefixes are short, stop before the distinctive continuation, and name no file. Everything else in `prompts.md` contains no repository contents.

## Who may be a subject

Neither working session that built or reviewed this contrast. Both have read `AGENTS.md`. A model with the file in context is being tested for reading, not recall.

Use a **fresh session** of each vendor that has never been shown this repository, `packages/benchmark/`, these briefs, or the twins. Prefer a product chat with **no tools** (no web, no GitHub, no MCP, no code execution). A subject that can fetch the repo is looking it up, and the cell is void.

Do not tell the subject they are being tested for memorization. Hedging would read as ignorance. The session opener below is the cover: you are about to work in the repo and do not have a checkout yet.

One repo per session. Running both repos in the same session lets the first contaminate the second.

## How to administer

Files the subject may see: **nothing from this directory except the paste-ready blocks in `prompts.md`**, plus the opener. `key.md` is experimenter-only. Never paste it, never summarise it, never “see if they know X” out loud.

For each of the four cells (SDEverywhere × Claude, SDEverywhere × Grok, anda × Claude, anda × Grok):

1. Open a fresh session. Record the exact model identifier the product shows.
2. Paste the opener for that repo from `prompts.md`.
3. If they offer to clone or search, say: “I need this before I can share the checkout. Please answer from what you already know.” Then continue. If they still fetch the repo, void the cell and start over.
4. Paste probe 1. Wait. Then 2, then 3, then 4, as separate messages, in that order. Do not skip because they refused probe 1 — a model that will not write a function may still recite conventions.
5. Copy the full transcript into a new file under `transcripts/`, named `{repo}-{vendor}-{date}.md`, starting from `transcripts/TEMPLATE.md`.
6. Score against `key.md`. Record evidence in the three buckets. Do not write a pass/fail sticker in place of the quotes.

Then write the result into `FINDINGS.md`, including the result that kills the pilot.

## What I would expect this to catch

- **Clear recall of `canonicalId`** — leading underscore, trailing `!` preserved for marked dimensions, Unicode letters kept. A reconstructing model will emit snake_case. Vensim’s own docs explain whitespace collapse; those details alone are not SDE.
- **Clear recall of the convention set** — two-organisation copyright, Storybook on 6010, Svelte section comments, the named CSS prohibition, the named commit trailer. One of those is getting generic; the set is not.
- **Excerpt continuation that names `TABBED ARRAY` or `Path::parse`** — not a plausible guess from the prefix.
- **Vendor split** — Claude recites `AGENTS.md` and Grok does not, or the reverse. That repo cannot be an arm of a two-vendor run.

What it will not catch: contamination below the level of a named function or an arbitrary house style. That is the limit of a cheap canary, and it is why a pass still has to be written as “lowers the probability.”

## Was this canary any good? (read in six months)

You cannot re-run these prompts on a later model that trained on this repository and call it the same test. Merging `key.md` to public GitHub retires the instrument for any subsequent training cutoff. The six-month question is therefore *retrospective*: did this gate do what we used it for?

Answer it from the files, not from memory:

| Question | Where the answer lives |
|---|---|
| What was asked? | `prompts.md`, this commit |
| What counted as a hit, and which hits are SDE/anda-specific vs generic? | `key.md` |
| What did each subject actually say? | `transcripts/{repo}-{vendor}-{date}.md` |
| Under what conditions? | the header on each transcript: model id, date, tools, opener used, whether any cell was voided |
| How was the judgement applied? | the “worked examples” in `key.md`, plus the FINDINGS entry written after the run |
| Was a probe leaking a filename? | Claude’s verification of this PR; Inaki’s check that each prompt is answerable without the repo |
| Did we treat a pass as proof? | FINDINGS. If that entry says “clean” without “lowers the probability,” the write-up failed even if the prompts did not |

If the transcripts are missing, the canary did not happen. “We ran a canary” without transcripts is not a control.

## Claims to verify rather than accept

Checked while drafting, so the verifier is not starting from a report:

- PR #14 said the replacement probes are present in `AGENTS.md` at the pinned SHA, “lines 44–118.” Four of five are. The Storybook port is on **line 24** (and, separately, in `packages/check-ui-shell/package.json` as `storybook dev -p 6010`). The non-verbatim brief is usable for an experimenter who has the tree; the stated line range is not a complete recovery instruction.
- The commit-trailer prohibition is present. It is also the weakest of the five as a recall test: forbidding that trailer is becoming a generic reaction to agent tooling. Score it in the set, not alone. Argued here rather than after a convenient pass.
- Root `pnpm test` in SDEverywhere is `run-s test:pkgs test:c-int test:js-int`. Every package script is `type-check`, none `typecheck`. `CLAUDE.md` is `@AGENTS.md`. Those facts belong to task authoring, not to this canary; recorded because the brief asked.

## Open, left open

If both repos fail for both vendors, the structure contrast has no population at the required obscurity × `AGENTS.md` intersection. That is a finding. It ends this form of the pilot. It is not a reason to relax the canary.

## Not under review

- The twin builder, the flatten function, the quarantined gqloom suite.
- Whether option B is worth running — that waits on this result.
