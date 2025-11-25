import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

// Local imports
import { routes } from '../../routes.js';
import { generateRoute } from './generateRoute.js';
import { generateDynamicRoute } from './generateDynamicRoute.js';

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
                name: route.name,
                pathname: route.pattern?.pathname,
                meta: route.meta,
                components: typeof route.components === 'function' 
                    ? route.components.toString()
                    : JSON.stringify(route.components)
            });
            
            return crypto.createHash('md5').update(data).digest('hex');
        } catch (error) {
            return null;
        }
    };
    
    const hasChanged = (route) => {
        const hash = hashRoute(route);
        if (!hash) return true;
        
        const routeKey = route.pattern?.pathname || route.name;
        const cached = cache.routes[routeKey];
        
        if (!cached) return true;
        
        return cached.hash !== hash;
    };
    
    const update = (route, result) => {
        const hash = hashRoute(route);
        if (!hash) return;
        
        const routeKey = route.pattern?.pathname || route.name;
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
 * Safe route builder with error recovery
 */
async function safeBuildRoute(route, buildCache, outputDir, options) {
    const { verbose, continueOnError } = options;
    
    try {
        // Check cache
        if (buildCache && !buildCache.hasChanged(route)) {
            const routeKey = route.pattern?.pathname || route.name;
            const cached = buildCache.getCache().routes[routeKey];
            
            if (verbose) {
                console.log(`⏭️  ${route.name} (cached)`);
            }
            
            return {
                success: true,
                skipped: true,
                route,
                result: cached.result
            };
        }
        
        // Dynamic route with external data
        if (route.pattern.pathname.includes(':')) {
            if (!route.externalData) {
                throw new Error(
                    `Dynamic route "${route.name}" missing externalData function`
                );
            }
            
            let data;
            try {
                data = await route.externalData();
            } catch (error) {
                throw new Error(
                    `Failed to fetch external data for "${route.name}": ${error.message}`
                );
            }
            
            const dataArray = Array.isArray(data) ? data : [data];
            const results = await generateDynamicRoute(route, dataArray, outputDir);
            
            if (results.length === 0) {
                throw new Error(`Dynamic route "${route.name}" generated no output`);
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
        // Static route
        else {
            const result = await generateRoute(route, outputDir);
            
            if (!result) {
                throw new Error(`Route "${route.name}" generated no output`);
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
            route: route.name,
            pathname: route.pattern?.pathname,
            error: error.message,
            stack: error.stack,
            timestamp: Date.now()
        };
        
        console.error(`❌ ${route.name} failed:`, error.message);
        
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
 * @param {string} outputDir - Output directory
 * @param {Object} options - Build options
 * @param {boolean} options.cache - Enable build cache (default: true)
 * @param {boolean} options.clean - Clean output before build (default: true)
 * @param {boolean} options.parallel - Enable parallel builds (default: false)
 * @param {boolean} options.verbose - Verbose logging (default: false)
 * @param {boolean} options.continueOnError - Continue build on error (default: true)
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
        onError = null
    } = options;
    
    const startTime = performance.now();
    const generated = [];
    const errors = [];
    const skipped = [];
    
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
    
    // Build routes
    const routeTasks = routes.map(route => async () => {
        const result = await safeBuildRoute(
            route, 
            buildCache, 
            outputDir, 
            { verbose, continueOnError }
        );
        
        if (result.success) {
            if (result.skipped) {
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
    console.log(`✅ Generated: ${generated.length} route(s)`);
    console.log(`⏭️  Skipped:   ${skipped.length} route(s) (cached)`);
    console.log(`❌ Errors:    ${errors.length} route(s)`);
    console.log(`⏱️  Duration:  ${duration}s`);
    
    if (buildCache) {
        const stats = buildCache.getStats();
        console.log(`💾 Cache:     ${stats.totalRoutes} route(s), ${(stats.cacheSize / 1024).toFixed(2)} KB`);
    }
    
    console.log('─'.repeat(50));
    
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