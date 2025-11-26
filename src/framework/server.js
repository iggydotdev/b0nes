// // src/framework/server.js
// import http from 'node:http';
// import http2 from 'node:http2';
// import { readFile, mkdir, writeFile } from 'node:fs/promises';
// import { existsSync } from 'node:fs';
// import { fileURLToPath } from 'node:url';
// import path from 'node:path';
// import { execSync } from 'node:child_process';
// import { stat } from 'node:fs/promises'


// import { compose } from './compose.js';
// import { renderPage } from './renderPage.js';
// import { getRoutes } from './utils/server/autoRoutes.js';
// import { ENV } from './config/envs.js';

// //
// import { validateAndSanitizePath } from './utils/sanitizePaths.js';
// import { serveStaticFiles } from './utils/server/staticFiles.js';
// import { CLIENT_BASE, COMPONENTS_BASE, PAGES_BASE, CERTS_DIR } from './utils/server/getServerConfig.js';
// import { serveRuntimeFiles } from './utils/server/serveRuntimeFiles.js';
// import { serveB0nes } from './utils/server/serveB0nes.js';
// import { serveClientFiles } from './utils/server/serveClientFiles.js';
// import { serveTemplates } from './utils/server/serveTemplates.js';
// import { servePages } from './utils/server/servePages.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Add this config near the top
// const USE_HTTP2 = process.env.NODE_ENV === 'production' || process.env.FORCE_HTTP2 === 'true';


// /**
//  * Generate self-signed certificates for HTTP/2
//  * Because browsers require HTTPS for HTTP/2 (thanks, spec!)
//  */
// async function ensureCerts() {
//     const keyPath = path.join(CERTS_DIR, 'localhost-key.pem');
//     const certPath = path.join(CERTS_DIR, 'localhost.pem');
    
//     // Check if certs already exist
//     if (existsSync(keyPath) && existsSync(certPath)) {
//         console.log('[b0nes] 🔒 Using existing SSL certificates');
//         return { key: await readFile(keyPath), cert: await readFile(certPath) };
//     }
    
//     console.log('[b0nes] 🔧 Generating self-signed SSL certificates...');
    
//     // Create .certs directory if it doesn't exist
//     if (!existsSync(CERTS_DIR)) {
//         await mkdir(CERTS_DIR, { recursive: true });
//     }
    
//     try {
//         // Generate self-signed cert using OpenSSL
//         execSync(`openssl req -x509 -newkey rsa:2048 -nodes \
//             -sha256 -days 365 \
//             -keyout "${keyPath}" \
//             -out "${certPath}" \
//             -subj "/CN=localhost" \
//             -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"`, 
//             { stdio: 'pipe' }
//         );
        
//         console.log('[b0nes] ✅ SSL certificates generated successfully!');
//         console.log('[b0nes] 💡 Note: Your browser will show a security warning (this is normal for self-signed certs)');
        
//         return { key: await readFile(keyPath), cert: await readFile(certPath) };
//     } catch (error) {
//         console.error('[b0nes] ❌ Failed to generate SSL certificates:', error.message);
//         console.error('[b0nes] 💡 Make sure OpenSSL is installed on your system');
//         throw error;
//     }
// }


// const requestHandler = async (req, res) => {
//   const host = req.headers.host || 'localhost';
//   const url = new URL(req.url, `http${ENV.isDev ? '' : 's'}://${host}`);
//   console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);

//   // Choose exactly one handler based on URL
//   const selectHandler = (pathname) => {
//     // runtime
//     if (pathname === '/b0nes.js') return serveB0nes;
//     if ((pathname.startsWith('/client/') || pathname.startsWith('/utils/')) && pathname.endsWith('.js')) return serveRuntimeFiles;
//     // component runtime files
//     if (pathname.includes('client.js')) return serveClientFiles;
//     // static assets
//     if (
//       pathname.startsWith('/styles/') ||
//       pathname.startsWith('/images/') ||
//       pathname.startsWith('/assets/') ||
//       pathname.match(/\.(css|jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf)$/)
//     ) return serveStaticFiles;
//     // templates
//     if (pathname.includes('/templates/') && pathname.endsWith('.js')) return serveTemplates;
//     // default -> pages router (dynamic + static pages)
//     return servePages;
//   };

//   const handler = selectHandler(url.pathname);

//   try {
//     console.log(`[Server] Using handler: ${handler.name} for ${url.pathname}`, );
//     const result = await handler(req, res, url);

//     // If handler didn't send a response and didn't return true, it's treated as "not found"
//     if (!(result === true || res.headersSent || res.writableEnded)) {
//       console.warn('[Server] Handler did not respond:', handler.name || 'unknown', url.pathname);
//       if (!res.headersSent && !res.writableEnded) {
//         res.writeHead(404, { 'content-type': 'text/html' });
//         res.end(renderPage('<h1>404 - Page Not Found</h1>', { title: '404' }));
//       }
//     }
//   } catch (err) {
//     console.error('[Server] Error in handler', err);
//     if (res.headersSent || res.writableEnded) return;
//     try {
//       res.writeHead(500, { 'content-type': 'text/plain' });
//       res.end('Internal Server Error');
//     } catch (_) {}
//   }
// };


// /**
//  * Create HTTP/2 server
//  */
// async function createServer(port) {
//     let server;
//     if (USE_HTTP2) {
//         // Only in prod (or if someone really wants the pain)
//         const { key, cert } = await ensureCerts();
//         server = http2.createSecureServer({key, cert, allowHTTP1: true}, (req, res) => requestHandler(req, res));
//       } else {
//         // Dev: pure, sweet, delicious HTTP/1.1
//         server = http.createServer((req, res) => requestHandler(req, res));
//       }
//     return server; 
// }

// export async function startServer(port = 5000, host = '0.0.0.0') {
//     let server = await createServer(port);
    
//     server.listen(port, host, () => {
//         console.log(`\n🦴 b0nes development server running with ${USE_HTTP2? 'HTTP/2':'HTTP/1'}`);
//         console.log(`   Local:   https://localhost:${port}`);
//         console.log(`   Network: https://${host}:${port}\n`);
//         if (USE_HTTP2) {
//             console.log('   ⚠️  Self-signed certificate warning is normal for dev\n');
//         }
//         console.log('   Press Ctrl+C to stop\n');
//     });
    
//     return server;
// }

// if (import.meta.url === `file://${process.argv[1]}`) {
//     const PORT = process.env.PORT || 5000;
//     const HOST = process.env.HOST || '0.0.0.0';
//     startServer(PORT, HOST);
// }

// export default startServer;


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
router.get('/b0nes.js', async (req,res)=> {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http${ENV.isDev ? '' : 's'}://${host}`);
    return serveB0nes(req,res,url)
});


// 2. Client/utils files (e.g., /client/*.js or /utils/*.js)
router.get(/^\/(client|utils)\/.*\.js$/, async (req, res) => {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http${ENV.isDev ? '' : 's'}://${host}`);
    return serveClientFiles(req, res, url);
});

// 3. Component client behaviors (e.g., /atoms/button/client.js)
router.get(/client\.js$/, async (req, res) => {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http${ENV.isDev ? '' : 's'}://${host}`);
    return serveRuntimeFiles(req, res, url);
});

// 4. Static assets (styles, images, assets, or file extensions)
router.get(/^\/(styles|images|assets)\//, async (req,res) => {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http${ENV.isDev ? '' : 's'}://${host}`);
    return serveStaticFiles(req, res, url);
});
router.get(/\.(css|jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf)$/, async () => {
    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http${ENV.isDev ? '' : 's'}://${host}`);
    return serveStaticFiles(req, res, url)
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