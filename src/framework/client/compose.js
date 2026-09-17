import { html as trustedHTML, isHTML, restoreHTML } from '../shared/html.js';
// src/framework/client/compose.js
/**
 * Client-side component composer
 * Dynamically imports components and renders them
 * 
 * NOTE: This is for DYNAMIC templates only. Static templates should be pre-compiled!
 */

const componentCache = new Map();

// Module location determines asset layout, including production on localhost.
const isDev = !new URL(import.meta.url).pathname.startsWith('/assets/');
const getComponentPath = (type, name) => {
    if (!['atom', 'molecule', 'organism'].includes(type) || !/^[a-z0-9-]+$/.test(name)) {
        throw new TypeError('Invalid component identifier');
    }
    return new URL(isDev ? `../../components/${type}s/${name}/index.js` :
        `../behaviors/${type}s/${name}/index.js`, import.meta.url).href;
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
            if (isHTML(component) || component?.html !== undefined) return composeSlot(component);
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
                    return '<!-- Component failed to load -->';
                }
            }

            const comp = componentCache.get(cacheKey);


            // 🚀 Convention over Configuration: Scan props for {{var}}
            const propertyBindings = [];
            const finalProps = { ...props };
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

            const prepare = async (value, key = '') => {
                if (value == null) return value;
                if (type === 'atom' && name === 'textarea' && ['slot', 'value'].includes(key)) return value;
                if (isHTML(value) || (typeof value === 'object' && (value.type && value.name || 'html' in value)) ||
                    key === 'slot' || key.endsWith('Slot') || ['content', 'label', 'trigger'].includes(key) || (name === 'modal' && key === 'title')) {
                    const output = await composeSlot(value);
                    return output === '' ? '' : trustedHTML(output);
                }
                if (key === 'attrs') return value;
                if (Array.isArray(value)) return Promise.all(value.map(item => prepare(item)));
                if (typeof value === 'object') return Object.fromEntries(await Promise.all(
                    Object.entries(value).map(async ([k, v]) => [k, await prepare(v, k)])));
                return value;
            };
            for (const key of Object.keys(finalProps)) finalProps[key] = await prepare(finalProps[key], key);

            // Render the component
            try {
                const renderFn = typeof comp === 'function' ? comp : comp?.render;
                
                if (typeof renderFn !== 'function') {
                    throw new Error(`Component ${name} is not a function`);
                }
                
                let html = String(renderFn(finalProps));

                // 🔗 Reactivity Hook: add binding attribute
                if (typeof html === 'string') {
                    const allBindings = [...propertyBindings];
                    if (props.bind) allBindings.push(props.bind);
                    
                    if (allBindings.length > 0) {
                        // Inject data-b0nes-bind into the first opening tag
                        html = html.replace(/<([a-z0-9-]+)/i, (_, tag) => `<${tag} data-b0nes-bind="${escapeAttr(allBindings.join(','))}"`);
                    }
                }
                
                return html;
            } catch (error) {
                console.error(`[compose] Render error for ${cacheKey}:`, error);
                return '<!-- Component render failed -->';
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
    if (slot == null) return '';
    if (isHTML(slot)) return String(slot);
    if (Array.isArray(slot)) return (await Promise.all(slot.map(composeSlot))).join('');
    if (typeof slot === 'object') {
        if ('html' in slot && !slot.type) return String(restoreHTML(slot));
        if (slot.type && slot.name) return compose([slot]);
        throw new TypeError('Invalid content object');
    }
    return processTextSlot(String(slot));
}

/**
 * Clear component cache (useful for hot reload in dev)
 */
export const clearComposeCache = () => {
    componentCache.clear();
    console.log('[compose] Cache cleared');
};

export default compose;