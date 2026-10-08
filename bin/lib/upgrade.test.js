import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildUpgradePlan, runUpgrade, readPackageVersion } from './upgrade.js';
import {
  writeManifest,
  writeChecksums,
  createInitialManifest,
  buildChecksums,
  readManifest,
  readChecksums,
  listFiles
} from './manifest.js';
import { FRAMEWORK_PATHS, FRAMEWORK_UTILS_PATHS, COMPONENT_PATHS, DEFAULT_POLICY } from './paths.js';

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

// An older project has string-based slot utilities and no trusted HTML or URL
// utility. Its component library stays user-owned during a default upgrade.
const createLegacyProject = () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-legacy-up-'));
  const write = (rel, body) => {
    const dest = path.join(tmp, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, body);
  };
  write('package.json', JSON.stringify({ type: 'module' }));
  write('src/framework/placeholder.js', '// previous framework\n');
  write('src/components/utils/processSlot.js', `export const processSlotTrusted = value =>
    typeof value === 'string' ? value : '';
`);
  write('src/components/utils/componentError.js', `export const validatePropTypes = (props, schema) => {
    for (const [key, type] of Object.entries(schema)) {
      if (typeof props[key] !== type) throw new TypeError('Unexpected prop type');
    }
};
`);
  write('src/components/utils/attrsToString.js', `export const attrsToString = value => value || '';
`);
  for (const name of ['escapeHtml.js', 'escapeAttr.js']) {
    write(`src/components/utils/${name}`, fs.readFileSync(path.join(packageRoot, 'src/components/utils', name)));
  }
  write('src/components/library.js', `import { processSlotTrusted } from './utils/processSlot.js';
import { validatePropTypes } from './utils/componentError.js';
export default { atoms: { text: props => {
  validatePropTypes(props, { slot: 'string' });
  return '<p>' + processSlotTrusted(props.slot) + '</p>';
} }, molecules: {}, organisms: {} };
`);
  write('src/components/utils/custom.js', 'export const custom = true;\n');
  write('src/pages/index.js', 'export const components = []; // user page\n');
  const manifest = createInitialManifest({ frameworkVersion: '0.2.1', template: 'basic' });
  manifest.policy.frameworkPaths = ['src/framework'];
  writeManifest(tmp, manifest);
  writeChecksums(tmp, buildChecksums(tmp, ['src/framework', ...COMPONENT_PATHS]));
  return tmp;
};

test('default upgrade installs shared utilities and renders an older component library', async t => {
  const tmp = createLegacyProject();
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const preserved = ['src/components/library.js', 'src/components/utils/custom.js', 'src/pages/index.js'];
  const originals = buildChecksums(tmp, preserved);

  assert.equal(await runUpgrade({ packageRoot, projectRoot: tmp, yes: true }), 0);
  assert.deepEqual(buildChecksums(tmp, preserved), originals);
  assert.deepEqual(readManifest(tmp).policy, DEFAULT_POLICY);
  const checksums = readChecksums(tmp);
  for (const rel of FRAMEWORK_UTILS_PATHS) assert.equal(checksums[rel], buildChecksums(packageRoot, [rel])[rel]);

  const { compose } = await import(pathToFileURL(path.join(tmp, 'src/framework/core/compose.js')));
  const nested = { type: 'atom', name: 'text', props: { slot: 'Nested' } };
  assert.equal(compose([{ type: 'atom', name: 'text', props: { slot: ['<unsafe>', nested] } }], { strict: true }),
    '<p>&lt;unsafe&gt;<p>Nested</p></p>');
  const { generateStylesheetTag } = await import(pathToFileURL(path.join(tmp, 'src/framework/build/pipeline/generateStylesheetTag.js')));
  assert.match(generateStylesheetTag({ href: '/site.css' }), /href="\/site.css"/);
  assert.throws(() => generateStylesheetTag({ href: 'javascript:alert(1)' }), /Unsupported URL protocol/);

  // Ownership metadata also migrates when the project files already match.
  const manifest = readManifest(tmp);
  manifest.policy.frameworkPaths = ['src/framework'];
  writeManifest(tmp, manifest);
  assert.equal(await runUpgrade({ packageRoot, projectRoot: tmp, yes: true }), 0);
  assert.deepEqual(readManifest(tmp).policy, DEFAULT_POLICY);
});

test('default upgrade preserves modified shared utilities unless forced and backs them up', async t => {
  const tmp = createLegacyProject();
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const rel = 'src/components/utils/processSlot.js';
  const dest = path.join(tmp, rel);
  fs.appendFileSync(dest, '// local customization\n');
  const customized = fs.readFileSync(dest, 'utf8');

  assert.equal(await runUpgrade({ packageRoot, projectRoot: tmp, yes: true }), 2);
  assert.equal(fs.readFileSync(dest, 'utf8'), customized);
  assert.equal(fs.existsSync(path.join(tmp, 'src/framework/core/compose.js')), false,
    'a blocked upgrade must not partially install the framework');

  assert.equal(await runUpgrade({ packageRoot, projectRoot: tmp, yes: true, force: true }), 0);
  assert.equal(fs.readFileSync(dest, 'utf8'), fs.readFileSync(path.join(packageRoot, rel), 'utf8'));
  const backup = listFiles(tmp, '.b0nes/backups').find(file => file.endsWith(`/${rel}`));
  assert.ok(backup, 'the customized utility should be backed up');
  assert.equal(fs.readFileSync(path.join(tmp, backup), 'utf8'), customized);
});

test('default upgrade refuses differing legacy utilities with no checksum baseline', async t => {
  const tmp = createLegacyProject();
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  writeChecksums(tmp, buildChecksums(tmp, ['src/framework']));
  const rel = 'src/components/utils/processSlot.js';
  const original = fs.readFileSync(path.join(tmp, rel), 'utf8');

  assert.equal(await runUpgrade({ packageRoot, projectRoot: tmp, yes: true }), 2);
  assert.equal(fs.readFileSync(path.join(tmp, rel), 'utf8'), original);
  assert.equal(fs.existsSync(path.join(tmp, 'src/components/utils/html.js')), false);
});
