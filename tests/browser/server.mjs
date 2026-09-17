// Zero-dependency browser regression fixture. Run: node tests/browser/server.mjs
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compose } from '../../src/framework/core/compose.js';
import { renderPage } from '../../src/framework/core/render.js';
import { createPageBundle } from '../../src/framework/build/pipeline/bundle.js';
import { copyComponentBehaviors } from '../../src/framework/build/pipeline/copyComponentBehaviors.js';
import { copyFrameworkRuntime } from '../../src/framework/build/pipeline/copyFrameworkRuntime.js';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'b0nes-browser-'));
const tab = { type: 'molecule', name: 'tabs', props: { tabs: [
    { label: 'First', content: 'First panel' }, { label: 'Second', content: 'Second panel' }
] } };
// Identical trees exercise cached HTML and ID allocation across instances.
const content = `<h1>Browser regression fixture</h1><pre id="results">Running…</pre>
<button id="opener" data-modal-open="test-dialog">Open dialog</button>
<button id="outside">Outside focus target</button>` + compose([tab, tab,
    { type: 'molecule', name: 'modal', props: { id: 'test-dialog', title: 'Test dialog',
        slot: [{type:'atom', name:'input', props:{type:'text', attrs:{'aria-label':'Name'}}},
            {type:'atom', name:'button', props:{slot:'Last action',attrs:{id:'last'}}}] } },
    { type: 'molecule', name: 'modal', props: { id: 'empty-dialog', title: 'Empty dialog', slot: 'No controls' } }
]);
const html = renderPage(content, { interactive: false, title: 'b0nes browser tests',
    scripts: ['/tests/browser/checks.js'] });
const bundle = await createPageBundle('browser', new Set(['organism:multi-step-form', 'molecule:tabs']), output);
await copyFrameworkRuntime(output);
await copyComponentBehaviors(output);
fs.writeFileSync(path.join(output, 'index.html'), renderPage(compose([
    {type:'organism',name:'multi-step-form',props:{}}, tab
]), { title:'Production module test', bundlePath: bundle }));

const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/assets/js/behaviors/atoms/pending/client.js') {
        setTimeout(() => {
            res.setHeader('content-type','text/javascript');
            res.end('export const client = el => { el.dataset.calls = String(Number(el.dataset.calls || 0) + 1); };');
        }, 40);
        return;
    }
    if (pathname === '/results' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; if (body.length > 65536) req.destroy(); });
        req.on('end', () => {
            try { process.send?.({type:'results', ...JSON.parse(body)}); res.end('ok'); }
            catch { res.writeHead(400); res.end(); }
        });
        return;
    }
    if (pathname === '/') { res.setHeader('content-type', 'text/html'); res.end(html); return; }
    if (pathname === '/no-js') {
        res.setHeader('content-type', 'text/html');
        res.end(renderPage(content, { interactive:false, title:'Unenhanced tabs' })); return;
    }
    const base = pathname.startsWith('/assets/') || pathname === '/production' ? output : root;
    if (base === root && !pathname.startsWith('/src/') && !pathname.startsWith('/tests/browser/')) {
        res.writeHead(404); res.end(); return;
    }
    const file = path.resolve(base, '.' + (pathname === '/production' ? '/index.html' : pathname));
    if (!file.startsWith(base + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404); res.end(); return;
    }
    res.setHeader('content-type', file.endsWith('.html') ? 'text/html' : 'text/javascript');
    res.end(fs.readFileSync(file));
});
server.listen(Number(process.env.PORT ?? 5068), '127.0.0.1', () => {
    const url = `http://127.0.0.1:${server.address().port}`;
    console.log(`Browser checks: ${url}`);
    process.send?.({type:'ready',url});
});
const close = () => server.close(() => { fs.rmSync(output, {recursive:true,force:true}); process.exit(0); });
process.on('SIGINT', close);
process.on('SIGTERM', close);
