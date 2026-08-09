import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildUpgradePlan, runUpgrade, readPackageVersion } from './upgrade.js';
import {
  writeManifest,
  writeChecksums,
  createInitialManifest,
  buildChecksums,
  readManifest
} from './manifest.js';
import { FRAMEWORK_PATHS } from './paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '../..');

test('readPackageVersion reads package.json', () => {
  const v = readPackageVersion(packageRoot);
  assert.match(v, /^\d+\.\d+\.\d+/);
});

test('buildUpgradePlan marks missing files as add', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-up-'));
  try {
    fs.mkdirSync(path.join(tmp, 'src/framework'), { recursive: true });
    // empty framework dir → everything from package is "add"
    const plan = buildUpgradePlan({
      projectRoot: tmp,
      packageRoot,
      pathSpecs: ['src/framework/core/compose.js'],
      tier: 'framework',
      previousChecksums: {}
    });
    assert.ok(plan.length >= 1);
    assert.equal(plan[0].status, 'add');
    assert.equal(plan[0].rel, 'src/framework/core/compose.js');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('runUpgrade dry-run on mini project does not write framework files', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-up-'));
  try {
    // Minimal project marker
    fs.mkdirSync(path.join(tmp, 'src/framework'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'src/framework/placeholder.js'), '// old\n');

    const manifest = createInitialManifest({
      frameworkVersion: '0.0.0',
      template: 'basic'
    });
    writeManifest(tmp, manifest);
    writeChecksums(tmp, buildChecksums(tmp, FRAMEWORK_PATHS));

    const code = await runUpgrade({
      packageRoot,
      projectRoot: tmp,
      dryRun: true,
      yes: true
    });
    assert.equal(code, 0);

    // placeholder still only file if we never applied — dry-run
    assert.ok(fs.existsSync(path.join(tmp, 'src/framework/placeholder.js')));
    assert.equal(
      fs.existsSync(path.join(tmp, 'src/framework/core/compose.js')),
      false,
      'dry-run must not copy compose.js'
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('runUpgrade applies framework and updates manifest', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-up-'));
  try {
    fs.mkdirSync(path.join(tmp, 'src/framework'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'src/framework/placeholder.js'), '// old\n');

    writeManifest(
      tmp,
      createInitialManifest({ frameworkVersion: '0.0.0', template: 'basic' })
    );
    writeChecksums(tmp, {});

    const code = await runUpgrade({
      packageRoot,
      projectRoot: tmp,
      dryRun: false,
      yes: true,
      backup: true
    });
    assert.equal(code, 0);

    assert.ok(
      fs.existsSync(path.join(tmp, 'src/framework/core/compose.js')),
      'compose.js should be copied'
    );

    const m = readManifest(tmp);
    assert.equal(m.frameworkVersion, readPackageVersion(packageRoot));
    assert.ok(m.upgradedAt);

    // pages must not be created from package examples by upgrade
    assert.equal(fs.existsSync(path.join(tmp, 'src/pages/examples/talk')), false);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('local-modified without --force returns exit 2', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-up-'));
  try {
    // Seed one real framework file from package, then dirty it
    const rel = 'src/framework/core/compose.js';
    const src = path.join(packageRoot, rel);
    const dest = path.join(tmp, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);

    const prevHash = buildChecksums(tmp, [rel]);
    writeChecksums(tmp, prevHash);
    writeManifest(
      tmp,
      createInitialManifest({ frameworkVersion: '0.0.0', template: 'basic' })
    );

    // Local edit
    fs.appendFileSync(dest, '\n// local hack\n');

    const code = await runUpgrade({
      packageRoot,
      projectRoot: tmp,
      dryRun: false,
      yes: true,
      force: false,
      backup: false
    });
    assert.equal(code, 2);

    // File still has local hack
    const body = fs.readFileSync(dest, 'utf8');
    assert.ok(body.includes('local hack'));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
