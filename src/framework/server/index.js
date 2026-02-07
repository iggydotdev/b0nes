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

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function startServer(port = 5000, host = '0.0.0.0') {
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 1000; // 1 second between retries

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const server = await new Promise((resolve, reject) => {
                const s = http.createServer(router.handle);
                s.once('error', (err) => {
                    s.close();
                    reject(err);
                });
                s.listen(port, host, () => resolve(s));
            });

            activeServer = server;
            console.log(`\n   b0nes development server running\n`);
            console.log(`   Local:   http://localhost:${port}`);
            console.log(`   Network: http://${host}:${port}\n`);
            console.log('   Press Ctrl+C to stop\n');

            if (ENV.isDev && startWatcher) {
                startWatcher();
                console.log(`   Inspector: http://localhost:${port}/_inspector\n`);
            }

            return server;
        } catch (err) {
            if (err.code === 'EADDRINUSE') {
                console.warn(`   Port ${port} in use, retrying in ${RETRY_DELAY}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await wait(RETRY_DELAY);
            } else {
                throw err;
            }
        }
    }

    throw new Error(`Port ${port} still in use after ${MAX_RETRIES} attempts.`);
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
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0';
    startServer(PORT, HOST).catch((err) => {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    });
}

export default startServer;
