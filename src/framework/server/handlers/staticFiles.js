import { tryResolveFile } from '../../shared/tryResolveFile.js';
import { ENV } from '../../config/envs.js';
import path from 'node:path';
import { getContentType } from '../../shared/getContentType.js';

export const serveStaticFiles = async (req, res, url) => {
    const isKnownStaticDir = /^\/(assets|styles|images)\//.test(url.pathname);
    let result = await tryResolveFile(url.pathname);
    if (!result.found && ENV.isDev && !isKnownStaticDir && req.headers.referer) {
        try {
            const referer = new URL(req.headers.referer);
            result = await tryResolveFile(path.posix.join(referer.pathname, path.posix.basename(url.pathname)));
        } catch { /* Invalid referrers do not affect asset resolution. */ }
    }
    if (!result.found) {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('File not found');
        return true;
    }
    res.writeHead(200, {
        'content-type': getContentType(result.path),
        'x-content-type-options': 'nosniff',
        'cache-control': ENV.isDev ? 'no-store, no-cache, must-revalidate, proxy-revalidate' : 'public, max-age=3600'
    });
    res.end(req.method === 'HEAD' ? undefined : result.content);
    return true;
};
