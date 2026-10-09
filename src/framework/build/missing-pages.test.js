import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const fixture = t => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-missing-pages-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    fs.cpSync(path.join(root, 'src'), path.join(dir, 'src'), {
        recursive: true, filter: filename => !filename.endsWith('.test.js')
    });
    fs.mkdirSync(path.join(dir, 'src/pages'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}');
    fs.writeFileSync(path.join(dir, 'src/pages/index.js'), `
        export const components = [{type:'atom',name:'text',props:{is:'h1',slot:'Published home'}}];
    `);
    return dir;
};

const snapshot = directory => fs.readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry => {
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) return [[entry.name, 'directory'], ...snapshot(filename).map(([name, ...value]) => [path.join(entry.name, name), ...value])];
        return [[entry.name, 'file', fs.readFileSync(filename).toString('hex')]];
    });

const run = (dir, source) => {
    fs.writeFileSync(path.join(dir, 'missing-pages-test.mjs'), `
        import fs from 'node:fs';
        import path from 'node:path';
        import assert from 'node:assert/strict';
        import {build} from './src/framework/build/pipeline/ssg.js';
        const snapshot = ${snapshot.toString()};
        ${source}
    `);
    const result = spawnSync(process.execPath, ['missing-pages-test.mjs'], {
        cwd: dir, encoding: 'utf8', timeout: 30000,
        env: { ...process.env, NODE_ENV: 'production', npm_lifecycle_event: '' }
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
};

for (const clean of [false, true]) {
    test(`missing page sources fail without replacing the previous output (clean:${clean})`, t => {
        const dir = fixture(t);
        run(dir, `
            assert.equal((await build('public', {clean:false})).success, true);
            fs.mkdirSync('public/uploads', {recursive:true});
            fs.writeFileSync('public/uploads/user.bin', Buffer.from([0,255,128]));
            const before = snapshot('public');
            const topLevel = fs.readdirSync('.').sort();
            fs.renameSync('src/pages', 'src/pages-backup');
            await assert.rejects(() => build('public', {clean:${clean}}), /Pages directory not found/);
            assert.deepEqual(snapshot('public'), before);
            assert.deepEqual(fs.readdirSync('.').sort(), topLevel, 'Failed discovery leaked transaction artifacts');

            // An existing empty source directory is an intentional empty site.
            fs.mkdirSync('src/pages');
            const empty = await build('public', {clean:${clean}});
            assert.equal(empty.success, true);
            assert.deepEqual(empty.generated, []);
            assert.equal(fs.existsSync('public/index.html'), false);
            assert.equal(fs.existsSync('public/uploads/user.bin'), ${!clean});
            assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
        `);
    });

    test(`CLI rejects missing page sources and retains the published site (clean:${clean})`, t => {
        const dir = fixture(t);
        run(dir, `assert.equal((await build('public', {clean:false})).success, true);`);
        const before = snapshot(path.join(dir, 'public'));
        const topLevel = fs.readdirSync(dir).sort();
        fs.renameSync(path.join(dir, 'src/pages'), path.join(dir, 'src/pages-backup'));
        const result = spawnSync(process.execPath, ['src/framework/build/cli.js', 'build', ...(clean ? ['--clean'] : [])], {
            cwd: dir, encoding: 'utf8', timeout: 30000,
            env: { ...process.env, NODE_ENV: 'production', npm_lifecycle_event: '' }
        });
        assert.equal(result.status, 1, result.stdout + result.stderr);
        assert.match(result.stdout + result.stderr, /Pages directory not found/);
        assert.deepEqual(snapshot(path.join(dir, 'public')), before);
        assert.deepEqual(fs.readdirSync(dir).sort(), topLevel);
    });
}

test('a missing pages directory on the first build cannot publish an empty site', t => {
    const dir = fixture(t);
    fs.rmSync(path.join(dir, 'src/pages'), { recursive: true });
    run(dir, `
        const topLevel = fs.readdirSync('.').sort();
        await assert.rejects(() => build('public', {clean:false}), /Pages directory not found/);
        assert.equal(fs.existsSync('public'), false);
        assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
    `);
});
