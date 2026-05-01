import type { FileEntry } from './filesystem.js';
import type { Manifest, RuleResult } from '../types.js';

// O5 — architecture document identifies high-risk files
export function evaluateO5(files: FileEntry[], manifest: Manifest | null): RuleResult {
  // Best signal: manifest.highFanIn is declared and non-empty
  if (manifest?.highFanIn && manifest.highFanIn.length > 0) {
    return {
      id: 'O5',
      passed: true,
      severity: 'recommendation',
      scoreImpact: 0,
      message: `${manifest.highFanIn.length} high fan-in file${manifest.highFanIn.length > 1 ? 's' : ''} identified in manifest`,
    };
  }

  // Also pass if an ARCHITECTURE.md or similar doc exists at the root
  const archDocs = ['ARCHITECTURE.md', 'ARCHITECTURE.mdx', 'architecture.md', 'docs/ARCHITECTURE.md'];
  const hasArchDoc = files.some(f => archDocs.includes(f.relativePath));
  if (hasArchDoc) {
    return {
      id: 'O5',
      passed: true,
      severity: 'recommendation',
      scoreImpact: 0,
      message: 'Architecture document found',
    };
  }

  return {
    id: 'O5',
    passed: false,
    severity: 'recommendation',
    scoreImpact: 0,
    message: 'No high-risk files identified in manifest or architecture document',
  };
}
