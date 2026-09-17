/**
 * Default error fallback renderer
 * Override via setErrorFallbackRenderer() for custom error UI
 */

const sanitize = (value) => String(value ?? '').replace(/[<>"']/g, '');

/**
 * Built-in fallback used when no custom renderer is set.
 * Always renders a visible, sanitized error box so missing/broken
 * components are obvious during SSR/SSG. Override with
 * setErrorFallbackRenderer() for silent production behavior.
 *
 * @param {Object} error - Error info ({ message, details, stack, ... })
 * @param {Object} component - Component descriptor ({ type, name, ... })
 * @returns {string} Fallback HTML
 */
export const defaultErrorFallbackRenderer = (error, component) => {
    const isDev = process.env.NODE_ENV === 'development';
    const type = sanitize(component?.type || 'unknown');
    const name = sanitize(component?.name || 'unknown');
    const message = sanitize(error?.message || 'Unknown error');
    const details = error?.details ? sanitize(error.details) : '';
    const stack = isDev && error?.stack ? sanitize(error.stack) : '';

    return `<div style="border: 2px solid #ef4444; background-color: #fee2e2; color: #7f1d1d; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 12px;">
  <strong>Component Error:</strong> ${type}/${name}<br>
  <small>${message}</small>
  ${details ? `<br><small>${details}</small>` : ''}
  ${stack ? `<details style="margin-top: 0.5rem;"><summary>Stack Trace</summary><pre style="font-size: 0.8em; overflow-x: auto;">${stack}</pre></details>` : ''}
</div>`;
};

/** @type {(error: Object, component: Object) => string} */
let currentRenderer = defaultErrorFallbackRenderer;

/**
 * Get the active error fallback renderer
 * @returns {(error: Object, component: Object) => string}
 */
export const getErrorFallbackRenderer = () => currentRenderer;

/**
 * Set a custom error fallback renderer
 * @param {(error: Object, component: Object) => string} renderer
 */
export const setErrorFallbackRenderer = (renderer) => {
    if (typeof renderer !== 'function') {
        throw new Error('[compose] Error fallback must be a function');
    }
    currentRenderer = renderer;
};

/**
 * Reset to the default error fallback renderer
 */
export const resetErrorFallbackRenderer = () => {
    currentRenderer = defaultErrorFallbackRenderer;
};

/**
 * Invoke the active renderer (convenience)
 * @param {Object} error
 * @param {Object} component
 * @returns {string}
 */
export const renderErrorFallback = (error, component) => currentRenderer(error, component);

// Back-compat: callable export that always uses the current renderer
export const errorFallbackRenderer = (error, component) => currentRenderer(error, component);
