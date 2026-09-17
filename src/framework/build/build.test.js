import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const fixture = t => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-build-test-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    fs.cpSync(path.join(root, 'src'), path.join(dir, 'src'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'src/pages'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}');
    return dir;
};
const write = (dir, name, source) => {
    const file = path.join(dir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, source);
};
const run = (dir, args) => {
    const result = spawnSync(process.execPath, args, { cwd: dir, encoding: 'utf8', timeout: 30000 });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    return result;
};
const page = value => `export const components = [{type:'atom',name:'text',props:{is:'p',slot:${JSON.stringify(value)}}}];`;

for (const parallel of [false, true]) {
    test(`fresh builds and dynamic discovery (${parallel ? 'parallel' : 'sequential'})`, t => {
        const dir = fixture(t);
        write(dir, 'src/pages/index.js', page('first'));
        write(dir, 'src/pages/posts/[slug].js', `
            export const externalData = async () => [{slug:'hello'}, {slug:'world'}];
            export const components = async data => [{type:'atom',name:'text',props:{is:'p',slot:data.slug}}];
        `);
        write(dir, 'src/pages/runtime/[id].js', `export const components = params => [{type:'atom',name:'text',props:{is:'p',slot:params.id}}];`);
        const args = ['src/framework/build/cli.js', 'build', ...(parallel ? ['--parallel'] : [])];
        run(dir, args);
        assert.match(fs.readFileSync(path.join(dir, 'public/posts/hello/index.html'), 'utf8'), />hello<\/p>/);
        assert.match(fs.readFileSync(path.join(dir, 'public/posts/world/index.html'), 'utf8'), />world<\/p>/);
        write(dir, 'src/pages/index.js', page('edited'));
        run(dir, args);
        assert.match(fs.readFileSync(path.join(dir, 'public/index.html'), 'utf8'), />edited<\/p>/);
        fs.unlinkSync(path.join(dir, 'public/posts/hello/index.html'));
        run(dir, [...args, '--clean']);
        assert.ok(fs.existsSync(path.join(dir, 'public/posts/hello/index.html')));
        // A custom output directory must not inherit results from another output.
        run(dir, [...args, '--output=other-public']);
        assert.ok(fs.existsSync(path.join(dir, 'other-public/index.html')));
    });
}

test('repeated build() calls reload transitive modules and component implementations', t => {
    const dir = fixture(t);
    write(dir, 'src/pages/data.js', 'export const value = "before";');
    write(dir, 'src/pages/index.js', `import {value} from './data.js'; export const components = [{type:'atom',name:'text',props:{is:'p',slot:value}}];`);
    write(dir, 'repeat.mjs', `
        import fs from 'node:fs';
        import assert from 'node:assert/strict';
        import {build} from './src/framework/build/pipeline/ssg.js';
        assert.equal((await build('public', {clean:false})).success, true);
        fs.writeFileSync('src/pages/data.js', 'export const value = "after";');
        const file = 'src/components/atoms/text/text.js';
        fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('class="', 'data-rebuilt="yes" class="'));
        assert.equal((await build('public', {clean:false})).success, true);
        const html = fs.readFileSync('public/index.html', 'utf8');
        assert.ok(html.includes('after'));
        assert.ok(html.includes('data-rebuilt="yes"'));
    `);
    run(dir, ['repeat.mjs']);
});

test('production entry points preserve imports and nested behaviors across pages', t => {
    const dir = fixture(t);
    const tree = [{type:'atom',name:'box',props:{slot:[
        {type:'organism',name:'multi-step-form',props:{}},
        {type:'molecule',name:'tabs',props:{tabs:[{label:'A',content:'B'}]}}
    ]}}];
    write(dir, 'src/pages/index.js', `export const components = ${JSON.stringify(tree)};`);
    write(dir, 'src/pages/other/index.js', `export const components = ${JSON.stringify(tree)};`);
    run(dir, ['src/framework/build/cli.js', 'build', '--production', '--parallel']);
    for (const name of ['index', 'other']) {
        const filename = `public/assets/js/bundles/${name}.bundle.js`;
        run(dir, ['--check', filename]);
        const source = fs.readFileSync(path.join(dir, filename), 'utf8');
        assert.ok(source.includes('../behaviors/organisms/multi-step-form/client.js'));
        assert.ok(source.includes('../behaviors/molecules/tabs/client.js'));
        assert.ok(fs.existsSync(path.join(dir, 'public/assets/js/behaviors/organisms/multi-step-form/client.js')));
        assert.ok(fs.existsSync(path.join(dir, 'public/assets/js/shared/urlPattern.js')));
        assert.ok(!fs.existsSync(path.join(dir, 'public/assets/js/client/store.test.js')));
    }
});

test('dynamic generation failures fail the build instead of publishing partial success', t => {
    const dir = fixture(t);
    write(dir, 'src/pages/[slug].js', `
        export const externalData = async () => [{slug:'ok'}, {slug:'bad'}];
        export const components = data => { if (data.slug === 'bad') throw Error('broken data'); return []; };
    `);
    const result = spawnSync(process.execPath, ['src/framework/build/cli.js', 'build'], { cwd: dir, encoding: 'utf8', timeout: 30000 });
    assert.equal(result.status, 1);
    assert.match(result.stdout + result.stderr, /broken data/);
});


test('finished route workers release timers and tolerate throwing error callbacks', t => {
    const dir = fixture(t);
    write(dir, 'src/pages/index.js', 'setInterval(() => {}, 1000); export const components = [];');
    write(dir, 'src/pages/broken/index.js', 'throw new Error("broken page");');
    write(dir, 'worker-lifecycle.mjs', `
        import assert from 'node:assert/strict';
        import {build} from './src/framework/build/pipeline/ssg.js';
        const result = await build('public', {
            continueOnError: true,
            onError: () => { throw Error('callback error'); }
        });
        assert.equal(result.success, false);
        assert.equal(result.errors.length, 1);
        assert.equal(result.generated.length, 1);
    `);
    run(dir, ['worker-lifecycle.mjs']);
});

for (const descriptor of [
    { type: 'atom', name: 'missing', props: {} },
    { type: 'atom', name: 'button', props: { slot: 'Go', type: 'invalid' } }
]) {
    test(`build rejects ${descriptor.name} failures unless explicitly permitted`, t => {
        const dir = fixture(t);
        write(dir, 'src/pages/index.js', `export const components = [${JSON.stringify(descriptor)}];`);
        const args = ['src/framework/build/cli.js', 'build'];
        const failed = spawnSync(process.execPath, args, { cwd: dir, encoding: 'utf8', timeout: 30000 });
        assert.equal(failed.status, 1, failed.stdout + failed.stderr);
        assert.equal(fs.existsSync(path.join(dir, 'public/index.html')), false);
        run(dir, [...args, '--allow-render-errors']);
        assert.ok(fs.existsSync(path.join(dir, 'public/index.html')));
    });
}

test('broken SPA templates fail builds and repeated compilation reloads imports', t => {
    const dir = fixture(t);
    write(dir, 'src/pages/index.js', page('home'));
    write(dir, 'src/pages/app/templates/main.js', "export const components = [{type:'atom',name:'missing'}];");
    const failed = spawnSync(process.execPath, ['src/framework/build/cli.js', 'build'], { cwd: dir, encoding: 'utf8', timeout: 30000 });
    assert.equal(failed.status, 1);
    write(dir, 'src/pages/app/data.js', 'export const value = "before";');
    write(dir, 'src/pages/app/templates/main.js', "import {value} from '../data.js'; export const components = [{type:'atom',name:'text',props:{is:'p',slot:value}}];");
    write(dir, 'repeat-template.mjs', `
        import fs from 'node:fs';
        import assert from 'node:assert/strict';
        import {build} from './src/framework/build/pipeline/ssg.js';
        assert.equal((await build('public')).success, true);
        fs.writeFileSync('src/pages/app/data.js', 'export const value = "after";');
        assert.equal((await build('public')).success, true);
        assert.match(fs.readFileSync('public/app/templates/main.js', 'utf8'), /after/);
    `);
    run(dir, ['repeat-template.mjs']);
});

for (const kind of ['unsafe parameter', 'asset copy failure']) {
    test(`CLI exits nonzero for ${kind}`, t => {
        const dir = fixture(t);
        if (kind === 'unsafe parameter') {
            write(dir,'src/pages/posts/[slug].js', `export const externalData = () => [{slug:'../../escaped'}]; export const components = [];`);
        } else {
            write(dir,'src/pages/about/index.js', page('About'));
            write(dir,'src/pages/about/style.css','body{}');
            fs.mkdirSync(path.join(dir,'public/about/style.css'),{recursive:true});
        }
        const result = spawnSync(process.execPath,['src/framework/build/cli.js','build'],{cwd:dir,encoding:'utf8',timeout:30000});
        assert.equal(result.status,1,result.stdout + result.stderr);
        assert.equal(fs.existsSync(path.join(dir,'escaped')),false);
    });
}

test('production bundle retains dependencies after serialized component input', t => {
    const dir = fixture(t);
    write(dir,'src/pages/index.js', `
        import {tabs} from '../components/molecules/tabs/tabs.js';
        export const components = JSON.parse(JSON.stringify([tabs({tabs:[{label:'A',content:'B'}]})]));
    `);
    run(dir,['src/framework/build/cli.js','build','--production']);
    const bundle = fs.readFileSync(path.join(dir,'public/assets/js/bundles/index.bundle.js'),'utf8');
    assert.match(bundle,/molecules:tabs/);
    assert.equal(fs.existsSync(path.join(dir,'public/assets/js/behaviors/atoms/button/button.test.js')),false);
});
