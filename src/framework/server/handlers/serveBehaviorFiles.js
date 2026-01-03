import path from 'path';
import { readFile } from 'fs/promises';
import { COMPONENTS_BASE, ENV } from './getServerConfig.js';

export const serveBehaviorFiles = async (req, res, url) => {
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
}