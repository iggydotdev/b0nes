import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fork, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));

async function serverFixture(t, mode = 'production') {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-static-safety-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    fs.cpSync(path.join(root, 'src'), path.join(dir, 'src'), {
        recursive: true, filter: file => !file.endsWith('.test.js')
    });
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ type: 'module' }));
    const pages = path.join(dir, 'src/pages');
    fs.mkdirSync(path.join(pages, 'private'), { recursive: true });
    fs.mkdirSync(path.join(pages, 'server-data'), { recursive: true });
    fs.writeFileSync(path.join(pages, 'private/index.js'), `
        const serverOnly = 'SERVER_SOURCE_SENTINEL';
        export const components = [{ type: 'atom', name: 'text', props: { is: 'p', slot: 'Rendered page' } }];
    `);
    fs.writeFileSync(path.join(pages, 'private/:id.js'), `
        const serverOnly = 'SERVER_SOURCE_SENTINEL';
        export const components = [];
        export const getStaticPaths = () => [{ id: 'example' }];
    `);
    fs.writeFileSync(path.join(pages, 'private/script.js'), 'window.publicScript = true;');
    fs.writeFileSync(path.join(pages, 'private/style.css'), 'body { color: teal; }');
    fs.writeFileSync(path.join(pages, 'private/data.json'), '{"public":true}');
    fs.writeFileSync(path.join(pages, 'server-data/config.js'), "export const key = 'SERVER_SOURCE_SENTINEL';");
    const built = spawnSync(process.execPath, ['src/framework/build/cli.js', 'build', '--clean'], {
        cwd: dir, encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production', npm_lifecycle_event: '' }
    });
    assert.equal(built.status, 0, built.stderr + built.stdout);
    fs.symlinkSync(path.join(pages, 'private/index.js'), path.join(dir, 'public/leaked.js'));
    fs.symlinkSync(path.join(pages, 'private/index.js'), path.join(dir, 'public/assets/js/client/leaked'));
    fs.writeFileSync(path.join(dir, 'public/.env.js'), 'SERVER_SOURCE_SENTINEL');
    fs.symlinkSync(path.join(dir, 'public/.env.js'), path.join(dir, 'public/aliased-secret.js'));
    fs.symlinkSync(path.join(pages, 'private/index.js'), path.join(dir, 'public/assets/js/client/leaked.js'));
    fs.writeFileSync(path.join(dir, 'serve.mjs'), `
        import { startServer } from './src/framework/server/index.js';
        const server = startServer(0, '127.0.0.1');
        server.on('listening', () => process.send({ port: server.address().port }));
    `);
    const child = fork(path.join(dir, 'serve.mjs'), [], {
        cwd: dir, silent: true, env: { ...process.env, NODE_ENV: mode, npm_lifecycle_event: '' }
    });
    let output = '';
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    t.after(async () => {
        if (child.exitCode === null) {
            const exited = once(child, 'exit');
            child.kill('SIGTERM');
            await exited;
        }
    });
    const [message] = await Promise.race([
        once(child, 'message'),
        once(child, 'exit').then(([code]) => { throw new Error(`Server exited with ${code}: ${output}`); })
    ]);
    return { url: `http://127.0.0.1:${message.port}`, dir };
}

test('production serves built assets and SSR pages without exposing source or symlink targets', { timeout: 30000 }, async t => {
    const { url, dir } = await serverFixture(t);
    for (const pathname of [
        '/private/index.js', '/private/:id.js', '/private/%3Aid.js', '/pages/private/index.js', '/assets/private/index.js',
        '/assets/js/pages/private/index.js', '/server-data/config.js',
        '/leaked.js', '/aliased-secret.js', '/assets/js/client/leaked.js', '/client/leaked.js', '/client/leaked',
        '/assets/../src/pages/private/index.js'
    ]) {
        const response = await fetch(url + pathname, { headers: { referer: url + '/private' } });
        assert.equal(response.status, 404, pathname);
        assert.ok(!(await response.text()).includes('SERVER_SOURCE_SENTINEL'), pathname);
    }
    for (const [pathname, contentType, expected] of [
        ['/private', 'text/html', 'Rendered page'],
        ['/private/script.js', 'application/javascript', 'window.publicScript'],
        ['/private/style.css', 'text/css', 'color: teal'],
        ['/private/data.json', 'application/json', '"public":true'],
        ['/assets/js/client/b0nes.js', 'application/javascript', 'window.b0nes'],
        ['/assets/js/client/fsm.js', 'application/javascript', 'createFSM'],
        ['/assets/js/behaviors/molecules/tabs/client.js', 'application/javascript', 'export'],
        ['/assets/js/shared/html.js', 'application/javascript', 'export'],
        ['/assets/components/utils/html.js', 'application/javascript', 'TrustedHTML'],
        ['/client/compose.js', 'application/javascript', 'compose'],
        ['/utils/urlPattern.js', 'application/javascript', 'URLPattern'],
        ['/assets/js/b0nes.js', 'application/javascript', 'window.b0nes'],
        ['/client/b0nes.js', 'application/javascript', 'window.b0nes']
    ]) {
        const response = await fetch(url + pathname);
        assert.equal(response.status, 200, pathname);
        assert.match(response.headers.get('content-type'), new RegExp(contentType), pathname);
        const content = await response.text();
        assert.ok(content.includes(expected), pathname);
        assert.ok(!content.includes('SERVER_SOURCE_SENTINEL'), pathname);
    }
    const runtime = path.join(dir, 'public/assets/js/client/b0nes.js');
    fs.unlinkSync(runtime);
    fs.symlinkSync(path.join(dir, 'src/pages/private/index.js'), runtime);
    for (const pathname of ['/client/b0nes.js', '/assets/js/b0nes.js', '/assets/js/client/b0nes.js']) {
        const response = await fetch(url + pathname);
        assert.equal(response.status, 404, pathname);
        assert.ok(!(await response.text()).includes('SERVER_SOURCE_SENTINEL'));
    }
});

test('development serves co-located assets and native modules while page entries stay private', { timeout: 30000 }, async t => {
    const { url, dir } = await serverFixture(t, 'development');
    fs.writeFileSync(path.join(dir, 'src/pages/private/script.js'), 'window.developmentScript = true;');
    fs.mkdirSync(path.join(dir, 'src/pages/client'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src/pages/client/b0nes.js'), 'window.shadowedRuntime = true;');
    fs.writeFileSync(path.join(dir, 'src/pages/private/[slug].js'), 'export const components = [];');
    for (const pathname of ['/private/index.js', '/pages/private/index.js', '/private/%5Bslug%5D.js', '/leaked.js']) {
        const response = await fetch(url + pathname, { headers: { referer: url + '/private' } });
        assert.equal(response.status, 404, pathname);
        assert.ok(!(await response.text()).includes('SERVER_SOURCE_SENTINEL'));
    }
    for (const [pathname, expected] of [
        ['/private/script.js', 'window.developmentScript'],
        ['/private/style.css', 'color: teal'],
        ['/private/data.json', '"public":true'],
        ['/assets/js/client/fsm.js', 'createFSM'],
        ['/client/b0nes.js', 'window.b0nes'],
        ['/assets/js/b0nes.js', 'window.b0nes'],
        ['/assets/js/behaviors/molecules/tabs/client.js', 'export'],
        ['/utils/html.js', 'export'],
        ['/components/utils/html.js', 'TrustedHTML'],
        ['/assets/js/shared/html.js', 'export'],
        ['/assets/components/utils/html.js', 'TrustedHTML']
    ]) {
        const response = await fetch(url + pathname);
        assert.equal(response.status, 200, pathname);
        assert.match(response.headers.get('cache-control'), /no-store/, pathname);
        assert.ok((await response.text()).includes(expected), pathname);
    }
    const response = await fetch(url + '/style.css', { headers: { referer: url + '/private' } });
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes('color: teal'));
});
