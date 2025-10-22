import { escapeAttr } from './escapeAttr.js';

/**
 * Normalizes CSS class names by removing extra whitespace and duplicates
 * Also escapes class names to prevent attribute injection
 * 
 * @param {string | Array<string> | Object} classes - Classes to normalize
 *   Can be a space-separated string, array of class names, or object with boolean values
 * @returns {string} Normalized, escaped, space-separated class string
 * 
 * @example
 * normalizeClasses('btn  primary   large')
 * // Returns: 'btn primary large'
 * 
 * @example
 * normalizeClasses(['btn', 'primary', '', 'large'])
 * // Returns: 'btn primary large'
 * 
 * @example
 * normalizeClasses({ btn: true, primary: true, disabled: false })
 * // Returns: 'btn primary'
 * 
 * @example
 * normalizeClasses('btn" onclick="alert(1)')
 * // Returns: 'btn&quot; onclick=&quot;alert(1)'
 */
export const normalizeClasses = (classes) => {
    if (!classes) return '';
    
    let classArray = [];
    
    // Handle different input types
    if (typeof classes === 'string') {
        classArray = classes.split(/\s+/);
    } else if (Array.isArray(classes)) {
        classArray = classes;
    } else if (typeof classes === 'object') {
        // Handle object notation: { className: boolean }
        classArray = Object.entries(classes)
            .filter(([_, include]) => include)
            .map(([className]) => className);
    } else {
        console.warn(`normalizeClasses received unexpected type: ${typeof classes}`);
        return '';
    }
    
    // Filter out empty strings, trim, remove duplicates, and escape
    const normalized = classArray
        .filter(c => c && typeof c === 'string')
        .map(c => c.trim())
        .filter(c => c.length > 0)
        .filter((c, index, self) => self.indexOf(c) === index) // Remove duplicates
        .map(c => escapeAttr(c)) // Escape for safety
        .join(' ');
    
    return normalized;
};

/**
 * Merges multiple class inputs into a single normalized string
 * Useful for combining base classes with custom classes
 * 
 * @param {...(string | Array<string> | Object)} classInputs - Multiple class inputs to merge
 * @returns {string} Merged and normalized class string
 * 
 * @example
 * mergeClasses('btn', 'primary', { large: true, disabled: false })
 * // Returns: 'btn primary large'
 * 
 * @example
 * mergeClasses('box', '', 'card custom-card')
 * // Returns: 'box card custom-card'
 */
export const mergeClasses = (...classInputs) => {
    const allClasses = classInputs
        .map(input => normalizeClasses(input))
        .filter(c => c.length > 0)
        .join(' ');
    
    // Normalize again to remove any duplicates from merging
    return normalizeClasses(allClasses);
};

/**
 * Creates a class string with a base class and optional modifiers
 * Follows BEM-like naming convention
 * 
 * @param {string} base - Base class name
 * @param {string | Array<string> | Object} [modifiers] - Modifier classes
 * @returns {string} Combined class string
 * 
 * @example
 * createClassString('btn', 'primary large')
 * // Returns: 'btn btn-primary btn-large'
 * 
 * @example
 * createClassString('card', ['elevated', 'interactive'])
 * // Returns: 'card card-elevated card-interactive'
 */
export const createClassString = (base, modifiers) => {
    if (!base) return '';
    
    const escapedBase = escapeAttr(base);
    
    if (!modifiers) return escapedBase;
    
    const modifierArray = typeof modifiers === 'string' 
        ? modifiers.split(/\s+/)
        : Array.isArray(modifiers)
        ? modifiers
        : [];
    
    const modifierClasses = modifierArray
        .filter(m => m && typeof m === 'string')
        .map(m => m.trim())
        .filter(m => m.length > 0)
        .map(m => `${base}-${m}`)
        .map(m => escapeAttr(m));
    
    return [escapedBase, ...modifierClasses].join(' ');
};