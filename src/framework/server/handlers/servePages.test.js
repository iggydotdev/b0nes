import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fork, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));

async function fixture(t, mode = 'production') {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-production-pages-'));
    const write = (relative, source) => {
        const filename = path.join(directory, relative);
        fs.mkdirSync(path.dirname(filename), { recursive: true });
        fs.writeFileSync(filename, source);
    };
    fs.cpSync(path.join(root, 'src'), path.join(directory, 'src'), {
        recursive: true, filter: filename => !filename.endsWith('.test.js')
    });
    fs.rmSync(path.join(directory, 'src/pages'), { recursive: true, force: true });
    write('package.json', JSON.stringify({ type: 'module' }));
    write('src/pages/index.js', `export const components = [{ type: 'atom', name: 'text', props: { is: 'h1', slot: 'Built home' } }];`);
    write('src/pages/catalog/[slug].js', `
import { readFileSync } from 'node:fs';
export const meta = { render: 'ssg' };
export const externalData = () => JSON.parse(readFileSync(new URL('./records.json', import.meta.url), 'utf8'));
export const components = ({ title }) => {
    if (!title) throw new Error('Dynamic SSG requires fetched title');
    return [{ type: 'molecule', name: 'tabs', props: { tabs: [{ label: 'Title', content: title }] } }];
};`);
    write('src/pages/catalog/records.json', JSON.stringify([
        { slug: 'first', title: 'Fetched & <first>' },
        { slug: 'hello world', title: 'Space slug title' },
        { slug: '50% complete', title: 'Percent slug title' }
    ]));
    write('src/pages/live/[id].js', `
export const meta = { render: 'ssr', interactive: false };
export const externalData = () => { throw new Error('SSR must not run externalData'); };
let requests = 0;
export const components = async ({ id }) => [{ type: 'atom', name: 'text', props: { is: 'p', slot: 'SSR ' + id + ' request ' + ++requests } }];`);
    write('src/pages/fixed-live/index.js', `
export const meta = { render: 'ssr', interactive: false };
export const components = [{ type: 'atom', name: 'text', props: { is: 'p', slot: 'Fixed SSR content' } }];`);
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const built = spawnSync(process.execPath, ['src/framework/build/cli.js', 'build', '--clean', '--parallel', '--production'], {
        cwd: directory, encoding: 'utf8', timeout: 30000,
        env: { ...process.env, NODE_ENV: 'production', npm_lifecycle_event: '' }
    });
    assert.equal(built.status, 0, built.stdout + built.stderr);
    write('serve.mjs', `
import { startServer } from './src/framework/server/index.js';
const server = startServer(0, '127.0.0.1');
server.once('listening', () => process.send({ port: server.address().port }));`);
    const child = fork(path.join(directory, 'serve.mjs'), [], {
        cwd: directory, silent: true,
        env: { ...process.env, NODE_ENV: mode, npm_lifecycle_event: '' }
    });
    let output = '';
    child.stdout.on('data', chunk => { output = (output + chunk).slice(-16000); });
    child.stderr.on('data', chunk => { output = (output + chunk).slice(-16000); });
    t.after(async () => {
        if (child.exitCode === null && child.signalCode === null) {
            const exited = once(child, 'exit');
            child.kill('SIGTERM');
            await exited;
        }
    });
    const [message] = await Promise.race([
        once(child, 'message'),
        once(child, 'exit').then(([code]) => { throw new Error(`Server exited (${code}): ${output}`); })
    ]);
    const url = `http://127.0.0.1:${message.port}`;
    return { directory, write, request: (pathname, options) => fetch(url + pathname, { signal: AbortSignal.timeout(10000), ...options }) };
}

test('production HTTP serves generated dynamic SSG with fetched fields and production scripts', { timeout: 30000 }, async t => {
    const { directory, write, request } = await fixture(t);
    // Runtime source data differs, proving the response comes from the artifact.
    write('src/pages/catalog/records.json', JSON.stringify([{ slug: 'first', title: 'Runtime data must not replace build output' }]));
    for (const [pathname, file, expected] of [
        ['/catalog/first?variant=full', 'catalog/first/index.html', 'Fetched &amp; &lt;first&gt;'],
        ['/catalog/hello%20world?view=details#section', 'catalog/hello%20world/index.html', 'Space slug title'],
        ['/catalog/50%25%20complete', 'catalog/50%25%20complete/index.html', 'Percent slug title']
    ]) {
        const response = await request(pathname);
        assert.equal(response.status, 200, pathname);
        assert.equal(response.headers.get('x-rendered-by'), 'b0nes-ssg');
        assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
        const html = await response.text();
        assert.equal(html, fs.readFileSync(path.join(directory, 'public', file), 'utf8'));
        assert.ok(html.includes(expected), pathname);
        assert.match(html, /assets\/js\/client\/b0nes\.js/);
        assert.ok(!html.includes('Runtime data must not replace build output'));
    }
    const head = await request('/catalog/first', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    const missing = await request('/catalog/not-generated');
    assert.equal(missing.status, 404, 'unlisted SSG paths must not turn into SSR or server errors');

    // Builds predating the transaction manifest remain usable after upgrade.
    fs.unlinkSync(path.join(directory, 'public/.b0nes-build-manifest.json'));
    assert.equal((await request('/catalog/first')).status, 200);
});

test('production HTTP renders actual SSR routes even when generated fallback files exist', { timeout: 30000 }, async t => {
    const { directory, request } = await fixture(t);
    assert.match(fs.readFileSync(path.join(directory, 'public/fixed-live/index.html'), 'utf8'), /Loading/);
    const fixed = await request('/fixed-live');
    assert.equal(fixed.status, 200);
    assert.equal(fixed.headers.get('x-rendered-by'), 'b0nes-ssr');
    assert.match(await fixed.text(), /Fixed SSR content/);
    for (const [id, count] of [['first', 1], ['second', 2]]) {
        const response = await request('/live/' + id);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('x-rendered-by'), 'b0nes-ssr');
        assert.match(response.headers.get('cache-control'), /no-store/);
        assert.ok((await response.text()).includes(`SSR ${id} request ${count}`));
    }
});

test('production HTTP refuses generated HTML symlinks outside public or into forbidden files', { timeout: 30000 }, async t => {
    const { directory, write, request } = await fixture(t);
    const filename = path.join(directory, 'public/catalog/first/index.html');
    write('private.html', 'SERVER_PRIVATE_SENTINEL');
    fs.unlinkSync(filename);
    fs.symlinkSync(path.join(directory, 'private.html'), filename);
    let response = await request('/catalog/first');
    assert.equal(response.status, 404);
    assert.ok(!(await response.text()).includes('SERVER_PRIVATE_SENTINEL'));

    write('public/.env.html', 'SERVER_PRIVATE_SENTINEL');
    fs.unlinkSync(filename);
    fs.symlinkSync(path.join(directory, 'public/.env.html'), filename);
    response = await request('/catalog/first');
    assert.equal(response.status, 404);
    assert.ok(!(await response.text()).includes('SERVER_PRIVATE_SENTINEL'));

    fs.renameSync(path.join(directory, 'public'), path.join(directory, 'published'));
    fs.symlinkSync(path.join(directory, 'published'), path.join(directory, 'public'));
    assert.equal((await request('/catalog/hello%20world')).status, 404, 'a linked public root must not redirect page reads');
});

test('development HTTP keeps rendering source rather than previously generated pages', { timeout: 30000 }, async t => {
    const { write, request } = await fixture(t, 'development');
    write('src/pages/index.js', `export const components = [{ type: 'atom', name: 'text', props: { is: 'h1', slot: 'Fresh development home' } }];`);
    const home = await request('/');
    assert.equal(home.status, 200);
    assert.match(home.headers.get('cache-control'), /no-store/);
    const html = await home.text();
    assert.match(html, /Fresh development home/);
    assert.ok(!html.includes('Built home'));
    const live = await request('/live/development');
    assert.equal(live.status, 200);
    assert.match(await live.text(), /SSR development request 1/);
    write('src/pages/catalog/records.json', JSON.stringify([{ slug: 'hello world', title: 'Fresh fetched record' }]));
    const catalog = await request('/catalog/hello%20world');
    assert.equal(catalog.status, 200);
    assert.match(await catalog.text(), /Fresh fetched record/);
    assert.equal((await request('/catalog/not-enumerated')).status, 404);
});
