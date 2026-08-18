import type { Snapshot } from './types.js';

/**
 * The regression cases from the two customer feedback logs, as executable
 * assertions.
 *
 * Sources:
 *   clarx-cloud/docs/kuantu-regression-cases.md
 *   clarx-cloud/docs/property-analyser-regression-cases.md
 *
 * Both documents say, in their own words: "This file is not a test runner. It
 * is the canonical checklist to convert into real fixtures once a proper
 * regression harness exists." This is that conversion.
 *
 * `status` is observed, not aspirational:
 *
 *   'holds' — verified true against the current engine. Breaking it fails the
 *             run: it is a regression.
 *   'open'  — a known gap, currently failing. Reported, never failing the run.
 *             If it starts passing, the harness says so and asks you to promote
 *             it to 'holds' — that is how a fix gets locked in.
 *
 * Only engine-layer cases live here. Roughly half the documented cases are
 * cloud-layer (prompt building, working-set derivation, scan lifecycle, UI) and
 * belong in clarx-cloud, tested against the AnalysisResult fixtures this
 * harness produces.
 */

export type CaseStatus = 'holds' | 'open';

export interface RegressionCase {
  id: string;
  title: string;
  /** Corpus entry this case is asserted against. */
  repo: string;
  status: CaseStatus;
  /** Where the case is described in prose. */
  source: string;
  assert(snapshot: Snapshot): { ok: boolean; detail: string };
}

const rule = (s: Snapshot, id: string) => s.rules[id];

export const CASES: RegressionCase[] = [
  {
    id: 'PA-004',
    title: 'shadcn/ui components are exempt from C2 — and the exemption is selective',
    repo: 'fixture-shadcn-oversized',
    status: 'holds',
    source: 'property-analyser-regression-cases.md',
    assert(s) {
      const c2 = rule(s, 'C2');
      if (!c2) return { ok: false, detail: 'C2 missing from snapshot' };
      const flagged = c2.locations.map(l => l.path);
      const shadcnFlagged = flagged.filter(p => p.includes('components/ui/') || p.includes('widgets/sheet'));
      const controlFlagged = flagged.includes('src/lib/control.ts');
      return {
        // Both halves matter. Exempting everything would also produce zero
        // shadcn violations, which is why the control file must still be flagged.
        ok: shadcnFlagged.length === 0 && controlFlagged,
        detail: shadcnFlagged.length
          ? `shadcn-shaped files were flagged: ${shadcnFlagged.join(', ')}`
          : controlFlagged
            ? 'exempt by path and by content fingerprint; ordinary oversized file still flagged'
            : 'the ordinary control file was NOT flagged — C2 is not firing at all, so the exemption proves nothing',
      };
    },
  },
  {
    id: 'PA-002a',
    title: 'C2 severity gradient — a marginally oversized file is not a hard failure',
    repo: 'fixture-c2-marginal',
    status: 'holds',
    source: 'property-analyser-regression-cases.md',
    assert(s) {
      const c2 = rule(s, 'C2');
      if (!c2) return { ok: false, detail: 'C2 missing from snapshot' };
      return {
        ok: c2.passed === false && c2.severity === 'warning',
        detail: `426-line file → passed=${c2.passed}, severity=${c2.severity} (expected failing at 'warning')`,
      };
    },
  },
  {
    id: 'PA-002b',
    title: 'C2 severity gradient — a severely oversized file escalates to hard failure',
    repo: 'fixture-c2-severe',
    status: 'holds',
    source: 'property-analyser-regression-cases.md',
    assert(s) {
      const c2 = rule(s, 'C2');
      if (!c2) return { ok: false, detail: 'C2 missing from snapshot' };
      return {
        ok: c2.passed === false && c2.severity === 'hard_failure',
        detail: `766-line file → passed=${c2.passed}, severity=${c2.severity} (expected failing at 'hard_failure')`,
      };
    },
  },
  {
    id: 'PA-002c',
    title: 'C2 states how far over the limit a file is, not just that it is over',
    repo: 'fixture-c2-severe',
    status: 'holds',
    source: 'property-analyser-regression-cases.md',
    assert(s) {
      const c2 = rule(s, 'C2');
      if (!c2) return { ok: false, detail: 'C2 missing from snapshot' };
      // The overage lives in the location detail ("766 lines (91% over), …"),
      // not in the message. Both files produce the same message sentence, so
      // this is the only place the magnitude is actually stated — which is why
      // the snapshot retains location details rather than bare paths.
      const detail = c2.locations[0]?.detail ?? '';
      const statesOverage = /\(\d+% over\)/.test(detail);
      return {
        ok: statesOverage,
        detail: statesOverage
          ? `overage stated in the finding detail: "${detail}"`
          : `no overage percentage in the detail: "${detail}" — a 766-line and a 426-line file would read identically`,
      };
    },
  },
  {
    id: 'PA-010',
    title: 'Router files are auto-detected and exempt from the import-surface rule',
    repo: 'fixture-router-fanout',
    status: 'holds',
    source: 'property-analyser-regression-cases.md',
    assert(s) {
      const c3 = rule(s, 'C3');
      if (!c3) return { ok: false, detail: 'C3 missing from snapshot' };
      const routerFlagged = c3.locations.some(l => l.path === 'src/App.tsx');
      return {
        ok: !routerFlagged,
        detail: routerFlagged
          ? 'src/App.tsx imports 20 pages via wouter Switch/Route and is still flagged by C3 — it is structurally a router, not a fan-out problem, and today needs the highFanOut escape hatch'
          : 'router auto-detected and exempt',
      };
    },
  },
  {
    id: 'C1-dotfiles',
    title: 'Root dotfiles are not mistaken for generated directories',
    repo: 'fixture-dotfile-config',
    status: 'holds',
    source: 'found by the corpus on psf/requests, 2026-08-17',
    assert(s) {
      const c1 = rule(s, 'C1');
      if (!c1) return { ok: false, detail: 'C1 missing from snapshot' };
      const flagged = c1.locations.map(l => l.path);
      const dotfiles = flagged.filter(p => /^\.(coveragerc|cachefile|buildrc)$/.test(p));
      return {
        ok: dotfiles.length === 0,
        detail: dotfiles.length
          ? `config dotfiles reported as generated artifacts: ${dotfiles.join(', ')} — C1 is a hard failure worth 100 score impact, so this caps a repo's score for committing a coverage config`
          : 'config dotfiles correctly ignored by C1',
      };
    },
  },
  {
    id: 'PA-006',
    title: 'Unknown manifest keys surface as the scan tip instead of being ignored',
    repo: 'fixture-malformed-manifest',
    status: 'holds',
    source: 'property-analyser-regression-cases.md',
    assert(s) {
      const tip = s.tip ?? '';
      const namesBoth = tip.includes('vendorFiles') && tip.includes('alsoNotReal');
      return {
        ok: namesBoth && tip.includes('no effect'),
        detail: namesBoth ? 'both invented keys named in the tip' : `tip did not name the unknown keys: "${tip}"`,
      };
    },
  },
  {
    id: 'KUA-008',
    title: 'Every finding anchors to a real primary file (locations[0] contract)',
    repo: 'vite-react-spa',
    status: 'holds',
    source: 'kuantu-regression-cases.md',
    assert(s) {
      const broken: string[] = [];
      for (const [id, r] of Object.entries(s.rules)) {
        if (r.locations.length === 0) continue;
        // `primary` is captured before locations are sorted, so this genuinely
        // checks the engine's contract rather than an artefact of the snapshot.
        if (r.primary === null || !r.locations.some(l => l.path === r.primary)) broken.push(id);
      }
      return {
        ok: broken.length === 0,
        detail: broken.length ? `rules whose primary target is missing or not among its locations: ${broken.join(', ')}` : 'all findings anchor to a listed file',
      };
    },
  },
  {
    id: 'TRUST-inapplicable',
    title: 'JS-only rules report inapplicable on non-JS repos rather than failing',
    repo: 'python-lib',
    status: 'holds',
    source: 'clarx-cloud trust-parity work (engine 0.1.9)',
    assert(s) {
      const expected = ['B1', 'C3', 'C4', 'C5', 'C6'];
      const wrong = expected.filter(id => rule(s, id)?.inapplicable !== true);
      const scored = expected.filter(id => (rule(s, id)?.scoreImpact ?? 0) !== 0 && rule(s, id)?.inapplicable === true);
      return {
        ok: wrong.length === 0 && scored.length === 0,
        detail: wrong.length
          ? `expected inapplicable but were not: ${wrong.join(', ')}`
          : scored.length
            ? `inapplicable rules must not move the score: ${scored.join(', ')}`
            : 'B1, C3–C6 inapplicable and score-neutral',
      };
    },
  },
];
