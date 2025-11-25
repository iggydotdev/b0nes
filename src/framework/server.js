// src/framework/server.js
import http from 'node:http';
import http2 from 'node:http2';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { stat } from 'node:fs/promises'


import { compose } from './compose.js';
import { renderPage } from './renderPage.js';
import { getRoutes } from './utils/server/autoRoutes.js';
import { ENV } from './config/envs.js';

//
import { validateAndSanitizePath } from './utils/sanitizePaths.js';
import { serveStaticFiles } from './utils/server/staticFiles.js';
import { CLIENT_BASE, COMPONENTS_BASE, PAGES_BASE, CERTS_DIR } from './utils/server/getServerConfig.js';
import { serveRuntimeFiles } from './utils/server/serveRuntimeFiles.js';
import { serveB0nes } from './utils/server/serveB0nes.js';
import { serveClientFiles } from './utils/server/serveClientFiles.js';
import { serveTemplates } from './utils/server/serveTemplates.js';
import { servePages } from './utils/server/servePages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add this config near the top
const USE_HTTP2 = process.env.NODE_ENV === 'production' || process.env.FORCE_HTTP2 === 'true';


/**
 * Generate self-signed certificates for HTTP/2
 * Because browsers require HTTPS for HTTP/2 (thanks, spec!)
 */
async function ensureCerts() {
    const keyPath = path.join(CERTS_DIR, 'localhost-key.pem');
    const certPath = path.join(CERTS_DIR, 'localhost.pem');
    
    // Check if certs already exist
    if (existsSync(keyPath) && existsSync(certPath)) {
        console.log('[b0nes] 🔒 Using existing SSL certificates');
        return { key: await readFile(keyPath), cert: await readFile(certPath) };
    }
    
    console.log('[b0nes] 🔧 Generating self-signed SSL certificates...');
    
    // Create .certs directory if it doesn't exist
    if (!existsSync(CERTS_DIR)) {
        await mkdir(CERTS_DIR, { recursive: true });
    }
    
    try {
        // Generate self-signed cert using OpenSSL
        execSync(`openssl req -x509 -newkey rsa:2048 -nodes \
            -sha256 -days 365 \
            -keyout "${keyPath}" \
            -out "${certPath}" \
            -subj "/CN=localhost" \
            -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"`, 
            { stdio: 'pipe' }
        );
        
        console.log('[b0nes] ✅ SSL certificates generated successfully!');
        console.log('[b0nes] 💡 Note: Your browser will show a security warning (this is normal for self-signed certs)');
        
        return { key: await readFile(keyPath), cert: await readFile(certPath) };
    } catch (error) {
        console.error('[b0nes] ❌ Failed to generate SSL certificates:', error.message);
        console.error('[b0nes] 💡 Make sure OpenSSL is installed on your system');
        throw error;
    }
}


const requestHandler = async (req, res) => {
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url, `http${ENV.isDev ? '' : 's'}://${host}`);
  console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);

  // Choose exactly one handler based on URL
  const selectHandler = (pathname) => {
    // runtime
    if (pathname === '/b0nes.js') return serveB0nes;
    if ((pathname.startsWith('/client/') || pathname.startsWith('/utils/')) && pathname.endsWith('.js')) return serveRuntimeFiles;
    // component runtime files
    if (pathname.includes('client.js')) return serveClientFiles;
    // static assets
    if (
      pathname.startsWith('/styles/') ||
      pathname.startsWith('/images/') ||
      pathname.startsWith('/assets/') ||
      pathname.match(/\.(css|jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf)$/)
    ) return serveStaticFiles;
    // templates
    if (pathname.includes('/templates/') && pathname.endsWith('.js')) return serveTemplates;
    // default -> pages router (dynamic + static pages)
    return servePages;
  };

  const handler = selectHandler(url.pathname);

  try {
    console.log(`[Server] Using handler: ${handler.name} for ${url.pathname}`, );
    const result = await handler(req, res, url);

    // If handler didn't send a response and didn't return true, it's treated as "not found"
    if (!(result === true || res.headersSent || res.writableEnded)) {
      console.warn('[Server] Handler did not respond:', handler.name || 'unknown', url.pathname);
      if (!res.headersSent && !res.writableEnded) {
        res.writeHead(404, { 'content-type': 'text/html' });
        res.end(renderPage('<h1>404 - Page Not Found</h1>', { title: '404' }));
      }
    }
  } catch (err) {
    console.error('[Server] Error in handler', err);
    if (res.headersSent || res.writableEnded) return;
    try {
      res.writeHead(500, { 'content-type': 'text/plain' });
      res.end('Internal Server Error');
    } catch (_) {}
  }
};


/**
 * Create HTTP/2 server
 */
async function createServer(port) {
    let server;
    if (USE_HTTP2) {
        // Only in prod (or if someone really wants the pain)
        const { key, cert } = await ensureCerts();
        server = http2.createSecureServer({key, cert, allowHTTP1: true}, (req, res) => requestHandler(req, res));
      } else {
        // Dev: pure, sweet, delicious HTTP/1.1
        server = http.createServer((req, res) => requestHandler(req, res));
      }
    return server; 
}

export async function startServer(port = 5000, host = '0.0.0.0') {
    let server = await createServer(port);
    
    server.listen(port, host, () => {
        console.log(`\n🦴 b0nes development server running with ${USE_HTTP2? 'HTTP/2':'HTTP/1'}`);
        console.log(`   Local:   https://localhost:${port}`);
        console.log(`   Network: https://${host}:${port}\n`);
        if (USE_HTTP2) {
            console.log('   ⚠️  Self-signed certificate warning is normal for dev\n');
        }
        console.log('   Press Ctrl+C to stop\n');
    });
    
    return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0';
    startServer(PORT, HOST);
}

export default startServer;



/**
 * const requestHandler = async (req, res) => {
    // HTTP/2 uses :authority pseudo-header instead of Host
    const authority = req.headers[':authority'] || req.headers.host || 'localhost';
    const url = new URL(req.url, `https://${authority}`);
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);
    
    // Serve b0nes.js client-side runtime
    if (url.pathname === '/b0nes.js') {
        try {
            const filePath = path.join(CLIENT_BASE, 'b0nes.js');
            const content = await readFile(filePath, 'utf-8');
            res.writeHead(200, { 
                'content-type': 'application/javascript',
                'cache-control': 'no-cache'
            });
            res.end(content);
            return;
        } catch (error) {
            console.error('[Server] Error loading b0nes.js:', error);
            res.writeHead(500, { 'content-type': 'text/plain' });
            res.end('Error loading b0nes.js');
            return;
        }
    }
    
    // Server runtime files
    if ((url.pathname.startsWith('/client/') || url.pathname.startsWith('/utils/')) 
        && url.pathname.endsWith('.js')) {
        try {
            const filename = path.basename(url.pathname);
            const filePath = path.join(CLIENT_BASE, filename);
            const content = await readFile(filePath, 'utf-8');
            res.writeHead(200, { 
                'content-type': 'application/javascript',
                'cache-control': 'no-cache'
            });
            res.end(content);
            return;
        } catch (err) {
            console.log('[Server] Client runtime 404:', url.pathname);
            res.writeHead(404);
            res.end('Not found');
            return;
        }
    }
    
    // Client behavior files
    if (url.pathname.includes('client.js')) {
        try {
            const segments = url.pathname.split('/').filter(Boolean);
            let componentPath = null;
            
            for (let i = 0; i < segments.length; i++) {
                if (['atoms', 'molecules', 'organisms'].includes(segments[i])) {
                    const type = segments[i];
                    const name = segments[i + 1];
                    const filename = segments[segments.length - 1];
                    componentPath = path.join(COMPONENTS_BASE, type, name, filename);
                    break;
                }
            }
            
            if (!componentPath) {
                throw new Error('Could not resolve component path');
            }

            const content = await readFile(componentPath, 'utf-8');
            res.writeHead(200, { 
                'content-type': 'application/javascript',
                'cache-control': 'no-cache'
            });
            res.end(content);
            return;
        } catch (error) {
            console.error('[Server] Error loading client behavior:', error);
            res.writeHead(404, { 'content-type': 'text/plain' });
            res.end('Client behavior not found');
            return;
        }
    }
    
    // Static files with collocated support
    if (url.pathname.startsWith('/styles/') || 
        url.pathname.startsWith('/images/') || 
        url.pathname.startsWith('/assets/') ||
        url.pathname.match(/\.(css|jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf)$/)) {
        
        const result = await tryResolveFile(url.pathname);
        
        if (result.found) {
            console.log(`[Server] ✅ Serving static file from: ${result.path}`);
            res.writeHead(200, { 
                'content-type': getContentType(url.pathname),
                'cache-control': ENV.isDev ? 'no-cache' : 'public, max-age=3600'
            });
            res.end(result.content);
            return;
        }
        
        console.error('[Server] ❌ Static file not found:', url.pathname);
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('File not found');
        return;
    }

    // Organism templates
    if (url.pathname.includes('/templates/') && url.pathname.endsWith('.js')) {
        try {
            const filePath = fileURLToPath(
                new URL(`../components/organisms/${url.pathname}`, import.meta.url)
            );
            const content = await readFile(filePath, 'utf-8');
            res.writeHead(200, { 
                'content-type': 'application/javascript',
                'cache-control': 'no-cache'
            });
            res.end(content);
            return;
        } catch (err) {
            console.log('[Server] Template 404:', url.pathname);
            res.writeHead(404);
            res.end('Not found');
            return;
        }
    }

    // Route matching for pages
    try {
        let matchedRoute = null;
        let matchedResult = null;
        const routes = getRoutes();

        for (const route of routes) {

            const result = route.pattern.exec(url.href);

            if (result) {
                matchedRoute = route;
                matchedResult = result;
                break;
            }
        }

        if (!matchedRoute) {
            console.warn('[Server] 404 Not Found:', url.pathname);
            res.writeHead(404, { 'content-type': 'text/html' });
            res.end(renderPage(
                '<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p>',
                { title: '404' }
            ));
        } else {
            const page = await matchedRoute.load();
            console.log('[Server] Serving page for route:', matchedRoute.pattern.pathname);
            
            let components = page.components || page.default || [];
            
            if (typeof components === 'function') {
                try {
                    components = await components(matchedResult.pathname.groups);
                } catch (error) {
                    console.error('[Server] Error fetching external data:', error);
                    res.writeHead(500, { 'content-type': 'text/html' });
                    res.end(renderPage(
                        '<h1>500 - Error Loading Data</h1><p>Failed to fetch data for this page.</p>',
                        { title: '500' }
                    ));
                    return;
                }
            }
            
            const html = renderPage(compose(components), page.meta || {});
            
            res.writeHead(200, { 
                'content-type': 'text/html',
                'cache-control': 'no-cache'
            });
            res.end(html);
            return;
        }
    } catch (error) {
        console.error('[Server] Error processing request:', error);
        res.writeHead(500, { 'content-type': 'text/html' });
        res.end(renderPage(
            '<h1>500 - Internal Server Error</h1><p>Something went wrong processing your request.</p>',
            { title: '500' }
        ));
    }
};
 * 
 */