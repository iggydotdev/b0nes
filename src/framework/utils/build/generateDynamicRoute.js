// src/framework/utils/build/generateDynamicRoute.js
import { generateRoute } from './generateRoute.js';
import { buildPathname } from './buildPathName.js';
import { compose } from '../../compose.js';
import { renderPage } from '../../renderPage.js';
import fs from 'node:fs';
import path from 'node:path';

export const generateDynamicRoute = async (route, dataSource, outputDir = 'public') => {
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
};