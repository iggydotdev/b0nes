// src/framework/utils/build/generateRoute.js
import fs from 'node:fs';
import path from 'node:path';

import { buildPathname } from './buildPathName.js';
import { compose } from '../../compose.js';
import { renderPage } from '../../renderPage.js';

/**
 * Generate a static route to HTML file
 * @param {Object} route - Route object with pattern, components, meta
 * @param {string} outputDir - Output directory (default: public)
 * @param {function} [dataSource] - Option data source for dynamic routes 
 * @returns {Object} - Generated file info
 */
export const generateRoute = async (route, outputDir='public', dataSource) => {

    if (dataSource) {
        const generated = [];
      
        for (const data of dataSource) {
            // Replace :param with actual value
            const pathname = buildPathname(route.pattern.pathname, data);
            
            // Get components (may be function)
            const components = typeof route.components === 'function' 
                ? route.components(data) 
                : route.components;
            
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
    
            try {
                // Compose components
                const content = compose(components, {route});
                
                // ✨ THE FIX: Pass currentPath for asset resolution
                const meta = {
                    ...(route.meta || {}),
                    ...data,
                    currentPath: pathname  // Context-aware asset paths! 🎯
                };
                
                // Render with resolved paths
                const html = renderPage(content, meta);
    
                // Write file
                fs.writeFileSync(fullPath, html, 'utf8');
    
                console.log(`✓ ${pathname} → ${filePath}`);
                
                const result = {
                    path: pathname,
                    file: fullPath,
                    data
                };
                
                generated.push(result);
            } catch (error) {
                console.error(`❌ Failed to generate ${pathname}:`, error.message);
            }
        } 
        return generated;
    }

    // Get pathname from URLPattern
    const pathname = route.pattern.pathname;
    
    // Skip framework runtime and asset paths
    if (pathname.startsWith('/assets/')) {
        console.warn(`⚠️  Skipping asset path "${pathname}" (framework runtime)`);
        return null;
    }
    
    // Skip dynamic routes
    if (pathname.includes(':')) {
        console.warn(`⚠️  Route "${pathname}" has dynamic params`);
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
        const content = compose(route.components, {route});
        
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