/**
 * b0nes Inspector HTTP Handler
 * 
 * Serves the inspector UI and provides a REST API for component
 * introspection, rendering, and live hot-reload via SSE.
 * 
 * Routes (all under /_inspector prefix):
 *   GET  /                     -> Inspector UI page
 *   GET  /api/components       -> Component registry JSON
 *   POST /api/render           -> Render a component config to HTML
 *   GET  /api/showcase/:cat/:name -> Rendered showcase for a component
 *   GET  /events               -> SSE stream for file change notifications
 *   GET  /api/status           -> Watcher and registry status
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import { getRegistry, flattenRegistry, getCacheTimestamp } from '../../dev/introspect.js';
import { addSSEClient, getWatcherStatus } from '../../dev/watcher.js';
import { compose } from '../../core/compose.js';
import { getInspectorPageHTML } from '../../dev/inspector-ui.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPONENTS_ROOT = path.resolve(__dirname, '../../../components');

/**
 * Read the full request body as a string
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<string>}
 */
function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        req.on('error', reject);
    });
}

/**
 * Send a JSON response
 * @param {import('node:http').ServerResponse} res
 * @param {number} status
 * @param {*} data
 */
function sendJSON(res, status, data) {
    const body = JSON.stringify(data, null, 2);
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Length': Buffer.byteLength(body)
    });
    res.end(body);
}

/**
 * Send an HTML response
 * @param {import('node:http').ServerResponse} res
 * @param {number} status
 * @param {string} html
 */
function sendHTML(res, status, html) {
    res.writeHead(status, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Content-Length': Buffer.byteLength(html)
    });
    res.end(html);
}

/**
 * Main inspector request handler
 * 
 * Called by the router for all /_inspector/* paths.
 * The router strips the /_inspector prefix before calling,
 * so we route based on the remaining path.
 * 
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {URL} url
 */
export async function serveInspector(req, res, url) {
    // Extract the sub-path after /_inspector
    const fullPath = url.pathname;
    const subPath = fullPath.replace(/^\/_inspector/, '') || '/';
    
    try {
        // Route: GET / -> Inspector UI
        if (subPath === '/' && req.method === 'GET') {
            return handleUIPage(req, res);
        }
        
        // Route: GET /api/components -> Registry JSON
        if (subPath === '/api/components' && req.method === 'GET') {
            return handleGetComponents(req, res);
        }
        
        // Route: POST /api/render -> Render component
        if (subPath === '/api/render' && req.method === 'POST') {
            return handleRender(req, res);
        }
        
        // Route: GET /api/showcase/:category/:name -> Showcase HTML
        if (subPath.startsWith('/api/showcase/') && req.method === 'GET') {
            return handleShowcase(req, res, subPath);
        }
        
        // Route: GET /events -> SSE stream
        if (subPath === '/events' && req.method === 'GET') {
            return handleSSE(req, res);
        }
        
        // Route: GET /api/status -> Status info
        if (subPath === '/api/status' && req.method === 'GET') {
            return handleStatus(req, res);
        }
        
        // 404 for unknown inspector routes
        sendJSON(res, 404, { error: 'Inspector route not found', path: subPath });
        
    } catch (err) {
        console.error('[inspector] Error handling request:', err);
        sendJSON(res, 500, { error: 'Internal inspector error', message: err.message });
    }
}

/**
 * GET / -> Serve the inspector UI page
 */
function handleUIPage(req, res) {
    const html = getInspectorPageHTML();
    sendHTML(res, 200, html);
}

/**
 * GET /api/components -> Return full component registry
 */
function handleGetComponents(req, res) {
    const registry = getRegistry();
    const flat = flattenRegistry(registry);
    
    sendJSON(res, 200, {
        registry,
        components: flat,
        total: flat.length,
        cacheTimestamp: getCacheTimestamp()
    });
}

/**
 * POST /api/render -> Render a component configuration to HTML
 * 
 * Request body: { type: 'atom', name: 'button', props: { slot: 'Click me' } }
 * Response: { html: '<button ...>Click me</button>' }
 */
async function handleRender(req, res) {
    let body;
    try {
        const raw = await readBody(req);
        body = JSON.parse(raw);
    } catch (err) {
        return sendJSON(res, 400, { error: 'Invalid JSON body', message: err.message });
    }
    
    const { type, name, props } = body;
    
    if (!type || !name) {
        return sendJSON(res, 400, { error: 'Missing required fields: type, name' });
    }
    
    // Validate type
    const validTypes = ['atom', 'molecule', 'organism'];
    if (!validTypes.includes(type)) {
        return sendJSON(res, 400, { 
            error: `Invalid type "${type}". Must be one of: ${validTypes.join(', ')}` 
        });
    }
    
    try {
        const html = compose([{ type, name, props: props || {} }]);
        sendJSON(res, 200, { html, type, name, props: props || {} });
    } catch (err) {
        sendJSON(res, 422, { 
            error: 'Render failed', 
            message: err.message,
            type, 
            name 
        });
    }
}

/**
 * GET /api/showcase/:category/:name -> Render a component's .show.js
 * 
 * Dynamically imports the showcase file with cache-busting for hot reload.
 */
async function handleShowcase(req, res, subPath) {
    // Parse: /api/showcase/atoms/button -> category=atoms, name=button
    const parts = subPath.replace('/api/showcase/', '').split('/');
    
    if (parts.length < 2) {
        return sendJSON(res, 400, { error: 'Expected /api/showcase/:category/:name' });
    }
    
    const [category, name] = parts;
    
    // Resolve showcase file path
    const showFile = path.join(COMPONENTS_ROOT, category, name, `${name}.show.js`);
    
    try {
        // Cache-busting import for hot reload
        const showUrl = pathToFileURL(showFile).href + `?t=${Date.now()}`;
        const showModule = await import(showUrl);
        const showFn = showModule.show || showModule.default;
        
        if (typeof showFn !== 'function') {
            return sendJSON(res, 422, { 
                error: `Showcase file found but no "show" or "default" export in ${name}.show.js` 
            });
        }
        
        let html;
        // show() might be async
        const result = showFn();
        html = result instanceof Promise ? await result : result;
        
        sendJSON(res, 200, { html, category, name });
        
    } catch (err) {
        if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'ENOENT') {
            return sendJSON(res, 404, { error: `No showcase file found for ${category}/${name}` });
        }
        sendJSON(res, 500, { 
            error: 'Showcase render failed', 
            message: err.message,
            category,
            name 
        });
    }
}

/**
 * GET /events -> Server-Sent Events stream
 */
function handleSSE(req, res) {
    addSSEClient(res);
    // Response stays open -- watcher.js manages the connection
}

/**
 * GET /api/status -> Inspector and watcher status
 */
function handleStatus(req, res) {
    const watcherStatus = getWatcherStatus();
    const registry = getRegistry();
    const flat = flattenRegistry(registry);
    
    sendJSON(res, 200, {
        inspector: 'active',
        watcher: watcherStatus,
        registry: {
            total: flat.length,
            atoms: Object.keys(registry.atoms).length,
            molecules: Object.keys(registry.molecules).length,
            organisms: Object.keys(registry.organisms).length,
            cacheTimestamp: getCacheTimestamp()
        }
    });
}
