import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { compose } from './compose.js';
import { renderPage } from './renderPage.js';
import { getRoutes } from './autoRoutes.js';

/**
 * b0nes Development Server
 * Serves pages with SSR and hot reload support
 */

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);
    
    // Serve b0nes.js client-side runtime
    if (url.pathname === '/b0nes.js') {
        try {
            const filePath = fileURLToPath(new URL('./client/b0nes.js', import.meta.url));
            const content = await readFile(filePath, 'utf-8');
            res.writeHead(200, { 
                'Content-Type': 'application/javascript',
                'Cache-Control': 'no-cache'
            });
            res.end(content);
            return;
        } catch (error) {
            console.error('[Server] Error loading b0nes.js:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error loading b0nes.js');
            return;
        }
    }
    
    // Serve client behavior files (molecules/organisms with client.js)
    if (url.pathname.includes('client.js')) {
        try {
            const segments = url.pathname.split('/').filter(Boolean);
            const filename = segments[segments.length - 1]; // e.g., "molecules.tabs.client.js"
            const parts = filename.replace('.client.js', '').split('.');
            
            if (parts.length >= 2) {
                const [type, name] = parts; // e.g., ["molecules", "tabs"]
                const filePath = fileURLToPath(
                    new URL(`../components/${type}/${name}/${type}.${name}.client.js`, import.meta.url)
                );
                const content = await readFile(filePath, 'utf-8');
                res.writeHead(200, { 
                    'Content-Type': 'application/javascript',
                    'Cache-Control': 'no-cache'
                });
                res.end(content);
                return;
            }
        } catch (error) {
            console.error('[Server] Error loading client behavior:', error);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Client behavior not found');
            return;
        }
    }
    
    // Serve static files from public/ directory (stylesheets, images, etc.)
    if (url.pathname.startsWith('/styles/') || 
        url.pathname.startsWith('/images/') || 
        url.pathname.startsWith('/assets/')) {
        try {
            const filePath = fileURLToPath(new URL(`../../public${url.pathname}`, import.meta.url));
            const content = await readFile(filePath);
            
            // Determine content type
            const ext = url.pathname.split('.').pop();
            const contentTypes = {
                'css': 'text/css',
                'js': 'application/javascript',
                'json': 'application/json',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'svg': 'image/svg+xml',
                'webp': 'image/webp',
                'ico': 'image/x-icon'
            };
            
            res.writeHead(200, { 
                'Content-Type': contentTypes[ext] || 'application/octet-stream',
                'Cache-Control': 'public, max-age=3600'
            });
            res.end(content);
            return;
        } catch (error) {
            console.error('[Server] Static file not found:', url.pathname);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }
    }

    
    if (url.pathname.startsWith('/client/') && url.pathname.endsWith('.js')) {
        try {
            const filePath = fileURLToPath(new URL(`./${url.pathname}`, import.meta.url));
       
            const content = await readFile(filePath, 'utf-8');
            res.writeHead(200, { 
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-cache'
            });
            res.end(content);
            return;
        } catch (err) {
            console.log('Client runtime 404:', url.pathname);
            res.writeHead(404);
            res.end('Not found');
            return;
        }
    }
        // Route matching for pages
    try {
        
            let matchedRoute = null;
            let matchResult = null;

            const routes = getRoutes();
        

            for (const route of routes) {
                const result = route.pattern.exec(url.pathname);
                if (result) {
                matchedRoute = route;
                matchResult = result;
                break;
                }
            }
            if (!matchedRoute) {
                // 404 handling...
                console.warn('[Server] 404 Not Found:', url.pathname);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(renderPage(
                    '<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p>',
                    { title: '404' }
                ));
            } else {

                const page = await matchedRoute.load();
                console.log('[Server] Serving page for route:', matchedRoute.pattern.pathname);
                console.log('[Server] Page:', page);
                // Handle dynamic routes with externalData
                let components = page.components || page.default || [];
                
                if (typeof components === 'function' && route.externalData) {
                    try {
                        const data = await page.externalData(page.params);
                        components = await components(matchedRoute.pathname.groups, data);
                    } catch (error) {
                        console.error('[Server] Error fetching external data:', error);
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end(renderPage(
                            '<h1>500 - Error Loading Data</h1><p>Failed to fetch data for this page.</p>',
                            { title: '500' }
                        ));
                        return;
                    }
                }
                
                const html = renderPage(compose(components), page.meta || {});
                
                res.writeHead(200, { 
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-cache'
                });
                res.end(html);
                return;
            }
            
        } catch (error) {
            console.error('[Server] Error processing request:', error);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(renderPage(
                '<h1>500 - Internal Server Error</h1><p>Something went wrong processing your request.</p>',
                { title: '500' }
            ));
        }
    })

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