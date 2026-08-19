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

export interface Candidate {
  id: string
  url: string
  /** Pinned at selection time; never a branch. */
  sha: string
  language: string
  license: string
  rationale: string
}

export const CANDIDATES: Candidate[] = [
  {
    id: 'sdeverywhere',
    url: 'https://github.com/climateinteractive/SDEverywhere',
    sha: '2cf67ae9da3b2a48304f0b18288e05f8cce2b73e',
    language: 'typescript',
    license: 'mit',
    rationale:
      'Translates System Dynamics models to C/JS. A real domain tool with substantial prose documentation, a monorepo layout, and no plausible claim to fame — the kind of navigation problem the study is about.',
  },
  {
    id: 'gqloom',
    url: 'https://github.com/modevol-com/gqloom',
    sha: '3ec35f16e553a67750bd8dcd0112e857d4b257b8',
    language: 'typescript',
    license: 'mit',
    rationale:
      'GraphQL schema weaving from runtime types. Small, actively developed, documented, and obscure enough that recall is implausible.',
  },
  {
    id: 'fuse-backend-rs',
    url: 'https://github.com/cloud-hypervisor/fuse-backend-rs',
    sha: '544ce9cea7b5562d7538cc6c91d0ce932f06f35f',
    language: 'rust',
    license: 'apache-2.0',
    rationale:
      'Non-JS, which tests the partial-support claim directly. Systems code with real invariants, so tasks cannot be bluffed from documentation alone.',
  },
  {
    id: 'neocmakelsp',
    url: 'https://github.com/neocmakelsp/neocmakelsp',
    sha: '6b73bb85855258ab18c4c7fa22447decf17f6ac9',
    language: 'rust',
    license: 'mit',
    rationale:
      'A CMake language server: second non-JS repo, different shape from a library, and genuinely obscure.',
  },
]
