// Exercises the public npm artifact, upgrade CLI, production build/server and
// Chromium together. Requires an installed Chromium, but no npm dependencies.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fork, spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repository = fileURLToPath(new URL('../', import.meta.url));
const browserChecks = fs.readFileSync(new URL('./upgrade-browser-checks.js', import.meta.url));

const run = (command, args, cwd) => {
    const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 60000,
        env: { ...process.env, NODE_ENV: 'production' } });
    assert.equal(result.status, 0, `${command} ${args.join(' ')}\n${result.stdout}${result.stderr}`);
    return result.stdout;
};

const deadline = (promise, message, milliseconds = 45000) => {
    let timer;
    return Promise.race([promise, new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), milliseconds);
    })]).finally(() => clearTimeout(timer));
};

test('packed artifact upgrades a legacy app through production SSG, SSR and browser navigation', { timeout: 120000 }, async t => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-upgrade-integration-'));
    const project = path.join(directory, 'legacy-site');
    const output = path.join(project, 'public');
    const write = (relative, source) => {
        const filename = path.join(project, relative);
        fs.mkdirSync(path.dirname(filename), { recursive: true });
        fs.writeFileSync(filename, source);
    };
    // Register cleanup before starting any children, including failed startups.
    const children = [];
    const closedChildren = new Set();
    const track = child => {
        children.push(child);
        child.once('close', () => closedChildren.add(child));
        return child;
    };
    let proxy;
    t.after(async () => {
        if (proxy) {
            proxy.closeAllConnections();
            await new Promise(resolve => proxy.close(resolve));
        }
        await Promise.all(children.map(child => new Promise(resolve => {
            if (closedChildren.has(child)) return resolve();
            const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
            child.once('close', () => { clearTimeout(timer); resolve(); });
            child.kill('SIGTERM');
        })));
        fs.rmSync(directory, { recursive: true, force: true });
    });

    const packed = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', directory], repository))[0];
    run('tar', ['-xzf', path.join(directory, packed.filename)], directory);
    const artifact = path.join(directory, 'package');
    const cli = path.join(artifact, 'bin/b0nes.js');
    run(process.execPath, [cli, 'create', 'legacy-site', '--skip-git'], directory);
    const pkg = JSON.parse(fs.readFileSync(path.join(artifact, 'package.json')));
    assert.equal(Object.keys(pkg.dependencies || {}).length, 0);
    assert.equal(Object.keys(pkg.devDependencies || {}).length, 0);
    const { createInitialManifest, writeManifest, writeChecksums, buildChecksums } =
        await import(pathToFileURL(path.join(artifact, 'bin/lib/manifest.js')));
    const { COMPONENT_PATHS } = await import(pathToFileURL(path.join(artifact, 'bin/lib/paths.js')));

    // A representative 0.2.1 vendored installation: the old ownership policy
    // owns only src/framework, and shared utilities have the pre-escaping API.
    // Stock components are user-owned, just as they are in an existing app.
    write('src/framework/core/compose.js', `export const compose = configs => configs.map(item => item.props?.slot || '').join('');\n`);
    write('src/components/utils/processSlot.js', `export const processSlotTrusted = value => typeof value === 'string' ? value : '';\n`);
    write('src/components/utils/attrsToString.js', `export const attrsToString = value => value || '';\n`);
    write('src/components/utils/componentError.js', `export const validatePropTypes = (props, schema) => {
        for (const [key, type] of Object.entries(schema)) {
            if (typeof props[key] !== type) throw new TypeError('Unexpected prop type');
        }
    };\n`);
    for (const name of ['html.js', 'safeUrl.js']) fs.rmSync(path.join(project, 'src/components/utils', name));
    const legacyManifest = createInitialManifest({ frameworkVersion: '0.2.1', template: 'basic' });
    legacyManifest.policy.frameworkPaths = ['src/framework'];
    writeManifest(project, legacyManifest);
    writeChecksums(project, buildChecksums(project, ['src/framework', ...COMPONENT_PATHS]));

    // Local stock-component edits must survive a default framework upgrade.
    const customized = 'src/components/atoms/text/text.js';
    fs.appendFileSync(path.join(project, customized), '\n// Local application customization: retain this file.\n');
    write('public/styles/user.css', 'body { --user-asset-preserved: 1; }\n');
    write('src/pages/catalog/[slug].js', `
export const meta = { title: 'Catalog', render: 'ssg', interactive: false, stylesheets: ['/styles/user.css'] };
export const externalData = async () => [{ slug: 'first', title: 'First & <article>' }, { slug: 'second', title: 'Second article' }];
export const components = ({ title }) => [
    { type: 'atom', name: 'text', props: { is: 'h1', slot: title } },
    { type: 'atom', name: 'image', props: { src: './cover.svg', alt: 'Article cover' } }
];\n`);
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" fill="green"/></svg>';
    write('src/pages/catalog/cover.svg', svg);
    write('src/pages/live/[id].js', `
export const meta = { title: 'Live request', render: 'ssr', interactive: false };
export const components = async ({ id }) => [
    { type: 'atom', name: 'text', props: { is: 'h1', slot: 'SSR ' + id } },
    { type: 'atom', name: 'image', props: { src: './cover.svg', alt: 'Live cover' } }
];\n`);
    write('src/pages/live/cover.svg', svg);
    write('src/pages/app/index.js', `
export const meta = { title: 'Upgraded application', scripts: ['./config.js'], stylesheets: ['/styles/user.css'] };
export const components = [{ type: 'organism', name: 'spa', props: { slot: 'Readable application fallback' } }];\n`);
    write('src/pages/app/templates/home.js', `
export const components = [
    { type: 'atom', name: 'text', props: { is: 'h1', slot: 'Upgraded home', attrs: { id: 'view-heading' } } },
    { type: 'atom', name: 'text', props: { is: 'a', slot: 'Open item', attrs: { id: 'open-item', href: '/app/item/first', 'data-fsm-event': 'GOTO_ITEM', 'data-param-id': 'first' } } }
];\n`);
    write('src/pages/app/config.js', `
import { components as home } from '/app/templates/home.js';
import { components as item } from '/app/templates/item.js';
import { createStore } from '/assets/js/client/store.js';
const store = createStore({ state: { count: 0 }, actions: { increment: async state => ({ count: state.count + 1 }) } });
window.spaConfig = { store, routes: [
    { name: 'home', url: '/app', template: home },
    { name: 'item', url: '/app/item/:id', template: context => item({ ...context, count: store.get('count') }) }
], onInit: ({ fsm }) => { window.upgradeTest = { fsm, store }; } };\n`);
    write('src/pages/app/template-data/count-label.js', `export const countLabel = count => 'Count ' + count;\n`);
    write('src/pages/app/templates/item.js', `
import { text } from '../../../components/atoms/text/text.js';
export const components = async ({ id, count }) => {
    const { countLabel } = await import('../template-data/count-label.js');
    return [
        text({ is: 'h1', slot: 'Item ' + id, attrs: { id: 'view-heading' } }),
        text({ is: 'p', slot: countLabel(count), attrs: { id: 'item-count' } }),
        text({ is: 'p', slot: text({ is: 'span', slot: '<img src=x> & user text' }), attrs: { id: 'escaped-slot' } }),
        { type: 'atom', name: 'button', props: { slot: 'Increment', attrs: { id: 'increment', 'data-action': 'increment' } } },
        text({ is: 'a', slot: 'Home', attrs: { id: 'return-home', href: '/app', 'data-fsm-event': 'GOTO_HOME' } })
    ];
};\n`);
    const preservedFiles = [customized, 'src/pages/catalog/[slug].js', 'src/pages/live/[id].js',
        'src/pages/app/index.js', 'src/pages/app/config.js', 'public/styles/user.css'];
    const originalChecksums = buildChecksums(project, preservedFiles);
    run(process.execPath, [cli, 'upgrade', '--yes'], project);
    assert.deepEqual(buildChecksums(project, preservedFiles), originalChecksums, 'upgrade must preserve application-owned files');
    const updatedManifest = JSON.parse(fs.readFileSync(path.join(project, '.b0nes/manifest.json')));
    assert.equal(updatedManifest.frameworkVersion, pkg.version);
    assert.ok(updatedManifest.policy.frameworkPaths.includes('src/components/utils/html.js'));
    assert.equal(Object.keys(JSON.parse(fs.readFileSync(path.join(project, 'package.json'))).dependencies || {}).length, 0);

    run(process.execPath, ['src/framework/build/cli.js', 'build', '--parallel', '--production'], project);
    assert.deepEqual(buildChecksums(project, preservedFiles), originalChecksums, 'build must preserve application-owned files and public assets');
    const staticPage = fs.readFileSync(path.join(output, 'catalog/first/index.html'), 'utf8');
    assert.match(staticPage, /First &amp; &lt;article&gt;/);
    assert.match(staticPage, /src="\/catalog\/cover.svg"/);
    assert.match(fs.readFileSync(path.join(output, 'catalog/second/index.html'), 'utf8'), /Second article/);
    assert.match(fs.readFileSync(path.join(output, 'app/templates/home.js'), 'utf8'), /export const components = "/);
    assert.match(fs.readFileSync(path.join(output, 'app/templates/item.js'), 'utf8'), /template-modules/);
    assert.match(fs.readFileSync(path.join(output, 'live/:id/index.html'), 'utf8'), /requires server-side rendering/);
    assert.equal(fs.readFileSync(path.join(output, 'live/cover.svg'), 'utf8'), svg);

    // Start the framework's actual production server for SSR. The test proxy
    // serves built HTML (including the SPA history fallback) and delegates
    // remaining requests to that server; it never mounts framework source.
    write('production-test-runner.mjs', `import { startServer } from './src/framework/server/index.js';
const server = startServer(0, '127.0.0.1');
server.once('listening', () => process.send({ port: server.address().port }));\n`);
    const production = track(fork(path.join(project, 'production-test-runner.mjs'), [], {
        cwd: project, env: { ...process.env, NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe', 'ipc']
    }));
    let serverLog = '';
    production.stdout.on('data', chunk => { serverLog = (serverLog + chunk).slice(-16000); });
    production.stderr.on('data', chunk => { serverLog = (serverLog + chunk).slice(-16000); });
    const productionPort = await deadline(new Promise((resolve, reject) => {
        production.once('message', message => resolve(message.port));
        production.once('error', reject);
        production.once('exit', code => reject(new Error(`Production server exited (${code}): ${serverLog}`)));
    }), 'Production server did not start');
    let resolveResults;
    const results = new Promise(resolve => { resolveResults = resolve; });
    proxy = http.createServer((req, res) => {
        const pathname = new URL(req.url, 'http://localhost').pathname;
        if (pathname === '/__upgrade-checks') {
            res.setHeader('content-type', 'text/html');
            res.end('<!doctype html><title>Upgrade integration</title><pre id="results">Running</pre><script type="module" src="/__upgrade-checks.js"></script>');
            return;
        }
        if (pathname === '/__upgrade-checks.js') {
            res.setHeader('content-type', 'text/javascript'); res.end(browserChecks); return;
        }
        if (pathname === '/__upgrade-results' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; if (body.length > 65536) req.destroy(); });
            req.on('end', () => {
                try { resolveResults(JSON.parse(body)); res.end('ok'); }
                catch { res.writeHead(400); res.end(); }
            });
            return;
        }
        const htmlFile = pathname === '/app' || pathname.startsWith('/app/item/')
            ? path.join(output, 'app/index.html')
            : path.resolve(output, '.' + pathname, 'index.html');
        if (htmlFile.startsWith(output + path.sep) && fs.existsSync(htmlFile) && fs.statSync(htmlFile).isFile()) {
            res.setHeader('content-type', 'text/html'); res.end(fs.readFileSync(htmlFile)); return;
        }
        const upstream = http.request({ hostname: '127.0.0.1', port: productionPort, method: req.method,
            path: req.url, headers: { ...req.headers, host: `127.0.0.1:${productionPort}` } }, response => {
            res.writeHead(response.statusCode, response.headers); response.pipe(res);
        });
        upstream.on('error', error => { res.writeHead(502); res.end(error.message); });
        req.pipe(upstream);
    });
    await new Promise(resolve => proxy.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${proxy.address().port}`;
    const request = pathname => fetch(origin + pathname, { signal: AbortSignal.timeout(10000) });
    const ssrResponse = await request('/live/request-only');
    assert.equal(ssrResponse.status, 200);
    const ssrHTML = await ssrResponse.text();
    assert.match(ssrHTML, /SSR request-only/);
    assert.match(ssrHTML, /src="\/live\/cover.svg"/);
    assert.equal((await request('/live/cover.svg')).status, 200);
    assert.equal((await request('/src/pages/live/[id].js')).status, 404, 'production must not expose page source');

    const browser = track(spawn(process.env.CHROME_BIN || 'google-chrome', [
        '--headless', '--no-sandbox', '--disable-gpu', '--no-first-run', '--enable-logging=stderr',
        `--user-data-dir=${path.join(directory, 'chrome-profile')}`, origin + '/__upgrade-checks'
    ], { stdio: ['ignore', 'ignore', 'pipe'] }));
    let browserLog = '';
    browser.stderr.on('data', chunk => { browserLog = (browserLog + chunk).slice(-16000); });
    const report = await deadline(Promise.race([results, new Promise((_, reject) => {
        browser.once('error', reject);
        browser.once('exit', code => reject(new Error(`Chromium exited before reporting checks (${code}): ${browserLog}`)));
    })]), 'Upgraded app browser checks timed out');
    assert.equal(report.success, true, report.text + '\n' + browserLog);
    console.log(report.text);
});
