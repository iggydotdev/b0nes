import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, fork } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const write = (dir, filename, content) => {
    const file = path.join(dir, filename);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
};

for (const parallel of [false, true]) {
    test(`dynamic SSG and SSR asset URLs resolve to copied files (${parallel ? 'parallel' : 'sequential'})`, { timeout: 30000 }, async t => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-dynamic-assets-'));
        t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
        fs.cpSync(path.join(root, 'src'), path.join(dir, 'src'), { recursive: true, filter: file => !file.endsWith('.test.js') });
        write(dir, 'package.json', '{"type":"module"}');
        for (const [source, data] of [
            ['posts/[slug].js', [{ slug: 'hello' }, { slug: 'world' }]],
            ['catalog/[category]/[slug].js', [{ category: 'books', slug: 'guide' }]],
            ['helpers/[category]/[slug].js', [{ category: 'books', slug: 'guide' }]],
            ['serialized/[category]/[slug].js', [{ category: 'books', slug: 'guide' }]]
        ]) {
            write(dir, 'src/pages/' + source, `
                export const externalData = () => ${JSON.stringify(data)};
                export const meta = { interactive: false, stylesheets: ['./style.css'], scripts: ['./script.js'] };
                export const components = () => [{ type: 'atom', name: 'box', props: { slot: [
                    { type: 'atom', name: 'image', props: { src: './photo.png', alt: 'Photo' } }
                ] } }];
            `);
            if (source.startsWith('helpers/') || source.startsWith('serialized/')) {
                write(dir, 'src/pages/' + source, `
                    import { image } from '../../../components/atoms/image/image.js';
                    import { box } from '../../../components/atoms/box/box.js';
                    export const externalData = () => ${JSON.stringify(data)};
                    export const meta = { interactive: false, stylesheets: ['./style.css'], scripts: ['./script.js'] };
                    const tree = [box({ slot: image({ src: './photo.png', alt: 'Photo' }) })];
                    export const components = ${source.startsWith('serialized/') ? 'JSON.parse(JSON.stringify(tree))' : 'tree'};
                `);
            }
            const base = path.dirname('src/pages/' + source);
            write(dir, base + '/style.css', 'body { color: teal; }');
            write(dir, base + '/script.js', 'window.pageScript = true;');
            write(dir, base + '/photo.png', 'public-photo-bytes');
        }
        const built = spawnSync(process.execPath, ['src/framework/build/cli.js', 'build', '--production', ...(parallel ? ['--parallel'] : [])], {
            cwd: dir, encoding: 'utf8', timeout: 15000, env: { ...process.env, NODE_ENV: 'production', npm_lifecycle_event: '' }
        });
        assert.equal(built.status, 0, built.stdout + built.stderr);
        const routes = ['/posts/hello', '/posts/world', '/catalog/books/guide', '/helpers/books/guide', '/serialized/books/guide'];
        const links = html => [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match => match[1]).filter(value => value.startsWith('/'));
        const expectedBase = pathname => pathname.startsWith('/posts/') ? '/posts/' : '/' + pathname.split('/')[1] + '/%5Bcategory%5D/';
        for (const pathname of routes) {
            const html = fs.readFileSync(path.join(dir, 'public', pathname.slice(1), 'index.html'), 'utf8');
            assert.deepEqual(links(html).sort(), ['photo.png', 'script.js', 'style.css'].map(name => expectedBase(pathname) + name).sort());
            for (const url of links(html)) assert.ok(fs.existsSync(path.join(dir, 'public', decodeURIComponent(url.slice(1)))), url);
        }
        write(dir, 'serve.mjs', `
            import { startServer } from './src/framework/server/index.js';
            const server = startServer(0, '127.0.0.1');
            server.on('listening', () => process.send({ port: server.address().port }));
        `);
        const child = fork(path.join(dir, 'serve.mjs'), [], {
            cwd: dir, silent: true, env: { ...process.env, NODE_ENV: 'production', npm_lifecycle_event: '' }
        });
        let output = '';
        child.stdout.on('data', data => { output += data; });
        child.stderr.on('data', data => { output += data; });
        t.after(async () => {
            if (child.exitCode === null) {
                const exited = once(child, 'exit'); child.kill('SIGTERM'); await exited;
            }
        });
        const [message] = await Promise.race([
            once(child, 'message'),
            once(child, 'exit').then(([code]) => { throw new Error(`Server exited with ${code}: ${output}`); })
        ]);
        const base = `http://127.0.0.1:${message.port}`;
        for (const pathname of [...routes, '/posts/runtime', '/catalog/music/runtime']) {
            const response = await fetch(base + pathname);
            assert.equal(response.status, 200, pathname);
            const html = await response.text();
            assert.deepEqual(links(html).sort(), ['photo.png', 'script.js', 'style.css'].map(name => expectedBase(pathname) + name).sort());
            for (const url of links(html)) {
                const asset = await fetch(base + url);
                assert.equal(asset.status, 200, url);
                assert.ok((await asset.text()).length > 0, url);
            }
        }
    });
}
