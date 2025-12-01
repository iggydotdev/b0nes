import fs from 'node:fs';
import path from 'node:path';

import { compose } from '../../compose.js';
import { renderPage } from '../../renderPage.js';

import { processColocatedAssets } from './processColocatedAssets.js';
/**
 * Generate a static route to HTML file
 * @param {Object} route - Route object with pattern, components, meta
 * @param {string} outputDir - Output directory (default: public)
 * @returns {Object} - Generated file info
 */

export const generateRoute = async (route, outputDir='public', options = {}) => {
    const { verbose = false } = options; 
    
    // --- VALIDATION BLOCK ---
    // Add strong checks to ensure the route object is valid before proceeding.
    if (!route || !route.pattern || typeof route.pattern.pathname !== 'string') {
        console.error('❌ Invalid route object passed to generateRoute:', route);
        throw new Error('Failed to generate route due to invalid route object (missing `pattern.pathname`).');
    }
    if (typeof route.filePath !== 'string') {
        console.error('❌ Invalid route object passed to generateRoute:', route);
        throw new Error(`Failed to generate route for "${route.pattern.pathname}" due to missing 'filePath'.`);
    }

    const { pathname } = route.pattern;
    
    // Skip routes without components
    if (route.components === undefined || !Array.isArray(route.components)) {
        if (verbose) console.warn(`⚠️  Route "${pathname}" has no components, skipping`);
        return null;
    }

    try {
        // 1. Determine the final output file path from the route's pathname.
        let outputFilePath = pathname;
        if (outputFilePath === '/') {
            outputFilePath = 'index.html';
        } else if (!outputFilePath.endsWith('.html')) {
            outputFilePath = path.join(outputFilePath.replace(/\/$/, ''), 'index.html');
        }
        
        const fullPath = path.join(outputDir, outputFilePath);
        const dirPath = path.dirname(fullPath);

        // 2. Compose and render the initial HTML.
        const content = compose(route.components);
        let html = renderPage(content, route.meta || {});

        // 3. Process co-located assets and rewrite their paths.
        html = await processColocatedAssets(html, route, outputDir, { verbose });
        
        // 4. Ensure the output directory exists and write the final HTML.
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(fullPath, html, 'utf8');

        console.log(`✓ ${pathname} → ${path.relative(process.cwd(), fullPath)}`);

        return {
            path: pathname,
            file: fullPath,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to generate ${pathname}: ${errorMessage}`);
    }
};