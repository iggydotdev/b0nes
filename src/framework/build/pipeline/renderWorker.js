import { parentPort, workerData } from 'node:worker_threads';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// Import necessary framework functions
// Since workers start with a clean state, we need to import these here
import { compose } from '../../core/compose.js';
import { renderPage } from '../../core/render.js';
import { generateRoute } from './generateRoute.js';
import { copyColocatedAssets } from './colocatedAssets.js';
import { shouldBeStatic } from './ssg.js';

/**
 * Worker implementation for rendering a route
 */
async function run() {
    const { route, outputDir, options } = workerData;
    const { verbose } = options;

    try {
        // 1. Load the page module
        // We re-import it here because we can't pass the 'load' function across workers
        const moduleUrl = pathToFileURL(route.filePath).href;
        const page = await import(moduleUrl);

        // 2. Copy co-located assets
        if (route.filePath) {
            copyColocatedAssets(route.filePath, outputDir, { verbose });
        }

        // 3. Check if this route should be static or dynamic
        if (!shouldBeStatic(page, route)) {
            parentPort.postMessage({
                success: true,
                ssr: true,
                route,
                reason: route.params 
                    ? 'Dynamic route - SSR (no externalData)'
                    : 'SSR - components function'
            });
            return;
        }

        // 4. Build the route
        if (route.params && page.externalData) {
            // Dynamic route with externalData
            const data = await page.externalData();
            const dataArray = Array.isArray(data) ? data : [data];
            
            const routeWithComponents = {
                ...route,
                pattern: route.pattern,
                meta: page.meta || {},
                components: (d) => {
                    const comps = page.components;
                    return typeof comps === 'function' ? comps(d) : comps;
                }
            };
            
            const results = await generateRoute(routeWithComponents, outputDir, dataArray);
            parentPort.postMessage({ success: true, results, route });
        } else {
            // Static route
            const staticRoute = {
                pattern: route.pattern,
                components: page.components || page.default || [],
                meta: page.meta || {}
            };
            
            const result = await generateRoute(staticRoute, outputDir);
            parentPort.postMessage({ success: true, result, route });
        }

    } catch (error) {
        parentPort.postMessage({
            success: false,
            route: route.pattern?.pathname || 'unknown',
            error: error.message,
            stack: error.stack
        });
    }
}

run();
