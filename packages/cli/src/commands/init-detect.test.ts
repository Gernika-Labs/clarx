import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { detect, detectEcosystem } from './init-detect.js';

async function repo(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'clarx-init-'));
  for (const [rel, content] of Object.entries(files)) {
    const abs = join(dir, rel);
    await mkdir(join(abs, '..'), { recursive: true });
    await writeFile(abs, content, 'utf-8');
  }
  return dir;
}

describe('init detection', () => {
  test('a Cargo project never gets pnpm commands', async () => {
    // The bug this replaces: every manifest claimed `pnpm typecheck`, `pnpm test`
    // and `pnpm lint`, on repos with no package.json at all.
    const dir = await repo({ 'Cargo.toml': '[package]\nname = "thing"\n', 'src/main.rs': 'fn main() {}\n' });
    const d = await detect(dir);
    assert.equal(d.ecosystem, 'rust');
    assert.deepEqual(d.verificationCommands, { typecheck: 'cargo check', test: 'cargo test', lint: 'cargo clippy' });
    assert.deepEqual(d.generated, ['target']);
    assert.ok(!JSON.stringify(d).includes('pnpm'));
    assert.ok(!JSON.stringify(d).includes('.next'));
  });

  test('a Node project references only scripts it actually declares', async () => {
    const dir = await repo({
      'package.json': JSON.stringify({ packageManager: 'pnpm@10.0.0', scripts: { test: 'vitest run', 'check:type': 'tsc --noEmit' } }),
    });
    const d = await detect(dir);
    assert.equal(d.verificationCommands?.test, 'pnpm run test');
    assert.equal(d.verificationCommands?.typecheck, 'pnpm run check:type');
    // No lint script declared, so no lint command invented.
    assert.equal(d.verificationCommands?.lint, undefined);
  });

  test('verificationCommands is omitted entirely when nothing can be derived', async () => {
    // A field that is absent says "unknown". A field that guesses says something
    // false with the same confidence as everything else in the manifest.
    const dir = await repo({ 'pyproject.toml': '[project]\nname = "thing"\n' });
    const d = await detect(dir);
    assert.equal(d.ecosystem, 'python');
    assert.equal(d.verificationCommands, undefined);
  });

  test('a project with no recognised ecosystem gets no commands and no globs', async () => {
    const dir = await repo({ 'README.md': '# thing\n' });
    const d = await detect(dir);
    assert.equal(d.ecosystem, 'unknown');
    assert.equal(d.verificationCommands, undefined);
    assert.deepEqual(d.generated, []);
  });

  test('prefers a non-mutating lint script when both exist', async () => {
    // `lint` is frequently a fixer. Handing an agent a fixer as its verification
    // step invites edits nobody asked for.
    const dir = await repo({
      'package.json': JSON.stringify({ scripts: { lint: 'biome lint --write .', 'check:lint': 'biome lint .' } }),
    });
    const d = await detect(dir);
    assert.equal(d.verificationCommands?.lint, 'npm run check:lint');
  });

  test('package manager comes from the project, not a default', async () => {
    const yarn = await repo({ 'package.json': JSON.stringify({ scripts: { test: 'jest' } }), 'yarn.lock': '' });
    assert.equal((await detect(yarn)).verificationCommands?.test, 'yarn run test');

    const npm = await repo({ 'package.json': JSON.stringify({ scripts: { test: 'jest' } }) });
    assert.equal((await detect(npm)).verificationCommands?.test, 'npm run test');
  });

  test('framework globs appear only when the framework is in use', async () => {
    const plain = await repo({ 'package.json': '{}' });
    assert.ok(!(await detect(plain)).generated.includes('**/.next'));

    const next = await repo({ 'package.json': '{}', '.next/BUILD_ID': 'x' });
    assert.ok((await detect(next)).generated.includes('**/.next'));
  });

  test('go projects get go commands', async () => {
    const dir = await repo({ 'go.mod': 'module example.com/thing\n' });
    assert.equal(await detectEcosystem(dir), 'go');
    assert.equal((await detect(dir)).verificationCommands?.test, 'go test ./...');
  });
});
