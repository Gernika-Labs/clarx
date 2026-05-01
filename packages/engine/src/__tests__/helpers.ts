import type { FileEntry } from '../analyzers/filesystem.js';
import type { Manifest } from '../types.js';

export function makeFile(relativePath: string, lines?: number): FileEntry {
  return { path: `/root/${relativePath}`, relativePath, lines, isGenerated: false };
}

export function makeGenerated(relativePath: string): FileEntry {
  return { path: `/root/${relativePath}`, relativePath, isGenerated: true };
}

export function makeManifest(overrides: Partial<Manifest> = {}): Manifest {
  return {
    version: '0.1',
    generated: ['**/dist', '**/node_modules'],
    workspaces: {
      'packages/a': 'Package A',
      'packages/b': 'Package B',
    },
    verificationCommands: { typecheck: 'tsc', test: 'jest', lint: 'eslint' },
    commonTasks: { 'add a component': 'packages/a/src/' },
    ...overrides,
  };
}
