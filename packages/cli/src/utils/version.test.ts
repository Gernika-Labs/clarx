import test from 'node:test';
import assert from 'node:assert/strict';
import { getCliVersion } from './version.js';

test('getCliVersion reads version from package.json', () => {
  const version = getCliVersion();
  assert.match(version, /^\d+\.\d+\.\d+$/);
});