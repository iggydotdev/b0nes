// src/framework/utils/router/index.js
/**
 * b0nes Router - Structured, fast, maintainable
 * Zero regex soup. Maximum clarity.
 */

import { URLPattern } from '../utils/urlPattern.js';

/**
 * Route types (in priority order)
 */
const RouteType = {
    EXACT: 'exact',       // /client/b0nes.js
    EXTENSION: 'ext',     // *.css, *.js
    PREFIX: 'prefix',     // /assets/*
    PATTERN: 'pattern',   // /blog/:slug
    CATCHALL: 'catchall'  // /*
};

/**
 * Creates a structured router with priority-based matching
 */
export function createRouter() {
    // Route storage (organized by type for fast lookup)
    const routes = {
        exact: new Map(),           // path → handler
        extensions: new Map(),       // .css → handler
        prefixes: [],               // [{ prefix, handler }] (sorted by length)
        patterns: [],               // [{ pattern, handler }]
        catchall: null              // fallback handler
    };
    
    // Middleware stack
    const middleware = [];
    
    // Cache for matched routes (performance)
    const matchCache = new Map();
    const CACHE_SIZE = 500;

    /**
     * Add middleware
     */
    function use(fn) {
        if (typeof fn !== 'function') {
            throw new Error('Middleware must be a function');
        }
        middleware.push(fn);
        return this;
    }

    /**
     * Register an exact match route (fastest)
     * @example addExact('/client/b0nes.js', handler)
     */
    function addExact(path, handler) {
        if (routes.exact.has(path)) {
            console.warn(`[Router] Overwriting exact route: ${path}`);
        }
        routes.exact.set(path, handler);
        matchCache.clear(); // Invalidate cache
        return this;
    }

    /**
     * Register an extension-based route
     * @example addExtension('.css', handler)
     * @example addExtension(['.jpg', '.png'], handler)
     */
    function addExtension(ext, handler) {
        const extensions = Array.isArray(ext) ? ext : [ext];
        
        for (const e of extensions) {
            const normalized = e.startsWith('.') ? e : `.${e}`;
            if (routes.extensions.has(normalized)) {
                console.warn(`[Router] Overwriting extension route: ${normalized}`);
            }
            routes.extensions.set(normalized, handler);
        }
        
        matchCache.clear();
        return this;
    }

    /**
     * Register a prefix-based route
     * @example addPrefix('/assets/', handler)
     */
    function addPrefix(prefix, handler) {
        // Ensure trailing slash for consistency
        const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
        
        routes.prefixes.push({ prefix: normalizedPrefix, handler });
        
        // Sort by length (longest first for specificity)
        routes.prefixes.sort((a, b) => b.prefix.length - a.prefix.length);
        
        matchCache.clear();
        return this;
    }

    /**
     * Register a pattern-based route (URLPattern or regex)
     * @example addPattern('/blog/:slug', handler)
     * @example addPattern(/^\/api\/v\d+\//, handler)
     */
    function addPattern(pattern, handler) {
        let patternObj;
        
        if (pattern instanceof RegExp) {
            patternObj = pattern;
        } else if (typeof pattern === 'string') {
            patternObj = new URLPattern({ pathname: pattern });
        } else {
            throw new Error('Pattern must be string or RegExp');
        }
        
        routes.patterns.push({ pattern: patternObj, handler });
        matchCache.clear();
        return this;
    }


    // Add constraint checking
    
    /**
     * 
     * @example addPatternWithConstraints(
            '/blog/:year/:month/:day/:slug',
            serveBlogPost,
            {
                year: (val) => /^\d{4}$/.test(val),
                month: (val) => /^(0[1-9]|1[0-2])$/.test(val),
                day: (val) => /^(0[1-9]|[12]\d|3[01])$/.test(val)
            }
        );
     */
    
    function addPatternWithConstraints(pattern, handler, constraints) {
        router.addPattern(pattern, async (req, res, url) => {
        // Check constraints
        for (const [param, validator] of Object.entries(constraints)) {
            if (!validator(req.params[param])) {
                res.writeHead(400, { 'content-type': 'text/plain' });
                res.end(`Invalid ${param}`);
                return;
            }
        }
        
        return handler(req, res, url);
    });
}

    /**
     * Register catch-all fallback route
     * @example addCatchAll(handler)
     */
    function addCatchAll(handler) {
        if (routes.catchall) {
            console.warn('[Router] Overwriting catch-all route');
        }
        routes.catchall = handler;
        return this;
    }

    /**
     * Match a pathname to a handler
     * Returns: { handler, params, type, pattern }
     */
    function match(method, pathname) {
        // Check cache first
        const cacheKey = `${method}:${pathname}`;
        if (matchCache.has(cacheKey)) {
            return matchCache.get(cacheKey);
        }

        let result = null;

        // 1. EXACT MATCH (fastest - O(1))
        if (routes.exact.has(pathname)) {
            result = {
                handler: routes.exact.get(pathname),
                params: {},
                type: RouteType.EXACT,
                pattern: pathname
            };
        }

        // 2. EXTENSION MATCH (O(1))
        if (!result) {
            const ext = pathname.substring(pathname.lastIndexOf('.'));
            if (ext && routes.extensions.has(ext)) {
                result = {
                    handler: routes.extensions.get(ext),
                    params: {},
                    type: RouteType.EXTENSION,
                    pattern: `*${ext}`
                };
            }
        }

        // 3. PREFIX MATCH (O(n) but n is small, sorted by specificity)
        if (!result) {
            for (const { prefix, handler } of routes.prefixes) {
                if (pathname.startsWith(prefix)) {
                    result = {
                        handler,
                        params: {},
                        type: RouteType.PREFIX,
                        pattern: `${prefix}*`
                    };
                    break;
                }
            }
        }

        // 4. PATTERN MATCH (O(n) but necessary for dynamic routes)
        if (!result) {
            for (const { pattern, handler } of routes.patterns) {
                if (pattern instanceof RegExp) {
                    const match = pattern.exec(pathname);
                    if (match) {
                        result = {
                            handler,
                            params: match.groups || {},
                            type: RouteType.PATTERN,
                            pattern: pattern.toString()
                        };
                        break;
                    }
                } else {
                    // URLPattern
                    const match = pattern.exec({ pathname });
                    if (match) {
                        result = {
                            handler,
                            params: match.pathname.groups || {},
                            type: RouteType.PATTERN,
                            pattern: pattern.pathname
                        };
                        break;
                    }
                }
            }
        }

        // 5. CATCH-ALL (last resort)
        if (!result && routes.catchall) {
            result = {
                handler: routes.catchall,
                params: {},
                type: RouteType.CATCHALL,
                pattern: '/*'
            };
        }

        // Cache result (with size limit)
        if (result) {
            if (matchCache.size >= CACHE_SIZE) {
                // Simple LRU: delete oldest entry
                const firstKey = matchCache.keys().next().value;
                matchCache.delete(firstKey);
            }
            matchCache.set(cacheKey, result);
        }

        return result;
    }

    /**
     * Handle an incoming request
     */
    async function handle(req, res) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        try {
            // Run middleware
            for (const mw of middleware) {
                const result = await mw(req, res, url);
                if (result === true || res.headersSent) {
                    return; // Middleware handled it
                }
            }

            // Match route
            const matched = match(req.method, pathname);

            if (!matched) {
                if (!res.headersSent) {
                    res.writeHead(404, { 'content-type': 'text/plain' });
                    res.end('Not Found');
                }
                return;
            }

            // Attach params and query to request
            req.params = matched.params;
            req.query = Object.fromEntries(url.searchParams);
            req.routeInfo = {
                type: matched.type,
                pattern: matched.pattern
            };

            // Call handler
            await matched.handler(req, res, url);

            // Ensure response was sent
            if (!res.headersSent) {
                console.warn(
                    `[Router] Handler for ${pathname} did not send response`
                );
                res.writeHead(500, { 'content-type': 'text/plain' });
                res.end('Internal Server Error');
            }

        } catch (error) {
            console.error(`[Router] Error handling ${pathname}:`, error);
            
            if (!res.headersSent) {
                res.writeHead(500, { 'content-type': 'text/plain' });
                res.end('Internal Server Error');
            }
        }
    }

    /**
     * Print routing table (debugging)
     */
    function printRoutes() {
        console.log('\n📍 b0nes Router - Registered Routes\n');
        console.log('═'.repeat(70));
        
        // Exact routes
        if (routes.exact.size > 0) {
            console.log('\n🎯 EXACT MATCHES (Priority 1):');
            for (const [path] of routes.exact) {
                console.log(`   ${path}`);
            }
        }
        
        // Extension routes
        if (routes.extensions.size > 0) {
            console.log('\n📄 EXTENSION MATCHES (Priority 2):');
            for (const [ext] of routes.extensions) {
                console.log(`   *${ext}`);
            }
        }
        
        // Prefix routes
        if (routes.prefixes.length > 0) {
            console.log('\n📁 PREFIX MATCHES (Priority 3):');
            for (const { prefix } of routes.prefixes) {
                console.log(`   ${prefix}*`);
            }
        }
        
        // Pattern routes
        if (routes.patterns.length > 0) {
            console.log('\n🔍 PATTERN MATCHES (Priority 4):');
            for (const { pattern } of routes.patterns) {
                const display = pattern instanceof RegExp 
                    ? pattern.toString() 
                    : pattern.pathname || pattern;
                console.log(`   ${display}`);
            }
        }
        
        // Catch-all
        if (routes.catchall) {
            console.log('\n🌐 CATCH-ALL (Priority 5):');
            console.log('   /* (all unmatched routes)');
        }
        
        console.log('\n═'.repeat(70));
        console.log(`Total routes: ${getTotalRoutes()}`);
        console.log(`Cache size: ${matchCache.size}/${CACHE_SIZE}\n`);
    }

    /**
     * Get total number of registered routes
     */
    function getTotalRoutes() {
        return routes.exact.size + 
               routes.extensions.size + 
               routes.prefixes.length + 
               routes.patterns.length + 
               (routes.catchall ? 1 : 0);
    }

    /**
     * Clear route cache (useful for hot reload)
     */
    function clearCache() {
        matchCache.clear();
        console.log('[Router] Cache cleared');
    }

    /**
     * Get cache statistics
     */
    function getCacheStats() {
        return {
            size: matchCache.size,
            maxSize: CACHE_SIZE,
            hitRate: matchCache.size > 0 ? '~' : 'N/A'
        };
    }

    // Public API
    return {
        // Registration
        use,
        addExact,
        addExtension,
        addPrefix,
        addPattern,
        addPatternWithConstraints,
        addCatchAll,
        
        // Request handling
        match,
        handle,
        
        // Utilities
        printRoutes,
        getTotalRoutes,
        clearCache,
        getCacheStats
    };
}

/**
 * Create router with default logging middleware
 */
export function createRouterWithDefaults() {
    const router = createRouter();
    
    router.use(async (req, res, url) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${url.pathname}`);
        return false; // Continue to next handler
    });
    
    return router;
}