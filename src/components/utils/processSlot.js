import { escapeHtml } from './escapeHtml.js';

/**
 * Processes slot content safely
 * Handles strings, arrays, and nested component structures
 * Component-rendered HTML is trusted, user strings are escaped
 * 
 * @param {string | Array<string | Object>} slot - The slot content to process
 * @param {Object} [options] - Processing options
 * @param {boolean} [options.escape=true] - Whether to escape HTML in string content
 * @param {boolean} [options.trim=false] - Whether to trim whitespace
 * @returns {string} The processed and safe slot content
 * 
 * @example
 * // Escapes user input
 * processSlot('<script>alert(1)</script>')
 * // Returns: '&lt;script&gt;alert(1)&lt;/script&gt;'
 * 
 * @example
 * // Handles arrays
 * processSlot(['Hello', ' ', 'World'])
 * // Returns: 'Hello World'
 * 
 * @example
 * // Trusts component-rendered HTML
 * processSlot('<button class="btn">Click</button>', { escape: false })
 * // Returns: '<button class="btn">Click</button>'
 */
export const processSlot = (slot, options = {}) => {
    const { escape = true, trim = false } = options;
    
    // Handle null/undefined
    if (slot === null || slot === undefined) {
        return '';
    }
    
    // Handle arrays - recursively process each item
    if (Array.isArray(slot)) {
        const processed = slot
            .filter(item => item !== null && item !== undefined)
            .map(item => {
                // If it's a string in an array, it might be user content
                if (typeof item === 'string') {
                    return escape ? escapeHtml(item) : item;
                }
                // If it's an object, it's likely a component structure
                // (will be handled by compose function)
                return item;
            })
            .join('');
        
        return trim ? processed.trim() : processed;
    }
    
    // Handle strings
    if (typeof slot === 'string') {
        const processed = escape ? escapeHtml(slot) : slot;
        return trim ? processed.trim() : processed;
    }
    
    // Handle numbers, booleans, etc.
    if (typeof slot === 'number' || typeof slot === 'boolean') {
        return String(slot);
    }
    
    // Unknown type, return empty
    console.warn(`processSlot received unexpected type: ${typeof slot}`, slot);
    return '';
};

/**
 * Processes slot content but trusts it as pre-rendered HTML
 * Use this when content comes from other components or template literals
 * 
 * @param {string | Array<string>} slot - The trusted slot content
 * @returns {string} The processed slot content without escaping
 * 
 * @example
 * processSlotTrusted('<div class="box">Content</div>')
 * // Returns: '<div class="box">Content</div>' (unescaped)
 */
export const processSlotTrusted = (slot) => {
    return processSlot(slot, { escape: false });
};

/**
 * Processes user-provided content that should always be escaped
 * Use this for any content that comes from external sources
 * 
 * @param {string | Array<string>} slot - The user content to escape
 * @returns {string} The escaped and safe content
 * 
 * @example
 * processSlotUser('<img src=x onerror=alert(1)>')
 * // Returns: '&lt;img src=x onerror=alert(1)&gt;'
 */
export const processSlotUser = (slot) => {
    return processSlot(slot, { escape: true });
};