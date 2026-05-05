import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FileEntry } from './filesystem.js';
import type { ViewModelMigrationOpportunity } from '../types.js';

const ENTRY_FILE_RE = /(?:^|\/)(?:page|screen|view|container|layout)\.[jt]sx?$/;
const BOUNDARY_IMPORT_RE = /(?:^|\/)(?:view-models?\/|presenters?\/|facades?\/)|(?:^|\/)(?:use[A-Z][A-Za-z0-9]*ViewModel|[A-Za-z0-9-]+(?:view-model|viewmodel|presenter|facade|adapter))\.[jt]sx?$/;
const QUERY_HOOK_IMPORT_RE = /(?:^|\/)(?:hooks?\/queries?\/|queries?\/|use-[a-z0-9-]*query|use[A-Z][A-Za-z0-9]*Query|use[A-Z][A-Za-z0-9]*(?:Pagination|List|Summary|Data|Feed|Members|Usage|Training))/;
const HANDLER_TYPE_IMPORT_RE = /(?:^|\/)(?:services?\/handlers?\/|handlers?\/|api\/handlers?\/|types?\/api\/)/;
const MUTATION_SIGNAL_RE = /\b(useMutation|mutate(?:Async)?|Mutation\b|onSubmit|handleSubmit|refetch\s*:|refetch\()|\b(open|setOpen|selected|draft|modal|dialog)\b/g;
const TOKEN_SIGNAL_RE = /\b(accessToken|idToken|useUser|auth\b|organizationId|orgId)\b/g;
const INLINE_DERIVED_SIGNAL_RE = /\bconst\s+(?:is[A-Z][A-Za-z0-9]*|has[A-Z][A-Za-z0-9]*|can[A-Z][A-Za-z0-9]*|should[A-Z][A-Za-z0-9]*|[a-zA-Z0-9]+Label|[a-zA-Z0-9]+Name)\s*=\s*/g;

function countMatches(source: string, re: RegExp): number {
  const matches = source.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`));
  return matches?.length ?? 0;
}

function classify(score: number): 'high' | 'medium' | 'low' {
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function summarize(
  rating: 'high' | 'medium' | 'low',
  scores: ViewModelMigrationOpportunity['scores'],
  signals: ViewModelMigrationOpportunity['signals'],
  limits: string[]
): string {
  const parts: string[] = [];
  if (signals.queryHookImports > 0) parts.push(`${signals.queryHookImports} query/data hook${signals.queryHookImports === 1 ? '' : 's'}`);
  if (signals.handlerTypeImports > 0) parts.push(`${signals.handlerTypeImports} handler/type import${signals.handlerTypeImports === 1 ? '' : 's'}`);
  if (signals.tokenReferences > 0) parts.push(`${signals.tokenReferences} token/auth reference${signals.tokenReferences === 1 ? '' : 's'}`);
  if (scores.tracingRoi > 0) parts.push(`tracing ROI ${scores.tracingRoi}`);
  if (scores.simplificationRoi > 0) parts.push(`simplification ROI ${scores.simplificationRoi}`);

  const basis = parts.length > 0 ? parts.join(', ') : 'page-level coordination signals';
  if (rating === 'high') return `High ROI candidate: ${basis}.`;
  if (rating === 'medium') return `Moderate ROI candidate: ${basis}.`;
  return `Possible candidate, but expected gain is limited: ${basis}${limits.length > 0 ? `; ${limits[0]}` : ''}.`;
}

export async function findViewModelMigrationOpportunities(
  root: string,
  files: FileEntry[]
): Promise<ViewModelMigrationOpportunity[]> {
  const candidates = files.filter(
    file => !file.isGenerated && ENTRY_FILE_RE.test(file.relativePath)
  );

  const opportunities: ViewModelMigrationOpportunity[] = [];

  for (const file of candidates) {
    let source: string;
    try {
      source = await readFile(join(root, file.relativePath), 'utf-8');
    } catch {
      continue;
    }

    const importPaths = [...source.matchAll(/(?:import|export)\b[^'"]*['"]([^'"]+)['"]/g)]
      .map(match => match[1] ?? '')
      .filter(Boolean);

    const hasBoundarySurface = importPaths.some(imp => BOUNDARY_IMPORT_RE.test(imp));
    if (hasBoundarySurface) continue;

    const queryHookImports = importPaths.filter(imp => QUERY_HOOK_IMPORT_RE.test(imp)).length;
    const handlerTypeImports = importPaths.filter(imp => HANDLER_TYPE_IMPORT_RE.test(imp)).length;
    const tokenReferences = countMatches(source, TOKEN_SIGNAL_RE);
    const mutationSignals = countMatches(source, MUTATION_SIGNAL_RE);
    const inlineDerivedSignals = countMatches(source, INLINE_DERIVED_SIGNAL_RE);
    const lines = file.lines ?? source.split('\n').length;

    let tracingRoi = 0;
    tracingRoi += Math.min(queryHookImports * 18, 54);
    tracingRoi += Math.min(handlerTypeImports * 16, 32);
    tracingRoi += Math.min(tokenReferences * 2, 10);
    tracingRoi -= Math.min(inlineDerivedSignals * 6, 24);

    let simplificationRoi = 0;
    simplificationRoi += Math.min(tokenReferences * 3, 15);
    simplificationRoi += lines >= 500 ? 18 : lines >= 300 ? 12 : lines >= 180 ? 6 : 0;
    simplificationRoi -= Math.min(mutationSignals * 4, 24);

    const score = Math.max(0, tracingRoi) + Math.max(0, simplificationRoi);

    if (queryHookImports === 0 && handlerTypeImports === 0 && tokenReferences < 2 && lines < 180) {
      continue;
    }

    const rating = classify(score);
    const reasons: string[] = [];
    const limits: string[] = [];
    if (queryHookImports >= 3) reasons.push(`multiple query/data hooks (${queryHookImports}) suggest high tracing density`);
    else if (queryHookImports > 0) reasons.push(`query/data hooks (${queryHookImports}) suggest page-level data coordination`);

    if (handlerTypeImports > 0) reasons.push(`handler/type imports (${handlerTypeImports}) are likely contract-tracing targets`);
    if (tokenReferences >= 4) reasons.push(`heavy token/auth plumbing (${tokenReferences} references) suggests extractable page overhead`);
    else if (tokenReferences > 0) reasons.push(`token/auth plumbing is still visible in the page`);

    if (lines >= 300) reasons.push(`page is heavy (${lines} lines), so simplification alone may reduce read cost`);
    if (mutationSignals >= 4) reasons.push(`mutation/UI-state density is high (${mutationSignals}), so shrink may be limited`);
    else if (mutationSignals === 0) reasons.push('no obvious mutation/UI-state signals, so page shrink potential is high');

    if (inlineDerivedSignals >= 2) limits.push(`several inline-derived fields are already visible (${inlineDerivedSignals}), so tracing savings may be lower`);
    if (queryHookImports <= 1 && handlerTypeImports === 0) limits.push('little multi-source data coordination detected, so tracing ROI may be modest');
    if (mutationSignals >= 4) limits.push(`mutation-heavy page (${mutationSignals} signals), so page shrink is likely limited`);
    if (lines < 180) limits.push(`page is already small (${lines} lines), so simplification ROI is limited`);

    opportunities.push({
      path: file.relativePath,
      score,
      rating,
      summary: summarize(rating, {
        tracingRoi: Math.max(0, tracingRoi),
        simplificationRoi: Math.max(0, simplificationRoi),
      }, {
        lines,
        queryHookImports,
        handlerTypeImports,
        tokenReferences,
        mutationSignals,
        hasBoundarySurface,
        inlineDerivedSignals,
      }, limits),
      reasons,
      limits,
      scores: {
        tracingRoi: Math.max(0, tracingRoi),
        simplificationRoi: Math.max(0, simplificationRoi),
      },
      signals: {
        lines,
        queryHookImports,
        handlerTypeImports,
        tokenReferences,
        mutationSignals,
        hasBoundarySurface,
        inlineDerivedSignals,
      },
    });
  }

  return opportunities
    .filter(item => item.score >= 25)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, 10);
}
