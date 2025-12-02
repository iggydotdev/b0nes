// src/framework/utils/build/generateRoute.js
import fs from 'node:fs';
import path from 'node:path';

import { compose } from '../../compose.js';
import { renderPage } from '../../renderPage.js';

/**
 * Generate a static route to HTML file
 * @param {Object} route - Route object with pattern, components, meta
 * @param {string} outputDir - Output directory (default: public)
 * @returns {Object} - Generated file info
 */
export const generateRoute = async (route, outputDir='public') => {
    // Get pathname from URLPattern
    const pathname = route.pattern.pathname;
    
    // Skip framework runtime and asset paths
    if (pathname.startsWith('/assets/')) {
        console.warn(`⚠️  Skipping asset path "${pathname}" (framework runtime)`);
        return null;
    }
    
    // Skip dynamic routes
    if (pathname.includes(':')) {
        console.warn(`⚠️  Route "${pathname}" has dynamic params, use generateDynamicRoute instead`);
        return null;
    }

    // Skip routes without components
    if (route.components === undefined || !Array.isArray(route.components)) {
        console.warn(`⚠️  Route "${pathname}" has no components, skipping`);
        return null;
    }

    try {
        // Build file path
        let filePath = pathname;
        if (filePath === '/') {
            filePath = 'index.html';
        } else if (!filePath.endsWith('.html')) {
            filePath = `${filePath.replace(/\/$/, '')}/index.html`;
        }
        
        const fullPath = path.join(outputDir, filePath);
        const dirPath = path.dirname(fullPath);

        // Ensure directory exists
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Compose components to HTML
        const content = compose(route.components);
        
        // ✨ THE FIX: Pass currentPath in meta for asset resolution
        const meta = {
            ...(route.meta || {}),
            currentPath: pathname  // This is the magic! 🎩✨
        };
        
        // Render full page with context-aware asset paths
        const html = renderPage(content, meta);

        // Write file
        fs.writeFileSync(fullPath, html, 'utf8');

        console.log(`✓ ${pathname} → ${filePath}`);

        return {
            path: pathname,
            file: fullPath,
        };
    } catch (error) {
        throw new Error(`Failed to generate ${pathname}: ${error.message}`);
    }
};