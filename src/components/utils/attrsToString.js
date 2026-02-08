import { escapeAttr } from './escapeAttr.js';

/**
 * Converts an attrs prop (object or string) into a safe HTML attribute string.
 * 
 * When given an object, each key-value pair is escaped and serialized.
 * When given a string, it is passed through for backwards compatibility.
 * Boolean `true` values produce valueless attributes (e.g., `disabled`).
 * Boolean `false`, `null`, and `undefined` values are omitted entirely.
 * 
 * @param {string | Object<string, string | boolean | number>} attrs - Attributes as object or legacy string
 * @returns {string} A safe, space-prefixed HTML attribute string (or empty string)
 * 
 * @example
 * // Object form (recommended)
 * attrsToString({ id: 'main', 'data-active': true, disabled: true })
 * // Returns: ' id="main" data-active disabled'
 * 
 * @example
 * // Boolean false / null / undefined are omitted
 * attrsToString({ id: 'main', hidden: false, 'data-x': null })
 * // Returns: ' id="main"'
 * 
 * @example
 * // Number values are stringified
 * attrsToString({ tabindex: 0, 'data-count': 42 })
 * // Returns: ' tabindex="0" data-count="42"'
 * 
 * @example
 * // Legacy string form (backwards compatible, passed through as-is)
 * attrsToString('id="main" disabled')
 * // Returns: ' id="main" disabled'
 * 
 * @example
 * // Empty / falsy input
 * attrsToString('')   // Returns: ''
 * attrsToString({})   // Returns: ''
 * attrsToString(null) // Returns: ''
 */
export const attrsToString = (attrs) => {
    // Falsy: return empty
    if (!attrs) return '';

    // Legacy string path: pass through with leading space
    if (typeof attrs === 'string') {
        return attrs.length > 0 ? ` ${attrs}` : '';
    }

    // Object path: escape and serialize
    if (typeof attrs === 'object' && !Array.isArray(attrs)) {
        const parts = [];

        for (const [key, value] of Object.entries(attrs)) {
            // Skip falsy non-zero values
            if (value === false || value === null || value === undefined) continue;

            // Validate attribute name: only allow safe characters
            if (!/^[a-zA-Z_][\w\-:.]*$/.test(key)) {
                console.warn(
                    `[b0nes Warning] Invalid attribute name: "${key}". Skipping.`
                );
                continue;
            }

            // Boolean true -> valueless attribute (e.g. disabled, checked, open)
            if (value === true) {
                parts.push(key);
                continue;
            }

            // Numbers and strings -> escaped value
            const escaped = escapeAttr(String(value));
            parts.push(`${key}="${escaped}"`);
        }

        return parts.length > 0 ? ` ${parts.join(' ')}` : '';
    }

    // Anything else: warn and return empty
    console.warn(
        `[b0nes Warning] attrs must be a string or object. Got: ${typeof attrs}`
    );
    return '';
};
