import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import { generateSSRFallback } from './pipeline/ssrFallback.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const meta = {
    title: '</title><script>steal()</script> & "SSR"',
    description: '" onload="steal()"><img src=x> & details',
    lang: 'en" dir="rtl'
};
const assertMeta = html => {
    assert.ok(html.includes('<title>&lt;/title&gt;&lt;script&gt;steal()&lt;/script&gt; &amp; &quot;SSR&quot;</title>'));
    assert.ok(html.includes('<meta name="description" content="&quot; onload=&quot;steal()&quot;&gt;&lt;img src=x&gt; &amp; details">'));
    assert.ok(html.includes('<html lang="en&quot; dir=&quot;rtl">'));
    assert.equal(html.includes('<script>steal()</script>'), false);
    assert.equal(html.includes('<img src=x>'), false);
};
const temporaryDirectory = t => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-ssr-fallback-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    return dir;
};
const write = (dir, filename, content) => {
    const target = path.join(dir, filename);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
};
const fixture = t => {
    const dir = temporaryDirectory(t);
    fs.cpSync(path.join(root, 'src'), path.join(dir, 'src'), {
        recursive: true, filter: filename => !filename.endsWith('.test.js')
    });
    fs.mkdirSync(path.join(dir, 'src/pages'), { recursive: true });
    write(dir, 'package.json', '{"type":"module"}');
    return dir;
};
const run = (dir, source) => {
    write(dir, 'ssr-fallback-test.mjs', `
        import assert from 'node:assert/strict';
        import fs from 'node:fs';
        import { build } from './src/framework/build/pipeline/ssg.js';
        const assertMeta = ${assertMeta.toString()};
        ${source}
    `);
    const result = spawnSync(process.execPath, ['ssr-fallback-test.mjs'], {
        cwd: dir, encoding: 'utf8', timeout: 30000,
        env: { ...process.env, NODE_ENV: 'production', npm_lifecycle_event: '' }
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
};

for (const strategy of ['loading', 'empty', '404', 'redirect']) {
    test(`direct SSR fallback loads and escapes page metadata (${strategy})`, async t => {
        const dir = temporaryDirectory(t);
        let loads = 0;
        const route = {
            pattern: { pathname: '/direct' },
            load: async () => { loads++; return { meta }; }
        };
        const result = await generateSSRFallback(route, path.join(dir, 'public'), {
            strategy, serverUrl: 'https://example.test'
        });
        assert.equal(loads, 1);
        assert.equal(result.pathname, '/direct');
        assert.equal(result.strategy, strategy);
        assertMeta(fs.readFileSync(result.outputPath, 'utf8'));
    });
}
test('preloaded SSR metadata takes priority without importing the page again', async t => {
    const dir = temporaryDirectory(t);
    let loads = 0;
    const result = await generateSSRFallback({
        pattern: { pathname: '/preloaded' }, meta,
        load: async () => { loads++; throw new Error('Page must stay in its fresh worker'); }
    }, path.join(dir, 'public'));
    assert.equal(loads, 0);
    assertMeta(fs.readFileSync(result.outputPath, 'utf8'));
});

test('direct SSR fallback keeps defaults when the page cannot be loaded', async t => {
    const dir = temporaryDirectory(t);
    const result = await generateSSRFallback({
        pattern: { pathname: '/missing' },
        load: async () => { throw new Error('Page unavailable'); }
    }, path.join(dir, 'public'));
    const html = fs.readFileSync(result.outputPath, 'utf8');
    assert.ok(html.includes('<title>Loading...</title>'));
    assert.ok(html.includes('<html lang="en">'));
    assert.equal(html.includes('name="description"'), false);
});

test('SSR redirect safely embeds quotes and closing script tags in every context', async t => {
    const dir = temporaryDirectory(t);
    const serverUrl = 'https://example.test/?next=\'"</script><script>steal()</script>&x=';
    const result = await generateSSRFallback({
        pattern: { pathname: '/direct' }, meta
    }, path.join(dir, 'public'), { strategy: 'redirect', serverUrl });
    const html = fs.readFileSync(result.outputPath, 'utf8');
    assertMeta(html);
    assert.equal((html.match(/<script>/g) || []).length, 1);
    const href = html.match(/<a href="([^"]+)"/)?.[1];
    const refresh = html.match(/http-equiv="refresh" content="0; url=([^"]+)"/)?.[1];
    assert.equal(refresh, href);
    assert.ok(href.includes('&#x27;&quot;&lt;/script&gt;'));
    assert.ok(href.endsWith('&amp;x=/direct'));
    const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    assert.equal(script.includes('</script'), false);
    const window = { location: { href: '' } };
    runInNewContext(script, { window });
    assert.equal(window.location.href, serverUrl + '/direct');
});

test('SSR redirects reject executable protocols before writing output', async t => {
    const dir = temporaryDirectory(t), output = path.join(dir, 'public');
    for (const serverUrl of ['javascript:alert(1)', ' \nJaVaScRiPt:alert(1)', 'data:text/html,<script>steal()</script>']) {
        await assert.rejects(() => generateSSRFallback({
            pattern: { pathname: '/direct' }, meta
        }, output, { strategy: 'redirect', serverUrl }), /Unsupported URL protocol/);
    }
    assert.equal(fs.existsSync(output), false);
});

test('404 SSR fallback escapes the route shown in page content', async t => {
    const dir = temporaryDirectory(t);
    const result = await generateSSRFallback({
        pattern: { pathname: '/<route>&"details' }, meta
    }, path.join(dir, 'public'), { strategy: '404' });
    const html = fs.readFileSync(result.outputPath, 'utf8');
    assertMeta(html);
    assert.ok(html.includes('<code>/&lt;route&gt;&amp;&quot;details</code>'));
    assert.equal(html.includes('<route>'), false);
});

for (const parallel of [false, true]) {
    test(`real SSR fallback builds retain fresh transitive metadata (parallel:${parallel})`, t => {
        const dir = fixture(t);
        const values = `export const pageMeta = ${JSON.stringify(meta)};`;
        write(dir, 'src/meta-values.js', values);
        write(dir, 'src/page-meta.js', `
            export { pageMeta } from './meta-values.js';
        `);
        const page = `
            import { isMainThread } from 'node:worker_threads';
            import { pageMeta } from '../../page-meta.js';
            if (isMainThread) throw new Error('SSR page was reloaded in the build parent');
            export const meta = {
                ...pageMeta, render:'ssr', interactive:false,
                onRender: () => 'unsupported callback',
                extra: { callback() {}, symbol: Symbol('not cloneable') }
            };
            export const components = () => [];
        `;
        write(dir, 'src/pages/dashboard/index.js', page);
        write(dir, 'src/pages/users/[id].js', page);
        run(dir, `
            const options = { clean:false, parallel:${parallel} };
            const first = await build('public', options);
            assert.equal(first.success, true);
            assert.deepEqual(first.errors, []);
            assert.equal(first.ssrRoutes.length, 2);
            assert.deepEqual(first.generated, []);
            for (const filename of ['public/dashboard/index.html', 'public/users/:id/index.html']) {
                assertMeta(fs.readFileSync(filename, 'utf8'));
            }
            fs.writeFileSync('src/meta-values.js', ${JSON.stringify(`export const pageMeta = {
                title: 'Updated <SSR> & title',
                description: 'New "description" & value',
                lang: 'fr'
            };`)});
            const second = await build('public', options);
            assert.equal(second.success, true);
            assert.deepEqual(second.errors, []);
            assert.equal(second.ssrRoutes.length, 2);
            for (const filename of ['public/dashboard/index.html', 'public/users/:id/index.html']) {
                const html = fs.readFileSync(filename, 'utf8');
                assert.ok(html.includes('<title>Updated &lt;SSR&gt; &amp; title</title>'));
                assert.ok(html.includes('<meta name="description" content="New &quot;description&quot; &amp; value">'));
                assert.ok(html.includes('<html lang="fr">'));
                assert.equal(html.includes('steal()'), false);
            }
            assert.equal(fs.readdirSync('.').some(name => name.includes('.b0nes-build-')), false);
        `);
    });
}
