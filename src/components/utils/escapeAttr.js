/**
 * Escapes HTML attribute values
 * Stricter than escapeHtml, suitable for attribute contexts
 * @param {string} value - The attribute value to escape
 * @returns {string} The escaped attribute value
 * @example
 * escapeAttr('onclick="alert(1)"')
 * // Returns: 'onclick=&quot;alert(1)&quot;'
 */
export const escapeAttr = (value) => {
    if (typeof value !== 'string') {
        return '';
    }
    
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};