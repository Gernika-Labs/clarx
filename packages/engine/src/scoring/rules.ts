import type { FileEntry } from '../analyzers/filesystem.js';
import type { ImportGraph } from '../analyzers/import-graph.js';
import { evaluateC1, evaluateC2 } from '../analyzers/rules-c.js';
import { evaluateD1, evaluateD4 } from '../analyzers/rules-d.js';
import { evaluateD2, evaluateD3, evaluateD5 } from '../analyzers/rules-d2-d3-d5.js';
import { evaluateB3 } from '../analyzers/rules-b.js';
import { evaluateB1, evaluateB2 } from '../analyzers/rules-b1-b2.js';
import { evaluateC3, evaluateC4, evaluateC5 } from '../analyzers/rules-c3-c4-c5.js';
import { evaluateE1, evaluateE3, evaluateE5 } from '../analyzers/rules-e.js';
import { evaluateB4, evaluateB5, evaluateE2, evaluateE4 } from '../analyzers/rules-remaining.js';
import { evaluateO5 } from '../analyzers/rules-o5.js';
import type { Manifest, RuleId, RuleResult } from '../types.js';

export type EvaluationResult = {
  rules: Partial<Record<RuleId, RuleResult>>;
  importGraphResolved: boolean;
};

export async function evaluateRules(
  root: string,
  files: FileEntry[],
  manifest: Manifest | null,
  importGraph: ImportGraph
): Promise<EvaluationResult> {
  const rules: Partial<Record<RuleId, RuleResult>> = {};

  // ── Discoverability ───────────────────────────────────────────────────────

  rules['D1'] = await evaluateD1(root);
  rules['D2'] = await evaluateD2(root, manifest, files);
  rules['D3'] = evaluateD3(files, manifest);
  rules['D4'] = evaluateD4(files);
  rules['D5'] = evaluateD5(files, manifest);

  // ── Boundary Clarity ──────────────────────────────────────────────────────

  rules['B1'] = evaluateB1(importGraph, manifest);
  rules['B2'] = evaluateB2(files, manifest);
  rules['B3'] = await evaluateB3(root, manifest, files);
  rules['B4'] = evaluateB4(files);
  rules['B5'] = evaluateB5(files);

  // ── Context Efficiency ────────────────────────────────────────────────────

  rules['C1'] = evaluateC1(files, manifest);
  rules['C2'] = evaluateC2(files);
  rules['C3'] = evaluateC3(importGraph, manifest);
  rules['C4'] = evaluateC4(importGraph, manifest);
  rules['C5'] = evaluateC5(importGraph, files);

  // ── Operational Guidance ──────────────────────────────────────────────────

  const guidanceFiles = ['CLAUDE.md', 'AGENTS.md', 'clarx-manifest.json', '.cursor'];
  const hasGuidance = files.some(f =>
    guidanceFiles.some(g => f.relativePath === g || f.relativePath.startsWith(g + '/'))
  );
  rules['O1'] = {
    id: 'O1',
    passed: hasGuidance || manifest !== null,
    severity: 'hard_failure',
    scoreImpact: 100,
    message: hasGuidance || manifest !== null
      ? 'Machine-readable guidance file found'
      : 'No CLAUDE.md, AGENTS.md, or clarx-manifest.json found',
  };

  const hasGeneratedDeclaration = manifest !== null && (manifest.generated?.length ?? 0) > 0;
  rules['O2'] = {
    id: 'O2',
    passed: hasGeneratedDeclaration,
    severity: 'warning',
    scoreImpact: 25,
    message: hasGeneratedDeclaration
      ? 'Generated directories declared in manifest'
      : 'No generated directories declared in guidance file or manifest',
  };

  const hasVerificationCommands = manifest !== null &&
    manifest.verificationCommands != null &&
    Object.keys(manifest.verificationCommands).length > 0;
  rules['O3'] = {
    id: 'O3',
    passed: hasVerificationCommands,
    severity: 'warning',
    scoreImpact: 25,
    message: hasVerificationCommands
      ? 'Verification commands declared in manifest'
      : 'No verification commands declared',
  };

  const hasCommonTasks = manifest !== null &&
    manifest.commonTasks != null &&
    Object.keys(manifest.commonTasks).length > 0;
  rules['O4'] = {
    id: 'O4',
    passed: hasCommonTasks,
    severity: 'warning',
    scoreImpact: 25,
    message: hasCommonTasks
      ? 'Common task locations declared in manifest'
      : 'No common task locations declared',
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
