// src/framework/utils/build/ssg.js
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fixed imports - use the auto-routes system
import { getRoutes, invalidateRoutes } from '../../server/handlers/autoRoutes.js';
import { generateRoute } from './generateRoute.js';

import { copyColocatedAssets } from './colocatedAssets.js';
import { generateSSRFallback } from './ssrFallback.js';
import { copyFrameworkRuntime } from './copyFrameworkRuntime.js';
import { copyComponentBehaviors } from './copyComponentBehaviors.js';
import { generateCompiledTemplates } from './compileTemplates.js';
import { createPageBundle } from './bundle.js';
import { compose } from '../../core/compose.js';


/**
 * Check if a route should be rendered as SSG or SSR
 * @param {Object} page - The loaded page module
 * @param {Object} route - The route object
 * @returns {boolean} - true if should be SSG, false if SSR
 */
export const shouldBeStatic = (page, route) => {
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
export async function safeBuildRoute(route, outputDir, options) {
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
            
            // Convert components function to proper format for dynamic route
            const routeWithComponents = {
                ...route,
                pattern: route.pattern,
                meta: page.meta || {},
                components: (data) => {
                    const comps = page.components || page.default || [];
                    return typeof comps === 'function' ? comps(data) : comps;
                }
            };
            
            const results = await generateRoute(routeWithComponents, outputDir, dataArray);
            
            if (results.length === 0) {
                throw new Error(`Dynamic route "${route.pattern.pathname}" generated no output`);
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
            // Collect dependencies during composition
            const dependencies = new Set();
            
            // Convert auto-route format to generateRoute format
            const staticRoute = {
                pattern: route.pattern,
                components: page.components || page.default || [],
                meta: page.meta || {}
            };
            
            // Create a special context for composition that includes our dependency tracker
            const context = { route, dependencies };
            
            // Compose components to HTML
            const content = compose(staticRoute.components, context);
            
            // Create production bundle if requested
            let bundlePath = null;
            if (options.production && staticRoute.meta.interactive !== false) {
                const pageName = route.pattern.pathname === '/' ? 'index' : route.pattern.pathname.substring(1).replace(/\//g, '-');
                bundlePath = await createPageBundle(pageName, dependencies, outputDir, { verbose });
            }

            // Sync meta with bundlePath
            const finalMeta = {
                ...staticRoute.meta,
                bundlePath: bundlePath || staticRoute.meta.bundlePath
            };

            const result = await generateRoute({ ...staticRoute, meta: finalMeta, components: staticRoute.components }, outputDir);
            
            if (!result) {
                throw new Error(`Route "${route.pattern.pathname}" generated no output`);
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
 * Build static site with isolated route workers and error reporting
 * Now supports hybrid SSG/SSR rendering!
 * 
 * @param {string} outputDir - Output directory
 * @param {Object} options - Build options
 * @param {boolean} options.cache - Reserved for compatibility; routes always rebuild
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
        clean = true,
        parallel = false,
        verbose = false,
        continueOnError = true,
        generateSSRStubs = true,
        production = false,
        onError = null
    } = options;
    
    const startTime = performance.now();
    const generated = [];
    const errors = [];
    const skipped = [];
    const ssrRoutes = [];
    
    // Routes always rebuild: arbitrary module, environment and remote-data
    // dependencies cannot safely be invalidated by a pathname cache.
    console.log('🦴 b0nes SSG Build Starting...\n');
    
        
    // ============================================
    // STEP 1: Clean output directory
    // ============================================
    if (clean) {
        if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
        }
    }
    
    // ============================================
    // STEP 2: Ensure output directory exists
    // ============================================
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // ============================================
    // STEP 3: 🎯 COMPILE SPA TEMPLATES (RECURSIVE)
    // ============================================
    console.log('📦 Compiling SPA templates...\n');
    try {
        const pagesDir = path.resolve(process.cwd(), 'src/pages');
        
        /**
         * Recursively find all 'templates' directories
         */
        const findTemplateDirs = (dir) => {
            let results = [];
            if (!fs.existsSync(dir)) return results;
            
            const list = fs.readdirSync(dir);
            for (const file of list) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                
                if (stat && stat.isDirectory()) {
                    if (file === 'templates') {
                        results.push(dir);
                    } else {
                        results = results.concat(findTemplateDirs(fullPath));
                    }
                }
            }
            return results;
        };

        const templateDirs = findTemplateDirs(pagesDir);
        
        if (templateDirs.length === 0) {
            console.log('   ℹ️  No SPA templates found to compile.\n');
        } else {
            for (const spaDir of templateDirs) {
                const relativePath = path.relative(pagesDir, spaDir);
                // Output to public/path/to/spa/templates
                const compiledOutputPath = path.join(outputDir, relativePath, 'templates');
                
                if (verbose) {
                    console.log(`   📂 Found SPA templates in: ${relativePath}`);
                }

                await generateCompiledTemplates(spaDir, compiledOutputPath, { 
                    verbose, 
                    mode: 'individual' 
                });
            }
            console.log(`✅ ${templateDirs.length} SPA template directory(s) compiled!\n`);
        }
    } catch (error) {
        console.error('❌ Failed to compile SPA templates:', error.message);
        if (!continueOnError) throw error;
    }

    // ============================================
    // STEP 4: Get routes from auto-discovery
    // ============================================
    invalidateRoutes();
    const routes = getRoutes();
    
    if (routes.length === 0) {
        console.warn('⚠️  No routes found. Check your pages/ directory.');
        return { success: true, generated: [],
            skipped: [],
            ssrRoutes: [],
            errors: [],
            duration: 0 };
    }
    
    console.log(`📦 Found ${routes.length} route(s)\n`);
    

    // ============================================
    // STEP 5: Build routes (parallel or sequential)
    // ============================================
    // Build routes (co-located assets are copied per-route in safeBuildRoute)
    // Execute builds
    if (routes.length > 0) {
        const cpuCount = os.cpus().length;
        const workerCount = parallel ? Math.min(cpuCount, routes.length) : 1;
        console.log(`🚀 Using ${workerCount} worker thread(s) for fresh route rendering\n`);

        const runWorker = (index) => {
            return new Promise((resolve, reject) => {
                const route = routes[index];
                
                // Sanitize route object for worker (remove functions)
                const workerRoute = {
                    pattern: { pathname: route.pattern.pathname },
                    params: route.params,
                    filePath: route.filePath,
                    meta: route.meta || {}
                };

                const worker = new Worker(path.join(__dirname, 'renderWorker.js'), {
                    workerData: { route: workerRoute, outputDir, options: { verbose, continueOnError: true, production } }
                });

                let reported = false;
                worker.on('message', (result) => {
                    reported = true;
                    if (result.success) {
                        if (result.ssr) {
                            ssrRoutes.push({
                                pathname: result.route.pattern.pathname,
                                reason: result.reason,
                                route: result.route
                            });
                        } else if (result.results) {
                            result.results.forEach(r => generated.push(r));
                        } else {
                            generated.push(result.result);
                        }
                    } else {
                        errors.push(result);
                        if (typeof onError === 'function') {
                            try { onError(result, route); }
                            catch (error) { console.error('[Build] Error in onError callback:', error); }
                        }
                    }
                    // Route modules may leave timers open; the render is complete.
                    worker.terminate().then(resolve, reject);
                });

                worker.on('error', (err) => {
                    reported = true;
                    console.error(`❌ Worker error for ${route.pattern.pathname}:`, err);
                    errors.push({ success: false, route: route.pattern.pathname, error: err.message });
                    resolve(); // Don't crash the whole build
                });

                worker.on('exit', (code) => {
                    if (!reported) {
                        errors.push({ success: false, route: route.pattern.pathname,
                            error: `Worker exited without a build result (code ${code})` });
                        resolve();
                    }
                });
            });
        };

        // Simple worker pool
        const queue = routes.map((_, i) => i);
        const workers = Array(workerCount).fill(null).map(async () => {
            while (queue.length > 0) {
                const index = queue.shift();
                await runWorker(index);
                if (!continueOnError && errors.length) throw new Error(errors.at(-1).error);
            }
        });

        await Promise.all(workers);

    }

    // ============================================
    // STEP 6: Copy framework runtime files
    // ============================================
    console.log('📋 Copying framework runtime files...\n');
    await copyFrameworkRuntime(outputDir, { verbose });
    
    // ============================================
    // STEP 7: Copy component client behaviors
    // ============================================
    console.log('📋 Copying component client behaviors...\n');
    await copyComponentBehaviors(outputDir, { verbose });
    
    // ============================================
    // STEP 8: Generate SSR fallback pages (if needed)
    // ============================================
    if (generateSSRStubs && ssrRoutes.length > 0) {
        console.log('\n⚡ Generating SSR fallback pages...\n');
        for (const ssrRoute of ssrRoutes) {
            await generateSSRFallback(ssrRoute.route, outputDir, { verbose });
        }
    }
    
    // ============================================
    // DONE! Print summary
    // ============================================
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
        cacheStats: null
    };
};

/** Remove caches written by older versions. Kept for CLI/API compatibility. */
export const clearBuildCache = () => {
    fs.rmSync(path.join('.b0nes-cache', 'build-cache.json'), { force: true });
};

/** Persistent HTML caching is disabled until inputs can be reliably tracked. */
export const getBuildCacheStats = () => ({ totalRoutes: 0, cacheSize: 0 });
