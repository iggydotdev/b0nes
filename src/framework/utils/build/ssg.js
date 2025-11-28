// src/framework/utils/build/ssg.js
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

// Fixed imports - use the auto-routes system
import { getRoutes } from '../server/autoRoutes.js';
import { generateRoute } from './generateRoute.js';
import { generateDynamicRoute } from './generateDynamicRoute.js';
import { copyColocatedAssets } from './colocatedAssets.js';
import { generateSSRFallback } from './ssrFallback.js';
import { copyFrameworkRuntime } from './copyFrameworkRuntime.js';

/**
 * Build cache to skip unchanged routes (functional style with closures)
 */
const createBuildCache = (cacheDir = '.b0nes-cache') => {
    const cacheFile = path.join(cacheDir, 'build-cache.json');
    
    const loadCache = () => {
        try {
            if (fs.existsSync(cacheFile)) {
                const data = fs.readFileSync(cacheFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.warn('[Cache] Failed to load cache:', error.message);
        }
        return { routes: {}, version: '1.0' };
    };
    
    let cache = loadCache();
    
    const saveCache = () => {
        try {
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir, { recursive: true });
            }
            fs.writeFileSync(
                cacheFile, 
                JSON.stringify(cache, null, 2), 
                'utf8'
            );
        } catch (error) {
            console.error('[Cache] Failed to save cache:', error.message);
        }
    };
    
    const hashRoute = (route) => {
        try {
            const data = JSON.stringify({
                pathname: route.pattern?.pathname,
                // Hash the actual page module path
                modulePath: route.load?.toString()
            });
            
            return crypto.createHash('md5').update(data).digest('hex');
        } catch (error) {
            return null;
        }
    };
    
    const hasChanged = (route) => {
        const hash = hashRoute(route);
        if (!hash) return true;
        
        const routeKey = route.pattern?.pathname || 'unknown';
        const cached = cache.routes[routeKey];
        
        if (!cached) return true;
        
        return cached.hash !== hash;
    };
    
    const update = (route, result) => {
        const hash = hashRoute(route);
        if (!hash) return;
        
        const routeKey = route.pattern?.pathname || 'unknown';
        cache.routes[routeKey] = {
            hash,
            lastBuild: Date.now(),
            result
        };
    };
    
    const clear = () => {
        cache = { routes: {}, version: '1.0' };
        try {
            if (fs.existsSync(cacheFile)) {
                fs.unlinkSync(cacheFile);
            }
        } catch (error) {
            console.error('[Cache] Failed to clear cache:', error.message);
        }
    };
    
    const getStats = () => {
        return {
            totalRoutes: Object.keys(cache.routes).length,
            cacheSize: fs.existsSync(cacheFile) 
                ? fs.statSync(cacheFile).size 
                : 0
        };
    };
    
    const getCache = () => cache;
    
    return { 
        hasChanged, 
        update, 
        clear, 
        getStats, 
        save: saveCache,
        getCache 
    };
};

/**
 * Check if a route should be rendered as SSG or SSR
 * @param {Object} page - The loaded page module
 * @param {Object} route - The route object
 * @returns {boolean} - true if should be SSG, false if SSR
 */
const shouldBeStatic = (page, route) => {
    // Check for explicit render mode in meta
    if (page.meta?.render === 'ssr') {
        return false; // Force SSR
    }
    
    if (page.meta?.render === 'ssg') {
        return true; // Force SSG
    }
    
    // Dynamic routes (with params like [slug]) need special handling
    if (route.params) {
        // If it has externalData, it can be pre-rendered (SSG)
        if (page.externalData && typeof page.externalData === 'function') {
            return true; // SSG with pre-fetched data
        }
        
        // No externalData? Must be SSR (needs runtime data)
        return false; // SSR - will fetch data at runtime
    }
    
    // Static routes: if components is a function, it's SSR (needs runtime data)
    // If it's a static array, it's SSG
    const components = page.components || page.default || [];
    
    if (typeof components === 'function') {
        return false; // SSR - needs runtime data
    }
    
    return true; // SSG - static components
};

/**
 * Safe route builder with error recovery and hybrid rendering support
 */
/**
 * Safe route builder with error recovery and hybrid rendering support
 * Now also copies co-located assets!
 */
async function safeBuildRoute(route, buildCache, outputDir, options) {
    const { verbose, continueOnError } = options;
    
    try {
        // Load the page module
        const page = await route.load();
        
        // Copy co-located assets FIRST (CSS, images, etc. in same folder as page)
        if (route.filePath) {
            const assetStats = copyColocatedAssets(route.filePath, outputDir, { verbose });
            if (verbose && assetStats.filesCopied > 0) {
                console.log(`   📎 Copied ${assetStats.filesCopied} co-located asset(s) for ${route.pattern.pathname}`);
            }
        }
        
        // Check if this route should be static or dynamic
        if (!shouldBeStatic(page, route)) {
            if (verbose) {
                const reason = route.params 
                    ? 'Dynamic route without externalData (runtime SSR)'
                    : 'Components function detected (SSR)';
                console.log(`⚡ ${route.pattern.pathname} (${reason})`);
            }
            return {
                success: true,
                skipped: true,
                ssr: true,
                route,
                reason: route.params 
                    ? 'Dynamic route - SSR (no externalData)'
                    : 'SSR - components function'
            };
        }
        
        // Check cache
        if (buildCache && !buildCache.hasChanged(route)) {
            const routeKey = route.pattern?.pathname || 'unknown';
            const cached = buildCache.getCache().routes[routeKey];
            
            if (verbose) {
                console.log(`⏭️  ${route.pattern.pathname} (cached)`);
            }
            
            return {
                success: true,
                skipped: true,
                route,
                result: cached.result
            };
        }
        
        // Dynamic route with externalData (SSG with pre-fetched data)
        if (route.params && page.externalData) {
            let data;
            try {
                data = await page.externalData();
            } catch (error) {
                throw new Error(
                    `Failed to fetch external data for "${route.pattern.pathname}": ${error.message}`
                );
            }
            
            const dataArray = Array.isArray(data) ? data : [data];
            
            // Convert components function to proper format for generateDynamicRoute
            const routeWithComponents = {
                ...route,
                pattern: route.pattern,
                meta: page.meta || {},
                components: (data) => {
                    const comps = page.components;
                    return typeof comps === 'function' ? comps(data) : comps;
                }
            };
            
            const results = await generateDynamicRoute(routeWithComponents, dataArray, outputDir);
            
            if (results.length === 0) {
                throw new Error(`Dynamic route "${route.pattern.pathname}" generated no output`);
            }
            
            // Update cache for first result (representative)
            if (buildCache && results.length > 0) {
                buildCache.update(route, results[0]);
            }
            
            return {
                success: true,
                skipped: false,
                route,
                results
            };
        } 
        // Static route with static components array
        else {
            // Convert auto-route format to generateRoute format
            const staticRoute = {
                pattern: route.pattern,
                components: page.components || page.default || [],
                meta: page.meta || {}
            };
            
            const result = await generateRoute(staticRoute, outputDir);
            
            if (!result) {
                throw new Error(`Route "${route.pattern.pathname}" generated no output`);
            }
            
            if (buildCache) {
                buildCache.update(route, result);
            }
            
            return {
                success: true,
                skipped: false,
                route,
                result
            };
        }
        
    } catch (error) {
        // Enhanced error information
        const errorInfo = {
            success: false,
            route: route.pattern?.pathname || 'unknown',
            error: error.message,
            stack: error.stack,
            timestamp: Date.now()
        };
        
        console.error(`❌ ${route.pattern?.pathname || 'unknown'} failed:`, error.message);
        
        if (verbose) {
            console.error('   Stack:', error.stack);
        }
        
        // Continue or abort?
        if (!continueOnError) {
            throw error; // Abort build
        }
        
        return errorInfo;
    }
}

/**
 * Build static site with error boundaries and intelligent caching
 * Now supports hybrid SSG/SSR rendering!
 * 
 * @param {string} outputDir - Output directory
 * @param {Object} options - Build options
 * @param {boolean} options.cache - Enable build cache (default: true)
 * @param {boolean} options.clean - Clean output before build (default: true)
 * @param {boolean} options.parallel - Enable parallel builds (default: false)
 * @param {boolean} options.verbose - Verbose logging (default: false)
 * @param {boolean} options.continueOnError - Continue build on error (default: true)
 * @param {boolean} options.generateSSRStubs - Generate fallback pages for SSR routes (default: true)
 * @param {Function} options.onError - Error callback (error, route) => void
 * @returns {Object} Build result with stats
 */
export const build = async (outputDir = 'public', options = {}) => {
    const {
        cache: enableCache = true,
        clean = true,
        parallel = false,
        verbose = false,
        continueOnError = true,
        generateSSRStubs = true,
        onError = null
    } = options;
    
    const startTime = performance.now();
    const generated = [];
    const errors = [];
    const skipped = [];
    const ssrRoutes = [];
    
    // Initialize cache
    const buildCache = enableCache ? createBuildCache() : null;
    
    console.log('🦴 b0nes SSG Build Starting...\n');
    
    if (verbose && buildCache) {
        const stats = buildCache.getStats();
        console.log(`📊 Cache: ${stats.totalRoutes} routes cached, ${(stats.cacheSize / 1024).toFixed(2)} KB\n`);
    }
    
    // Clean output directory if requested
    if (clean) {
        try {
            if (fs.existsSync(outputDir)) {
                fs.rmSync(outputDir, { recursive: true, force: true });
                if (verbose) console.log(`🗑️  Cleaned ${outputDir}\n`);
            }
        } catch (error) {
            console.error('❌ Failed to clean output directory:', error.message);
            if (!continueOnError) throw error;
        }
    }
    
    // Ensure output directory exists
    try {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
    } catch (error) {
        console.error('❌ Failed to create output directory:', error.message);
        throw error; // Can't continue without output dir
    }
    
     // Copy framework runtime files
    console.log('📋 Copying framework runtime files...\n');
    try {
        await copyFrameworkRuntime(outputDir, { verbose });
    } catch (error) {
        console.error('❌ Build failed during runtime file copy');
        if (!continueOnError) throw error;
        errors.push({
            route: 'framework-runtime',
            error: 'Failed to copy runtime files'
        });
    }


    // Get routes from auto-discovery
    const routes = getRoutes();
    
    if (routes.length === 0) {
        console.warn('⚠️  No routes found. Check your pages/ directory.');
        return {
            success: true,
            generated: [],
            skipped: [],
            ssrRoutes: [],
            errors: [],
            duration: 0
        };
    }
    
    console.log(`📦 Found ${routes.length} route(s)\n`);
    
    // Build routes (co-located assets are copied per-route in safeBuildRoute)
    const routeTasks = routes.map(route => async () => {
        const result = await safeBuildRoute(
            route, 
            buildCache, 
            outputDir, 
            { verbose, continueOnError }
        );
        
        if (result.success) {
            if (result.ssr) {
                // Route is SSR - skip in build, handle at runtime
                ssrRoutes.push({
                    pathname: route.pattern.pathname,
                    reason: result.reason,
                    route: route
                });
            } else if (result.skipped) {
                skipped.push(result);
            } else if (result.results) {
                // Dynamic route with multiple results
                result.results.forEach(r => generated.push(r));
            } else {
                generated.push(result.result);
            }
        } else {
            errors.push(result);
            
            // Call error callback if provided
            if (onError && typeof onError === 'function') {
                try {
                    onError(result, route);
                } catch (callbackError) {
                    console.error('[Build] Error in onError callback:', callbackError);
                }
            }
        }
        
        return result;
    });
    
    // Execute builds (parallel or sequential)
    if (parallel && routes.length > 5) {
        console.log('⚡ Building routes in parallel...\n');
        try {
            await Promise.all(routeTasks.map(task => task()));
        } catch (error) {
            if (!continueOnError) {
                console.error('❌ Build aborted due to error');
                throw error;
            }
        }
    } else {
        for (const task of routeTasks) {
            try {
                await task();
            } catch (error) {
                if (!continueOnError) {
                    console.error('❌ Build aborted due to error');
                    throw error;
                }
            }
        }
    }
    
    // Generate SSR fallback pages (if enabled)
    if (generateSSRStubs && ssrRoutes.length > 0) {
        console.log('\n⚡ Generating SSR fallback pages...\n');
        try {
            for (const ssrRoute of ssrRoutes) {
                await generateSSRFallback(ssrRoute.route, outputDir, { verbose });
            }
            if (verbose) {
                console.log(`✅ Generated ${ssrRoutes.length} SSR fallback page(s)\n`);
            }
        } catch (error) {
            console.error('❌ Failed to generate SSR fallbacks:', error.message);
            if (!continueOnError) throw error;
        }
    }
    
    // Save cache
    if (buildCache) {
        try {
            buildCache.save();
        } catch (error) {
            console.error('⚠️  Failed to save cache:', error.message);
        }
    }
    
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Print summary
    console.log('\n📊 Build Summary');
    console.log('─'.repeat(50));
    console.log(`✅ Generated (SSG): ${generated.length} route(s)`);
    console.log(`⏭️  Skipped:        ${skipped.length} route(s) (cached)`);
    console.log(`⚡ SSR Routes:      ${ssrRoutes.length} route(s) (runtime)`);
    console.log(`❌ Errors:          ${errors.length} route(s)`);
    console.log(`⏱️  Duration:        ${duration}s`);
    
    if (buildCache) {
        const stats = buildCache.getStats();
        console.log(`💾 Cache:           ${stats.totalRoutes} route(s), ${(stats.cacheSize / 1024).toFixed(2)} KB`);
    }
    
    console.log('─'.repeat(50));
    
    // Show SSR routes
    if (ssrRoutes.length > 0) {
        console.log('\n⚡ SSR Routes (will be rendered at runtime):');
        ssrRoutes.forEach(r => {
            console.log(`   • ${r.pathname} - ${r.reason}`);
        });
        console.log('');
    }
    
    // Detailed error reporting
    if (errors.length > 0) {
        console.log('\n❌ Failed Routes:');
        errors.forEach(error => {
            console.log(`   • ${error.route}: ${error.error}`);
        });
        console.log('');
    }
    
    if (errors.length > 0) {
        console.log(`\n⚠️  Build completed with ${errors.length} error(s)\n`);
    } else {
        console.log('\n✅ Build completed successfully!\n');
    }
    
    return {
        success: errors.length === 0,
        generated,
        skipped,
        ssrRoutes,
        errors,
        duration: parseFloat(duration),
        cacheStats: buildCache ? buildCache.getStats() : null
    };
};

/**
 * Clear build cache
 */
export const clearBuildCache = () => {
    const cache = createBuildCache();
    cache.clear();
    console.log('🗑️  Build cache cleared');
};

/**
 * Get build cache stats
 */
export const getBuildCacheStats = () => {
    const cache = createBuildCache();
    return cache.getStats();
};