import fs from 'node:fs';
// Local imports

import { routes } from '../../routes.js';
import { generateRoute } from './generateRoute.js';
import { generateDynamicRoute } from './generateDynamicRoute.js';

export const build = async (outputDir = 'public') => {
    const generated = [];
    const errors = [];

    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    for(const route of routes) {
        try {
            if (route.pattern.pathname.includes(':')) {
                const data = [await route.externalData()];
                const results = await generateDynamicRoute(route, data, outputDir);
                if (results.length > 0) {
                    generated.push(...results)
                }
            } else {
                const res = await generateRoute(route,  outputDir);
                if (res) {
                    generated.push(res)
                }
            }

        } catch (error) {
            errors.push({route, error});
            console.error(`${route} failed: `, error);
        }
    }

    return ({
        generated,
        errors
    });
}


