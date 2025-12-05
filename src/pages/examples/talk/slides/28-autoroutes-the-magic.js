export default  {
          title: 'Auto-Routes: The Magic',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-purple-400">How Does It Work?</h2>
              <pre class="bg-gray-800 p-4 rounded-lg text-cyan-300 text-sm md:text-base font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl overflow-auto"><code>// autoRoutes.js - walks your pages/ directory
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
}</code></pre>
              <p class="mt-6 text-xl text-gray-300 text-center max-w-3xl">No magic. Just Node fs + URLPattern. <span class="text-green-400 font-bold">That's it.</span></p>
            </div>
          `
        };