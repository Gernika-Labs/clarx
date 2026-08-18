import { canonical } from './normalize.js';
import type { DiffEntry, RuleSnapshot, Snapshot } from './types.js';

/**
 * Fields recorded for provenance but never diffed.
 *
 * `engineVersion` is the important one: bumping the engine would otherwise red
 * every repo in the corpus without a single behavioural change. The version is
 * printed in the run header instead, so a reviewer always knows which engine
 * produced a diff.
 *
 * `sha` is pinned in corpus.json — if it moves, that is a corpus edit, and the
 * run reports it separately as a cosmetic entry rather than as scan drift.
 */
const NOT_DIFFED = new Set(['engineVersion']);

/** Score movement tolerated before a diff is raised. 0 = any movement fails. */
const SCORE_TOLERANCE = 0;

export function diffSnapshots(before: Snapshot, after: Snapshot): DiffEntry[] {
  const out: DiffEntry[] = [];
  const repo = after.repo;

  const push = (
    cls: DiffEntry['class'],
    field: string,
    b: unknown,
    a: unknown,
    opts?: { fails?: boolean; note?: string },
  ) => {
    out.push({
      repo,
      class: cls,
      fails: opts?.fails ?? cls !== 'message',
      field,
      before: b,
      after: a,
      ...(opts?.note ? { note: opts.note } : {}),
    });
  };

  if (!NOT_DIFFED.has('sha') && before.sha !== after.sha) {
    push('cosmetic', 'sha', before.sha, after.sha, {
      note: 'The pinned SHA moved. A corpus entry should be immutable — verify this was intentional.',
    });
  }

  if (Math.abs(before.score - after.score) > SCORE_TOLERANCE) {
    push('score', 'score', before.score, after.score);
  }

  for (const key of ['confidence', 'manifestFound', 'importGraphResolved'] as const) {
    if (before[key] !== after[key]) push('structural', key, before[key], after[key]);
  }

  for (const name of Object.keys(after.pillars) as Array<keyof Snapshot['pillars']>) {
    const b = before.pillars[name];
    const a = after.pillars[name];
    if (b !== undefined && Math.abs(b - a) > SCORE_TOLERANCE) {
      push('score', `pillars.${name}`, b, a);
    }
  }

  const beforeHard = before.hardFailures.join(',');
  const afterHard = after.hardFailures.join(',');
  if (beforeHard !== afterHard) {
    push('structural', 'hardFailures', before.hardFailures, after.hardFailures);
  }

  if (before.filesScanned !== after.filesScanned) {
    push('cosmetic', 'filesScanned', before.filesScanned, after.filesScanned, {
      note: 'File count moved without the SHA moving — check .gitignore handling or the ignore list.',
    });
  }

  for (const key of ['tip', 'confidenceCaveat'] as const) {
    if (before[key] !== after[key]) {
      push('message', `${key}`, before[key], after[key], {
        fails: numbersIn(before[key] ?? '') !== numbersIn(after[key] ?? ''),
      });
    }
  }

  const ruleIds = [...new Set([...Object.keys(before.rules), ...Object.keys(after.rules)])].sort();
  for (const id of ruleIds) {
    diffRule(id, before.rules[id], after.rules[id], push);
  }

  return out;
}

function diffRule(
  id: string,
  b: RuleSnapshot | undefined,
  a: RuleSnapshot | undefined,
  push: (cls: DiffEntry['class'], field: string, b: unknown, a: unknown, opts?: { fails?: boolean; note?: string }) => void,
): void {
  if (!b && a) return push('structural', `rules.${id}`, null, 'present', { note: 'Rule appeared.' });
  if (b && !a) return push('structural', `rules.${id}`, 'present', null, { note: 'Rule disappeared.' });
  if (!b || !a) return;

  // A rule going inapplicable is the silent change that erodes trust most: it
  // stops moving the score without ever reporting a failure. Treated as
  // structural, never as noise.
  for (const key of ['passed', 'inapplicable', 'severity', 'confidence'] as const) {
    if (b[key] !== a[key]) push('structural', `rules.${id}.${key}`, b[key], a[key]);
  }

  if (b.scoreImpact !== a.scoreImpact) {
    push('score', `rules.${id}.scoreImpact`, b.scoreImpact, a.scoreImpact);
  }

  const bLoc = canonical(b.locations);
  const aLoc = canonical(a.locations);
  if (bLoc !== aLoc) {
    const pathsMoved = b.locations.map(l => l.path).join('|') !== a.locations.map(l => l.path).join('|');
    push('location', `rules.${id}.locations`, b.locations.map(fmtLoc), a.locations.map(fmtLoc), {
      note: pathsMoved
        ? undefined
        : 'Same files, changed detail — the line/export/overage numbers a reader acts on.',
    });
  }

  // Guards the engine's documented contract that locations[0] is the canonical
  // file a finding is about (KUA-008). Sorting `locations` would otherwise hide
  // a change in which file the finding actually anchors to.
  if (b.primary !== a.primary) {
    push('location', `rules.${id}.primary`, b.primary, a.primary, {
      note: 'The primary target moved. locations[0] is the file the finding claims to be about.',
    });
  }

  if (b.message !== a.message) {
    // Wording may drift freely; the numbers embedded in messages may not.
    // "3 files exceed 400 lines, among 26 files" and "lib×8, components×6" were
    // themselves the bug in PA-005 and the C3 label case.
    const numbersMoved = numbersIn(b.message) !== numbersIn(a.message);
    push('message', `rules.${id}.message`, b.message, a.message, {
      fails: numbersMoved,
      ...(numbersMoved ? { note: 'A number inside the message changed — this is a claim, not wording.' } : {}),
    });
  }
}

function fmtLoc(l: { path: string; detail?: string }): string {
  return l.detail ? `${l.path} — ${l.detail}` : l.path;
}

function numbersIn(text: string): string {
  return (text.match(/\d+(?:\.\d+)?/g) ?? []).join(',');
}
