import path from 'path';
import { readFile } from 'fs/promises';
import { CLIENT_BASE } from './getServerConfig.js';

export const serveB0nes = async (req, res, url) => {
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
}