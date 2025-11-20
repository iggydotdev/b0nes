import library from '../components/library.js';

const componentLibrary = {
    atom: library.atoms,
    molecule: library.molecules,
    organism: library.organisms
};

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
const composeSlot = (slot) => {
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
            return compose([child]);
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
export const compose = (components = []) => {
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

        const cacheKey = getCacheKey(component);

        if (compositionCache.has(cacheKey)) {
            return compositionCache.get(cacheKey);
        }

        let slotContent = '';
        if (props.slot !== undefined && props.slot !== null) {
            slotContent = composeSlot(props.slot);
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