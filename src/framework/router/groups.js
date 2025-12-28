// src/framework/utils/router/groups.js
/**
 * Helper for grouping related routes
 */
export function createRouteGroup(router, prefix, configure) {
    const group = {
        addExact: (path, handler) => {
            router.addExact(`${prefix}${path}`, handler);
            return group;
        },
        addPattern: (pattern, handler) => {
            router.addPattern(`${prefix}${pattern}`, handler);
            return group;
        }
    };
    
    configure(group);
    return router;
}

// Usage in server.js
/** 
 * 
 @example 
    createRouteGroup(router, '/api', (api) => {
    api.addPattern('/users/:id', handleUser);
    api.addPattern('/posts/:slug', handlePost);
    });
*/