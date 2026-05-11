import type { FileEntry } from './filesystem.js';
import type { RuleResult } from '../types.js';

// D6 — no route name appears at multiple URL depths (shadow routes)
//
// File-system routers (Next.js, Remix, SvelteKit) make it structurally
// possible to have two handlers for what looks like the same resource:
//   app/api/mnemonic/route.ts        → /api/mnemonic
//   app/api/mobile/mnemonic/route.ts → /api/mobile/mnemonic
//
// When the same leaf segment appears at different depths, one route likely
// shadows or duplicates the other. Developers can't easily tell which one
// to call or which one is current.

const ROUTE_FILE_NAMES = new Set([
  'route.ts', 'route.tsx', 'route.js', 'route.jsx',
]);

function routeSegments(filePath: string): string[] | null {
  const parts = filePath.split('/');
  const appIdx = parts.findIndex(s => s === 'app');
  if (appIdx === -1) return null;
  // Segments between 'app/' and the filename, excluding route groups '(group)'
  return parts.slice(appIdx + 1, -1).filter(s => !s.startsWith('('));
}

export function evaluateD6(files: FileEntry[]): RuleResult {
  const routeFiles = files.filter(f => {
    if (f.isGenerated) return false;
    return ROUTE_FILE_NAMES.has(f.relativePath.split('/').pop() ?? '');
  });

  if (routeFiles.length === 0) {
    return {
      id: 'D6',
      passed: true,
      severity: 'warning',
      confidence: 'low',
      scoreImpact: 25,
      message: 'No file-system route handlers found',
    };
  }

  const byLeaf = new Map<string, string[]>();
  for (const f of routeFiles) {
    const segs = routeSegments(f.relativePath);
    if (!segs || segs.length === 0) continue;
    const leaf = segs[segs.length - 1]!;
    if (leaf.startsWith('[')) continue; // dynamic segment — not a stable name
    const list = byLeaf.get(leaf) ?? [];
    list.push(f.relativePath);
    byLeaf.set(leaf, list);
  }

  const shadowGroups = [...byLeaf.entries()].filter(([, paths]) => paths.length > 1);

  if (shadowGroups.length === 0) {
    return {
      id: 'D6',
      passed: true,
      severity: 'warning',
      confidence: 'medium',
      scoreImpact: 25,
      message: 'No shadow or duplicate route handlers detected',
    };
  }

  const totalRoutes = shadowGroups.reduce((n, [, paths]) => n + paths.length, 0);
  return {
    id: 'D6',
    passed: false,
    severity: 'warning',
    confidence: 'medium',
    scoreImpact: 25,
    message: `${shadowGroups.length} route name${shadowGroups.length > 1 ? 's' : ''} appear at multiple URL depths — likely shadow or duplicate handlers`,
    remediation: 'Pick one canonical URL for each resource and delete or redirect the other. If both are intentional (mobile vs desktop API), document the distinction in clarx-manifest.json.',
    locations: shadowGroups.flatMap(([leaf, paths]) =>
      paths.map(p => ({ path: p, detail: `"${leaf}" also exists at a different URL depth` }))
    ),
  };
}
