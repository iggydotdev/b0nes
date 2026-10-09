import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { generateCompiledTemplates } from './pipeline/compileTemplates.js';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const fixture = t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-template-modules-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const write = (relative, source) => {
        const filename = path.join(root, relative);
        fs.mkdirSync(path.dirname(filename), { recursive: true });
        fs.writeFileSync(filename, source);
        return filename;
    };
    write('package.json', '{"type":"module"}');
    const app = path.join(root, 'src/pages/app'), output = path.join(root, 'public');
    return { root, app, output, write };
};

for (const mode of ['individual', 'bundle']) {
    test(`compiled ${mode} dynamic templates retain component imports, transitive re-exports, cycles and lazy JSON imports`, async t => {
        const { root, app, output, write } = fixture(t);
        fs.cpSync(path.join(repository, 'src/components/utils'), path.join(root, 'src/components/utils'), { recursive: true });
        fs.cpSync(path.join(repository, 'src/components/atoms/text'), path.join(root, 'src/components/atoms/text'), { recursive: true });
        write('src/pages/app/data/label.js', `import { suffix } from './suffix.js'; export const label = value => value + suffix();`);
        write('src/pages/app/data/suffix.js', `import { label } from './label.js'; export const suffix = () => ' & ready'; export const other = () => label('other');`);
        write('src/pages/app/data/reexport.js', `export { label } from './label.js';`);
        write('src/pages/app/data/lazy.json', JSON.stringify({ tail: ' <safe>' }));
        write('src/pages/app/data/not-imported.js', `export const secret = 'DO_NOT_PUBLISH';`);
        write('src/pages/app/templates/user-card.js', `
import { text } from '../../../components/atoms/text/text.js';
import { label } from '../data/reexport.js';
// import('./private-comment.js') is documentation, not a dependency.
export const components = async ({ name }) => {
    const { default: data } = await import('../data/lazy.json', { with: { type: 'json' } });
    return [text({ is: 'h1', slot: label(name) + data.tail })];
};`);
        write('src/pages/app/templates/static-card.js', `export const components = [];`);
        const destination = mode === 'individual' ? path.join(output, 'app/templates') : path.join(output, 'templates.js');
        await generateCompiledTemplates(app, destination, { mode, outputDir: output });
        const entry = mode === 'individual' ? path.join(destination, 'user-card.js') : destination;
        const emitted = await import(pathToFileURL(entry));
        const fn = mode === 'individual' ? emitted.components : emitted.templates['user-card'];
        const html = await fn({ name: '<user>' });
        assert.match(String(html[0]), /&lt;user&gt; &amp; ready &lt;safe&gt;/);
        const namespace = path.join(output, 'assets/js/template-modules', fs.readdirSync(path.join(output, 'assets/js/template-modules'))[0]);
        assert.equal(fs.existsSync(path.join(namespace, 'pages/app/data/not-imported.js')), false);
        assert.equal(fs.existsSync(path.join(namespace, 'components/atoms/text/text.test.js')), false);
        assert.ok(fs.existsSync(path.join(namespace, 'pages/app/data/lazy.json')));
        assert.equal(mode === 'individual' ? emitted.default : emitted.default['user-card'], fn);
    });
}

test('module graph preserves spaces and escaped module specifiers', async t => {
    const { app, output, write } = fixture(t);
    write('src/pages/app/data/my label.js', `export const label = 'works';`);
    write('src/pages/app/templates/main.js', String.raw`import { label } from '../data/my\u0020label.js'; export const components = () => label;`);
    const destination = path.join(output, 'app with spaces/templates');
    await generateCompiledTemplates(app, destination, { mode: 'individual', outputDir: output });
    const module = await import(pathToFileURL(path.join(destination, 'main.js')));
    assert.equal(module.components(), 'works');
});

for (const variant of ['builtin', 'computed', 'server page', 'outside source', 'source symlink']) {
    test(`unsupported ${variant} template dependencies fail the build and preserve prior output`, t => {
        const { root, write } = fixture(t);
        fs.cpSync(path.join(repository, 'src'), path.join(root, 'src'), { recursive: true, filter: filename => !filename.endsWith('.test.js') });
        write('src/pages/index.js', `export const components = [];`);
        const build = () => spawnSync(process.execPath, ['src/framework/build/cli.js', 'build'], { cwd: root, encoding: 'utf8', timeout: 30000 });
        const first = build();
        assert.equal(first.status, 0, first.stdout + first.stderr);
        const previous = fs.readFileSync(path.join(root, 'public/index.html'));
        const imports = {
            builtin: `import { readFileSync } from 'node:fs';`,
            computed: `export const load = filename => import(filename);`,
            'server page': `import '../index.js';`,
            'outside source': `import '../../../../outside.js';`,
            'source symlink': `import '../data/linked.js';`
        };
        write('src/pages/app/index.js', `export const components = [];`);
        write('outside.js', `export const privateData = 'PRIVATE';`);
        write('src/pages/app/templates/main.js', `${imports[variant]} export const components = () => [];`);
        if (variant === 'source symlink') {
            fs.mkdirSync(path.join(root, 'src/pages/app/data'), { recursive: true });
            fs.symlinkSync(path.join(root, 'outside.js'), path.join(root, 'src/pages/app/data/linked.js'));
        }
        const failed = build();
        assert.equal(failed.status, 1, failed.stdout + failed.stderr);
        assert.deepEqual(fs.readFileSync(path.join(root, 'public/index.html')), previous);
        assert.equal(fs.existsSync(path.join(root, 'public/app/templates/main.js')), false);
        assert.match(failed.stdout + failed.stderr, /Unsupported template import|literal module paths|Server-only|escapes its root|Symlink/);
    });
}

test('successful rebuilds prune unused emitted template dependencies', t => {
    const { root, write } = fixture(t);
    fs.cpSync(path.join(repository, 'src'), path.join(root, 'src'), { recursive: true, filter: filename => !filename.endsWith('.test.js') });
    write('src/pages/index.js', `export const components = [];`);
    write('src/pages/app/data/label.js', `export const label = 'old';`);
    write('src/pages/app/templates/main.js', `import { label } from '../data/label.js'; export const components = () => label;`);
    const build = () => {
        const result = spawnSync(process.execPath, ['src/framework/build/cli.js', 'build'], { cwd: root, encoding: 'utf8', timeout: 30000 });
        assert.equal(result.status, 0, result.stdout + result.stderr);
    };
    build();
    const modules = path.join(root, 'public/assets/js/template-modules');
    const helper = path.join(modules, fs.readdirSync(modules)[0], 'pages/app/data/label.js');
    assert.ok(fs.existsSync(helper));
    write('src/pages/app/templates/main.js', `export const components = () => [];`);
    build();
    assert.equal(fs.existsSync(helper), false);
});
