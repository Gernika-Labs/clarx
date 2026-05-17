import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FileEntry } from '../analyzers/filesystem.js';
import type { ImportGraph } from '../analyzers/import-graph.js';
import {
  evaluateB1,
  evaluateB2,
  evaluateB3,
  evaluateB4,
  evaluateB5,
  evaluateC1,
  evaluateC2,
  evaluateC3,
  evaluateC4,
  evaluateC5,
  evaluateC6,
  evaluateD1,
  evaluateD2,
  evaluateD3,
  evaluateD4WithRoot,
  evaluateD5,
  evaluateD6,
  evaluateE1,
  evaluateE2,
  evaluateE3,
  evaluateE4,
  evaluateE5,
  evaluateO5,
} from '../analyzers/index.js';
import type { Manifest, RuleId, RuleResult } from '../types.js';

export type EvaluationResult = {
  rules: Partial<Record<RuleId, RuleResult>>;
  importGraphResolved: boolean;
};

async function readGuidanceContent(root: string, files: FileEntry[]): Promise<string> {
  const parts: string[] = [];
  for (const name of ['CLAUDE.md', 'AGENTS.md']) {
    if (files.some(f => f.relativePath === name)) {
      try { parts.push(await readFile(join(root, name), 'utf-8')); } catch { /* ignore */ }
    }
  }
  return parts.join('\n');
}

const COMMAND_RE = /`?(yarn|npm run|pnpm(?: run)?|npx|make|go test|cargo test|pytest|jest|vitest|tsc)\s/i;
const DIR_RE = /`[a-z][a-z0-9_-]*\/[a-z]/;

async function readRootPkgScripts(root: string, files: FileEntry[]): Promise<Set<string>> {
  if (!files.some(f => f.relativePath === 'package.json')) return new Set();
  try {
    const raw = await readFile(join(root, 'package.json'), 'utf-8');
    const pkg = JSON.parse(raw) as { scripts?: Record<string, string> };
    return new Set(Object.keys(pkg.scripts ?? {}));
  } catch {
    return new Set();
  }
}

export async function evaluateRules(
  root: string,
  files: FileEntry[],
  manifest: Manifest | null,
  importGraph: ImportGraph,
  gitTrackedPaths: Set<string> = new Set()
): Promise<EvaluationResult> {
  const rules: Partial<Record<RuleId, RuleResult>> = {};

  // ── Discoverability ───────────────────────────────────────────────────────

  rules['D1'] = await evaluateD1(root, manifest);
  rules['D2'] = await evaluateD2(root, manifest, files);
  rules['D3'] = evaluateD3(files, manifest);
  rules['D4'] = await evaluateD4WithRoot(root, files);
  rules['D5'] = evaluateD5(files, manifest);
  rules['D6'] = evaluateD6(files);

  // ── Boundary Clarity ──────────────────────────────────────────────────────

  rules['B1'] = evaluateB1(importGraph, manifest);
  rules['B2'] = evaluateB2(files, manifest);
  rules['B3'] = await evaluateB3(root, manifest, files);
  rules['B4'] = evaluateB4(files);
  rules['B5'] = evaluateB5(files);

  // ── Context Efficiency ────────────────────────────────────────────────────

  rules['C1'] = evaluateC1(files, manifest, gitTrackedPaths);
  rules['C2'] = await evaluateC2(root, files);
  rules['C3'] = evaluateC3(importGraph, manifest);
  rules['C4'] = evaluateC4(importGraph, manifest);
  rules['C5'] = evaluateC5(importGraph, files);
  rules['C6'] = await evaluateC6(root, files);

  // ── Operational Guidance ──────────────────────────────────────────────────

  const guidanceFiles = ['CLAUDE.md', 'AGENTS.md', 'clarx-manifest.json', '.cursor'];
  const hasGuidance = files.some(f =>
    guidanceFiles.some(g => f.relativePath === g || f.relativePath.startsWith(g + '/'))
  );
  rules['O1'] = {
    id: 'O1',
    passed: hasGuidance || manifest !== null,
    severity: 'hard_failure',
    confidence: 'medium',
    scoreImpact: 100,
    message: hasGuidance || manifest !== null
      ? 'Machine-readable guidance file found'
      : 'No CLAUDE.md, AGENTS.md, or clarx-manifest.json found',
    ...(!(hasGuidance || manifest !== null) && {
      remediation: 'Add a clarx-manifest.json at the repo root. At minimum include verificationCommands so the engine can confirm test and typecheck commands exist.',
    }),
  };

  const hasGeneratedDeclaration = manifest !== null && (manifest.generated?.length ?? 0) > 0;
  rules['O2'] = {
    id: 'O2',
    passed: hasGeneratedDeclaration,
    severity: 'warning',
    confidence: 'medium',
    scoreImpact: 25,
    message: hasGeneratedDeclaration
      ? 'Generated directories declared in manifest'
      : 'Generated directories not declared in clarx-manifest.json — agents cannot tell which dirs to skip',
    ...(!hasGeneratedDeclaration && {
      remediation: 'Add a "generated" array to clarx-manifest.json (e.g. ["dist", ".next"]). This is separate from .gitignore — it tells AI agents which directories to exclude from analysis.',
    }),
  };

  const guidanceContent = await readGuidanceContent(root, files);

  const pkgScripts = await readRootPkgScripts(root, files);
  const pkgHasVerification = pkgScripts.has('test') || pkgScripts.has('typecheck') || pkgScripts.has('lint');
  const hasVerificationCommands = (manifest?.verificationCommands != null &&
    Object.keys(manifest.verificationCommands).length > 0) ||
    COMMAND_RE.test(guidanceContent) ||
    pkgHasVerification;
  rules['O3'] = {
    id: 'O3',
    passed: hasVerificationCommands,
    severity: 'warning',
    confidence: 'medium',
    scoreImpact: 25,
    message: hasVerificationCommands
      ? pkgHasVerification && !(manifest?.verificationCommands != null && Object.keys(manifest.verificationCommands).length > 0) && !COMMAND_RE.test(guidanceContent)
        ? 'Verification commands found in package.json scripts'
        : 'Verification commands declared in guidance'
      : 'No verification commands found in manifest or guidance files',
    ...(!hasVerificationCommands && {
      remediation: 'Add verificationCommands to clarx-manifest.json with at minimum "typecheck" and "test" scripts.',
    }),
  };

  const hasCommonTasks = (manifest?.commonTasks != null &&
    Object.keys(manifest.commonTasks).length > 0) ||
    DIR_RE.test(guidanceContent);
  rules['O4'] = {
    id: 'O4',
    passed: hasCommonTasks,
    severity: 'warning',
    confidence: 'medium',
    scoreImpact: 25,
    message: hasCommonTasks
      ? 'Common task locations declared in guidance'
      : 'No common task locations found in manifest or guidance files',
    ...(!hasCommonTasks && {
      remediation: 'Add a commonTasks section to clarx-manifest.json mapping task names to their directory paths.',
    }),
  };

  rules['O5'] = evaluateO5(files, manifest);

  // ── Edit Safety ───────────────────────────────────────────────────────────

  rules['E1'] = evaluateE1(files);
  rules['E2'] = evaluateE2(files);
  rules['E3'] = await evaluateE3(root, files);
  rules['E4'] = await evaluateE4(root, files);
  rules['E5'] = await evaluateE5(root, files, manifest);

  return { rules, importGraphResolved: true };
}
