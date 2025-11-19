// src/framework/utils/build/ssg.js
import fs from 'node:fs';

import { getRoutes } from '../../autoRoutes.js';
import { generateRoute } from './generateRoute.js';
import { generateDynamicRoute } from './generateDynamicRoute.js';

export const build = async (outputDir = 'public') => {
    const generated = [];
    const errors = [];

    // Clean output directory
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    // Get routes from autoRoutes
    const routes = getRoutes();
    console.log(`\n🏗️  Building ${routes.length} routes...\n`);

    for (const route of routes) {
        try {
            // Load the page module
            const pageModule = await route.load();
            
            // Convert autoRoute format to SSG format
            const ssgRoute = {
                name: route.pattern.pathname,
                pattern: route.pattern,
                components: pageModule.components || pageModule.default || [],
                meta: pageModule.meta || {},
                externalData: pageModule.externalData
            };

            // Check if it's a dynamic route
            if (route.params && ssgRoute.externalData) {
                // Dynamic route - needs data
                console.log(`📊 Generating dynamic route: ${route.pattern.pathname}`);
                const data = await ssgRoute.externalData();
                const dataArray = Array.isArray(data) ? data : [data];
                const results = await generateDynamicRoute(ssgRoute, dataArray, outputDir);
                if (results.length > 0) {
                    generated.push(...results);
                }
            } else if (route.params && !ssgRoute.externalData) {
                // Dynamic route without data - skip with warning
                console.warn(`⚠️  Skipping dynamic route (no externalData): ${route.pattern.pathname}`);
            } else {
                // Static route
                console.log(`📄 Generating static route: ${route.pattern.pathname}`);
                
                // If components is a function, call it
                if (typeof ssgRoute.components === 'function') {
                    ssgRoute.components = await ssgRoute.components({});
                }
                
                const res = await generateRoute(ssgRoute, outputDir);
                if (res) {
                    generated.push(res);
                }
            }

        } catch (error) {
            errors.push({ route: route.pattern.pathname, error });
            console.error(`❌ ${route.pattern.pathname} failed:`, error.message);
        }
    }

    console.log(`\n✅ Build complete!`);
    console.log(`   Generated: ${generated.length} pages`);
    console.log(`   Errors: ${errors.length}`);

    if (errors.length > 0) {
        console.log('\n❌ Build errors:');
        errors.forEach(({ route, error }) => {
            console.log(`   ${route}: ${error.message}`);
        });
    }

    return {
        generated,
        errors
    };
};