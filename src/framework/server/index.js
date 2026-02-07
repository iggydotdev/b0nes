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

// Dev-only: Inspector imports (conditionally loaded)
let serveInspector = null;
let startWatcher = null;
if (ENV.isDev) {
    const inspectorHandler = await import('./handlers/serveInspector.js');
    const watcher = await import('../dev/watcher.js');
    serveInspector = inspectorHandler.serveInspector;
    startWatcher = watcher.startWatcher;
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

let activeServer = null;

function tryListen(port, host) {
    return new Promise((resolve, reject) => {
        const s = http.createServer(router.handle);
        s.once('error', (err) => {
            s.close();
            reject(err);
        });
        s.listen(port, host, () => resolve(s));
    });
}

const FALLBACK_PORTS = [3000, 3001, 4000, 5000, 5001, 8080, 0];

export async function startServer(port, host = '0.0.0.0') {
    // Build ordered list: requested port first, then fallbacks
    const portsToTry = port != null
        ? [Number(port), ...FALLBACK_PORTS.filter(p => p !== Number(port))]
        : FALLBACK_PORTS;

    let server;
    for (const p of portsToTry) {
        try {
            console.log(`[v0] Trying port ${p}...`);
            server = await tryListen(p, host);
            break;
        } catch (err) {
            if (err.code === 'EADDRINUSE') {
                console.warn(`   Port ${p} in use, skipping...`);
                continue;
            }
            throw err;
        }
    }

    if (!server) {
        throw new Error('Could not bind to any port.');
    }

    activeServer = server;
    const actualPort = server.address().port;

    console.log(`\n   b0nes development server running\n`);
    console.log(`   Local:   http://localhost:${actualPort}`);
    console.log(`   Network: http://${host}:${actualPort}\n`);
    console.log('   Press Ctrl+C to stop\n');

    if (ENV.isDev && startWatcher) {
        startWatcher();
        console.log(`   Inspector: http://localhost:${actualPort}/_inspector\n`);
    }

    return server;
}

// Graceful shutdown
function shutdown() {
    if (activeServer) {
        activeServer.close(() => process.exit(0));
    }
    setTimeout(() => process.exit(1), 1000);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Auto-start
if (import.meta.url === `file://${process.argv[1]}`) {
    const PORT = process.env.PORT || undefined;
    const HOST = process.env.HOST || '0.0.0.0';
    console.log(`[v0] process.env.PORT=${process.env.PORT}, using PORT=${PORT}`);
    startServer(PORT, HOST).catch((err) => {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    });
}

export default startServer;
