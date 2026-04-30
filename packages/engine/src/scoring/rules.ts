import type { FileEntry } from '../analyzers/filesystem.js';
import type { Manifest, RuleId, RuleResult } from '../types.js';

export type EvaluationResult = {
  rules: Partial<Record<RuleId, RuleResult>>;
  importGraphResolved: boolean;
};

export async function evaluateRules(
  root: string,
  files: FileEntry[],
  manifest: Manifest | null
): Promise<EvaluationResult> {
  const rules: Partial<Record<RuleId, RuleResult>> = {};

  // O1 — machine-readable guidance file
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

  // O2 — guidance declares generated directories
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

  // O3 — guidance declares verification commands
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

  // O4 — guidance declares where common changes belong
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

  // Additional rules will be implemented in subsequent analyzers
  // Stub remaining rules as passed with placeholder messages for now
  const stubPassed: RuleId[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'B1', 'B2', 'B3', 'B4', 'B5', 'C1', 'C2', 'C3', 'C4', 'C5', 'O5', 'E1', 'E2', 'E3', 'E4', 'E5'];
  for (const id of stubPassed) {
    if (!rules[id]) {
      rules[id] = { id, passed: true, severity: 'warning', scoreImpact: 0, message: 'Analysis not yet implemented' };
    }
  }

  return { rules, importGraphResolved: false };
}
