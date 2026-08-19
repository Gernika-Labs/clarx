# Frozen environment

Required before any task freeze or paid run. An agent's cost and success depend
on what it can reach, so the environment is part of the treatment whether or not
anyone writes it down.

**Nothing here is enforced yet.** No harness exists. This is the specification a
harness must implement, recorded now so it cannot be quietly decided later by
whatever the runner happened to allow.

## Network: offline

SDEverywhere's README points at `sdeverywhere.org`; gqloom's points at
`gqloom.dev`. With network access an agent can read the project's live,
structured documentation regardless of what the local twin says — which makes
the local manipulation optional and the measurement meaningless.

Offline is therefore a requirement, not a preference.

## Clarx tooling: absent

- No `clarx` CLI on PATH
- No Clarx MCP server configured
- No Clarx-authored files in the structure contrast

The study asks whether documentation structure changes agent cost. An agent that
can run `clarx score` is being handed the instrument.

## Versions

Pinned per run and recorded with the results:

| Component | Pin |
|---|---|
| `@clarxai/engine` | exact version, recorded — scores are covariates and must be comparable |
| `@clarxai/cli` | exact version, only if a contrast uses `clarx init` |
| Agent vendor + model | exact, per arm |
| Repository | commit SHA, already pinned in `corpus.json` |

`clarx init` output changed materially between 0.1.12 and 0.1.13 — the earlier
version fabricated verification commands. Any adoption-contrast result is tied
to the CLI version that produced its manifest, and comparing across versions
compares two different treatments.

## Tools available to the agent

Identical in both arms. In particular **`git` must be present in both** — an
earlier build deleted `.git` from one twin, which handed one arm working
`log`/`blame`/`grep` and the other nothing. The builder now asserts this.

## What gets recorded per run

- Full transcript, including whether the agent opened the degraded document at
  all. If it never read it, the cell is uninformative rather than a null on
  structure.
- Token counts in and out, turns, wall time
- Commands the agent chose to run — the scoped `pnpm -F {package} test` versus
  the root suite is itself an outcome
- Pass/fail from the hidden grader
