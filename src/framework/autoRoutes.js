// src/framework/autoRoutes.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { URLPattern } from './utils/urlPattern.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.resolve(__dirname, '../pages');

function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

function buildRoutes() {
  const routes = [];
  
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
        params: pathname.includes(':')        
      });
    }

    for (const entry of entries) {
      if (entries.name === 'index.js') continue;

      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const childBase = basePath? `${basePath}/${entry.name}`: entry.name;
        walk(fullPath, childBase);
        continue;
      }

      if (!entry.name.endsWith('.js')) continue;
     
      // Now only leaf pages (not folder-named .js files)
      const segment = entry.name.replace(/\.js$/, '');
      let pathname = basePath? `${basePath}/${segment}`:segment;
      pathname = pathname.replace(/\[([^\/]+)\]/g, ':$1');
      // Clean slashes and force leading
      pathname = '/'+ pathname.replace(/\/+/g, '/').replace(/\/$/, '');
      pathname = pathname.replace('/index','');
      routes.push({ 
        pattern: new URLPattern({ pathname }), 
        load: () => import(fullPath), 
        params: pathname.includes(':'),
      });
    }
  }
  walk(pagesDir);
  return routes;
}

let ROUTES_CACHE = null;

export function getRoutes() {
  if (!ROUTES_CACHE) {
    ROUTES_CACHE = buildRoutes();
    console.log(`Auto-discovered ${ROUTES_CACHE.length} routes`);
  }
  return ROUTES_CACHE;
}

// Clear cache on --watch restart
process.on('SIGUSR2', () => {
  ROUTES_CACHE = null;
  console.log('Routes cache cleared – will re-scan pages/');
});