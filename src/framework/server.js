import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { router } from './router.js';
import { routes } from './routes.js';
import { compose } from './compose.js';
import { renderPage } from './renderPage.js';

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
    
    // Route matching for pages
    try {
        const route = router(url, routes);
        
        if (route) {
            // Handle dynamic routes with externalData
            let components = route.components;
            
            if (typeof components === 'function' && route.externalData) {
                try {
                    const data = await route.externalData(route.params);
                    components = components(data);
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
            
            const content = compose(components);
            const html = renderPage(content, route.meta);
            
            res.writeHead(200, { 
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache'
            });
            res.end(html);
            return;
        }
        
        // 404 - Not Found
        console.warn('[Server] 404 Not Found:', url.pathname);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(renderPage(
            '<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p>',
            { title: '404' }
        ));
        
    } catch (error) {
        console.error('[Server] Error processing request:', error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(renderPage(
            '<h1>500 - Internal Server Error</h1><p>Something went wrong processing your request.</p>',
            { title: '500' }
        ));
    }
});

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