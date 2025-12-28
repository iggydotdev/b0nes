// src/framework/server.js
import http from 'node:http';
import { createRouterWithDefaults } from './router/index.js';
import { PRINT_CURRENT_CONFIG, ENV } from './utils/server/getServerConfig.js';

// Import handlers
import { serveB0nes } from './utils/server/serveB0nes.js';
import { serveClientFiles } from './utils/server/serveClientFiles.js';
import { serveStaticFiles } from './utils/server/staticFiles.js';
import { serveTemplates } from './utils/server/serveTemplates.js';
import { servePages } from './utils/server/servePages.js';
import { serveRuntimeFiles } from './utils/server/serveRuntimeFiles.js';

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
router.addPattern('/components/:type/:name/client.js', serveClientFiles);
router.addPattern('/:type/:name/client.js', serveClientFiles);

// 5. CATCH-ALL (pages from auto-discovery)
router.addCatchAll(servePages);

// Debug: Print route table
router.printRoutes();

// ============================================
// CREATE SERVER
// ============================================

const server = http.createServer(router.handle);

export function startServer(port = 5000, host = '0.0.0.0') {
    server.listen(port, host, () => {
        console.log(`\n🦴 b0nes development server running\n`);
        console.log(`   Local:   http://localhost:${port}`);
        console.log(`   Network: http://${host}:${port}\n`);
        console.log('   Press Ctrl+C to stop\n');
    });
    
    return server;
}

// Auto-start
if (import.meta.url === `file://${process.argv[1]}`) {
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0';
    startServer(PORT, HOST);
}

export default startServer;