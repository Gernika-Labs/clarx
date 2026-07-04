import cliPackage from '../../../packages/cli/package.json';

/** Published Clarx CLI version — single source of truth for docs and landing. */
export const CLARX_VERSION = cliPackage.version;

export function formatClarxVersion(prefix = 'v'): string {
  return `${prefix}${CLARX_VERSION}`;
}