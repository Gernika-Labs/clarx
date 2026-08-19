# Working with a second model

Two models work on this project. This is how the work divides, and why it
divides that way rather than by splitting the queue in half.

## The rule: whoever builds does not verify

An independent model reviewed this benchmark twice. Across those rounds it found
a `.git` asymmetry between twins, a flattening function that destroyed every code
sample while its test passed, tasks that graded unfixed code as correct, a
product bug shipping fabricated commands to users, a false claim in our own
findings document, and — the one that mattered most — a write-up describing a
contrast the pipeline could not produce.

None of that was luck, and none of it was model capability. It was the
structural advantage of not having built the thing. That advantage disappears
the moment the reviewer becomes a co-author of what it is checking.

So: **the model that implements a change does not verify it.** Roles rotate per
task, not per project. If Grok writes the tasks, Claude verifies them; if Claude
writes the harness, Grok verifies it.

Splitting the queue by capacity would spend the tokens and lose the property
that made the second model worth having.

## What verification means here

Running things, not reading claims about them. Every check below caught
something real:

- **Read the artefact, not the report.** The pipeline once logged
  `[structure] changed AGENTS.md` while producing five changed files. The check
  that caught it was `git diff --no-index` on the built trees.
- **Confirm the edit landed.** A change was reported complete on the strength of
  a `print` statement while the replacement had silently not matched. Assert on
  the file afterwards.
- **A check that has never failed is not known to work.** Break it on purpose
  once. The corpus gate was trusted only after lowering a threshold produced 13
  failing diffs; the fence test was worthless until it was written to fail.
- **Merging is not shipping.** Three fixes in one day needed a second action to
  reach users. Verify the deployed artefact, not the merge.

## Handoff artefacts

The receiving model has none of the conversation that produced the work. A task
list is not enough; decisions and their reasons have to travel with it.

Every brief carries:

1. **What to do**, self-contained, assuming no prior context
2. **What was already decided and why** — so the receiver does not relitigate or
   silently reverse it
3. **What NOT to review**, to save effort on parts already covered by tests
4. **Claims to verify rather than accept**, because several confident assertions
   in this project turned out to be wrong when finally checked
5. **An open section** — the most valuable finding is usually the one the brief
   failed to ask about

A brief written by the model that did the work will steer attention toward
problems that model already knows about. Say so in the brief.

## Repository protocol

- **One branch, one owner.** No concurrent edits to the same files.
- **Branch names carry the author**: `grok/…` or `claude/…`.
- **PRs describe what was verified and how**, not just what changed.
- The verifying model reviews the PR before merge and says explicitly what it
  ran.
- Findings land in `FINDINGS.md` as they happen, including the ones that make
  the work look worse. Corrections edit the original claim rather than appending
  a footnote — a correction nobody reads is not a correction.

## Current briefs

| Brief | For | Status |
|---|---|---|
| `briefs/memorization-canary.md` | second model | ready |
| `briefs/task-authoring.md` | second model | ready |

`REVIEW_BRIEF.md` and `REVIEW_FOLLOWUP.md` are the two completed review rounds.
Read them before starting: they contain the reasoning behind most of the
constraints in the current design.
