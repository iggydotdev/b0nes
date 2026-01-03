// src/framework/utils/build/ssrFallback.js
import fs from 'node:fs';
import path from 'node:path';

/**
 * Generate a fallback HTML page for SSR routes
 * This creates a loading/placeholder page that gets replaced by the server at runtime
 * 
 * Strategy Options:
 * 1. Loading spinner - Shows loading state until JS hydrates
 * 2. 404-like page - Tells user this page needs server
 * 3. Meta redirect - Redirects to a proxy/server endpoint
 * 4. Empty page - Just a shell that server will populate
 * 
 * @param {Object} route - The route object
 * @param {string} outputDir - Output directory
 * @param {Object} options - Generation options
 */
export const generateSSRFallback = async (route, outputDir, options = {}) => {
    const {
        verbose = false,
        strategy = 'loading', // 'loading', 'redirect', 'empty', '404'
        serverUrl = 'http://localhost:3000'
    } = options;
    
    const pathname = route.pattern?.pathname || '/unknown';
    
    // Determine output path
    // For dynamic routes like /blog/[slug], create a directory structure
    const outputPath = pathname.includes('[') 
        ? path.join(outputDir, pathname.replace(/\[.*?\]/g, '_dynamic_'))
        : path.join(outputDir, pathname);
    
    const htmlPath = path.join(outputPath, 'index.html');
    
    // Ensure directory exists
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }
    
    // Load page meta if available
    let meta = { title: 'Loading...', description: '' };
    try {
        const page = await route.load();
        meta = page.meta || meta;
    } catch (error) {
        // Ignore - use defaults
    }
    
    // Generate HTML based on strategy
    const html = generateFallbackHTML(route, meta, { strategy, serverUrl });
    
    // Write to file
    fs.writeFileSync(htmlPath, html, 'utf8');
    
    if (verbose) {
        console.log(`   ✅ Generated SSR fallback: ${pathname} (${strategy})`);
    }
    
    return {
        pathname,
        outputPath: htmlPath,
        strategy
    };
};

/**
 * Generate the actual HTML content for fallback pages
 */
const generateFallbackHTML = (route, meta, options) => {
    const { strategy, serverUrl } = options;
    const pathname = route.pattern?.pathname || '/';
    
    // Common HTML head
    const head = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${meta.title || 'Loading...'}</title>
    ${meta.description ? `<meta name="description" content="${meta.description}">` : ''}
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            max-width: 600px;
        }
        .spinner {
            width: 50px;
            height: 50px;
            margin: 2rem auto;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        h1 { font-size: 2rem; margin-bottom: 1rem; }
        p { font-size: 1.1rem; opacity: 0.9; line-height: 1.6; }
        .error { background: #e74c3c; }
        code {
            background: rgba(0,0,0,0.2);
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
    </style>`;
    
    switch (strategy) {
        case 'loading':
            return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head}
    <script>
        // Auto-refresh when server is available
        // This works for development - production should use proper SSR
        (function checkServer() {
            fetch(window.location.href)
                .then(res => {
                    if (res.ok && res.headers.get('x-rendered-by') === 'b0nes-ssr') {
                        window.location.reload();
                    } else {
                        setTimeout(checkServer, 2000);
                    }
                })
                .catch(() => setTimeout(checkServer, 2000));
        })();
    </script>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h1>🦴 Loading...</h1>
        <p>This page requires server-side rendering.</p>
        <p>Waiting for the server to be available...</p>
    </div>
</body>
</html>`;
        
        case 'redirect':
            return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head}
    <meta http-equiv="refresh" content="0; url=${serverUrl}${pathname}">
    <script>
        // Fallback redirect if meta refresh fails
        window.location.href = '${serverUrl}${pathname}';
    </script>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h1>Redirecting...</h1>
        <p>This page needs to be served dynamically.</p>
        <p>If you're not redirected, <a href="${serverUrl}${pathname}" style="color: white;">click here</a>.</p>
    </div>
</body>
</html>`;
        
        case '404':
            return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head}
</head>
<body class="error">
    <div class="container">
        <h1>⚡ Server-Side Route</h1>
        <p>The page <code>${pathname}</code> is a server-side rendered route.</p>
        <p>It cannot be accessed as a static file.</p>
        <p>Please run <code>npm run dev</code> or deploy to a server that supports SSR.</p>
    </div>
</body>
</html>`;
        
        case 'empty':
        default:
            return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head}
</head>
<body>
    <div id="app">
        <!-- SSR content will be rendered here -->
        <div class="container">
            <div class="spinner"></div>
            <p>Loading dynamic content...</p>
        </div>
    </div>
    <script>
        // This page needs to be served by b0nes SSR
        console.log('[b0nes] SSR page - waiting for server render');
    </script>
</body>
</html>`;
    }
};

/**
 * Generate fallback pages for all SSR routes at once
 * Useful for batch processing
 */
export const generateAllSSRFallbacks = async (ssrRoutes, outputDir, options = {}) => {
    const results = [];
    
    for (const routeInfo of ssrRoutes) {
        try {
            const result = await generateSSRFallback(routeInfo.route, outputDir, options);
            results.push(result);
        } catch (error) {
            console.error(`Failed to generate SSR fallback for ${routeInfo.pathname}:`, error.message);
            results.push({
                pathname: routeInfo.pathname,
                error: error.message
            });
        }
    }
    
    return results;
};

/**
 * Create a manifest file listing all SSR routes
 * Useful for deployment and server configuration
 */
export const createSSRManifest = (ssrRoutes, outputDir) => {
    const manifest = {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        ssrRoutes: ssrRoutes.map(r => ({
            pathname: r.pathname,
            reason: r.reason,
            isDynamic: r.pathname.includes('[')
        }))
    };
    
    const manifestPath = path.join(outputDir, 'ssr-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    
    console.log(`✅ Created SSR manifest: ${manifestPath}`);
    
    return manifestPath;
};