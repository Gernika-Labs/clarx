# Quarantined task sets

Not loaded by the validator and not runnable by a harness. Kept for the record,
not for use.

## gqloom

Written for the adoption contrast, which was withdrawn. An independent review
found the suite unusable on its own terms, and adding `checkSpec` to make
validation pass did not address any of it:

- **gqloom-01** — the prompt names both converters and the exact input, so the
  identifier echo does the finding that structure was supposed to do.
- **gqloom-02** — the grader cannot distinguish a no-op from a success. The task
  is "remove a redundant ternary"; the hidden spec only checks behaviour, which
  is unchanged either way.
- **gqloom-03** — the hidden test requires the export name `kebabCase`, which the
  prompt never states, so `toKebabCase` fails a correct solution.
- **gqloom-04** — the grader accepts an unused helper whose name contains
  "pascal" and never inspects the call sites the task is about.

All four also live in one 23-line module, which is not a sample of work.

Anything reusable here is the *shape* of the format, not these tasks.
