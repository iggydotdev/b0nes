// src/framework/server.js
import http from 'node:http';
import { createRouterWithDefaults } from '../core/router/index.js';
import { PRINT_CURRENT_CONFIG, ENV } from './handlers/getServerConfig.js';

// Import handlers
import { serveB0nes } from './handlers/serveB0nes.js';
import { serveBehaviorFiles } from './handlers/serveBehaviorFiles.js';
import { serveStaticFiles } from './handlers/staticFiles.js';
import { serveTemplates } from './handlers/serveTemplates.js';
import { servePages } from './handlers/servePages.js';
import { serveRuntimeFiles } from './handlers/serveRuntimeFiles.js';

// Dev-only: Inspector + HMR imports (conditionally loaded)
let serveInspector = null;
let startWatcher = null;
let addSSEClient = null;
let stopWatcher = null;
if (ENV.isDev) {
    const inspectorHandler = await import('./handlers/serveInspector.js');
    const watcher = await import('../dev/watcher.js');
    serveInspector = inspectorHandler.serveInspector;
    startWatcher = watcher.startWatcher;
    addSSEClient = watcher.addSSEClient;
    stopWatcher = watcher.stopWatcher;
}

PRINT_CURRENT_CONFIG();

// Create router
const router = createRouterWithDefaults();

// ============================================
// ROUTE REGISTRATION - Clear & Organized
// ============================================

// 1. EXACT MATCHES (highest priority - specific files)
router.addExact('/client/b0nes.js', serveB0nes);
router.addExact('/assets/js/b0nes.js', serveB0nes);

// 2. EXTENSION MATCHES (fast lookup by file type)
const staticExtensions = [
    '.css', '.js', '.json',
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico',
    '.woff', '.woff2', '.ttf', '.eot'
];
router.addExtension(staticExtensions, serveStaticFiles);

// 2b. DEV-ONLY: Inspector routes (before prefix/extension catches them)
if (ENV.isDev && serveInspector) {
    router.addExact('/_inspector', serveInspector);
    router.addPrefix('/_inspector/', serveInspector);
}

// 2c. DEV-ONLY: HMR SSE endpoint
if (ENV.isDev && addSSEClient) {
    router.addExact('/_hmr/events', (req, res) => {
        addSSEClient(res);
    });
}

// 3. PREFIX MATCHES (directory-based routing)
router.addPrefix('/assets/', serveStaticFiles);
router.addPrefix('/styles/', serveStaticFiles);
router.addPrefix('/images/', serveStaticFiles);
router.addPrefix('/client/', serveRuntimeFiles);
router.addPrefix('/utils/', serveRuntimeFiles);
router.addPrefix('/templates/', serveTemplates);

// 4. PATTERN MATCHES (dynamic routes)
// Component behaviors (e.g., /atoms/button/atom.button.client.js)
router.addPattern('/components/:type/:name/client.js', serveBehaviorFiles);
router.addPattern('/:type/:name/client.js', serveBehaviorFiles);

// 5. CATCH-ALL (pages from auto-discovery)
router.addCatchAll(servePages);

// Debug: Print route table
router.printRoutes();

// ============================================
// CREATE SERVER
// ============================================

const server = http.createServer(router.handle);

export function startServer(port = 3000, host = '0.0.0.0') {
    server.listen(port, host, () => {
        console.log(`\n   b0nes development server running\n`);
        console.log(`   Local:   http://localhost:${port}`);
        console.log(`   Network: http://${host}:${port}\n`);
        console.log('   Press Ctrl+C to stop\n');

        if (ENV.isDev && startWatcher) {
            startWatcher();
            console.log(`   Inspector: http://localhost:${port}/_inspector\n`);
        }
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use.`);
        } else {
            console.error('Server error:', err);
        }
        process.exit(1);
    });

    return server;
}

// Replace the two process.on() lines at the bottom with:
function shutdown() {
    console.log('\n[b0nes] Shutting down...');

    // Close SSE clients + clear the heartbeat interval FIRST — otherwise
    // watcher.js's setInterval keeps the event loop alive on its own.
    if (ENV.isDev && stopWatcher) {
        stopWatcher();
    }

    // server.close() alone waits forever for long-lived connections
    // (the SSE streams are *designed* to never close). Force them shut.
    server.closeAllConnections();
    server.close(() => process.exit(0));

    // Safety net — if anything still refuses to die, don't hang the terminal.
    setTimeout(() => {
        console.warn('[b0nes] Forced shutdown after timeout');
        process.exit(1);
    }, 3000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Auto-start
if (import.meta.url === `file://${process.argv[1]}`) {
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0';
    startServer(PORT, HOST);
}

export default startServer;
