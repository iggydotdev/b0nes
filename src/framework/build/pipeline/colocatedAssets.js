// src/framework/utils/build/colocatedAssets.js
import fs from 'node:fs';
import path from 'node:path';

/**
 * Copy co-located assets for a specific page
 * 
 * For a page at src/pages/examples/talk/index.js:
 * - Copies custom.css → public/examples/talk/custom.css
 * - Copies script.js → public/examples/talk/script.js
 * - Ignores index.js (that's the page file)
 * 
 * @param {string} pageFilePath - Path to the page file (e.g., 'src/pages/examples/talk/index.js')
 * @param {string} outputDir - Output directory (e.g., 'public')
 * @param {Object} options - Copy options
 * @returns {Object} Stats about copied assets
 */
export const copyColocatedAssets = (pageFilePath, outputDir, options = {}) => {
    const {
        verbose = false,
        // Files to ignore (the actual page files)
        ignorePatterns = ['index.js', 'page.js', '[*.js', '*.test.js', '*.spec.js'],
        // Only copy these extensions (or all if empty)
        allowedExtensions = ['.css', '.js', '.json', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.woff', '.woff2', '.ttf', '.eot']
    } = options;
    
    const stats = {
        filesCopied: 0,
        errors: []
    };
    
    // Get the directory containing the page file
    const pageDir = path.dirname(pageFilePath);
    
    // Check if directory exists
    if (!fs.existsSync(pageDir)) {
        return stats;
    }
    
    // Calculate relative path from pages directory to preserve structure
    // e.g., src/pages/examples/talk/index.js → examples/talk
    const pagesDir = pageFilePath.includes('pages') 
        ? pageFilePath.substring(0, pageFilePath.indexOf('pages') + 5)
        : path.dirname(pageFilePath);
    
    const relativePath = path.relative(pagesDir, pageDir);
    const targetDir = path.join(outputDir, relativePath);
    
    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Read all files in the page directory
    const files = fs.readdirSync(pageDir);
    
    for (const file of files) {
        const filePath = path.join(pageDir, file);
        const fileStat = fs.statSync(filePath);
        
        // Skip directories
        if (fileStat.isDirectory()) continue;
        
        // Check if file should be ignored
        const shouldIgnore = ignorePatterns.some(pattern => {
            if (pattern.startsWith('[')) {
                // Dynamic route file like [slug].js
                return file.startsWith('[') && file.endsWith('.js');
            }
            return file === pattern || file.includes(pattern);
        });
        
        if (shouldIgnore) {
            if (verbose) {
                console.log(`   ⏭️  Ignored: ${file} (page file)`);
            }
            continue;
        }
        
        // Check extension
        const ext = path.extname(file);
        if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
            if (verbose) {
                console.log(`   ⏭️  Ignored: ${file} (extension not allowed)`);
            }
            continue;
        }
        
        // Copy the asset
        const targetPath = path.join(targetDir, file);
        
        try {
            fs.copyFileSync(filePath, targetPath);
            stats.filesCopied++;
            
            if (verbose) {
                console.log(`   ✅ Copied asset: ${relativePath}/${file}`);
            }
        } catch (error) {
            stats.errors.push({
                file: filePath,
                error: error.message
            });
            console.error(`   ❌ Failed to copy ${file}:`, error.message);
        }
    }
    
    return stats;
};

/**
 * Process all routes and copy their co-located assets
 * This gets called during the build process for each route
 * 
 * @param {Array} routes - Array of route objects from getRoutes()
 * @param {string} outputDir - Output directory
 * @param {Object} options - Copy options
 * @returns {Object} Total stats
 */
export const copyAllColocatedAssets = (routes, outputDir, options = {}) => {
    const { verbose = false } = options;
    
    const totalStats = {
        filesCopied: 0,
        routesProcessed: 0,
        errors: []
    };
    
    if (verbose) {
        console.log('📦 Copying co-located assets...\n');
    }
    
    for (const route of routes) {
        // Get the file path for this route
        // This is stored in the route object when auto-discovery runs
        const pageFilePath = route.filePath;
        
        if (!pageFilePath) {
            if (verbose) {
                console.warn(`   ⚠️  No file path for route: ${route.pattern.pathname}`);
            }
            continue;
        }
        
        const stats = copyColocatedAssets(pageFilePath, outputDir, options);
        
        totalStats.filesCopied += stats.filesCopied;
        totalStats.routesProcessed++;
        totalStats.errors.push(...stats.errors);
    }
    
    if (verbose) {
        console.log(`\n✅ Copied ${totalStats.filesCopied} co-located asset(s) from ${totalStats.routesProcessed} route(s)\n`);
    }
    
    return totalStats;
};

/**
 * Watch co-located assets for changes during development
 * When a CSS/JS file changes, copy it to the output directory
 * 
 * @param {string} pagesDir - Pages directory to watch
 * @param {string} outputDir - Output directory
 * @param {Object} options - Watch options
 * @returns {FSWatcher} The file system watcher
 */
export const watchColocatedAssets = (pagesDir, outputDir, options = {}) => {
    const { verbose = false, debounce = 100 } = options;
    
    if (!fs.existsSync(pagesDir)) {
        console.warn(`⚠️  Cannot watch: ${pagesDir} does not exist`);
        return null;
    }
    
    const timeouts = new Map();
    
    const handleChange = (eventType, filename) => {
        if (!filename) return;
        
        // Only watch asset files, not JS page files
        const ext = path.extname(filename);
        const assetExtensions = ['.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
        
        if (!assetExtensions.includes(ext)) {
            return; // Ignore non-asset files
        }
        
        // Debounce the copy operation
        const existingTimeout = timeouts.get(filename);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        
        const timeout = setTimeout(() => {
            const fullPath = path.join(pagesDir, filename);
            
            if (!fs.existsSync(fullPath)) {
                return; // File was deleted
            }
            
            // Find the page directory
            const fileDir = path.dirname(fullPath);
            const relativePath = path.relative(pagesDir, fileDir);
            const targetDir = path.join(outputDir, relativePath);
            const targetPath = path.join(targetDir, path.basename(filename));
            
            // Ensure target directory exists
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            
            // Copy the file
            try {
                fs.copyFileSync(fullPath, targetPath);
                console.log(`🔄 Updated: ${relativePath}/${path.basename(filename)}`);
            } catch (error) {
                console.error(`❌ Failed to copy ${filename}:`, error.message);
            }
            
            timeouts.delete(filename);
        }, debounce);
        
        timeouts.set(filename, timeout);
    };
    
    const watcher = fs.watch(pagesDir, { recursive: true }, handleChange);
    
    console.log(`👀 Watching co-located assets in: ${pagesDir}`);
    
    return watcher;
};