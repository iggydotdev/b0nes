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
    const maxRetries = 10;
    let attempt = 0;

    function tryListen(currentPort) {
        attempt++;
        server.listen(currentPort, host, () => {
            console.log(`\n🦴 b0nes development server running\n`);
            console.log(`   Local:   http://localhost:${currentPort}`);
            console.log(`   Network: http://${host}:${currentPort}\n`);
            console.log('   Press Ctrl+C to stop\n');
        });

        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE' && attempt < maxRetries) {
                const nextPort = currentPort + 1;
                console.warn(`   Port ${currentPort} in use, trying ${nextPort}...`);
                server.removeAllListeners('error');
                tryListen(nextPort);
            } else {
                console.error(`Failed to start server: ${err.message}`);
                process.exit(1);
            }
        });
    }

    tryListen(Number(port));
    return server;
}

// Auto-start
if (import.meta.url === `file://${process.argv[1]}`) {
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0';
    startServer(PORT, HOST);
}

export default startServer;
