// src/framework/utils/build/copyAssets.js
import fs from 'node:fs';
import path from 'node:path';

/**
 * Recursively copy directory contents
 * Handles nested folders and preserves structure
 */
const copyDir = (src, dest, stats, options = {}) => {
    const { verbose = false, ignore = [] } = options;
    
    // Create destination directory
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
        stats.directoriesCreated++;
    }
    
    // Read source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        // Check if should be ignored
        const shouldIgnore = ignore.some(pattern => {
            if (typeof pattern === 'string') {
                return entry.name === pattern || entry.name.includes(pattern);
            }
            if (pattern instanceof RegExp) {
                return pattern.test(entry.name);
            }
            return false;
        });
        
        if (shouldIgnore) {
            if (verbose) {
                console.log(`   ⏭️  Ignored: ${entry.name}`);
            }
            continue;
        }
        
        if (entry.isDirectory()) {
            // Recursively copy subdirectory
            copyDir(srcPath, destPath, stats, options);
        } else {
            // Copy file
            try {
                fs.copyFileSync(srcPath, destPath);
                stats.filesCopied++;
                
                if (verbose) {
                    console.log(`   ✅ Copied: ${entry.name}`);
                }
            } catch (error) {
                stats.errors.push({
                    file: srcPath,
                    error: error.message
                });
                console.error(`   ❌ Failed to copy ${entry.name}:`, error.message);
            }
        }
    }
};

/**
 * Copy static assets from source to output directory
 * Preserves directory structure and handles nested folders
 * 
 * @param {string} assetsDir - Source directory (e.g., 'src/static')
 * @param {string} outputDir - Output directory (e.g., 'public')
 * @param {Object} options - Copy options
 * @param {boolean} options.verbose - Verbose logging
 * @param {Array<string|RegExp>} options.ignore - Files/patterns to ignore
 * @param {boolean} options.preserveRoot - Keep the root folder name in output
 * @returns {Object} Copy statistics
 */
export const copyStaticAssets = async (assetsDir = 'src/static', outputDir = 'public', options = {}) => {
    const {
        verbose = false,
        ignore = ['.DS_Store', 'Thumbs.db', '.gitkeep'],
        preserveRoot = false
    } = options;
    
    const stats = {
        filesCopied: 0,
        directoriesCreated: 0,
        errors: []
    };
    
    // Check if source directory exists
    if (!fs.existsSync(assetsDir)) {
        if (verbose) {
            console.log(`⚠️  Static assets directory not found: ${assetsDir}`);
        }
        return stats;
    }
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Determine destination
    const dest = preserveRoot 
        ? path.join(outputDir, path.basename(assetsDir))
        : outputDir;
    
    if (verbose) {
        console.log(`📁 Copying from: ${assetsDir}`);
        console.log(`📁 Copying to:   ${dest}\n`);
    }
    
    // Copy all contents
    copyDir(assetsDir, dest, stats, { verbose, ignore });
    
    if (stats.errors.length > 0) {
        console.warn(`⚠️  Encountered ${stats.errors.length} error(s) while copying assets`);
    }
    
    return stats;
};

/**
 * Copy specific file or directory
 * Useful for copying individual assets on-demand
 */
export const copyAsset = (src, dest, options = {}) => {
    const { verbose = false } = options;
    
    try {
        const srcStat = fs.statSync(src);
        
        if (srcStat.isDirectory()) {
            const stats = {
                filesCopied: 0,
                directoriesCreated: 0,
                errors: []
            };
            copyDir(src, dest, stats, options);
            return stats;
        } else {
            // Ensure destination directory exists
            const destDir = path.dirname(dest);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }
            
            fs.copyFileSync(src, dest);
            
            if (verbose) {
                console.log(`✅ Copied: ${path.basename(src)} → ${dest}`);
            }
            
            return { filesCopied: 1, directoriesCreated: 0, errors: [] };
        }
    } catch (error) {
        console.error(`❌ Failed to copy ${src}:`, error.message);
        return { filesCopied: 0, directoriesCreated: 0, errors: [{ file: src, error: error.message }] };
    }
};

/**
 * Watch static assets directory for changes and copy on change
 * Useful for development mode with hot-reloading
 */
export const watchStaticAssets = (assetsDir, outputDir, options = {}) => {
    const { verbose = false, debounce = 100 } = options;
    
    if (!fs.existsSync(assetsDir)) {
        console.warn(`⚠️  Cannot watch: ${assetsDir} does not exist`);
        return null;
    }
    
    let timeout;
    
    const handleChange = (eventType, filename) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (verbose) {
                console.log(`🔄 Asset changed: ${filename}, re-copying...`);
            }
            copyStaticAssets(assetsDir, outputDir, options);
        }, debounce);
    };
    
    const watcher = fs.watch(assetsDir, { recursive: true }, handleChange);
    
    console.log(`👀 Watching static assets: ${assetsDir}`);
    
    return watcher;
};