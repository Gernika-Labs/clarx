# Why we did not run our own benchmark

We built a causal benchmark to test whether adopting Clarx makes AI agents
cheaper and more reliable in a codebase. We did not run it. Two designs failed
for different reasons, both caught before spending anything on agent work.

This is the write-up we would have wanted to read before starting. Every claim
below is checkable against the artefacts in this directory, which are public,
including the ones where we were wrong.

## What we wanted to measure

Clarx scores a repository on how safely an agent can navigate and edit it. The
commercial claim behind it is that raising that score lowers what agent work
costs. That is a causal claim, and we wanted evidence rather than a story.

The design: take a repository, produce two versions differing only in
documentation, give an agent identical tasks in each, and compare token cost and
task success. Source files byte-identical, degradation applied by a published
script, pre-registered, published regardless of outcome.

**The obstacle we knew about.** We sell the product under test. That conflict is
the first thing any reader should discount for, and the usual answers —
pre-registration, mechanical transforms, publishing negative results — are
commitments about our future behaviour, which is exactly what a skeptic has no
reason to trust.

**The obstacle we did not know about** is that the design was wrong twice, and
both times in ways that would have produced a publishable-looking number.

## Attempt one: the contrast measured something else

`twin_high` was the repository after running `clarx init`. `twin_low` was that,
with the manifest converted to prose **and** every other document flattened.

Three faults, none visible from inside:

**Two treatments were stacked, and the larger one was not Clarx.** The degraded
twin gained a prose notes file and lost its structured `README`, `AGENTS.md`, and
`docs/`. A positive result would have read most naturally as "damaging the README
makes agents worse" — undisputed, and no support for adopting anything.

**The score movement was definitional.** Every selected repository carried a
`C2` context-efficiency hard failure, so all of them were capped at 65. The
entire 15-point gap was the graduated hard-failure floor moving from two failures
to one — and the rule that moved, `O1`, is an existence check: it passes when
`CLAUDE.md`, `AGENTS.md`, or `clarx-manifest.json` is present. There was no
high-scoring repository in the corpus. `twin_high` was the floor after buying O1.
We were measuring whether our own tool had written the file our own rule looks
for.

**The control arm was missing its `.git` directory.** The degradation copied the
tree and deleted it. One arm could run `git log`, `blame`, and `grep`; the other
could not. That is a tooling difference, not a documentation one, and it would
have been the most plausible explanation for any effect we found. Our
source-identity assertion could not see it, because `.git` paths carry no source
extension.

The first honest signal was there and we misread it. Flattening every document —
between 1,100 and 1,700 lines per repository — moved the Clarx score by **zero**
across all four. Not a single rule flipped. That meant the score does not measure
documentation structure, so a documentation-only twin cannot test a score claim.
Instead of accepting the null, we changed the manipulation until the score moved,
by adding the file the score checks for.

We did not notice. An independent review, run by a different model with no stake,
found all three faults in one pass, along with a fourth: our markdown flattener
had been collapsing every fenced code block onto a single line, destroying every
code sample in the corpus. Its test asserted that a fence marker and one word
survived, so it passed the whole time.

## Attempt two: the population was contaminated

The redesign was clean. One manipulation: take a repository that already ships a
substantial agent guide, flatten **only that file**, change nothing else. No
Clarx artefacts in either arm, `git` present in both, the Clarx score recorded as
a covariate rather than the treatment. Verified by diffing the built trees —
exactly one file differed, documentation volume within 1.2%.

Then we screened for training contamination, because a model that has memorized
a repository is not navigating it, and flattening its documentation measures
nothing.

Four sessions, two repositories, two vendors, fresh chats, no repository access.
Probes: reproduce a named function, state the project's arbitrary conventions,
describe the layout, continue a real excerpt. Scored against the pinned SHA.

| Repository | Claude | Grok |
|---|---|---|
| `climateinteractive/SDEverywhere` | **clear recall** | no distinctive marker |
| `ldclabs/anda` | no distinctive marker | **clear recall** |

The recall was not ambiguous. One session volunteered the `*-vm.ts` view-model
convention — real across 46 files — plus the exported helper `decanonicalize`,
`canonicalVarId`, and a copyright line naming both Climate Interactive and New
Venture Fund. The other reproduced all four error strings of `validate_function_name`
verbatim: `empty string`, `exceeds the limit 64`, `lowercase letter`,
`invalid character`.

Each repository was known by exactly one vendor. A repository one arm's model
remembers and the other's does not is a confound between conditions, not a weak
cell — the scoring key said so before the run. Both were unusable for a
two-vendor study, and they were the only two candidates that qualified.

**The population is the problem.** The contrast needs a repository obscure enough
not to be memorized *and* shipping a substantial structured agent guide.
Screening found roughly one candidate per twenty repositories, and the qualifying
set skews heavily toward recent AI-adjacent projects: agent frameworks, LLM
tooling. That is precisely the material a coding model has absorbed. The
selection criterion and the population work against each other.

## Four things we would tell anyone attempting this

**Your instrument has to be able to move for non-definitional reasons.** If the
only rule that responds to your manipulation is a check for a file's existence,
you cannot claim the score caused anything. Before designing tasks, ask what
would have to change for the number to move, and whether that thing is the
treatment or the tautology.

**A calibrated refusal is not absence of knowledge.** Our strongest recall cell
declined to reproduce the function, hedged every claim, and offered to fetch the
file — then volunteered a 46-file naming convention unprompted. Score the
specifics a model gives away, never its tone. Ours would have passed on tone.

**Contamination in the code rather than the document is worse, not better.** The
same session confidently denied the project uses Storybook. It does, on the exact
port stated in the `AGENTS.md` that the whole contrast manipulates. So the
memorized thing was the codebase, not the artefact being degraded. That looks
like a reprieve and is the opposite: a model that already knows the code has no
reason to read the guide, and the treatment cannot matter to a subject who is not
navigating.

**Have something outside your own head check the built artefact.** Our write-up
described a contrast the pipeline could not produce: the structure-only mode
existed in a unit test while the pipeline still ran the old one, and the numbers
we reported came from a one-off script. Twice, a passing test hid a broken
transform. Documents describe intent and green tests describe coverage. Only
reading the output catches the difference, so we now assert the built trees match
the declared contrast, in code.

## What the exercise was worth anyway

The benchmark did not run. The infrastructure built for it found real defects in
the shipped product:

- **A hard-failure rule that could not fail.** `C1` checks whether generated
  output is committed to the source tree — worth 100 score impact. The
  filesystem scanner stripped `dist`, `build`, `out`, `.next`, and `coverage`
  before rules ran, so `C1` never saw them: a repository with `dist/bundle.js`
  committed and no `.gitignore` was told "generated artefacts are excluded from
  the source tree". It asserted a pass it had never verified, for the entire
  JavaScript ecosystem. It now asks git, which is where the answer lives.
- **`clarx init` fabricated verification commands.** Every manifest it generated
  claimed `pnpm typecheck`, `pnpm test`, and `pnpm lint`, regardless of project —
  including on Cargo repositories with no `package.json`. It had done this for as
  long as the tool existed. Found because the benchmark ran the CLI across four
  repositories in three ecosystems, more variety than its tests covered. Fixed in
  CLI 0.1.13.
- **A release workflow that shipped half-releases silently.** `continue-on-error`
  on the engine publish left the release green while npm kept an older engine.
  That is how engine 0.1.8 and CLI 0.1.10 came to be published out of step,
  with nothing complaining at the time.
- **A regression harness** over pinned real repositories, which now gates every
  rule change with a measured blast radius instead of a guess. The `C1` fix's
  first version hard-failed `honojs/hono` for committing its own build scripts;
  the harness caught that before release.

A benchmark that cannot run is a bad outcome. A benchmark that told us our own
score was an existence check, before we published a number based on it, is not
the worst one.

## What we are doing instead

Not running the study. Not pre-registering it. Not keeping the withdrawn design
in the default path "in case".

Two options remain and neither is chosen: single-vendor cells, which lose the
cross-vendor replication that was the defence against one vendor's habits
explaining the result; or a larger screened population, which the contamination
skew works against.

The narrower question — do the findings this product surfaces actually lead
anyone to act — is answerable from our own instrumentation, on real usage, at no
token cost. That is a weaker claim than causal token savings, and it is one we
can support.

If the population of obscure, well-documented, uncontaminated repositories
becomes large enough to screen properly, the design in this directory is ready
and the harness is built. Until then, saying so is more useful than a number we
would have to defend.

## Artefacts

Everything referenced here is in this directory:

| Path | What it is |
|---|---|
| `FINDINGS.md` | Every finding as it happened, including corrections to earlier claims |
| `REVIEW_BRIEF.md`, `REVIEW_FOLLOWUP.md` | What the independent reviewer was asked, including the argument against each of our own decisions |
| `src/degrade.ts` | The degradation script, with its assertions |
| `src/build-twins.ts` | Twin construction, and the check that the built trees match the declared contrast |
| `canary/` | Probes, scoring key, and the four transcripts |
| `../corpus/` | The regression harness the benchmark produced |

The corrections in `FINDINGS.md` are left visible rather than edited away,
including the claims that turned out to be false. A record that contains only
what survived is not a record.
