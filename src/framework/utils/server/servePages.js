import { renderPage } from '../../renderPage.js';
import { getRoutes } from './autoRoutes.js';
import { compose } from '../../compose.js';

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
            
            let components = page.components || page.default || [];
            
            if (typeof components === 'function') {
                try {
                    components = await components(matchedResult.pathname.groups);
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
            // Provide `currentPath` so renderPage can correctly resolve relative assets.
            const meta = {
                ...(page.meta || {}),
                currentPath: matchedRoute.pattern.pathname 
            };
            const html = renderPage(compose(components), meta);
            
            res.writeHead(200, { 
                'content-type': 'text/html',
                'cache-control': 'no-cache'
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