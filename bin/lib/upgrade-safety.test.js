import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runUpgrade } from './upgrade.js';
import { buildChecksums, createInitialManifest, writeManifest, writeChecksums } from './manifest.js';

const fixture = t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-upgrade-safety-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const project = path.join(root, 'project'), packageRoot = path.join(root, 'package'), outside = path.join(root, 'outside');
    const write = (base, relative, source) => {
        const filename = path.join(base, relative);
        fs.mkdirSync(path.dirname(filename), { recursive: true });
        fs.writeFileSync(filename, source);
        return filename;
    };
    write(packageRoot, 'package.json', '{"version":"0.3.0"}');
    for (const name of ['a.js', 'z.js']) {
        write(packageRoot, 'src/framework/' + name, 'NEW ' + name);
        write(project, 'src/framework/' + name, 'OLD ' + name);
    }
    writeManifest(project, createInitialManifest({ frameworkVersion: '0.2.1' }));
    writeChecksums(project, buildChecksums(project, ['src/framework']));
    write(outside, 'sentinel', 'EXTERNAL');
    return { root, project, packageRoot, outside, write };
};

for (const variant of ['managed file', 'managed directory', 'source directory', 'dangling file', 'manifest', 'checksums', 'metadata directory', 'backup directory', 'upstream file']) {
    test(`upgrade preflight rejects a linked ${variant} even with --force, before any writes`, async t => {
        const { project, packageRoot, outside, write } = fixture(t);
        let target;
        if (['managed file', 'dangling file', 'upstream file'].includes(variant)) {
            target = path.join(variant === 'upstream file' ? packageRoot : project, 'src/framework/z.js');
            fs.unlinkSync(target);
            fs.symlinkSync(variant === 'dangling file' ? path.join(outside, 'missing') : path.join(outside, 'sentinel'), target);
        } else if (['managed directory', 'source directory'].includes(variant)) {
            const relative = variant === 'source directory' ? 'src' : 'src/framework';
            target = path.join(project, relative);
            fs.renameSync(target, path.join(outside, 'linked-directory'));
            fs.symlinkSync(path.join(outside, 'linked-directory'), target);
        } else if (['manifest', 'checksums'].includes(variant)) {
            target = path.join(project, '.b0nes', variant + '.json');
            fs.renameSync(target, path.join(outside, variant + '.json'));
            fs.symlinkSync(path.join(outside, variant + '.json'), target);
        } else if (variant === 'metadata directory') {
            target = path.join(project, '.b0nes');
            fs.renameSync(target, path.join(outside, 'metadata'));
            fs.symlinkSync(path.join(outside, 'metadata'), target);
        } else {
            target = path.join(project, '.b0nes/backups');
            fs.symlinkSync(outside, target);
        }
        const before = fs.readFileSync(path.join(project, 'src/framework/a.js'), 'utf8');
        const metadata = fs.readFileSync(path.join(project, '.b0nes/manifest.json'), 'utf8');
        const inventory = fs.readdirSync(outside).sort();
        await assert.rejects(runUpgrade({ projectRoot: project, packageRoot, yes: true, force: true }), error => {
            assert.equal(error.code, 'B0NES_UNSAFE_PATH');
            assert.match(error.message, /symbolic links/);
            return true;
        });
        assert.equal(fs.readFileSync(path.join(project, 'src/framework/a.js'), 'utf8'), before);
        assert.equal(fs.readFileSync(path.join(project, '.b0nes/manifest.json'), 'utf8'), metadata);
        assert.equal(fs.readFileSync(path.join(outside, 'sentinel'), 'utf8'), 'EXTERNAL');
        assert.deepEqual(fs.readdirSync(outside).sort(), inventory);
        assert.ok(fs.lstatSync(target).isSymbolicLink());
        assert.equal(fs.existsSync(path.join(outside, 'missing')), false);
    });
}

test('unsafe later destinations are rejected before an earlier framework file is upgraded', async t => {
    const { project, packageRoot } = fixture(t);
    fs.unlinkSync(path.join(project, 'src/framework/z.js'));
    fs.mkdirSync(path.join(project, 'src/framework/z.js'));
    await assert.rejects(runUpgrade({ projectRoot: project, packageRoot, yes: true, backup: false }), /expected file/);
    assert.equal(fs.readFileSync(path.join(project, 'src/framework/a.js'), 'utf8'), 'OLD a.js');
});

test('the public upgrade CLI reports unsafe project links and exits without changing files', t => {
    const { project, outside } = fixture(t);
    fs.unlinkSync(path.join(project, 'src/framework/z.js'));
    fs.symlinkSync(path.join(outside, 'sentinel'), path.join(project, 'src/framework/z.js'));
    const cli = fileURLToPath(new URL('../b0nes.js', import.meta.url));
    const result = spawnSync(process.execPath, [cli, 'upgrade', '--yes', '--force', '--no-backup'], { cwd: project, encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /Refusing unsafe managed path/);
    assert.equal(fs.readFileSync(path.join(outside, 'sentinel'), 'utf8'), 'EXTERNAL');
    assert.equal(fs.readFileSync(path.join(project, 'src/framework/a.js'), 'utf8'), 'OLD a.js');
});

test('ordinary upgrades retain backups and user files with guarded writes', async t => {
    const { project, packageRoot, write } = fixture(t);
    write(project, 'src/pages/index.js', 'USER PAGE');
    write(project, 'public/style.css', 'USER ASSET');
    assert.equal(await runUpgrade({ projectRoot: project, packageRoot, yes: true }), 0);
    assert.equal(fs.readFileSync(path.join(project, 'src/framework/a.js'), 'utf8'), 'NEW a.js');
    const backups = fs.readdirSync(path.join(project, '.b0nes/backups'));
    assert.equal(backups.length, 1);
    assert.equal(fs.readFileSync(path.join(project, '.b0nes/backups', backups[0], 'src/framework/a.js'), 'utf8'), 'OLD a.js');
    assert.equal(fs.readFileSync(path.join(project, 'src/pages/index.js'), 'utf8'), 'USER PAGE');
    assert.equal(fs.readFileSync(path.join(project, 'public/style.css'), 'utf8'), 'USER ASSET');
    assert.equal(JSON.parse(fs.readFileSync(path.join(project, '.b0nes/manifest.json'))).frameworkVersion, '0.3.0');
});
