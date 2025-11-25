import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { CLIENT_BASE, ENV } from './getServerConfig.js';

export const serveRuntimeFiles = async (req, res, url) => {
    // Server runtime files
    if ((url.pathname.startsWith('/client/') || url.pathname.   startsWith('/utils/')) 
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
}