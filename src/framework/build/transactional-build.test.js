import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const fixture = t => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-transactional-build-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    fs.cpSync(path.join(root, 'src'), path.join(dir, 'src'), {
        recursive: true, filter: file => !file.endsWith('.test.js')
    });
    fs.mkdirSync(path.join(dir, 'src/pages'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}');
    return dir;
};
const write = (dir, name, source) => {
    const file = path.join(dir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, source);
};
const page = value => `export const components = [{type:'atom',name:'text',props:{is:'p',slot:${JSON.stringify(value)}}}];`;

// Include directory entries and link destinations as well as file bytes, without
// following output symlinks. A failed build must preserve the complete tree.
const snapshot = directory => {
    const entries = [];
    const walk = (current, relative) => {
        for (const name of fs.readdirSync(current).sort()) {
            const filename = path.join(current, name);
            const item = path.join(relative, name);
            const stat = fs.lstatSync(filename);
            if (stat.isSymbolicLink()) entries.push([item, 'link', fs.readlinkSync(filename)]);
            else if (stat.isDirectory()) {
                entries.push([item, 'directory']);
                walk(filename, item);
            } else entries.push([item, 'file', fs.readFileSync(filename).toString('hex')]);
        }
    };
    walk(directory, '');
    return entries;
};
const support = `
    import fs from 'node:fs';
    import path from 'node:path';
    import assert from 'node:assert/strict';
    import { build } from './src/framework/build/pipeline/ssg.js';
    const snapshot = ${snapshot.toString()};
    const write = (name, value) => {
        fs.mkdirSync(path.dirname(name), {recursive:true});
        fs.writeFileSync(name, value);
    };
    const expectFailure = async (options, output = 'public') => {
        let succeeded = false;
        try { succeeded = (await build(output, options)).success; }
        catch (error) { assert.ok(error instanceof Error); }
        assert.equal(succeeded, false, 'Build unexpectedly succeeded');
    };
`;
const runScript = (dir, source) => {
    write(dir, 'transactional-test.mjs', support + source);
    const result = spawnSync(process.execPath, ['transactional-test.mjs'], {
        cwd: dir, encoding: 'utf8', timeout: 30000,
        env: { ...process.env, NODE_ENV: 'production', npm_lifecycle_event: '' }
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    return result;
};

for (const clean of [false, true]) {
    for (const failure of ['route', 'template', 'runtime asset']) {
        test(`${failure} failure preserves the last successful build (clean:${clean})`, t => {
            const dir = fixture(t);
            write(dir, 'src/pages/index.js', page('last successful page'));
            write(dir, 'src/pages/other/index.js', page('another successful page'));
            const change = failure === 'route'
                ? `write('src/pages/zz-broken/index.js', 'throw Error("transactional route failure");');`
                : failure === 'template'
                    ? `write('src/pages/app/templates/main.js', "export const components = [{type:'atom',name:'missing'}];");`
                    : `write('private.txt', 'private bytes'); fs.symlinkSync(path.resolve('private.txt'), 'src/framework/client/private.js');`;
            runScript(dir, `
                assert.equal((await build('public', {clean:false, production:true})).success, true);
                write('public/uploads/user.bin', Buffer.from([0,255,12,128]));
                fs.mkdirSync('public/uploads/empty', {recursive:true});
                ${change}
                const before = snapshot('public');
                const topLevel = fs.readdirSync('.').sort();
                write('src/pages/index.js', ${JSON.stringify(page('changed page must not be published'))});
                await expectFailure({clean:${clean}, parallel:true, production:true});
                assert.deepEqual(snapshot('public'), before);
                assert.deepEqual(fs.readdirSync('.').sort(), topLevel, 'Staging or backup directory leaked');
                ${failure === 'runtime asset' ? "assert.equal(fs.readFileSync('private.txt','utf8'), 'private bytes');" : ''}
            `);
        });
    }
}

test('colocated asset copy failures preserve output files and unmanaged directories', t => {
    const dir = fixture(t);
    write(dir, 'src/pages/index.js', page('previous page'));
    write(dir, 'src/pages/about/index.js', page('about'));
    runScript(dir, `
        assert.equal((await build('public', {clean:false})).success, true);
        fs.mkdirSync('public/about/style.css', {recursive:true});
        write('public/about/style.css/user.txt', 'user directory contents');
        const before = snapshot('public');
        const topLevel = fs.readdirSync('.').sort();
        write('src/pages/index.js', ${JSON.stringify(page('replacement page'))});
        write('src/pages/about/style.css', 'body { color: red; }');
        await expectFailure({clean:false});
        assert.deepEqual(snapshot('public'), before);
        assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
    `);
});

test('a failed first build leaves no output or staging directory', t => {
    const dir = fixture(t);
    write(dir, 'src/pages/index.js', page('must not be partially published'));
    write(dir, 'src/pages/zz-broken/index.js', 'throw Error("first build failure");');
    runScript(dir, `
        const topLevel = fs.readdirSync('.').sort();
        await expectFailure({clean:false, parallel:true});
        assert.equal(fs.existsSync('public'), false);
        assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
    `);
});

test('fail-fast parallel builds settle running workers before removing their staging directory', t => {
    const dir = fixture(t);
    write(dir, 'src/pages/index.js', page('last successful page'));
    runScript(dir, `
        assert.equal((await build('public', {clean:false})).success, true);
        const before = snapshot('public');
        const topLevel = fs.readdirSync('.').sort();
        write('src/pages/aa-slow/index.js', ${JSON.stringify("await new Promise(resolve => setTimeout(resolve, 200)); " + page('slow staged page'))});
        write('src/pages/zz-broken/index.js', 'throw Error("fail-fast parallel failure");');
        await expectFailure({clean:false, parallel:true, continueOnError:false});
        assert.deepEqual(snapshot('public'), before);
        assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
        await new Promise(resolve => setTimeout(resolve, 300));
        assert.deepEqual(fs.readdirSync('.').sort(), topLevel, 'A running worker recreated the removed stage');
    `);
});

test('CLI --clean failures keep the previous site and exit unsuccessfully', t => {
    const dir = fixture(t);
    write(dir, 'src/pages/index.js', page('published page'));
    runScript(dir, `assert.equal((await build('public', {clean:false})).success, true);`);
    write(dir, 'public/uploads/user.txt', 'keep after a failed clean build');
    const before = snapshot(path.join(dir, 'public'));
    const topLevel = fs.readdirSync(dir).sort();
    write(dir, 'src/pages/index.js', 'throw Error("failed clean build");');
    const result = spawnSync(process.execPath, ['src/framework/build/cli.js', 'build', '--clean'], {
        cwd: dir, encoding: 'utf8', timeout: 30000
    });
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout + result.stderr, /failed clean build/);
    assert.deepEqual(snapshot(path.join(dir, 'public')), before);
    assert.deepEqual(fs.readdirSync(dir).sort(), topLevel);
});

for (const parallel of [false, true]) {
    test(`successful rebuild removes obsolete managed files and preserves user assets (parallel:${parallel})`, t => {
        const dir = fixture(t);
        write(dir, 'src/pages/index.js', page('before'));
        write(dir, 'src/pages/obsolete/index.js', `
            export const components = [{type:'molecule',name:'tabs',props:{tabs:[{label:'Old',content:'obsolete route'}]}}];
        `);
        write(dir, 'src/pages/obsolete/style.css', 'body { color: red; }');
        write(dir, 'src/pages/app/templates/obsolete.js', page('obsolete template'));
        write(dir, 'src/pages/posts/[slug].js', `
            export const externalData = () => [{slug:'old'}, {slug:'kept'}];
            export const components = data => [{type:'atom',name:'text',props:{is:'p',slot:data.slug}}];
        `);
        write(dir, 'src/framework/client/obsolete.js', 'export const obsolete = true;');
        write(dir, 'src/components/utils/obsolete.js', 'export const obsolete = true;');
        runScript(dir, `
            assert.equal((await build('public', {clean:false, production:true, parallel:${parallel}})).success, true);
            const removed = [
                'obsolete/index.html', 'obsolete/style.css', 'posts/old/index.html',
                'app/templates/obsolete.js', 'assets/js/bundles/obsolete.bundle.js',
                'assets/js/client/obsolete.js', 'assets/js/behaviors/utils/obsolete.js'
            ];
            for (const name of removed) assert.ok(fs.existsSync(path.join('public',name)), name);
            write('public/obsolete/user.bin', Buffer.from([255,0,127]));
            write('public/uploads/user.txt', 'unmanaged upload');
            write('public/assets/js/client/custom.js', 'unmanaged browser module');
            fs.mkdirSync('public/uploads/empty', {recursive:true});
            const topLevel = fs.readdirSync('.').sort();
            fs.rmSync('src/pages/obsolete', {recursive:true});
            fs.unlinkSync('src/pages/app/templates/obsolete.js');
            fs.unlinkSync('src/framework/client/obsolete.js');
            fs.unlinkSync('src/components/utils/obsolete.js');
            write('src/pages/index.js', ${JSON.stringify(page('after'))});
            write('src/pages/posts/[slug].js', ${JSON.stringify("export const externalData = () => [{slug:'kept'}, {slug:'new'}]; export const components = data => [{type:'atom',name:'text',props:{is:'p',slot:data.slug}}];")});
            const result = await build('public', {clean:false, production:true, parallel:${parallel}});
            assert.equal(result.success, true);
            for (const name of removed) assert.equal(fs.existsSync(path.join('public',name)), false, name);
            assert.match(fs.readFileSync('public/index.html','utf8'), />after<\\/p>/);
            assert.ok(fs.existsSync('public/posts/kept/index.html'));
            assert.ok(fs.existsSync('public/posts/new/index.html'));
            assert.deepEqual(fs.readFileSync('public/obsolete/user.bin'), Buffer.from([255,0,127]));
            assert.equal(fs.readFileSync('public/uploads/user.txt','utf8'), 'unmanaged upload');
            assert.equal(fs.readFileSync('public/assets/js/client/custom.js','utf8'), 'unmanaged browser module');
            assert.ok(fs.statSync('public/uploads/empty').isDirectory());
            assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
            for (const generated of result.generated) {
                assert.ok(generated.file.startsWith(path.resolve('public') + path.sep));
                assert.ok(fs.existsSync(generated.file), 'Build result contains an unpublished staging path');
            }
        `);
    });
}

test('clean:true discards unmanaged assets only after a successful replacement build', t => {
    const dir = fixture(t);
    write(dir, 'src/pages/index.js', page('before clean'));
    runScript(dir, `
        assert.equal((await build('public', {clean:false})).success, true);
        write('public/uploads/user.txt', 'remove only on success');
        const topLevel = fs.readdirSync('.').sort();
        write('src/pages/index.js', ${JSON.stringify(page('after clean'))});
        assert.equal((await build('public', {clean:true})).success, true);
        assert.equal(fs.existsSync('public/uploads/user.txt'), false);
        assert.match(fs.readFileSync('public/index.html','utf8'), />after clean<\\/p>/);
        assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
    `);
});

test('an empty route set removes previously generated pages, assets and templates', t => {
    const dir = fixture(t);
    write(dir, 'src/pages/index.js', page('old home'));
    write(dir, 'src/pages/style.css', 'body { color: red; }');
    write(dir, 'src/pages/app/templates/main.js', page('old template'));
    runScript(dir, `
        assert.equal((await build('public', {clean:false})).success, true);
        write('public/uploads/user.txt', 'keep without routes');
        const topLevel = fs.readdirSync('.').sort();
        fs.rmSync('src/pages', {recursive:true});
        fs.mkdirSync('src/pages');
        const result = await build('public', {clean:false});
        assert.equal(result.success, true);
        assert.deepEqual(result.generated, []);
        for (const name of ['index.html','style.css','app/templates/main.js']) {
            assert.equal(fs.existsSync(path.join('public',name)), false, name);
        }
        assert.equal(fs.readFileSync('public/uploads/user.txt','utf8'), 'keep without routes');
        assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
    `);
});

for (const clean of [false, true]) {
    test(`a linked output root is rejected without modifying its target (clean:${clean})`, t => {
        const dir = fixture(t);
        write(dir, 'src/pages/index.js', page('must not publish outside output'));
        write(dir, 'outside/private.txt', 'private bytes');
        fs.symlinkSync(path.join(dir, 'outside'), path.join(dir, 'public'), 'dir');
        runScript(dir, `
            const before = snapshot('outside');
            const topLevel = fs.readdirSync('.').sort();
            await expectFailure({clean:${clean}});
            assert.deepEqual(snapshot('outside'), before);
            assert.ok(fs.lstatSync('public').isSymbolicLink());
            assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
        `);
    });
}

test('linked nested output directories cannot redirect a staged build into external files', t => {
    const dir = fixture(t);
    write(dir, 'src/pages/index.js', page('original page'));
    runScript(dir, `
        assert.equal((await build('public', {clean:false})).success, true);
        fs.rmSync('public/assets', {recursive:true});
        write('outside/private.txt', 'private bytes');
        fs.symlinkSync(path.resolve('outside'), 'public/assets', 'dir');
        const before = snapshot('public');
        const outsideBefore = snapshot('outside');
        const topLevel = fs.readdirSync('.').sort();
        await expectFailure({clean:false});
        assert.deepEqual(snapshot('public'), before);
        assert.deepEqual(snapshot('outside'), outsideBefore);
        assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
    `);
});

for (const [name, manifest] of [
    ['file traversal', {version:1, files:['../outside/private.txt'], directories:[]}],
    ['directory traversal', {version:1, files:[], directories:['../../outside']}],
    ['invalid files type', {version:1, files:'index.html', directories:[]}]
]) {
    test(`invalid build manifest (${name}) cannot remove output or external files`, t => {
        const dir = fixture(t);
        write(dir, 'src/pages/index.js', page('last successful page'));
        runScript(dir, `
            assert.equal((await build('public', {clean:false})).success, true);
            write('outside/private.txt', 'private bytes');
            write('public/.b0nes-build-manifest.json', ${JSON.stringify(JSON.stringify(manifest))});
            const before = snapshot('public');
            const outsideBefore = snapshot('outside');
            const topLevel = fs.readdirSync('.').sort();
            await expectFailure({clean:false});
            assert.deepEqual(snapshot('public'), before);
            assert.deepEqual(snapshot('outside'), outsideBefore);
            assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
        `);
    });
}

test('failed promotion restores the previous output and disposes transaction artifacts', async t => {
    const dir = fixture(t);
    const output = path.join(dir, 'public');
    write(dir, 'public/index.html', 'previous published page');
    write(dir, 'public/uploads/user.bin', Buffer.from([0,255,128]));
    write(dir, 'public/.b0nes-build-manifest.json', JSON.stringify({version:1, files:['index.html'], directories:[]}));
    const before = snapshot(output);
    const topLevel = fs.readdirSync(dir).sort();
    const { createBuildTransaction } = await import('./pipeline/buildTransaction.js');
    const transaction = await createBuildTransaction(output, {clean:false});
    fs.writeFileSync(path.join(transaction.outputDir, 'index.html'), 'replacement staged page');

    const rename = fs.renameSync;
    let promotionAttempted = false;
    fs.renameSync = (source, destination) => {
        if (path.resolve(source) === path.resolve(transaction.outputDir) && path.resolve(destination) === output) {
            promotionAttempted = true;
            throw new Error('simulated promotion failure');
        }
        return rename(source, destination);
    };
    try {
        await assert.rejects(async () => transaction.commit(), /simulated promotion failure/);
        assert.equal(promotionAttempted, true);
        assert.deepEqual(snapshot(output), before);
    } finally {
        fs.renameSync = rename;
        await transaction.dispose();
    }
    assert.deepEqual(snapshot(output), before);
    assert.deepEqual(fs.readdirSync(dir).sort(), topLevel);
});

test('concurrent transactions reject the second build and release the lock after disposal', async t => {
    const dir = fixture(t);
    const output = path.join(dir, 'public');
    write(dir, 'public/index.html', 'previous published page');
    const before = snapshot(output);
    const topLevel = fs.readdirSync(dir).sort();
    const { createBuildTransaction } = await import('./pipeline/buildTransaction.js');
    const first = await createBuildTransaction(output, {clean:false});
    const activeArtifacts = fs.readdirSync(dir).sort();
    try {
        await assert.rejects(async () => createBuildTransaction(output, {clean:false}), /build|lock|progress|concurrent/i);
        assert.deepEqual(snapshot(output), before);
        assert.deepEqual(fs.readdirSync(dir).sort(), activeArtifacts, 'Rejected transaction leaked an artifact');
    } finally {
        await first.dispose();
    }
    assert.deepEqual(fs.readdirSync(dir).sort(), topLevel);
    const next = await createBuildTransaction(output, {clean:false});
    await next.dispose();
    assert.deepEqual(snapshot(output), before);
    assert.deepEqual(fs.readdirSync(dir).sort(), topLevel);
});

for (const target of ['.git', '.git/release-output', '.b0nes', '.agents', '.codex', '.aws', 'node_modules', 'node_modules/package/output']) {
    test(`build and CLI clean reject protected project output ${target}`, t => {
        const dir = fixture(t);
        const metadataRoot = target.split('/')[0];
        write(dir, 'src/pages/index.js', page('must not replace project metadata'));
        write(dir, metadataRoot + '/config', 'protected metadata marker');
        runScript(dir, `
            const before = snapshot(${JSON.stringify(metadataRoot)});
            const topLevel = fs.readdirSync('.').sort();
            for (const clean of [false, true]) {
                await expectFailure({clean}, ${JSON.stringify(target)});
                assert.deepEqual(snapshot(${JSON.stringify(metadataRoot)}), before);
                assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
            }
        `);
        const before = snapshot(path.join(dir, metadataRoot));
        const topLevel = fs.readdirSync(dir).sort();
        const result = spawnSync(process.execPath, ['src/framework/build/cli.js', 'clean', '--output=' + target], {
            cwd: dir, encoding: 'utf8', timeout: 30000
        });
        assert.equal(result.status, 1, result.stdout + result.stderr);
        assert.deepEqual(snapshot(path.join(dir, metadataRoot)), before);
        assert.deepEqual(fs.readdirSync(dir).sort(), topLevel);
    });
}

for (const [kind, filename] of [['colon', 'a:b.css'], ['backslash', 'a\\b.css'], ['control byte', 'a\u0001b.css']]) {
    test(`unsupported ${kind} asset filenames cannot publish or poison the build manifest`, {skip:process.platform === 'win32'}, t => {
        const dir = fixture(t);
        write(dir, 'src/pages/index.js', page('last successful page'));
        runScript(dir, `
            assert.equal((await build('public', {clean:false})).success, true);
            const before = snapshot('public');
            const topLevel = fs.readdirSync('.').sort();
            write('src/pages/index.js', ${JSON.stringify(page('must not be partially published'))});
            const unsupportedAsset = path.join('src/pages', ${JSON.stringify(filename)});
            write(unsupportedAsset, 'body { color: red; }');
            await expectFailure({clean:false});
            assert.deepEqual(snapshot('public'), before);
            assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
            fs.unlinkSync(unsupportedAsset);
            write('src/pages/index.js', ${JSON.stringify(page('successful recovery'))});
            assert.equal((await build('public', {clean:false})).success, true);
            assert.match(fs.readFileSync('public/index.html','utf8'), />successful recovery<\\/p>/);
            assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
        `);
    });
}
