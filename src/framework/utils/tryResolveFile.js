
import path from "path";
import { readFile, stat } from "fs/promises";
import { ENV } from "../config/envs.js";
import { validateAndSanitizePath } from "./sanitizePaths.js";
import { PAGES_BASE, COMPONENTS_BASE, CLIENT_BASE } from "./server/getServerConfig.js";

/**
 * Updated tryResolveFile with security validation
 */
export async function tryResolveFile(pathname) {
    // Define allowed base directories
    const allowedBases = ENV.isDev
        ? [PAGES_BASE, COMPONENTS_BASE, CLIENT_BASE].filter(Boolean)
        : [CLIENT_BASE, COMPONENTS_BASE, PAGES_BASE].filter(Boolean);
 
    
 
    // Common suffixes to attempt for URLs that are directory-like or extension-less
    const candidateSuffixes = ['', '.js', '.html', '/index.js', '/index.html'];

    
    // ⭐ NEW: Special handling for co-located assets (CSS, images in same folder as page)
    // Extract the page path and asset filename
    // e.g., /examples/talk/custom.css → look in pages/examples/talk/custom.css
    if (pathname.match(/\.(css|jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf)$/)) {
        console.log(`[Server] 🔍 Co-located asset detected: ${pathname}`);
        
        // Try to find it in PAGES_BASE first (co-located with pages)
        const validation = validateAndSanitizePath(pathname, PAGES_BASE);
        
        if (validation.safe) {
            try {
                const stats = await stat(validation.sanitized);
                if (stats.isFile()) {
                    const content = await readFile(validation.sanitized);
                    console.log(`[Server] ✅ Found co-located asset: ${validation.sanitized}`);
                    return { content, found: true, path: validation.sanitized };
                }
            } catch (err) {
                console.log(`[Server] ⚠️ Co-located asset not found in PAGES_BASE: ${pathname}`);
            }
        }
    }



    for (const baseDir of allowedBases) {
        let lookupPath = pathname;

        // Strip logical prefixes if they match the current base directory
        // Robust handling for both /prefix/ and prefix/
        if (baseDir === COMPONENTS_BASE) {
            if (lookupPath.startsWith('/components/')) lookupPath = lookupPath.slice(12);
            else if (lookupPath.startsWith('components/')) lookupPath = lookupPath.slice(11);
        } else if (baseDir === CLIENT_BASE) {
            if (lookupPath.startsWith('/client/')) lookupPath = lookupPath.slice(8);
            else if (lookupPath.startsWith('client/')) lookupPath = lookupPath.slice(7);
        } else if (baseDir === PAGES_BASE) {
            if (lookupPath.startsWith('/pages/')) lookupPath = lookupPath.slice(7);
            else if (lookupPath.startsWith('pages/')) lookupPath = lookupPath.slice(6);
        }

        const validation = validateAndSanitizePath(lookupPath, baseDir);
        if (validation.safe) {
            for (const suffix of candidateSuffixes) {
                const candidatePath = validation.sanitized + suffix;
                try {
                    const stats = await stat(candidatePath);
                    if (stats.isFile()) {
                        const content = await readFile(candidatePath);
                        console.log(`[Server] ✅ Serving validated file: ${candidatePath}`);
                        return { content, found: true, path: candidatePath };
                    }
                } catch (_) {
                    // File not found, try next suffix/base
                }
            }
        }
        
        // --- HEURISTIC: If base is PAGES_BASE, try resolving under an 'examples' subdirectory ---
        if (baseDir === PAGES_BASE) {
            const parts = pathname.split('/').filter(Boolean);
            if (parts.length && parts[0] !== 'examples') {
                const altPath = '/' + path.posix.join('examples', ...parts);
                const altValidation = validateAndSanitizePath(altPath, baseDir);
                if (altValidation.safe) {
                    for (const suffix of candidateSuffixes) {
                        const candidate = altValidation.sanitized + suffix;
                        try {
                            const s = await stat(candidate);
                            if (!s.isFile()) continue;
                            const content = await readFile(candidate);
                            console.log(`[Server] ✅ Serving validated file (heuristic): ${candidate}`);
                            return { content, found: true, path: candidate };
                        } catch (_) { /* try next */ }
                    }
                }
            }
        }
    }
    
    console.warn(`[Server] ❌ File not found for pathname: ${pathname}`);
    
    return { content: null, found: false };
}