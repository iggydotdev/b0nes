import { tryResolveFile } from "../tryResolveFile.js";
import { ENV } from "../../config/envs.js";
import path from "path";
import { getContentType } from "../getContentType.js";

export const serveStaticFiles = async (req, res, url) => {
    // Static files with collocated support
    const isKnownStaticDir = url.pathname.startsWith('/assets/') || 
        url.pathname.startsWith('/styles/') || 
        url.pathname.startsWith('/images/');
    
    if (isKnownStaticDir ||
        url.pathname.match(/\.(css|jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|js)$/)) {
        console.log(`[Server] Static file request: ${url.pathname}`);
        let assetPath = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
        let result = await tryResolveFile(assetPath);
        
        // --- Dev-mode co-location fix ---
        if (!result.found && ENV.isDev && !isKnownStaticDir && req.headers.referer) {
            console.log(`[Server] ⚠️ Asset not found at '${assetPath}'. Checking referer...`);
            try {
                const refererUrl = new URL(req.headers.referer);
                const refererPath = refererUrl.pathname;
                const assetName = path.basename(url.pathname);
                
                const refererBasedPath = path.join(refererPath, assetName).substring(1);
                console.log(`[Server] ➡️ Attempting to resolve via referer: '${refererBasedPath}'`);
                result = await tryResolveFile(refererBasedPath);
                if (result.found) {
                    assetPath = refererBasedPath;
                }
            } catch (e) {
                console.error('[Server] ❌ Error parsing referer URL:', e.message);
            }
        }
        
        if (result.found) {
            console.log(`[Server] ✅ Serving static file from: ${result.path}`);
            res.writeHead(200, { 
                'content-type': getContentType(assetPath),
                'cache-control': ENV.isDev ? 'no-cache' : 'public, max-age=3600'
            });
            res.end(result.content);
            return true;
        }
        
        console.error(`[Server] ❌ Static file not found: ${url.pathname}`);
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('File not found');
        return true;
    }
    return false;
}