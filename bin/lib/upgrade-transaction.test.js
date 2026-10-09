import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runUpgrade } from './upgrade.js';
import { createInitialManifest, writeManifest, writeChecksums, buildChecksums, listFiles } from './manifest.js';

function fixture(t, { identical = false, metadata = true } = {}) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-upgrade-transaction-'));
    const packageRoot = path.join(directory, 'package');
    const projectRoot = path.join(directory, 'project');
    const write = (root, relative, value) => {
        const filename = path.join(root, relative);
        fs.mkdirSync(path.dirname(filename), { recursive: true });
        fs.writeFileSync(filename, value);
    };
    write(packageRoot, 'package.json', JSON.stringify({ version: '0.3.1' }));
    for (const relative of ['src/framework/a.js', 'src/framework/b.js', 'src/framework/new/deep/c.js']) {
        write(packageRoot, relative, '// New framework ' + relative);
        if (identical || !relative.includes('/new/')) write(projectRoot, relative, identical ? '// New framework ' + relative : '// Previous framework ' + relative);
    }
    write(projectRoot, 'src/pages/index.js', '// User page');
    write(projectRoot, 'public/user.css', '/* User stylesheet */');
    write(projectRoot, '.b0nes/backups/previous/user.txt', 'Previous backup must survive');
    if (metadata) {
        writeManifest(projectRoot, createInitialManifest({ frameworkVersion: '0.2.1', template: 'minimal' }));
        writeChecksums(projectRoot, buildChecksums(projectRoot, ['src/framework']));
    }
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    return { packageRoot, projectRoot, write };
}
const ownedSnapshot = root => buildChecksums(root, ['src/framework', '.b0nes/manifest.json', '.b0nes/checksums.json', 'src/pages', 'public']);

test('upgrade rolls back partially copied files and removes newly created directories after a late copy failure', async t => {
    const { packageRoot, projectRoot } = fixture(t);
    const original = ownedSnapshot(projectRoot);
    const open = fs.promises.open;
    let failed = false;
    t.mock.method(fs.promises, 'open', async (filename, flags, ...args) => {
        if (!failed && filename === path.join(projectRoot, 'src/framework/new/deep/c.js') && (flags & fs.constants.O_WRONLY)) {
            failed = true;
            throw new Error('Injected late copy failure');
        }
        return open(filename, flags, ...args);
    });
    await assert.rejects(runUpgrade({ packageRoot, projectRoot, yes: true, backup: false }), /previous files restored.*Injected late copy failure/);
    assert.equal(failed, true);
    assert.deepEqual(ownedSnapshot(projectRoot), original);
    assert.equal(fs.existsSync(path.join(projectRoot, 'src/framework/new')), false);
    assert.equal(fs.readFileSync(path.join(projectRoot, '.b0nes/backups/previous/user.txt'), 'utf8'), 'Previous backup must survive');
});

test('upgrade rolls back framework and checksums when the final manifest write fails, keeping user backups', async t => {
    const { packageRoot, projectRoot } = fixture(t);
    fs.appendFileSync(path.join(projectRoot, 'src/framework/a.js'), '\n// Local edit');
    const original = ownedSnapshot(projectRoot);
    const open = fs.openSync;
    let failed = false;
    t.mock.method(fs, 'openSync', (filename, flags, ...args) => {
        if (!failed && filename === path.join(projectRoot, '.b0nes/manifest.json') && (flags & fs.constants.O_WRONLY)) {
            failed = true;
            throw new Error('Injected metadata write failure');
        }
        return open(filename, flags, ...args);
    });
    await assert.rejects(runUpgrade({ packageRoot, projectRoot, yes: true, force: true }), /previous files restored.*Injected metadata write failure/);
    assert.deepEqual(ownedSnapshot(projectRoot), original);
    assert.equal(fs.existsSync(path.join(projectRoot, 'src/framework/new')), false);
    const backup = listFiles(projectRoot, '.b0nes/backups').find(filename => filename.endsWith('/src/framework/a.js'));
    assert.ok(backup, 'the user-visible backup should remain available');
    assert.match(fs.readFileSync(path.join(projectRoot, backup), 'utf8'), /Local edit/);
    assert.equal(fs.readFileSync(path.join(projectRoot, '.b0nes/backups/previous/user.txt'), 'utf8'), 'Previous backup must survive');
});

test('metadata-only upgrade restores the old manifest if checksum writing fails', async t => {
    const { packageRoot, projectRoot } = fixture(t, { identical: true });
    const original = ownedSnapshot(projectRoot);
    const open = fs.openSync;
    let failed = false;
    t.mock.method(fs, 'openSync', (filename, flags, ...args) => {
        if (!failed && filename === path.join(projectRoot, '.b0nes/checksums.json') && (flags & fs.constants.O_WRONLY)) {
            failed = true;
            throw new Error('Injected checksum write failure');
        }
        return open(filename, flags, ...args);
    });
    await assert.rejects(runUpgrade({ packageRoot, projectRoot, yes: true }), /previous files restored.*Injected checksum write failure/);
    assert.deepEqual(ownedSnapshot(projectRoot), original);
});

test('legacy upgrade removes newly introduced metadata after late failure', async t => {
    const { packageRoot, projectRoot } = fixture(t, { metadata: false });
    const original = ownedSnapshot(projectRoot);
    const open = fs.openSync;
    let failed = false;
    t.mock.method(fs, 'openSync', (filename, flags, ...args) => {
        if (!failed && filename === path.join(projectRoot, '.b0nes/manifest.json') && (flags & fs.constants.O_WRONLY)) {
            failed = true;
            throw new Error('Injected legacy metadata failure');
        }
        return open(filename, flags, ...args);
    });
    await assert.rejects(runUpgrade({ packageRoot, projectRoot, yes: true, backup: false }), /previous files restored.*Injected legacy metadata failure/);
    assert.deepEqual(ownedSnapshot(projectRoot), original);
    assert.equal(fs.existsSync(path.join(projectRoot, '.b0nes/checksums.json')), false);
    assert.equal(fs.existsSync(path.join(projectRoot, '.b0nes/manifest.json')), false);
});
