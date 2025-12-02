
import path from 'path';

import library from '../components/library.js';

const componentLibrary = {
    atom: library.atoms,
    molecule: library.molecules,
    organism: library.organisms
};

import { createRenderCache } from "./utils/compose/createRenderCache.js";
import { createErrorTracker } from "./utils/compose/errorTracker.js";

const renderCache = createRenderCache(500);
const errorTracker = createErrorTracker(100);

const compositionCache = new Map();

/**
 * Creates a cache key for a component composition
 * @param {Object} component - Component object
 * @param {string} component.type - Component type (atom, molecule, organism)
 * @param {string} component.name - Component name
 * @param {Object} component.props - Component props
 * @returns {string} Cache key
 * @private
 */
const getCacheKey = (component) => {
    return `${component.type}:${component.name}:${JSON.stringify(component.props)}`;
};

/**
 * Renders a fallback error component when composition fails
 * @param {string} componentName - Name of the component that failed
 * @param {string} componentType - Type of the component (atom, molecule, organism)
 * @param {string} errorMessage - Error message describing what went wrong
 * @returns {string} HTML string with error message
 * @private
 */
const renderErrorFallback = (componentName, componentType, errorMessage) => {
    const sanitizedName = String(componentName).replace(/[<>"']/g, '');
    const sanitizedType = String(componentType).replace(/[<>"']/g, '');
    const sanitizedError = String(errorMessage).replace(/[<>"']/g, '');

    return `<div style="border: 2px solid #ef4444; background-color: #fee2e2; color: #7f1d1d; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  <strong>Component Error:</strong> ${sanitizedType}/${sanitizedName}<br>
  <small>${sanitizedError}</small>
</div>`;
};

/**
 * Safely retrieves a component from the library
 * @param {string} type - Component type (atom, molecule, organism)
 * @param {string} name - Component name
 * @returns {Function|Object|null} Component render function or object, or null if not found
 * @private
 */
const getComponent = (type, name) => {
    const lib = componentLibrary[type];
    if (!lib) return null;
    return lib[name] || null;
};

/**
 * Recursively composes nested component slots
 * @param {Array|string} slot - Slot content (can be string or array of component objects)
 * @returns {string} Rendered HTML string
 * @private
 */
const composeSlot = (slot, context) => {
    if (typeof slot === 'string') {
        return slot;
    }

    if (!Array.isArray(slot)) {
        return '';
    }

    return slot.map(child => {
        if (typeof child === 'string') {
            return child;
        }
        if (typeof child === 'object' && child !== null) {
            return compose([child], context);
        }
        return '';
    }).filter(Boolean).join('\n');
};

/**
 * Safely executes a render function with error handling
 * @param {Function|Object} comp - Component (function or object with render method)
 * @param {Object} props - Props to pass to component
 * @param {string} componentName - Name of component (for error reporting)
 * @param {string} componentType - Type of component (for error reporting)
 * @returns {string} Rendered HTML or error fallback
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
        return renderErrorFallback(
            componentName,
            componentType,
            error.message || 'Unknown error'
        );
    }
};

/**
 * Composes an array of component objects into HTML
 *
 * Features:
 * - Caches rendered components to improve performance
 * - Handles nested slot composition recursively
 * - Provides graceful error handling with visual fallback
 * - Logs errors for debugging
 *
 * @param {Array<Object>} components - Array of component objects to compose
 * @param {string} components[].type - Component type ('atom', 'molecule', 'organism')
 * @param {string} components[].name - Component name (must exist in library)
 * @param {Object} components[].props - Props to pass to component
 * @param {string|Array} [components[].props.slot] - Slot content (string or nested components)
 * @returns {string} Rendered HTML string
 *
 * @example
 * const html = compose([
 *   {
 *     type: 'atom',
 *     name: 'text',
 *     props: { slot: 'Hello World' }
 *   },
 *   {
 *     type: 'molecule',
 *     name: 'card',
 *     props: {
 *       slot: [
 *         { type: 'atom', name: 'text', props: { slot: 'Card Title' } }
 *       ]
 *     }
 *   }
 * ]);
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

        const comp = getComponent(type, name);

        if (!comp) {
            console.warn(
                `Component not found: ${type}/${name}`
            );
            return renderErrorFallback(name, type, 'Component not found in library');
        }

                // --- NEW: PATH REWRITING LOGIC ---
        // Create a mutable copy of props to allow for path rewriting.
        const finalProps = { ...props };

        // If we have a route context (from the build process), rewrite relative asset paths.
        if (context.route && context.route.pattern && context.route.pattern.pathname) {
            const routeBasePath = path.dirname(context.route.pattern.pathname);
            const pathProps = ['src', 'href', 'poster']; // Props that might contain asset paths

            for (const prop of pathProps) {
                if (typeof finalProps[prop] === 'string' && finalProps[prop].startsWith('./')) {
                    // Create a root-relative path, e.g., /examples/talk/qr-code.png
                    const newPath = path.join(routeBasePath, finalProps[prop].substring(2));
                    // Ensure forward slashes for URL compatibility
                    finalProps[prop] = newPath.replace(/\\/g, '/');
                }
            }
        }
        // --- END OF NEW LOGIC ---

        // Use the (potentially modified) finalProps for caching and rendering.
        const componentWithFinalProps = { type, name, props: finalProps };
       

        const cacheKey = getCacheKey(component);

        if (compositionCache.has(cacheKey)) {
            return compositionCache.get(cacheKey);
        }

        let slotContent = '';
        if (props.slot !== undefined && props.slot !== null) {
            slotContent = composeSlot(props.slot, context);
        }

        const html = safeRender(
            comp,
            { ...props, slot: slotContent },
            name,
            type
        );

        compositionCache.set(cacheKey, html);
        return html;
    }).filter(Boolean).join('\n');
};

/**
 * Clears the composition cache
 * Useful for development/testing or when you need to force re-render
 *
 * @returns {void}
 *
 * @example
 * clearCompositionCache();
 */
export const clearCompositionCache = () => {
    compositionCache.clear();
};

/**
 * Gets the current size of the composition cache
 * Useful for debugging performance
 *
 * @returns {number} Number of cached compositions
 *
 * @example
 * const cacheSize = getCompositionCacheSize();
 * console.log(`Cached ${cacheSize} compositions`);
 */
export const getCompositionCacheSize = () => {
    return compositionCache.size;
};





// /**
//  * Compose components with error boundaries and intelligent caching
//  * @param {Array} components - Array of component configurations
//  * @param {Object} options - Composition options
//  * @param {boolean} options.cache - Enable/disable caching (default: true)
//  * @param {boolean} options.throwOnError - Throw on first error instead of using fallback (default: false)
//  * @param {Function} options.onError - Callback for errors (error, component) => void
//  * @returns {string} Composed HTML
//  */
// export const compose = (components = [], options = {}) => {
//     const { 
//         cache = true,
//         throwOnError = false,
//         onError = null
//     } = options;
    
//     if (!Array.isArray(components)) {
//         console.warn('[compose] Components must be an array, got:', typeof components);
//         return '';
//     }
    
//     if (components.length === 0) {
//         return '';
//     }
    
//     const results = [];
//     const errors = [];
    
//     for (const component of components) {
//         const result = safeRenderComponent(component, { cache });
        
//         if (result.success) {
//             results.push(result.html);
//         } else {
//             errors.push(result.error);
            
//             // Call error callback if provided
//             if (onError && typeof onError === 'function') {
//                 try {
//                     onError(result.error, component);
//                 } catch (callbackError) {
//                     console.error('[compose] Error in onError callback:', callbackError);
//                 }
//             }
            
//             // Throw if requested
//             if (throwOnError) {
//                 throw new Error(
//                     `Component render failed: ${result.error.message}`,
//                     { cause: result.error }
//                 );
//             }
            
//             // Use fallback
//             results.push(result.fallback);
//         }
//     }
    
//     // Log summary if there were errors
//     if (errors.length > 0 && process.env.NODE_ENV === 'development') {
//         console.warn(
//             `[compose] Rendered ${components.length} components with ${errors.length} error(s)`
//         );
//     }
    
//     return results.join('\n');
// };

/**
 * Set custom error fallback renderer
 * @param {Function} renderer - Custom renderer function (error, component) => html
 */
export const setErrorFallback = (renderer) => {
    if (typeof renderer !== 'function') {
        throw new Error('[compose] Error fallback must be a function');
    }
    errorFallbackRenderer = renderer;
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

// Export cache and error tracker instances for advanced use
export { renderCache, errorTracker };