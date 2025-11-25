import { ENV } from "../../config/envs.js";
import { tryResolveFile } from '../../utils/tryResolveFile.js';
import { getContentType } from '../../utils/getContentType.js';

export const serveStaticFiles = async (req, res, url) => {
    // Static files with collocated support
    if (url.pathname.startsWith('/styles/') || 
        url.pathname.startsWith('/images/') || 
        url.pathname.startsWith('/assets/') ||
        url.pathname.match(/\.(css|jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf)$/)) {
        console.log('[Server] Static file request:', url.pathname);
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
}