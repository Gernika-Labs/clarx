/**
 * Candidate repositories for the pilot.
 *
 * Selection criteria, applied in this order. They are written down because a
 * benchmark whose repo list came from taste is a benchmark whose results came
 * from taste.
 *
 * 1. **Obscure enough not to be memorized.** Phase 1 excludes repos likely
 *    reproduced verbatim from training data — the study measures navigation,
 *    not recall. Operationalised as a GitHub star range, and every candidate
 *    here came from a recorded search rather than from memory:
 *
 *      gh search repos --language=<lang> --stars=80..800 --sort=updated
 *
 *    This is a proxy, not a proof. Star count correlates with fame imperfectly,
 *    and the honest position is that it reduces rather than eliminates the risk.
 * 2. **Permissively licensed**, since the corpus ships with the published paper.
 * 3. **English documentation**, so task wording is not a confound.
 * 4. **Enough documentation to degrade.** A repo whose docs are a stub cannot be
 *    twinned; this is checked mechanically by running the degradation, not by eye.
 * 5. **Spanning languages and sizes**, per Phase 1's variance requirement.
 *
 * A candidate that fails the mechanical twin check is recorded as disqualified
 * WITH its reason rather than quietly dropped. Which repos could not be twinned
 * is itself a finding about where the standard applies.
 */

/**
 * Which contrast a repository participates in.
 *
 * One manipulation per contrast, always. The first version applied two at once —
 * `clarx init` added a manifest AND every other document was flattened — which
 * cannot support a claim about either. Encoding the contrast per repo makes it
 * impossible to build that combination by accident.
 */
export type Contrast =
  /**
   * Structure only. high = the repo as published; low = the named documents
   * flattened and nothing else. No Clarx artifacts on either side; the Clarx
   * score is recorded as a covariate. This is the design's original question.
   */
  | { kind: 'structure'; flatten: string[] }
  /**
   * Adoption only. high = the repo plus `clarx init`; low = the repo as
   * published. No flattening — degrading existing documentation in the same
   * contrast is the second manipulation that sank the first design.
   *
   * Quarantined: it measures the vendor's own tool writing the file two of the
   * vendor's rules check for, so its score movement is definitional. Kept for
   * reference, excluded from the default run.
   */
  | { kind: 'adoption' }

export interface Candidate {
  id: string
  url: string
  /** Pinned at selection time; never a branch. */
  sha: string
  language: string
  license: string
  contrast: Contrast
  rationale: string
}

/**
 * The structure contrast needs a repository that already ships substantial,
 * structured agent documentation — there must be something real to flatten.
 * That is a narrower population than the original corpus, and a biased one:
 * repos with a good AGENTS.md are repos that already think about agents. The
 * bias is recorded rather than hidden, and finding more of them is the open
 * selection problem.
 */
export const CANDIDATES: Candidate[] = [
  {
    id: 'sdeverywhere',
    url: 'https://github.com/climateinteractive/SDEverywhere',
    sha: '2cf67ae9da3b2a48304f0b18288e05f8cce2b73e',
    language: 'typescript',
    license: 'mit',
    // Its published AGENTS.md states the `pnpm -F {package}` filter form, which
    // is the one fact in that file not cheaply recoverable from the tree: the
    // root `pnpm test` runs every package plus the integration suites, so the
    // scoped form changes cost even when both arms succeed.
    // CLAUDE.md is a pointer to AGENTS.md, so flattening AGENTS.md is the file
    // that matters.
    contrast: { kind: 'structure', flatten: ['AGENTS.md'] },
    rationale:
      'Translates System Dynamics models to C/JS. Ships a substantial structured AGENTS.md, which the structure contrast requires. Obscure, active, and no plausible claim to fame.',
  },
  {
    id: 'gqloom',
    url: 'https://github.com/modevol-com/gqloom',
    sha: '3ec35f16e553a67750bd8dcd0112e857d4b257b8',
    language: 'typescript',
    license: 'mit',
    contrast: { kind: 'adoption' },
    rationale:
      'GraphQL schema weaving from runtime types. Small, actively developed, documented, and obscure enough that recall is implausible.',
  },
  {
    id: 'fuse-backend-rs',
    url: 'https://github.com/cloud-hypervisor/fuse-backend-rs',
    sha: '544ce9cea7b5562d7538cc6c91d0ce932f06f35f',
    language: 'rust',
    license: 'apache-2.0',
    contrast: { kind: 'adoption' },
    rationale:
      'Non-JS, which tests the partial-support claim directly. Systems code with real invariants, so tasks cannot be bluffed from documentation alone.',
  },
  {
    id: 'neocmakelsp',
    url: 'https://github.com/neocmakelsp/neocmakelsp',
    sha: '6b73bb85855258ab18c4c7fa22447decf17f6ac9',
    language: 'rust',
    license: 'mit',
    contrast: { kind: 'adoption' },
    rationale:
      'A CMake language server: second non-JS repo, different shape from a library, and genuinely obscure.',
  },
]
