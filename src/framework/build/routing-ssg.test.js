import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const fixture = t => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-routing-ssg-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    fs.cpSync(path.join(root, 'src'), path.join(dir, 'src'), {
        recursive: true, filter: filename => !filename.endsWith('.test.js')
    });
    fs.mkdirSync(path.join(dir, 'src/pages'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}');
    return dir;
};
const write = (dir, name, value) => {
    const filename = path.join(dir, name);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, value);
};
const snapshot = directory => fs.readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry => {
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) return [[entry.name, 'directory'], ...snapshot(filename).map(([name, ...value]) => [path.join(entry.name, name), ...value])];
        return [[entry.name, 'file', fs.readFileSync(filename).toString('hex')]];
    });
const run = (dir, source, environment = 'production') => {
    write(dir, 'routing-ssg-test.mjs', `
        import fs from 'node:fs';
        import path from 'node:path';
        import assert from 'node:assert/strict';
        import {build} from './src/framework/build/pipeline/ssg.js';
        import {getRoutes, invalidateRoutes} from './src/framework/server/handlers/autoRoutes.js';
        import {servePages} from './src/framework/server/handlers/servePages.js';
        const snapshot = ${snapshot.toString()};
        const write = (name, value) => {
            fs.mkdirSync(path.dirname(name), {recursive:true});
            fs.writeFileSync(name, value);
        };
        ${source}
    `);
    const result = spawnSync(process.execPath, ['routing-ssg-test.mjs'], {
        cwd: dir, encoding: 'utf8', timeout: 30000,
        env: { ...process.env, NODE_ENV: environment, npm_lifecycle_event: '' }
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
};
const dynamicPage = rows => `
    export const meta = {interactive:false};
    export const externalData = async () => ${JSON.stringify(rows)};
    export const components = data => [{type:'atom',name:'text',props:{is:'h1',slot:data.title}}];
`;

for (const environment of ['development', 'production']) {
    test(`page routing prefers static and earlier literal segments in ${environment}`, t => {
        const dir = fixture(t);
        const page = expression => `
            export const meta = {render:'ssr',interactive:false};
            export const components = params => [{type:'atom',name:'text',props:{is:'h1',slot:${expression}}}];
        `;
        write(dir, 'src/pages/posts/[slug].js', page("'DYNAMIC_POST_' + params.slug"));
        write(dir, 'src/pages/posts/about/index.js', page("'STATIC_ABOUT'"));
        write(dir, 'src/pages/shop/[section]/fixed/index.js', page("'DYNAMIC_SECTION_' + params.section"));
        write(dir, 'src/pages/shop/books/[slug].js', page("'LITERAL_BOOKS_' + params.slug"));
        write(dir, 'src/pages/shop/[section]/book-[id]/index.js', page("'MIXED_BOOK_' + params.id"));
        write(dir, 'src/pages/shop/[section]/[slug].js', page("'GENERIC_SHOP_' + params.slug"));
        run(dir, `
            const readDirectory = fs.readdirSync;
            try {
                // Route priority must survive either filesystem iteration order.
                for (const reversed of [false, true]) {
                    fs.readdirSync = (...args) => {
                        const entries = readDirectory(...args);
                        return reversed && args[1]?.withFileTypes ? entries.reverse() : entries;
                    };
                    invalidateRoutes();
                    const routes = getRoutes();
                    assert.ok(routes.findIndex(route => route.pattern.pathname === '/posts/about') <
                        routes.findIndex(route => route.pattern.pathname === '/posts/:slug'));
                    for (const [pathname, expected] of [
                        ['/posts/about', 'STATIC_ABOUT'], ['/posts/hello', 'DYNAMIC_POST_hello'],
                        ['/shop/books/fixed', 'LITERAL_BOOKS_fixed'],
                        ['/shop/music/fixed', 'DYNAMIC_SECTION_music'],
                        ['/shop/music/book-42', 'MIXED_BOOK_42'],
                        ['/shop/music/other', 'GENERIC_SHOP_other']
                    ]) {
                        let status, body;
                        await servePages({method:'GET',headers:{}}, {
                            writeHead(value) {status=value;}, end(value) {body=value;}
                        }, new URL('http://localhost' + pathname));
                        assert.equal(status, 200, pathname);
                        assert.ok(body.includes('>' + expected + '</h1>'), pathname + ': ' + body);
                    }
                }
            } finally { fs.readdirSync = readDirectory; }
        `, environment);
    });
}

for (const [name, sources] of [
    ['renamed dynamic parameters', ['src/pages/posts/[id].js', 'src/pages/posts/[slug].js']],
    ['duplicate file and directory routes', ['src/pages/posts/[slug].js', 'src/pages/posts/[slug]/index.js']]
]) {
    test(`ambiguous ${name} fail discovery and preserve published output`, t => {
        const dir = fixture(t);
        write(dir, 'src/pages/index.js', 'export const components=[];');
        run(dir, `
            assert.equal((await build('public', {clean:false})).success, true);
            const before = snapshot('public');
            const topLevel = fs.readdirSync('.').sort();
            for (const source of ${JSON.stringify(sources)}) write(source, 'export const components=()=>[];');
            invalidateRoutes();
            assert.throws(() => getRoutes(), error => {
                assert.match(error.message, /Ambiguous page routes/);
                for (const source of ${JSON.stringify(sources)}) assert.ok(error.message.includes(source));
                return true;
            });
            await assert.rejects(() => build('public', {clean:false}), /Ambiguous page routes/);
            assert.deepEqual(snapshot('public'), before);
            assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
        `);
    });
}

for (const parallel of [false, true]) {
    test(`empty dynamic data publishes zero pages and prunes previous slugs (parallel:${parallel})`, t => {
        const dir = fixture(t);
        write(dir, 'src/pages/posts/[slug].js', dynamicPage([{slug:'old',title:'Old'}, {slug:'other',title:'Other'}]));
        write(dir, 'src/pages/posts/style.css', 'body { color: teal; }');
        run(dir, `
            for (const output of ['public','clean-public']) {
                const built = await build(output, {clean:false, parallel:${parallel}});
                assert.equal(built.success, true);
                assert.equal(built.generated.length, 2);
                write(output + '/posts/old/user.bin', Buffer.from([0,255,128]));
                assert.ok(fs.existsSync(output + '/posts/old/index.html'));
                assert.ok(fs.existsSync(output + '/posts/other/index.html'));
            }
            const topLevel = fs.readdirSync('.').sort();
            write('src/pages/posts/[slug].js', ${JSON.stringify(dynamicPage([]))});
            for (const [output,clean] of [['public',false],['clean-public',true]]) {
                const empty = await build(output, {clean, parallel:${parallel}});
                assert.equal(empty.success, true);
                assert.deepEqual(empty.generated, []);
                assert.deepEqual(empty.errors, []);
                assert.deepEqual(empty.ssrRoutes, []);
                assert.equal(fs.existsSync(output + '/posts/old/index.html'), false);
                assert.equal(fs.existsSync(output + '/posts/other/index.html'), false);
                assert.equal(fs.existsSync(output + '/posts/old/user.bin'), !clean);
                if (!clean) assert.deepEqual(fs.readFileSync(output + '/posts/old/user.bin'), Buffer.from([0,255,128]));
            }
            assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
        `);
    });
}

test('invalid dynamic data still fails without replacing successful output', t => {
    const dir = fixture(t);
    write(dir, 'src/pages/posts/[slug].js', dynamicPage([{slug:'old',title:'Old'}]));
    run(dir, `
        assert.equal((await build('public', {clean:false})).success, true);
        const before = snapshot('public');
        const topLevel = fs.readdirSync('.').sort();
        write('src/pages/posts/[slug].js', 'export const externalData=()=>undefined; export const components=()=>[];');
        const invalid = await build('public', {clean:false});
        assert.equal(invalid.success, false);
        assert.ok(invalid.errors.length > 0);
        assert.deepEqual(snapshot('public'), before);
        assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
    `);
});

for (const parallel of [false, true]) {
    for (const kind of ['static and dynamic routes', 'intersecting dynamic routes', 'duplicate data records']) {
        test(`colliding output from ${kind} fails without publishing (parallel:${parallel})`, t => {
            const dir = fixture(t);
            write(dir, 'src/pages/index.js', 'export const components=[];');
            const additions = kind === 'static and dynamic routes'
                ? `write('src/pages/posts/same/index.js', 'export const components=[];');`
                : kind === 'intersecting dynamic routes'
                    ? `write('src/pages/[section]/[id].js', ${JSON.stringify(dynamicPage([{section:'posts',id:'same',title:'Intersecting'}]))});`
                    : '';
            const rows = kind === 'duplicate data records'
                ? [{slug:'same',title:'First'}, {slug:'same',title:'Second'}]
                : [{slug:'same',title:'Dynamic'}];
            run(dir, `
                assert.equal((await build('public', {clean:false})).success, true);
                write('public/user.bin', Buffer.from([0,255,128]));
                const before = snapshot('public');
                const topLevel = fs.readdirSync('.').sort();
                write('src/pages/posts/[slug].js', ${JSON.stringify(dynamicPage(rows))});
                ${additions}
                const reported = [];
                const result = await build('public', {
                    clean:false, parallel:${parallel}, onError:error => reported.push(error)
                });
                assert.equal(result.success, false);
                assert.ok(result.errors.some(error => /Generated output collision/.test(error.error)));
                assert.ok(reported.some(error => /Generated output collision/.test(error.error)));
                assert.deepEqual(snapshot('public'), before);
                assert.deepEqual(fs.readdirSync('.').sort(), topLevel);
                assert.equal(fs.existsSync('public/posts/same/index.html'), false);
            `);
        });
    }
}
