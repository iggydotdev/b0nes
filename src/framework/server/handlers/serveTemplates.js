import { fileURLToPath } from 'node:url';
import { readFile } from 'fs/promises';
import { COMPONENTS_BASE } from './getServerConfig.js';

export const serveTemplates = async (req, res, url) => {
    // Organism templates
    if (url.pathname.includes('/templates/') && url.pathname.endsWith('.js')) {
        try {
            const filePath = fileURLToPath(
                new URL(`${COMPONENTS_BASE}/organisms/${url.pathname}`, import.meta.url)
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
}
