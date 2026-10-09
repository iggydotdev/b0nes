// Zero-dependency browser regression fixture. Run: node tests/browser/server.mjs
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compose } from '../../src/framework/core/compose.js';
import { renderPage } from '../../src/framework/core/render.js';
import { escapeHtml } from '../../src/components/utils/escapeHtml.js';
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
    {type:'organism',name:'multi-step-form',props:{action:'/form-submit',method:'post'}},
    {type:'organism',name:'multi-step-form',props:{action:'/form-submit',method:'post'}}, tab
]), { title:'Production module test', bundlePath: bundle }));

const spaBundle = await createPageBundle('spa-browser', new Set(['organism:spa']), output);
const spaConfig = `
const { createStore } = await import('/assets/js/client/store.js');
const store = createStore({ state: { items: ['first'], count: 0, text:'<img src=x> & bound', checked:true, title:'Bound title', className:'bound-class', unsafeURL:'javascript:window.spaBindingExecuted=true', unsafeSource:'data:text/html,unsafe', markup:'<img src=x onerror=parent.spaBindingExecuted=true>' }, actions: {
    add: state => ({ items: [...state.items, 'next'], count: state.count + 1 }),
    patch: (_, changes) => changes
} });
window.spaConfig = { store, routes: [
    { name: 'home', url: '/spa', template: '<h2 id="spa-heading">Home</h2><a id="spa-item" href="/spa/second" data-fsm-event="GOTO_ITEM" data-param-id="second">Item</a>' },
    { name: 'item', url: '/spa/:id', template: context => '<h2 id="spa-heading">Item ' + context.id + '</h2><ul>' + store.get('items').map(value => '<li>' + value + '</li>').join('') + '</ul><button id="spa-add" data-action="add">Add</button><a id="spa-home" href="/spa" data-fsm-event="GOTO_HOME">Home</a>' },
    { name: 'components', url: '/spa-components', template: [{ type: 'atom', name: 'text', props: { is: 'p', slot: '<img src=x> & user text' } }] },
    { name:'bindings', url:'/spa-bindings', template:'<div id=spa-bound-text data-b0nes-bind=text></div><input id=spa-bound-value data-b0nes-bind=text:value><input id=spa-bound-checked type=checkbox data-b0nes-bind=checked:checked><div id=spa-bound-title data-b0nes-bind=title:title></div><div id=spa-bound-class data-b0nes-bind=className:className></div><a id=spa-bound-url href=/safe data-b0nes-bind=unsafeURL:href>Safe link</a><img id=spa-bound-src src=/safe-image.png data-b0nes-bind=unsafeSource:src><iframe id=spa-bound-frame srcdoc="Safe" data-b0nes-bind=markup:srcdoc></iframe><div id=spa-bound-html data-b0nes-bind=markup:innerHTML>Safe text</div>' },
    { name: 'widgets', url: '/spa-widgets', template: [{ type:'molecule', name:'tabs', props:{ tabs:[{label:'One',content:'One panel'},{label:'Two',content:'Two panel'}] } }] },
    { name: 'slow', url: '/spa-slow', template: () => new Promise(resolve => { window.resolveSpaSlow = resolve; }) }
], onInit: ({ fsm }) => { window.spaTest = { fsm, store }; } };
`;
const spaHTML = renderPage(compose([{ type:'organism', name:'spa', props:{ slot:'Readable SPA fallback' } }]), {
    title:'SPA regression fixture', bundlePath:spaBundle, inlineScripts:[spaConfig]
});

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
    if (pathname === '/form-submit' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; if (body.length > 65536) req.destroy(); });
        req.on('end', () => {
            res.setHeader('content-type', 'text/html');
            res.end(`<h1>Submitted</h1><pre id="submitted-form">${escapeHtml(body)}</pre>`);
        });
        return;
    }
    if (pathname === '/form-no-js') {
        res.setHeader('content-type', 'text/html');
        res.end(renderPage(compose([{ type:'organism', name:'multi-step-form',
            props:{ action:'/form-submit', method:'post' } }]), { interactive:false, title:'Native form fallback' }));
        return;
    }
    if (pathname === '/') { res.setHeader('content-type', 'text/html'); res.end(html); return; }
    if (pathname.startsWith('/spa')) { res.setHeader('content-type', 'text/html'); res.end(spaHTML); return; }
    if (pathname === '/no-js') {
        res.setHeader('content-type', 'text/html');
        res.end(renderPage(content, { interactive:false, title:'Unenhanced tabs' })); return;
    }
    const sourceAliases = { '/client/':'src/framework/client/', '/shared/':'src/framework/shared/', '/components/':'src/components/' };
    const sourceMount = Object.keys(sourceAliases).find(prefix => pathname.startsWith(prefix));
    const sourcePath = sourceMount ? '/' + sourceAliases[sourceMount] + pathname.slice(sourceMount.length) : pathname;
    const base = pathname.startsWith('/assets/') || pathname === '/production' ? output : root;
    if (base === root && !sourcePath.startsWith('/src/') && !sourcePath.startsWith('/tests/browser/')) {
        res.writeHead(404); res.end(); return;
    }
    const file = path.resolve(base, '.' + (pathname === '/production' ? '/index.html' : sourcePath));
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
