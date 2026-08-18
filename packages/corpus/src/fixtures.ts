import type { CorpusRepo } from './types.js';

/**
 * Entries that are NOT part of the publishable corpus.
 *
 * Two kinds live here:
 *
 * - **Synthetic fixtures.** Repo shapes that cannot be found in the wild —
 *   principally a deliberately malformed manifest. Defined in code so the tree
 *   can never drift from its description.
 * - **Local checkouts.** Your own repos, which are the only corpus entries
 *   whose correct output you know cold. Skipped with a notice when absent, so
 *   the harness still runs on a fresh clone or in CI.
 *
 * Customer repositories (Kuantu, Property Organizer, hanzibit) may be added
 * here as `local` entries. They must never move into corpus.json: that file
 * ships with the benchmark, and a private repo in it poisons publication.
 */

const MANIFEST_WITH_UNKNOWN_KEYS = JSON.stringify(
  {
    version: '0.1',
    generated: ['**/dist'],
    // `vendorFiles` is invented — exactly the key a real user reached for and
    // lost a scan cycle to before unknown keys were surfaced (PA-006).
    vendorFiles: ['src/components/ui/**'],
    alsoNotReal: true,
    verificationCommands: { typecheck: 'tsc --noEmit' },
  },
  null,
  2,
);


/**
 * Pads a file to roughly `lines` total lines with real function declarations.
 *
 * The padding must be executable logic, not constant declarations: C2 skips
 * files that fail `hasExecutableLogic` (function / class / arrow), which is
 * correct behaviour — a long file of plain constants is not a complexity
 * problem. A fixture padded with `const x = 1` silently never triggers the rule
 * it claims to test.
 */
function padTo(lines: number, header: string): string {
  const body: string[] = [header, ''];
  let i = 0;
  while (body.length < lines) {
    body.push(`function helper${i}(input: number): number {`);
    body.push(`  if (input > ${i}) return input - ${i};`);
    body.push(`  return input + ${i};`);
    body.push('}');
    body.push('');
    i++;
  }
  return body.slice(0, lines).join('\n') + '\n';
}

const SHADCN_HEADER = [
  "'use client';",
  "",
  "import * as React from 'react';",
  "import * as SheetPrimitive from '@radix-ui/react-dialog';",
].join('\n');

const PLAIN_HEADER = "// Ordinary application logic — no exemption applies.";

/** A router file importing `count` page components plus wouter's Switch/Route. */
function routerFile(count: number): string {
  const names = Array.from({ length: count }, (_, i) => `Page${i}`);
  return [
    "import { Switch, Route } from 'wouter';",
    ...names.map(n => `import ${n} from './pages/${n}';`),
    '',
    'export default function App() {',
    '  return (',
    '    <Switch>',
    ...names.map((n, i) => `      <Route path='/p${i}' component={${n}} />`),
    '    </Switch>',
    '  );',
    '}',
  ].join('\n') + '\n';
}

function pageFiles(count: number): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < count; i++) {
    out[`src/pages/Page${i}.tsx`] = `export default function Page${i}() { return null; }\n`;
  }
  return out;
}

export const FIXTURE_REPOS: CorpusRepo[] = [
  {
    id: 'fixture-malformed-manifest',
    rationale:
      'A clarx-manifest.json carrying keys the engine does not know. Asserts unknownKeys is populated and surfaces as the scan tip rather than being silently ignored (PA-006).',
    source: {
      kind: 'fixture',
      files: {
        'clarx-manifest.json': MANIFEST_WITH_UNKNOWN_KEYS + '\n',
        'README.md': '# Fixture: malformed manifest\n\nA manifest with invented keys.\n',
        'package.json': JSON.stringify({ name: 'fixture-malformed-manifest', type: 'module' }, null, 2) + '\n',
        'src/index.ts': 'export const value = 1;\n',
      },
    },
    maxFiles: 20,
  },
  {
    id: 'fixture-no-manifest',
    rationale:
      'No manifest at all. Pins the O1 hard failure and the "add a clarx-manifest.json" tip. Note it does NOT reach `confidence: low` — the corpus covers that path through the Python and Go entries instead.',
    source: {
      kind: 'fixture',
      files: {
        'README.md': '# Fixture: no manifest\n',
        'src/app.js': 'const helper = require("./missing-module");\nmodule.exports = helper;\n',
      },
    },
    maxFiles: 20,
  },
  {
    id: 'fixture-shadcn-oversized',
    rationale:
      'Three oversized files with logic: one shadcn by path, one shadcn by content fingerprint outside components/ui, and one ordinary control file. Proves the C2 exemption is SELECTIVE — the control must still be flagged, or an assertion of "no shadcn violation" would pass trivially (PA-004).',
    source: {
      kind: 'fixture',
      files: {
        'package.json': JSON.stringify({ name: 'fixture-shadcn-oversized', type: 'module' }, null, 2) + '\n',
        'README.md': '# Fixture: oversized shadcn components\n',
        'src/components/ui/sidebar.tsx': padTo(460, SHADCN_HEADER),
        'src/widgets/sheet.tsx': padTo(460, SHADCN_HEADER),
        'src/lib/control.ts': padTo(460, PLAIN_HEADER),
      },
    },
    maxFiles: 20,
  },
  {
    id: 'fixture-c2-marginal',
    rationale:
      'A single file marginally over the 400-line threshold. Pins the low end of the C2 severity gradient: a 426-line file must not read as a hard failure (PA-002).',
    source: {
      kind: 'fixture',
      files: {
        'package.json': JSON.stringify({ name: 'fixture-c2-marginal', type: 'module' }, null, 2) + '\n',
        'README.md': '# Fixture: marginally oversized file\n',
        'src/marginal.ts': padTo(426, PLAIN_HEADER),
      },
    },
    maxFiles: 20,
  },
  {
    id: 'fixture-c2-severe',
    rationale:
      'A single file far over the threshold. Pins the high end of the same gradient: 766 lines must escalate above the marginal case (PA-002).',
    source: {
      kind: 'fixture',
      files: {
        'package.json': JSON.stringify({ name: 'fixture-c2-severe', type: 'module' }, null, 2) + '\n',
        'README.md': '# Fixture: severely oversized file\n',
        'src/severe.ts': padTo(766, PLAIN_HEADER),
      },
    },
    maxFiles: 20,
  },
  {
    id: 'fixture-router-fanout',
    rationale:
      'A file importing 20 page components and wiring them through wouter Switch/Route — structurally a router, and over the C3 import-surface threshold. Pins whether routers are auto-detected or still require the highFanOut manifest escape hatch (PA-010).',
    source: {
      kind: 'fixture',
      files: {
        'package.json': JSON.stringify({ name: 'fixture-router-fanout', type: 'module' }, null, 2) + '\n',
        'README.md': '# Fixture: router fan-out\n',
        'src/App.tsx': routerFile(20),
        ...pageFiles(20),
      },
    },
    maxFiles: 40,
  },
  {
    id: 'fixture-dotfile-config',
    rationale:
      'Root-level dotfiles whose names begin with a generated-directory prefix — .coveragerc, .cachefile, .buildrc. These are configuration, committed on purpose. C1 must not report them as generated artifacts (found on the real psf/requests entry, where .coveragerc was a hard failure capping the score).',
    source: {
      kind: 'fixture',
      files: {
        'package.json': JSON.stringify({ name: 'fixture-dotfile-config', type: 'module' }, null, 2) + '\n',
        'README.md': '# Fixture: dotfile config vs generated dirs\n',
        '.coveragerc': '[run]\nbranch = True\n',
        '.cachefile': 'not a cache directory\n',
        '.buildrc': 'not a build directory\n',
        'src/index.ts': 'export const value = 1;\n',
      },
    },
    maxFiles: 20,
  },
  {
    id: 'local-clarx',
    rationale:
      'The engine repo itself. Dogfood: it ships a real clarx-manifest.json, so it pins the high-confidence path end to end.',
    source: { kind: 'local', path: new URL('../../..', import.meta.url).pathname },
    maxFiles: 3000,
  },
  {
    id: 'local-clarx-cloud',
    rationale:
      'The cloud monorepo. A large TypeScript workspace with a manifest — the other half of the dogfood pair, and the tree whose findings you read most often.',
    source: { kind: 'local', path: new URL('../../../../clarx-cloud', import.meta.url).pathname },
    maxFiles: 4000,
  },
];
