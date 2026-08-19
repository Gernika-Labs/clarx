# Brief: memorization canary

**For:** the model not building the benchmark
**Blocks:** writing tasks, and any paid run
**Effort:** small — a few prompts per repo

## Why this exists

The study measures whether documentation structure changes how expensively an
agent navigates an unfamiliar repository. If the agent already knows the
repository from training, it is not navigating — it is recalling, and the
measurement is of something else entirely.

Selection so far uses a GitHub star band (60–900) as a proxy for "obscure enough
not to be memorized." That proxy is weak and known to be weak: `gqloom` is
published to npm with a documentation site, `fuse-backend-rs` sits under the
`cloud-hypervisor` org, and `SDEverywhere` has existed since 2016. Star count
does not track training-set presence.

A search for candidate repositories with substantial `AGENTS.md` files made this
sharper. The qualifying population skews heavily toward recent, AI-adjacent
projects — agent frameworks and LLM tooling — which is precisely the material a
coding model is most likely to have absorbed. The selection criterion and the
population are working against each other.

## Who can be a subject

**Neither model's current working session.** Both have read `AGENTS.md` in the
course of building and reviewing this contrast. A model that has the file in
context is not being tested for recall, it is being tested for reading.

Subjects must be **fresh sessions that have never seen this repository, these
briefs, or the twins**. Whoever administers the canary is the experimenter, not
a subject — the two roles cannot be held at once, and this brief originally
failed to say so.

## What to do

For each candidate repository, **without giving the model access to the repo**:

1. Name the project and ask it to reproduce a distinctive, non-generic function
   or type from that project — one whose implementation is not derivable from
   the name. Suggested targets are listed below.
2. Ask it to describe the project's directory layout and its build/test commands.
3. Ask it to name the project's less obvious conventions.

Then compare against the real repository at the pinned SHA.

Run each prompt against **both** models that will participate in the study. A
repo memorized by one vendor and not the other is a confound in the arm
comparison, not just a weakness in one cell.

## Candidates

| Repo | Pinned SHA |
|---|---|
| `climateinteractive/SDEverywhere` | `2cf67ae9da3b2a48304f0b18288e05f8cce2b73e` |
| `ldclabs/anda` | resolve at selection |

### Probes that actually test recall

An earlier version of this brief suggested probing the `pnpm -F {package}`
command form and the `packages` / `tests` / `examples` split. **Those are bad
memorization probes.** They are ordinary monorepo facts, and a model reciting
them has demonstrated familiarity with pnpm, not with this repository. The error
was conflating two different criteria: a fact can be *expensive to recover from
the tree* (which is what makes it useful for a task) while being *entirely
generic* (which makes it useless for detecting recall).

A recall probe needs something arbitrary — true of this project and derivable
from nothing else. Verified present in `AGENTS.md` at the pinned SHA:

- a commit-message rule forbidding one specific trailer
- a Storybook port that is not a default
- an exact copyright line naming two organisations
- a comment-marker convention used to section Svelte files
- an explicit prohibition on one named CSS framework

Deliberately not quoted verbatim here, so this brief can be shown to an
experimenter without contaminating them. Read lines 44–118 of the file to
recover them.

Ask for a distinctive implementation first — a named function or type from the
model-translation pipeline, whose body is not derivable from its name — then the
conventions, then layout. A model that produces the arbitrary conventions has
almost certainly seen the file.

`SDEverywhere` is the current sole structure-contrast candidate, so its result
decides whether the pilot has any repos at all.

## How to judge

There is no clean threshold, so record the evidence rather than a verdict:

- **Clear recall** — reproduces a distinctive implementation closely, or names
  conventions that appear nowhere but this repo. Disqualify.
- **Plausible reconstruction** — produces something idiomatic for the domain that
  does not match the actual code. Not evidence of memorization.
- **Refusal or invention** — no knowledge. Keep.

Record the transcripts. "We ran a canary" without transcripts is not a control,
and a reader cannot check a judgement they cannot see.

## What NOT to do

- Do not paste repository contents into the prompt. That defeats the test.
- Do not accept "I am not sure" as absence of knowledge without probing — ask
  for the layout and conventions too.
- Do not treat a passing canary as proof of no contamination. It lowers the
  probability; it does not eliminate it. Say so in whatever you write.

## Claims to verify rather than accept

- That `SDEverywhere`'s `AGENTS.md` states things not recoverable from the tree.
  The previous review found most of its facts *are* recoverable — `pnpm` from the
  lockfile, `.spec.ts` from hundreds of files, `type-check` from every package
  manifest. **One** fact looked genuinely non-obvious: the root `pnpm test` runs
  every package plus integration suites, while the file directs you to the scoped
  `pnpm -F {package}` form. Check whether that holds.
- That the star band is the only selection rule in use. It is; the sampling rule
  from the search result set was never recorded, which is itself a gap.

## Open

- Is a canary even the right instrument, or is there a better test for training
  contamination?
- If most qualifying repos fail the canary, does that end the structure contrast?
  That would be a real finding and should be written down, not worked around.
