import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { installComponent } from './install-component.js';
import { updateCategoryIndex } from '../components/utils/componentRegistry.js';

const repository = fileURLToPath(new URL('../../', import.meta.url));
async function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-installer-'));
    fs.cpSync(path.join(repository, 'src'), path.join(root, 'src'), { recursive: true, filter: filename => !filename.endsWith('.test.js') });
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ type: 'module' }));
    const files = new Map();
    const requests = [];
    const server = http.createServer((req, res) => {
        requests.push(req.url);
        const response = files.get(new URL(req.url, 'http://localhost').pathname);
        if (response === undefined) { res.writeHead(404); res.end(); return; }
        if (typeof response === 'function') { response(req, res); return; }
        if (response.redirect) { res.writeHead(302, { location: response.redirect }); res.end(); return; }
        res.end(typeof response === 'string' ? response : JSON.stringify(response));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(async () => {
        server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
        fs.rmSync(root, { recursive: true, force: true });
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    return { root, base, files, requests };
}
const manifest = (name, extra = {}) => ({ name, version: '0.1.0', type: 'atom', files: { component: './renderer.js' }, ...extra });
const render = text => `export default () => ${JSON.stringify('<span>' + text + '</span>')};`;
const categoryIndex = root => path.join(root, 'src/components/atoms/index.js');
const transactionFiles = root => fs.readdirSync(path.join(root, 'src/components/atoms')).filter(name => name.startsWith('.b0nes-'));

test('direct and redirected manifests resolve files relative to the actual manifest and register usable components', async t => {
    const { root, base, files, requests } = await fixture(t);
    files.set('/redirect.json', { redirect: '/cards/b0nes.manifest.json' });
    files.set('/cards/b0nes.manifest.json', manifest('my-card', { dependencies: ['text'], files: { component: './renderer.js', client: './behavior.js' } }));
    files.set('/cards/renderer.js', render('Installed card'));
    files.set('/cards/behavior.js', 'export const client = root => { root.dataset.installed = "true"; };');
    const libraryModule = await import(pathToFileURL(path.join(root, 'src/components/library.js')));
    const atoms = libraryModule.default.atoms;
    const result = await installComponent(base + '/redirect.json?version=3', { projectRoot: root });
    assert.equal(result.success, true, result.error);
    assert.ok(requests.includes('/cards/renderer.js'));
    assert.equal(atoms['my-card'](), '<span>Installed card</span>', 'already-loaded library should see installation');
    assert.ok(fs.existsSync(path.join(result.path, 'client.js')), 'behavior must use the runtime filename');
    const exports = await import(pathToFileURL(categoryIndex(root)).href + '?installed=1');
    assert.equal(exports.myCard(), '<span>Installed card</span>');
    assert.equal(exports.atoms['my-card'](), '<span>Installed card</span>');
    assert.deepEqual(transactionFiles(root), []);
});

test('directory and JavaScript manifests support valid exports for leading digits and reserved words', async t => {
    const { root, base, files } = await fixture(t);
    files.set('/digit/b0nes.manifest.json', manifest('3d-card'));
    files.set('/digit/renderer.js', 'export const _3dCard = () => "Digit card";');
    assert.equal((await installComponent(base + '/digit/', { projectRoot: root })).success, true);
    files.set('/keyword/index.js', '/** @b0nes-manifest\n' + JSON.stringify(manifest('class')) + '\n*/\nexport default {};');
    files.set('/keyword/renderer.js', 'export const _class = () => "Keyword card";');
    const result = await installComponent(base + '/keyword', { projectRoot: root });
    assert.equal(result.success, true, result.error);
    const exports = await import(pathToFileURL(categoryIndex(root)).href + '?installed=2');
    assert.equal(exports._3dCard(), 'Digit card');
    assert.equal(exports._class(), 'Keyword card');
});

test('failed downloads and missing dependencies leave components and category index untouched', async t => {
    const { root, base, files } = await fixture(t);
    const original = fs.readFileSync(categoryIndex(root), 'utf8');
    files.set('/late/b0nes.manifest.json', manifest('late-card', { files: { component: './renderer.js', client: './missing.js' } }));
    files.set('/late/renderer.js', render('Never installed'));
    const failed = await installComponent(base + '/late/b0nes.manifest.json', { projectRoot: root });
    assert.equal(failed.success, false);
    assert.equal(fs.existsSync(path.join(root, 'src/components/atoms/late-card')), false);
    assert.equal(fs.readFileSync(categoryIndex(root), 'utf8'), original);
    files.set('/late/b0nes.manifest.json', manifest('missing-dependency', { dependencies: ['atom:not-present'] }));
    const dependency = await installComponent(base + '/late', { projectRoot: root });
    assert.equal(dependency.success, false);
    assert.match(dependency.error, /Missing component dependency/);
    assert.deepEqual(transactionFiles(root), []);
});

test('forced install refreshes the live renderer and registry write failures restore the previous component', async t => {
    const { root, base, files } = await fixture(t);
    files.set('/force/b0nes.manifest.json', manifest('force-card'));
    files.set('/force/renderer.js', render('Original'));
    assert.equal((await installComponent(base + '/force', { projectRoot: root })).success, true);
    const libraryModule = await import(pathToFileURL(path.join(root, 'src/components/library.js')));
    const { compose } = await import(pathToFileURL(path.join(root, 'src/framework/core/compose.js')));
    const descriptor = [{ type: 'atom', name: 'force-card', props: {} }];
    assert.equal(compose(descriptor, { strict: true }), '<span>Original</span>');
    const directory = path.join(root, 'src/components/atoms/force-card');
    const originalIndex = fs.readFileSync(categoryIndex(root), 'utf8');
    const originalRenderer = fs.readFileSync(path.join(directory, 'force-card.js'), 'utf8');
    fs.writeFileSync(path.join(directory, 'user-notes.txt'), 'Keep on failed overwrite');
    files.set('/force/renderer.js', render('Replacement'));
    const rename = fs.renameSync;
    let injected = false;
    t.mock.method(fs, 'renameSync', (from, to) => {
        if (!injected && to === categoryIndex(root)) { injected = true; throw new Error('Injected late registry write failure'); }
        return rename(from, to);
    });
    const failed = await installComponent(base + '/force', { projectRoot: root, force: true });
    assert.equal(failed.success, false);
    assert.match(failed.error, /Injected late registry/);
    assert.equal(fs.readFileSync(categoryIndex(root), 'utf8'), originalIndex);
    assert.equal(fs.readFileSync(path.join(directory, 'force-card.js'), 'utf8'), originalRenderer);
    assert.equal(fs.readFileSync(path.join(directory, 'user-notes.txt'), 'utf8'), 'Keep on failed overwrite');
    assert.equal(libraryModule.default.atoms['force-card'](), '<span>Original</span>');
    assert.deepEqual(transactionFiles(root), []);
    const success = await installComponent(base + '/force', { projectRoot: root, force: true });
    assert.equal(success.success, true, success.error);
    assert.equal(libraryModule.default.atoms['force-card'](), '<span>Replacement</span>');
    assert.equal(compose(descriptor, { strict: true }), '<span>Replacement</span>');
});

test('invalid downloaded JavaScript and registry symbol collisions fail before installation', async t => {
    const { root, base, files } = await fixture(t);
    files.set('/invalid/b0nes.manifest.json', manifest('broken-card'));
    files.set('/invalid/renderer.js', 'export const broken-card = () => "bad";');
    const broken = await installComponent(base + '/invalid', { projectRoot: root });
    assert.equal(broken.success, false);
    assert.equal(fs.existsSync(path.join(root, 'src/components/atoms/broken-card')), false);
    const source = updateCategoryIndex('export const atoms = {};\n', 'atom', 'foo-1');
    assert.throws(() => updateCategoryIndex(source, 'atom', 'foo1'), /export foo1 already exists/);
    assert.deepEqual(transactionFiles(root), []);
});

test('overlapping downloads retain both category registrations, and an active category lock refuses mutations', async t => {
    const { root, base, files } = await fixture(t);
    files.set('/slow/b0nes.manifest.json', manifest('slow-card'));
    files.set('/fast/b0nes.manifest.json', manifest('fast-card'));
    files.set('/fast/renderer.js', render('Fast card'));
    let pendingResponse;
    let requested;
    const requestReady = new Promise(resolve => { requested = resolve; });
    files.set('/slow/renderer.js', (req, res) => { pendingResponse = res; requested(); });
    const slow = installComponent(base + '/slow', { projectRoot: root });
    await requestReady;
    const fast = await installComponent(base + '/fast', { projectRoot: root });
    pendingResponse.end(render('Slow card'));
    assert.equal(fast.success, true, fast.error);
    const slowResult = await slow;
    assert.equal(slowResult.success, true, slowResult.error);
    const exports = await import(pathToFileURL(categoryIndex(root)).href + '?overlap=1');
    assert.equal(exports.fastCard(), '<span>Fast card</span>');
    assert.equal(exports.slowCard(), '<span>Slow card</span>');
    const source = fs.readFileSync(categoryIndex(root), 'utf8');
    const lock = path.join(path.dirname(categoryIndex(root)), '.b0nes-component-registry.lock');
    fs.writeFileSync(lock, 'Another installer or generator owns this lock');
    files.set('/locked/b0nes.manifest.json', manifest('locked-card'));
    files.set('/locked/renderer.js', render('Locked card'));
    const refused = await installComponent(base + '/locked', { projectRoot: root });
    assert.equal(refused.success, false);
    assert.match(refused.error, /EEXIST/);
    assert.equal(fs.readFileSync(categoryIndex(root), 'utf8'), source);
    assert.equal(fs.existsSync(path.join(root, 'src/components/atoms/locked-card')), false);
    assert.equal(fs.readFileSync(lock, 'utf8'), 'Another installer or generator owns this lock');
    fs.unlinkSync(lock);
    assert.deepEqual(transactionFiles(root), []);
});

test('post-registration failure restores cold-library state and original files for new and forced installs', async t => {
    for (const force of [false, true]) {
        const { root, base, files } = await fixture(t);
        const directory = path.join(root, 'src/components/atoms/rollback-card');
        if (force) {
            fs.mkdirSync(directory);
            fs.writeFileSync(path.join(directory, 'rollback-card.js'), render('Previous renderer'));
            fs.writeFileSync(path.join(directory, 'index.js'), "export { default } from './rollback-card.js';\n");
            fs.writeFileSync(path.join(directory, 'user-notes.txt'), 'User notes retained');
        }
        const source = fs.readFileSync(categoryIndex(root), 'utf8');
        // This import happens only after registration and promotion, so the
        // failure exercises both filesystem rollback and live library recovery.
        fs.writeFileSync(path.join(root, 'src/framework/core/compose.js'),
            'export const clearCompositionCache = () => { throw new Error("Injected post-registration failure"); };');
        files.set('/rollback/b0nes.manifest.json', manifest('rollback-card'));
        files.set('/rollback/renderer.js', render('Replacement renderer'));
        const result = await installComponent(base + '/rollback', { projectRoot: root, force });
        assert.equal(result.success, false);
        assert.match(result.error, /Injected post-registration failure/);
        assert.equal(fs.readFileSync(categoryIndex(root), 'utf8'), source);
        const libraryModule = await import(pathToFileURL(path.join(root, 'src/components/library.js')));
        if (force) {
            assert.equal(libraryModule.default.atoms['rollback-card'](), '<span>Previous renderer</span>');
            assert.equal(fs.readFileSync(path.join(directory, 'rollback-card.js'), 'utf8'), render('Previous renderer'));
            assert.equal(fs.readFileSync(path.join(directory, 'user-notes.txt'), 'utf8'), 'User notes retained');
        } else {
            assert.equal(Object.hasOwn(libraryModule.default.atoms, 'rollback-card'), false);
            assert.equal(fs.existsSync(directory), false);
        }
        assert.deepEqual(transactionFiles(root), []);
    }
});

test('installer CLI no longer advertises or silently ignores unsupported reference mode', () => {
    const filename = fileURLToPath(import.meta.url).replace(/\.test\.js$/, '.js');
    const help = spawnSync(process.execPath, [filename, '--help'], { encoding: 'utf8' });
    assert.equal(help.status, 0);
    assert.ok(!help.stdout.includes('--reference'));
    const result = spawnSync(process.execPath, [filename, 'https://example.com/component', '--reference'], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unsupported installer option: --reference/);
});
