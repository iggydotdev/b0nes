import path from 'path';
import { readFile } from 'fs/promises';
import { CLIENT_BASE, ENV } from './getServerConfig.js';

export const serveB0nes = async (req, res, url) => {
    // Serve b0nes.js client-side runtime

    try {
        // In dev: serve from CLIENT_BASE
        // In prod: serve from CLIENT_BASE (which points to public/assets/js/client)
        const filePath = path.join(CLIENT_BASE, 'b0nes.js');
        
        console.log(`[Server] 📦 Serving b0nes.js from: ${filePath}`);
        
        const content = await readFile(filePath, 'utf-8');
        res.writeHead(200, { 
            'content-type': 'application/javascript',
            'cache-control': ENV.isDev ? 'no-store, no-cache, must-revalidate, proxy-revalidate' : 'public, max-age=3600'
        });
        res.end(content);
        return;
    } catch (error) {
        console.error('[Server] ❌ Error loading b0nes.js:', error);
        res.writeHead(500, { 'content-type': 'text/plain' });
        res.end('Error loading b0nes.js');
        return;
    }
}