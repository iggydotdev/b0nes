import { html as trustedHTML, isHTML, restoreHTML } from '../../components/utils/html.js';
import { resolveAssetPath } from '../server/handlers/resolveAssetPath.js';

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
    if (!lib || !Object.hasOwn(componentLibrary, type)) return null;
    return Object.hasOwn(lib, name) ? lib[name] : null;
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
    if (slot == null) return '';
    if (isHTML(slot)) {
        slot.dependencies.forEach(dep => context.dependencies?.add(dep));
        return String(slot);
    }
    if (Array.isArray(slot)) return slot.map(child => composeSlot(child, context)).join('');
    if (typeof slot === 'object') {
        if ('html' in slot && !slot.type) return composeSlot(restoreHTML(slot), context);
        if (slot.type && slot.name) return compose([slot], context);
        throw new TypeError('Invalid content object');
    }
    return processTextSlot(String(slot));
};

/**
 * Safely executes a render function with error handling
 * @private
 */
const safeRender = (comp, props, componentName, componentType, context) => {
    try {
        const renderFn = typeof comp === 'function' ? comp : comp?.render;

        if (typeof renderFn !== 'function') {
            throw new Error('Component must be a function or have a render method');
        }

        return String(renderFn(props));
    } catch (error) {
        if (context.strict) throw new Error(`Failed to render ${componentType}/${componentName}: ${error.message}`, { cause: error });
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
        const pathProps = ['src', 'href', 'poster'];

        for (const prop of pathProps) {
            if (typeof finalProps[prop] === 'string' && finalProps[prop].startsWith('./')) {
                const newPath = resolveAssetPath(finalProps[prop], context.route.pattern.pathname);
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
        if (isHTML(component) || component?.html !== undefined) return composeSlot(component, context);
        if (!component || typeof component !== 'object') {
            if (context.strict) throw new TypeError('Invalid component descriptor');
            return '';
        }

        const { type, name, props = {} } = component;

        if (!type || !name) {
            if (context.strict) throw new TypeError('Components require type and name');
            return '';
        }

        // Track dependency if we have a dependencies set in context
        if (context.dependencies instanceof Set) {
            context.dependencies.add(`${type}:${name}`);
        }

        const comp = getComponent(type, name);

        if (!comp) {
            if (context.strict) throw new Error(`Component not found: ${type}/${name}`);
            console.warn(`Component not found: ${type}/${name}`);
            return renderErrorFallback(name, type, 'Component not found in library');
        }

        // Path rewriting — must apply to the props actually rendered
        const finalProps = rewriteAssetPaths(props, context);
        const componentWithFinalProps = {
            type, name, props: finalProps,
            routePath: context.route?.pattern?.pathname,
            strict: Boolean(context.strict)
        };

        const cached = renderCache.get(componentWithFinalProps, context.dependencies);
        if (cached) {
            return cached;
        }

        const dependencies = new Set([`${type}:${name}`]);
        const childContext = { ...context, dependencies };
        const prepare = (value, key = '') => {
            if (value == null) return value;
            // Textarea content is text even when it resembles markup.
            if (type === 'atom' && name === 'textarea' && ['slot', 'value'].includes(key)) return value;
            if (isHTML(value) || (typeof value === 'object' && (value.type && value.name || 'html' in value)) ||
                key === 'slot' || key.endsWith('Slot') || ['content', 'label', 'trigger'].includes(key) || (name === 'modal' && key === 'title')) {
                const output = composeSlot(value, childContext);
                return output === '' ? '' : trustedHTML(output);
            }
            if (key === 'attrs') return value;
            if (Array.isArray(value)) return value.map(item => prepare(item));
            if (typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, prepare(v, k)]));
            return value;
        };
        const renderedProps = Object.fromEntries(Object.entries(finalProps).map(([key, value]) => [key, prepare(value, key)]));

        const html = safeRender(
            comp,
            renderedProps,
            name,
            type,
            context
        );

        dependencies.forEach(dep => context.dependencies?.add(dep));
        renderCache.set(componentWithFinalProps, html, dependencies);
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
