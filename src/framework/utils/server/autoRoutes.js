// src/framework/utils/server/autoRoutes.js
import fs from 'node:fs';
import path from 'node:path';

import { URLPattern } from '../urlPattern.js';
import { PAGES_BASE } from './getServerConfig.js'; 

const pagesDir = PAGES_BASE;
console.log(`[b0nes] Auto-discovering routes in: ${PAGES_BASE}`);

function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

function buildRoutes() {
  let routes = [];
  
  function walk(dir, basePath ='') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const indexEntry = entries.find(e => e.name === 'index.js');
    
    if (indexEntry) {
      const fullPath = path.join(dir, 'index.js');
      let pathname = basePath || '/';
      pathname = '/' + pathname.replace(/^\//, ''); // force leading slash, no double
      
      routes.push({ 
        pattern: new URLPattern({ pathname: pathname.replace('/index','')  }), 
        load: () => import(fullPath),
        params: pathname.includes(':'),
        filePath: fullPath  // 🔥 ADD THIS - track file path for co-located assets
      });
    }

    for (const entry of entries) {
      if (entry.name === 'index.js') continue;

      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const childBase = basePath? `${basePath}/${entry.name}`: entry.name;
        walk(fullPath, childBase);
        continue;
      }

      if (!entry.name.endsWith('.js')) continue;
      
      // Only leaf pages (not folder-named .js files)
      const segment = entry.name.replace(/\.js$/, '');
      let pathname = basePath? `${basePath}/${segment}`:segment;
      pathname = pathname.replace(/\[([^\/]+)\]/g, ':$1');
      
      // Clean slashes and force leading
      pathname = '/'+ pathname.replace(/\/+/g, '/').replace(/\/$/, '');
      if (pathname !== '/') {
        pathname = pathname.replace('/index', '');
      }
      
      routes.push({ 
        pattern: new URLPattern({ pathname }), 
        load: () => import(fullPath), 
        params: pathname.includes(':'),
        filePath: fullPath  // 🔥 ADD THIS - track file path for co-located assets
      });
    }
  }
  
  walk(pagesDir);

  // Filter out framework runtime and asset paths
    routes = routes.filter(route => {
        const pathname = route.pattern?.pathname;
        
        // Skip asset paths - these are served statically, not rendered
        if (pathname && pathname.startsWith('/assets/')) {
            return false;
        }
        
        return true;
    });


  return routes;
}

let ROUTES_CACHE = null;

export function getRoutes() {
  if (!ROUTES_CACHE) {
    ROUTES_CACHE = buildRoutes();
    console.log(`[b0nes] Auto-discovered ${ROUTES_CACHE.length} routes`);
    console.log(ROUTES_CACHE.map(r => ` - ${r.pattern.pathname}`).join('\n'));
  }
  return ROUTES_CACHE;
}

// Clear cache on --watch restart
process.on('SIGUSR2', () => {
  ROUTES_CACHE = null;
  console.log('[b0nes] Routes cache cleared – will re-scan pages/');
});