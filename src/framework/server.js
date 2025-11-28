import http from 'node:http';
import path from 'node:path';

import { fileURLToPath } from 'node:url';
;
import { PRINT_CURRENT_CONFIG, ENV  } from './utils/server/getServerConfig.js';

import { serveB0nes } from './utils/server/serveB0nes.js';
import { serveClientFiles } from './utils/server/serveClientFiles.js';
import { serveStaticFiles } from './utils/server/staticFiles.js';
import { serveTemplates } from './utils/server/serveTemplates.js';
import { servePages } from './utils/server/servePages.js';
import { serveRuntimeFiles } from './utils/server/serveRuntimeFiles.js';

import { createRouterWithDefaults } from './router.js';  // Our new functional router—enter the hero!

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Base paths: Unchanged, because why fix what ain't broke?

PRINT_CURRENT_CONFIG();

// Create the router—logging middleware included, no extra charge.
const router = createRouterWithDefaults();

// Register static routes—priority order: specific first, wildcards last.

// 1. b0nes.js runtime
router.get(/assets\/js\/b0nes.js$/, async (req,res)=> {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http${ENV.isDev ? '' : 's'}://${host}`);
    return serveB0nes(req,res,url)
});


// 2. Client/utils files (e.g., /client/*.js or /utils/*.js)
router.get(/^\/(client|utils)\/.*\.js$/, async (req, res) => {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http${ENV.isDev ? '' : 's'}://${host}`);
    return serveRuntimeFiles(req, res, url);
});

// 3. Component client behaviors (e.g., /atoms/button/client.js)
router.get(/client\.js$/, async (req, res) => {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http${ENV.isDev ? '' : 's'}://${host}`);
    return  serveClientFiles(req, res, url);
});

// 4. Static assets (styles, images, assets, or // 4. Static assets: This is a consolidated route for all static assets,
// combining directory and file-extension matching into a single handler.
router.get(/^\/(styles|images|assets)\/|.*\.(css|jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|js)$/i, async (req, res) => {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http${ENV.isDev ? '' : 's'}://${host}`);
    console.log('[Server] Static asset request:', url.pathname);
    return serveStaticFiles(req, res, url);
});

// 5. Templates? (This seems unused or duplicate—kept as-is, but check if needed)
router.get(/^\/templates\/.*\.js$/, async (req, res) => {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http${ENV.isDev ? '' : 's'}://${host}`);
    return serveTemplates(req, res,url);
});

// 6. Dynamic page routes from autoRoutes.js
router.get(/.*/, async (req, res) => {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http${ENV.isDev ? '' : 's'}://${host}`);
    return servePages(req, res, url);
});

// Debug: Print all routes for that warm fuzzy feeling.
router.printRoutes();

// The server: Now powered by router.handle—simple as pie.
const server = http.createServer(router.handle);

/**
 * Start the development server
 * @param {number} port - Port to listen on (default: 5000)
 * @param {string} host - Host to bind to (default: '0.0.0.0')
 * @returns {http.Server} Server instance
 */
export function startServer(port = 5000, host = '0.0.0.0') {
    server.listen(port, host, () => {
        console.log(`\n🦴 b0nes development server running\n`);
        console.log(`   Local:   http://localhost:${port}`);
        console.log(`   Network: http://${host}:${port}\n`);
        console.log('   Press Ctrl+C to stop\n');
    });
    
    return server;
}

// Auto-start server when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0';
    startServer(PORT, HOST);
}

export default startServer;