import fs from 'node:fs';
import path from 'node:path';

// Local imports
import { compose } from '../../compose.js';
import { renderPage } from '../../renderPage.js';

/**
 * Generate a static route to HTML file
 * @param {Object} route - Route object with pattern, components, meta
 * @param {string} outputDir - Output directory (default: public)
 * @returns {Object} - Generated file info
 */

export const generateRoute = async (route, outputDir='public') => {
    const pathname = route.pattern.pathname

    // skip for now dynamic routes
    // Skip routes without components
    if (!route.components || !Array.isArray(route.components)) {
        console.warn(`⚠️  Route "${route.name}" has no components, skipping`);
        return null;
    }
    try {
        // Build file path
        let filePath = pathname;
        if (filePath === '/') {
            filePath = 'index.html';
        } else if (!filePath.endsWith('.html')) {
            filePath = `${filePath}/index.html`;
        }
        
        const fullPath = path.join(outputDir, filePath);
        const dirPath = path.dirname(fullPath);

        // Ensure directory exists
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Compose components to HTML
        const content = compose(route.components);
        
        // Render full page with meta tags
        const html = renderPage(content, route.meta || {});

        // Write file
        fs.writeFileSync(fullPath, html, 'utf8');

        console.log(`✓ ${pathname} → ${filePath}`);

        return {
            path: pathname,
            file: fullPath,
        };
    } catch (error) {
        throw new Error(`Failed to generate ${route.name}: ${error.message}`);
    }



}