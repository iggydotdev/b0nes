import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { URLPattern } from '../urlPattern.js';
import { PAGES_BASE } from './getServerConfig.js'; 

const pagesDir = PAGES_BASE;

function buildRoutes() {
  const routes = [];
  
  if (!fs.existsSync(pagesDir)) {
    console.error(`[b0nes] ❌ Pages directory not found at: ${pagesDir}. Cannot discover routes.`);
    return [];
  }
  
  function walk(dir, basePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const childBase = path.join(basePath, entry.name);
        walk(fullPath, childBase);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        const isIndexPage = entry.name === 'index.js';
        const isDynamicPage = entry.name.startsWith('[') || entry.name.startsWith(':');
        
        if (!isIndexPage && !isDynamicPage) {
          continue; 
        }
        
        let routePath = basePath;
        if (!isIndexPage) {
          const segment = entry.name.replace(/\.js$/, '');
          routePath = path.join(basePath, segment);
        }
        
        let pathname = ('/' + routePath.replace(/\\/g, '/')).replace(/\/+/g, '/');
        pathname = pathname.replace(/\[([^\/]+)\]/g, ':$1');
        
        if (pathname.length > 1 && pathname.endsWith('/')) {
            pathname = pathname.slice(0, -1);
        }
        
        routes.push({ 
          pattern: new URLPattern({ pathname }), 
          load: () => import(pathToFileURL(fullPath).href), 
          filePath: fullPath
        });
      }
    }
  }
  
  walk(pagesDir);
  return routes;
}

let ROUTES_CACHE = null;

export function getRoutes() {
  if (!ROUTES_CACHE) {
    const discoveredRoutes = buildRoutes();
    
    // --- NEW VALIDATION STEP ---
    // After discovering routes, we now validate every single one to guarantee its integrity.
    for (const route of discoveredRoutes) {
      if (!route || typeof route !== 'object') {
        throw new Error(`[b0nes] Route discovery failed: Found an invalid entry in routes array.`);
      }
      if (!route.pattern || typeof route.pattern.pathname !== 'string') {
        throw new Error(`[b0nes] Route discovery failed: A route is missing a valid 'pattern.pathname'. Invalid route: ${JSON.stringify(route)}`);
      }
      if (typeof route.filePath !== 'string' || !route.filePath) {
        // This check catches the exact error at its source.
        throw new Error(`[b0nes] Route discovery failed: The route for "${route.pattern.pathname}" was created without the required 'filePath' property. Check the logic in autoRoutes.js.`);
      }
    }
    
    ROUTES_CACHE = discoveredRoutes;
    console.log(`[b0nes] Auto-discovered and validated ${ROUTES_CACHE.length} routes`);
    if (ROUTES_CACHE.length > 0) {
        console.log(ROUTES_CACHE.map(r => ` - ${r.pattern.pathname}`).join('\n'));
    }
  }
  return ROUTES_CACHE;
}

// Clear cache for development hot-reloading.
process.on('SIGUSR2', () => {
  ROUTES_CACHE = null;
  console.log('[b0nes] Routes cache cleared – will re-scan pages/');
});