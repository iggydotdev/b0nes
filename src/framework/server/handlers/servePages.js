import { renderPage } from '../../core/render.js';
import { getRoutes } from './autoRoutes.js';
import { compose } from '../../core/compose.js';
import { pageAssetBasePath } from '../../shared/pageAssetPath.js';
import { shouldBeStatic } from '../../shared/renderMode.js';
import { resolvePublicPage } from '../../shared/tryResolveFile.js';
import { ENV } from './getServerConfig.js';

/**
 * Serve pages based on route matching
 */
export const servePages = async (req, res, url) => {

    // Route matching for pages
    try {
        let matchedRoute = null;
        let matchedResult = null;
        const routes = getRoutes();

        for (const route of routes) {

            const result = route.pattern.exec(url.href);

            if (result) {
                matchedRoute = route;
                matchedResult = result;
                break;
            }
        }

        if (!matchedRoute) {
            console.warn('[Server - Wildcard] 404 Not Found:', url.pathname);
            res.writeHead(404, { 'content-type': 'text/html' });
            res.end(renderPage(
                '<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p>',
                { title: '404' }
            ));
        } else {
            const page = await matchedRoute.load();
            console.log('[Server] Serving page for route:', matchedRoute.pattern.pathname);

            // Production SSG is the build artifact, including externalData's
            // fetched fields and production module entries. Re-running its
            // component factory with only URL params loses that data. An absent
            // concrete artifact is a 404 for explicit SSG. Default dynamic
            // routes retain their existing request-time SSR fallback.
            if (!ENV.isDev && shouldBeStatic(page, matchedRoute)) {
                const generated = await resolvePublicPage(url.pathname);
                if (generated.found) {
                    res.writeHead(200, {
                        'content-type': 'text/html',
                        'x-content-type-options': 'nosniff',
                        'cache-control': 'public, max-age=0, must-revalidate',
                        'x-rendered-by': 'b0nes-ssg'
                    });
                    res.end(req.method === 'HEAD' ? undefined : generated.content);
                    return;
                }
                if (page.meta?.render === 'ssg' || !matchedRoute.params) {
                    res.writeHead(404, { 'content-type': 'text/html' });
                    res.end(renderPage('<h1>404 - Page Not Found</h1>', { title: '404', interactive: false }));
                    return;
                }
            }
            
            let components = page.components || page.default || [];
            let componentData = matchedResult.pathname.groups;

            // Development uses fresh source, but dynamic SSG factories still
            // receive the same complete record used by the build.
            if (ENV.isDev && matchedRoute.params && shouldBeStatic(page, matchedRoute) && typeof page.externalData === 'function') {
                const fetched = await page.externalData();
                const records = Array.isArray(fetched) ? fetched : [fetched];
                const parameters = Object.fromEntries(Object.entries(componentData).map(([key, value]) => {
                    try { return [key, decodeURIComponent(value)]; }
                    catch { return [key, value]; }
                }));
                const record = records.find(candidate => candidate && matchedRoute.params.every(key =>
                    Object.hasOwn(candidate, key) && String(candidate[key]) === parameters[key]));
                if (record) componentData = record;
                else if (page.meta?.render === 'ssg') {
                    res.writeHead(404, { 'content-type': 'text/html' });
                    res.end(renderPage('<h1>404 - Page Not Found</h1>', { title: '404', interactive: false }));
                    return;
                }
            }
            
            if (typeof components === 'function') {
                try {
                    components = await components(componentData);
                } catch (error) {
                    console.error('[Server] Error fetching external data:', error);
                    res.writeHead(500, { 'content-type': 'text/html' });
                    res.end(renderPage(
                        '<h1>500 - Error Loading Data</h1><p>Failed to fetch data for this page.</p>',
                        { title: '500' }
                    ));
                    return;
                }
            }
            const assetBasePath = pageAssetBasePath(matchedRoute.filePath, url.pathname);
            const resolvedRoute = { ...matchedRoute, pattern: { pathname: url.pathname } };
            const meta = {
                ...(page.meta || {}),
                currentPath: url.pathname,
                assetBasePath
            };
            const html = renderPage(compose(components, { route: resolvedRoute, assetBasePath }), meta);
            
            res.writeHead(200, { 
                'content-type': 'text/html',
                'x-rendered-by': 'b0nes-ssr',
                'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            });
            res.end(html);
            return;
        }
    } catch (error) {
        console.error('[Server] Error processing request:', error);
        res.writeHead(500, { 'content-type': 'text/html' });
        res.end(renderPage(
            '<h1>500 - Internal Server Error</h1><p>Something went wrong processing your request.</p>',
            { title: '500' }
        ));
    }
}
