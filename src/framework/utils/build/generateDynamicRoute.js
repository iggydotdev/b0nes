import { generateRoute } from './generateRoute.js';
import { buildPathname } from './buildPathName.js';

export const generateDynamicRoute = async (route, dataSource, outputDir = 'public') => {
    const generated = [];

    // dataSource = array of data objects
    // Example: [{slug: 'hello-world', title: 'Hello'}, ...]
    
    for (const data of dataSource) {
        // Replace :param with actual value
        const pathname = buildPathname(route.pattern.pathname, data);
        
        // Create route variant
        const routeVariant = {
            ...route,
            pattern: { ...route.pattern, pathname },
            components: route.components(data),
            meta: { ...route.meta, ...data }
        };

        const result = await generateRoute(routeVariant, outputDir);
        if (result) generated.push(result);
    }

    return generated;
};
