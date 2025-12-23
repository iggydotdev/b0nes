// src/framework/client/compose.js
/**
 * Client-side component composer
 * Dynamically imports components and renders them
 * 
 * NOTE: This is for DYNAMIC templates only. Static templates should be pre-compiled!
 */

const componentCache = new Map();

// Detect if we're in dev or prod
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

/**
 * Get the correct import path for a component based on environment
 */
const getComponentPath = (type, name) => {
    if (isDev) {
        // Dev: Components are in their source locations
        return `/components/${type}s/${name}/index.js`;
    } else {
        // Prod: Components are copied to assets/js/behaviors
        return `/assets/js/behaviors/${type}s/${name}/index.js`;
    }
};

/**
 * Compose component configs into HTML (async)
 * @param {Array} components - Array of component configurations
 * @returns {Promise<string>} Rendered HTML
 */
export const compose = async (components = []) => {
    // If it's already a string, it's already compiled HTML - just return it
    if (typeof components === 'string') {
        return components;
    }

    if (!Array.isArray(components)) {
        console.warn('[compose] Expected array or string, got:', typeof components);
        return '';
    }

    const results = await Promise.all(
        components.map(async (component) => {
            if (!component || typeof component !== 'object') {
                return '';
            }

            const { type, name, props = {} } = component;

            if (!type || !name) {
                console.warn('[compose] Invalid component:', component);
                return '';
            }

            // Check cache first
            const cacheKey = `${type}/${name}`;
            if (!componentCache.has(cacheKey)) {
                try {
                    const componentPath = getComponentPath(type, name);
                    
                    if (isDev) {
                        console.log(`[compose] Loading component: ${componentPath}`);
                    }
                    
                    const module = await import(componentPath);
                    const comp = module.default || module[name];
                    
                    if (!comp) {
                        throw new Error(`Component ${name} not found in module`);
                    }
                    
                    componentCache.set(cacheKey, comp);
                } catch (error) {
                    console.error(`[compose] Failed to load ${cacheKey}:`, error);
                    return `<!-- Component ${cacheKey} failed to load: ${error.message} -->`;
                }
            }

            const comp = componentCache.get(cacheKey);

            // Handle nested slots recursively
            let slotContent = '';
            if (props.slot !== undefined && props.slot !== null) {
                slotContent = await composeSlot(props.slot);
            }

            // 🚀 Convention over Configuration: Scan props for {{var}}
            const propertyBindings = [];
            const finalProps = { ...props };
            const store = window.spaConfig?.store;
            
            for (const [key, value] of Object.entries(finalProps)) {
                if (key === 'slot') continue; // 🚀 Convention: slots are handled by composeSlot
                
                if (typeof value === 'string' && value.includes('{{')) {
                    finalProps[key] = value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
                        const cleanPath = path.trim();
                        const storeValue = store ? store.get(cleanPath) : undefined;
                        propertyBindings.push(`${cleanPath}:${key}`);
                        return storeValue !== undefined ? storeValue : match;
                    });
                }
            }

            // Render the component
            try {
                const renderFn = typeof comp === 'function' ? comp : comp?.render;
                
                if (typeof renderFn !== 'function') {
                    throw new Error(`Component ${name} is not a function`);
                }
                
                let html = renderFn({ ...finalProps, slot: slotContent });

                // 🔗 Reactivity Hook: add binding attribute
                if (typeof html === 'string') {
                    const allBindings = [...propertyBindings];
                    if (props.bind) allBindings.push(props.bind);
                    
                    if (allBindings.length > 0) {
                        // Inject data-b0nes-bind into the first opening tag
                        html = html.replace(/<([a-z0-9-]+)/i, `<$1 data-b0nes-bind="${allBindings.join(',')}"`);
                    }
                }
                
                return html;
            } catch (error) {
                console.error(`[compose] Render error for ${cacheKey}:`, error);
                return `<!-- Component ${cacheKey} render failed: ${error.message} -->`;
            }
        })
    );

    return results.filter(Boolean).join('\n');
};

async function composeSlot(slot) {
    if (typeof slot === 'string') {
        // 🔗 Reactivity Hook: wrap {{path}} variables in reactive spans
        return slot.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const cleanPath = path.trim();
            const store = window.spaConfig?.store;
            let value = store ? store.get(cleanPath) : undefined;
            
            // If we have a value, use it. Otherwise keep the {{match}} for visibility
            const content = value !== undefined ? value : match;
            return `<span data-b0nes-bind="${cleanPath}">${content}</span>`;
        });
    }

    if (!Array.isArray(slot)) {
        return '';
    }

    const results = await Promise.all(
        slot.map(async (child) => {
            if (typeof child === 'string') {
                // 🔗 Reactivity Hook: wrap {{path}} variables in reactive spans
                // This allows granular updates without re-compositing the whole string
                return child.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
                    const cleanPath = path.trim();
                    const store = window.spaConfig?.store;
                    let value = store ? store.get(cleanPath) : undefined;
                    
                    // If we have a value, use it. Otherwise keep the {{match}} for visibility
                    const content = value !== undefined ? value : match;
                    return `<span data-b0nes-bind="${cleanPath}">${content}</span>`;
                });
            }
            if (typeof child === 'object' && child !== null && child.type && child.name) {
                return await compose([child]);
            }
            return '';
        })
    );

    return results.filter(Boolean).join('\n');
}

/**
 * Clear component cache (useful for hot reload in dev)
 */
export const clearComposeCache = () => {
    componentCache.clear();
    console.log('[compose] Cache cleared');
};

export default compose;