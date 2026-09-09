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
            const finalProps = { ...props, slot: slotContent };
            const store = window.spaConfig?.store;
            
            for (const [key, value] of Object.entries(finalProps)) {
                if (key === 'slot' || key.endsWith('Slot')) continue; // Slots are handled by composeSlot
                
                if (typeof value === 'string' && value.includes('{{')) {
                    finalProps[key] = value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
                        const cleanPath = path.trim();
                        const storeValue = store ? store.get(cleanPath) : undefined;
                        propertyBindings.push(`${cleanPath}:${key}`);
                        return storeValue !== undefined ? storeValue : match;
                    });
                }
            }

            // Compose named slots (*Slot) and component descriptor props
            for (const [key, val] of Object.entries(props)) {
                if (key === 'slot' || val === undefined || val === null) continue;

                const isNamedSlot = key.endsWith('Slot');
                const isComponentDescriptor = typeof val === 'object' && !Array.isArray(val) && Boolean(val.type && val.name);
                const isComponentArray = Array.isArray(val) && val.some(item => item && typeof item === 'object' && (item.type || item.html));

                if (isNamedSlot || isComponentDescriptor || isComponentArray) {
                    finalProps[key] = await composeSlot(val);
                }
            }

            // Render the component
            try {
                const renderFn = typeof comp === 'function' ? comp : comp?.render;
                
                if (typeof renderFn !== 'function') {
                    throw new Error(`Component ${name} is not a function`);
                }
                
                let html = renderFn(finalProps);

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

/**
 * Escape HTML special characters (inline — client has no shared util import path).
 * @param {string} unsafe
 * @returns {string}
 */
const escapeHtml = (unsafe) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const escapeAttr = (value) => {
    if (typeof value !== 'string') return '';
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

/**
 * Process plain-text slot: escape by default, preserve {{path}} binds.
 * Store values are escaped when interpolated.
 * @param {string} text
 * @returns {string}
 */
const processTextSlot = (text) => {
    const store = window.spaConfig?.store;
    const parts = [];
    let lastIndex = 0;
    const re = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = re.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(escapeHtml(text.slice(lastIndex, match.index)));
        }

        const cleanPath = match[1].trim();
        const storeValue = store ? store.get(cleanPath) : undefined;
        const content = storeValue !== undefined ? storeValue : match[0];
        parts.push(
            `<span data-b0nes-bind="${escapeAttr(cleanPath)}">${escapeHtml(String(content))}</span>`
        );
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(escapeHtml(text.slice(lastIndex)));
    }

    if (parts.length === 0) {
        return escapeHtml(text);
    }

    return parts.join('');
};

/**
 * Compose slot content with escape-by-default.
 * - string → escaped text (+ binds)
 * - { type, name } → component (trusted HTML after render)
 * - { html: '...' } → explicit raw HTML opt-in
 */
async function composeSlot(slot) {
    if (slot === null || slot === undefined) {
        return '';
    }

    if (typeof slot === 'string') {
        return processTextSlot(slot);
    }

    if (typeof slot === 'number' || typeof slot === 'boolean') {
        return String(slot);
    }

    if (typeof slot === 'object' && !Array.isArray(slot)) {
        if (typeof slot.html === 'string' && !slot.type) {
            return slot.html;
        }
        if (slot.type && slot.name) {
            return await compose([slot]);
        }
        return '';
    }

    if (!Array.isArray(slot)) {
        return '';
    }

    const results = await Promise.all(
        slot.map(async (child) => {
            if (child === null || child === undefined) {
                return '';
            }
            if (typeof child === 'string') {
                return processTextSlot(child);
            }
            if (typeof child === 'number' || typeof child === 'boolean') {
                return String(child);
            }
            if (typeof child === 'object') {
                if (typeof child.html === 'string' && !child.type) {
                    return child.html;
                }
                if (child.type && child.name) {
                    return await compose([child]);
                }
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