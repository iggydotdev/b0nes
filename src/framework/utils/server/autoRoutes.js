import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { URLPattern } from '../urlPattern.js';
import { PAGES_BASE } from './getServerConfig.js'; 

const pagesDir = PAGES_BASE;
console.log(`[b0nes] Auto-discovering routes in: ${PAGES_BASE}`);

function buildRoutes() {
  let routes = [];
  
  // Ensure the pages directory exists before trying to walk it.
  if (!fs.existsSync(pagesDir)) {
    console.error(`[b0nes] ❌ Pages directory not found at: ${pagesDir}`);
    return [];
  }
  
  function walk(dir, basePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // If it's a directory, recurse into it.
        const childBase = path.join(basePath, entry.name);
        walk(fullPath, childBase);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        // --- THIS IS THE CORE LOGIC CHANGE ---
        // Only treat specific file names as renderable pages to avoid including assets.
        const isIndexPage = entry.name === 'index.js';
        const isDynamicPage = entry.name.startsWith('[') || entry.name.startsWith(':');
        
        // If the file is not a recognized page type, skip it.
        if (!isIndexPage && !isDynamicPage) {
          continue; 
        }
        
        // Determine the URL path based on the file and directory structure.
        let routePath = basePath;
        if (!isIndexPage) {
          // For dynamic pages like `[slug].js`, add the filename part.
          const segment = entry.name.replace(/\.js$/, '');
          routePath = path.join(basePath, segment);
        }
        
        // Normalize the path for URLPattern.
        // 1. Convert Windows backslashes to forward slashes.
        // 2. Ensure it starts with a single slash.
        // 3. Convert [slug] syntax to :slug for URLPattern.
        let pathname = ('/' + routePath.replace(/\\/g, '/')).replace(/\/+/g, '/');
        pathname = pathname.replace(/\[([^\/]+)\]/g, ':$1');
        
        // Handle the root case which might be an empty string after processing.
        if (pathname === '') pathname = '/';
        
        // Avoid trailing slash on non-root paths.
        if (pathname.length > 1 && pathname.endsWith('/')) {
            pathname = pathname.slice(0, -1);
        }
        
        routes.push({ 
          pattern: new URLPattern({ pathname }), 
          load: () => import(pathToFileURL(fullPath).href), 
          params: pathname.includes(':'),
          filePath: fullPath // Keep for co-located asset handling
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
    ROUTES_CACHE = buildRoutes();
    console.log(`[b0nes] Auto-discovered ${ROUTES_CACHE.length} routes`);
    // Optional: Log discovered routes for debugging
    if (ROUTES_CACHE.length > 0) {
        console.log(ROUTES_CACHE.map(r => ` - ${r.pattern.pathname}`).join('\n'));
    }
  }
  return ROUTES_CACHE;
}

// Clear cache on --watch restart (for development)
process.on('SIGUSR2', () => {
  ROUTES_CACHE = null;
  console.log('[b0nes] Routes cache cleared – will re-scan pages/');
});