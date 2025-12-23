import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { CLIENT_BASE, UTILS_BASE, ENV } from './getServerConfig.js';

export const serveRuntimeFiles = async (req, res, url) => {
    // Server runtime files
    try {
        let baseDir = CLIENT_BASE;
        let filename;
        
        // Extract the filename and determine base directory
        if (url.pathname.includes('/utils/')) {
            baseDir = UTILS_BASE;
            filename = path.basename(url.pathname);
        } else {
            // Default to client base
            filename = path.basename(url.pathname);
        }
        
        const filePath = path.join(baseDir, filename);
        
        console.log(`[Server] 📦 Serving runtime file: ${filename} from ${filePath}`);
        
        const content = await readFile(filePath, 'utf-8');
        res.writeHead(200, { 
            'content-type': 'application/javascript',
            'cache-control': ENV.isDev ? 'no-cache' : 'public, max-age=3600'
        });
        res.end(content);
        return;
    } catch (err) {
        console.log(`[Server] ❌ Runtime file 404: ${url.pathname}`);
        res.writeHead(404);
        res.end('Not found');
        return;
    }
}