import path from 'path';

import library from '../../components/library.js';
import { escapeHtml } from '../../components/utils/escapeHtml.js';
import { escapeAttr } from '../../components/utils/escapeAttr.js';
import {
    renderErrorFallback as invokeErrorFallback,
    setErrorFallbackRenderer,
    resetErrorFallbackRenderer,
    getErrorFallbackRenderer
} from './compose_utils/errorFallbackRenderer.js';
import { createRenderCache } from './compose_utils/createRenderCache.js';
import { createErrorTracker } from './compose_utils/errorTracker.js';

const componentLibrary = {
    atom: library.atoms,
    molecule: library.molecules,
    organism: library.organisms
};

const renderCache = createRenderCache(500);
const errorTracker = createErrorTracker(100);

/**
 * Renders a fallback error component when composition fails
 * @param {string} componentName
 * @param {string} componentType
 * @param {string} errorMessage
 * @returns {string}
 * @private
 */
const renderErrorFallback = (componentName, componentType, errorMessage) => {
    return invokeErrorFallback(
        { message: errorMessage || 'Unknown error' },
        { type: componentType, name: componentName }
    );
};

/**
 * Safely retrieves a component from the library
 * @private
 */
const getComponent = (type, name) => {
    const lib = componentLibrary[type];
    if (!lib) return null;
    return lib[name] || null;
};

/**
 * Process a plain-text slot: escape HTML, preserve {{path}} bind markers.
 * Trust boundary — untrusted strings enter here and leave safe.
 * @param {string} text
 * @returns {string}
 * @private
 */
const processTextSlot = (text) => {
    const parts = [];
    let lastIndex = 0;
    const re = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = re.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(escapeHtml(text.slice(lastIndex, match.index)));
        }

        const cleanPath = match[1].trim();
        // Bind wrapper is framework HTML; path goes in an attribute; placeholder is escaped text
        parts.push(
            `<span data-b0nes-bind="${escapeAttr(cleanPath)}">${escapeHtml(match[0])}</span>`
        );
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(escapeHtml(text.slice(lastIndex)));
    }

    // No bind markers — whole string is plain text
    if (parts.length === 0) {
        return escapeHtml(text);
    }

    return parts.join('');
};

/**
 * Recursively composes nested component slots with escape-by-default.
 *
 * Slot node kinds:
 * - string / number / boolean → escaped text ({{bind}} preserved)
 * - { type, name, props }     → component node → compose (HTML trusted)
 * - { html: '...' }           → explicit raw HTML opt-in
 * - array                     → map each child
 *
 * @param {Array|string|Object|number|boolean|null} slot
 * @param {Object} context
 * @returns {string}
 * @private
 */
const composeSlot = (slot, context = {}) => {
    if (slot === null || slot === undefined) {
        return '';
    }

    if (typeof slot === 'string') {
        return processTextSlot(slot);
    }

    if (typeof slot === 'number' || typeof slot === 'boolean') {
        return String(slot);
    }

    // Single object (component node or raw html) — not an array
    if (typeof slot === 'object' && !Array.isArray(slot)) {
        // Explicit raw HTML opt-in
        if (typeof slot.html === 'string' && !slot.type) {
            return slot.html;
        }
        // Component node
        if (slot.type && slot.name) {
            return compose([slot], context);
        }
        return '';
    }

    if (!Array.isArray(slot)) {
        return '';
    }

    return slot.map(child => {
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
            // Explicit raw HTML opt-in
            if (typeof child.html === 'string' && !child.type) {
                return child.html;
            }
            // Component node
            if (child.type && child.name) {
                return compose([child], context);
            }
        }
        return '';
    }).filter(Boolean).join('\n');
};

/**
 * Safely executes a render function with error handling
 * @private
 */
const safeRender = (comp, props, componentName, componentType) => {
    try {
        const renderFn = typeof comp === 'function' ? comp : comp?.render;

        if (typeof renderFn !== 'function') {
            throw new Error('Component must be a function or have a render method');
        }

        return renderFn(props);
    } catch (error) {
        console.error(
            `Failed to render ${componentType}/${componentName}:`,
            error
        );

        errorTracker.track({
            type: 'render_error',
            component: `${componentType}/${componentName}`,
            message: error.message,
            stack: error.stack
        });

        return renderErrorFallback(
            componentName,
            componentType,
            error.message || 'Unknown error'
        );
    }
};

/**
 * Rewrite relative asset paths (./foo.png) to route-based absolute paths.
 * @private
 */
const rewriteAssetPaths = (props, context) => {
    const finalProps = { ...props };

    if (context.route?.pattern?.pathname) {
        const routeBasePath = path.dirname(context.route.pattern.pathname);
        const pathProps = ['src', 'href', 'poster'];

        for (const prop of pathProps) {
            if (typeof finalProps[prop] === 'string' && finalProps[prop].startsWith('./')) {
                const newPath = path.join(routeBasePath, finalProps[prop].substring(2));
                finalProps[prop] = newPath.replace(/\\/g, '/');
            }
        }
    }

    return finalProps;
};

/**
 * Composes an array of component objects into HTML
 *
 * Features:
 * - Escape-by-default for plain-text slots (XSS-safe)
 * - Nested component slots render as trusted HTML (no double-escape)
 * - Explicit raw HTML via { html: '...' }
 * - Caches rendered components
 * - Graceful error handling with visual fallback
 *
 * @param {Array<Object>} components - Array of component objects to compose
 * @param {Object} [context={}] - Compose context (route, dependencies, ...)
 * @returns {string} Rendered HTML string
 */
export const compose = (components = [], context = {}) => {
    return components.map(component => {
        if (!component || typeof component !== 'object') {
            return '';
        }

        const { type, name, props = {} } = component;

        if (!type || !name) {
            return '';
        }

        // Track dependency if we have a dependencies set in context
        if (context.dependencies instanceof Set) {
            context.dependencies.add(`${type}:${name}`);
        }

        const comp = getComponent(type, name);

        if (!comp) {
            console.warn(`Component not found: ${type}/${name}`);
            return renderErrorFallback(name, type, 'Component not found in library');
        }

        // Path rewriting — must apply to the props actually rendered
        const finalProps = rewriteAssetPaths(props, context);
        const componentWithFinalProps = { type, name, props: finalProps };

        const cached = renderCache.get(componentWithFinalProps);
        if (cached) {
            return cached;
        }

        let slotContent = '';
        if (finalProps.slot !== undefined && finalProps.slot !== null) {
            slotContent = composeSlot(finalProps.slot, context);
        }

        const html = safeRender(
            comp,
            { ...finalProps, slot: slotContent },
            name,
            type
        );

        renderCache.set(componentWithFinalProps, html);
        return html;
    }).filter(Boolean).join('\n');
};

/**
 * Clears the composition cache
 */
export const clearCompositionCache = () => {
    renderCache.clear();
};

/**
 * Gets the current size of the composition cache
 * @returns {number}
 */
export const getCompositionCacheSize = () => {
    return renderCache.getStats().size;
};

/**
 * Set custom error fallback renderer
 * @param {Function} renderer - (error, component) => html
 */
export const setErrorFallback = (renderer) => {
    setErrorFallbackRenderer(renderer);
};

/**
 * Reset error fallback to the default renderer
 */
export const resetErrorFallback = () => {
    resetErrorFallbackRenderer();
};

/**
 * Get error statistics
 */
export const getErrorStats = () => {
    return errorTracker.getStats();
};

/**
 * Get all tracked errors
 */
export const getErrors = () => {
    return errorTracker.getErrors();
};

/**
 * Get errors for specific component
 */
export const getComponentErrors = (componentName) => {
    return errorTracker.getErrorsByComponent(componentName);
};

/**
 * Clear error tracking
 */
export const clearErrors = () => {
    errorTracker.clear();
};

/**
 * Clear the render cache
 */
export const clearCache = () => {
    renderCache.clear();
    console.log('[compose] Cache cleared');
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
    return renderCache.getStats();
};

/**
 * Compose a single component (convenience function)
 */
export const composeOne = (component, options) => {
    return compose([component], options);
};

/**
 * Pre-warm the cache with common components
 */
export const warmCache = (components) => {
    console.log(`[compose] Warming cache with ${components.length} components...`);
    const start = performance.now();

    compose(components, { cache: true });

    const end = performance.now();
    const stats = renderCache.getStats();

    console.log(`[compose] Cache warmed in ${(end - start).toFixed(2)}ms`);
    console.log(`[compose] Cache stats:`, stats);
};

/**
 * Batch compose multiple component arrays
 */
export const composeBatch = (batches, options) => {
    return batches.map(batch => compose(batch, options));
};

// Export cache, error tracker, and slot processor for advanced use / testing
export { renderCache, errorTracker, composeSlot, processTextSlot, getErrorFallbackRenderer };
