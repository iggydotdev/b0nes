import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { copyColocatedAssets } from './pipeline/colocatedAssets.js';
import { copyFrameworkRuntime } from './pipeline/copyFrameworkRuntime.js';
import { copyComponentBehaviors } from './pipeline/copyComponentBehaviors.js';
import { generateCompiledTemplates } from './pipeline/compileTemplates.js';

const fixture = t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-asset-safety-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const output = path.join(root, 'public');
    const outside = path.join(root, 'outside');
    fs.mkdirSync(output);
    fs.mkdirSync(outside);
    const privateFile = path.join(outside, 'private.txt');
    fs.writeFileSync(privateFile, 'private content');
    return { root, output, outside, privateFile };
};
const write = (filename, value = '') => {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, value);
};
const link = (source, target, type = 'file') => {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.symlinkSync(source, target, type);
};

for (const linkedTarget of ['file', 'directory', 'root']) {
    test(`colocated assets reject a linked output ${linkedTarget} without changing external files`, t => {
        const { root, output, outside, privateFile } = fixture(t);
        const page = path.join(root, 'src/pages/about/index.js');
        write(page);
        write(path.join(path.dirname(page), 'style.css'), 'replacement');
        if (linkedTarget === 'file') link(privateFile, path.join(output, 'about/style.css'));
        if (linkedTarget === 'directory') link(outside, path.join(output, 'about'), 'dir');
        if (linkedTarget === 'root') { fs.rmdirSync(output); link(outside, output, 'dir'); }
        const result = copyColocatedAssets(page, output);
        assert.equal(result.filesCopied, 0);
        assert.equal(result.errors.length, 1);
        assert.match(result.errors[0].error, /Symlink/);
        assert.equal(fs.readFileSync(privateFile, 'utf8'), 'private content');
        assert.equal(fs.existsSync(path.join(outside, 'style.css')), false);
    });
}

for (const source of ['page module', 'external file']) {
    test(`colocated assets refuse a source symlink to ${source}`, t => {
        const { root, output, privateFile } = fixture(t);
        const page = path.join(root, 'src/pages/about/index.js');
        write(page, 'export const privateValue = "secret";');
        link(source === 'page module' ? page : privateFile, path.join(path.dirname(page), 'browser.js'));
        const result = copyColocatedAssets(page, output);
        assert.equal(result.filesCopied, 0);
        assert.match(result.errors[0].error, /Symlink/);
        assert.equal(fs.existsSync(path.join(output, 'about/browser.js')), false);
    });
}

for (const runtime of ['framework', 'component']) {
    test(`${runtime} runtime copy refuses an existing symlink destination`, async t => {
        const { output, privateFile } = fixture(t);
        const target = runtime === 'framework' ? 'assets/js/client/b0nes.js' : 'assets/js/behaviors/molecules/tabs/client.js';
        link(privateFile, path.join(output, target));
        await assert.rejects(runtime === 'framework' ? copyFrameworkRuntime(output) : copyComponentBehaviors(output), /Symlink/);
        assert.equal(fs.readFileSync(privateFile, 'utf8'), 'private content');
    });
}

test('runtime copy refuses a linked ancestor of its output directory', async t => {
    const { output, outside, privateFile } = fixture(t);
    link(outside, path.join(output, 'assets'), 'dir');
    await assert.rejects(copyFrameworkRuntime(output), /Symlink/);
    assert.equal(fs.readFileSync(privateFile, 'utf8'), 'private content');
    assert.deepEqual(fs.readdirSync(outside), ['private.txt']);
});

for (const mode of ['individual', 'bundle']) {
    test(`compiled templates refuse a linked ${mode} output`, async t => {
        const { root, output, privateFile } = fixture(t);
        const source = path.join(root, 'app');
        write(path.join(root, 'package.json'), '{"type":"module"}');
        write(path.join(source, 'templates/main.js'), 'export const components = [];');
        const destination = mode === 'individual' ? path.join(output, 'app/templates') : path.join(output, 'templates.js');
        link(privateFile, mode === 'individual' ? path.join(destination, 'main.js') : destination);
        await assert.rejects(generateCompiledTemplates(source, destination, { mode, outputDir: output }), /Symlink/);
        assert.equal(fs.readFileSync(privateFile, 'utf8'), 'private content');
    });
}

test('compiled templates refuse source symlinks before importing private modules', async t => {
    const { root, output, privateFile } = fixture(t);
    const source = path.join(root, 'app');
    link(privateFile, path.join(source, 'templates/main.js'));
    await assert.rejects(generateCompiledTemplates(source, path.join(output, 'templates'), { mode: 'individual', outputDir: output }), /Symlink/);
    assert.equal(fs.existsSync(path.join(output, 'templates/main.js')), false);
});

for (const runtime of ['framework', 'component']) {
    test(`${runtime} runtime copy refuses private source aliases`, async t => {
        const { root, output, privateFile } = fixture(t);
        const pipeline = path.join(root, 'src/framework/build/pipeline');
        const writer = runtime === 'framework' ? 'copyFrameworkRuntime' : 'copyComponentBehaviors';
        write(path.join(root, 'package.json'), '{"type":"module"}');
        for (const name of [writer, 'outputPath']) {
            write(path.join(pipeline, `${name}.js`), fs.readFileSync(fileURLToPath(new URL(`./pipeline/${name}.js`, import.meta.url))));
        }
        write(path.join(root, 'src/components/utils/html.js'), '');
        write(path.join(root, 'src/components/utils/escapeHtml.js'), '');
        const alias = runtime === 'framework' ? 'src/framework/client/browser.js' : 'src/components/browser.js';
        link(privateFile, path.join(root, alias));
        fs.mkdirSync(path.join(root, 'src/framework/shared'), { recursive: true });
        const module = await import(pathToFileURL(path.join(pipeline, `${writer}.js`)).href);
        await assert.rejects(module[writer](output), /Symlink/);
        assert.equal(fs.existsSync(path.join(output, runtime === 'framework' ? 'assets/js/client/browser.js' : 'assets/js/behaviors/browser.js')), false);
        assert.equal(fs.readFileSync(privateFile, 'utf8'), 'private content');
    });
}
