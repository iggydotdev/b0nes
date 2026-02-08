import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes, createComponentError } from '../../utils/componentError.js';
import { attrsToString } from '../../utils/attrsToString.js';

/**
 * Input component - An HTML input element for form data collection
 * 
 * Renders an HTML input element with type validation, accessibility features,
 * and customizable styling. Supports all standard HTML input types including
 * text, email, password, number, date, checkbox, radio, file, and more.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.type - Input type (text, email, password, number, tel, url, search, date, time, checkbox, radio, file, etc.)
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'placeholder="Enter text" required')
 * @param {string} [props.className=''] - Additional CSS classes to apply

 * 
 * @returns {string} Rendered HTML input element (self-closing)
 * 
 * @throws {ComponentError} If required props are missing or have invalid types
 * 
 * @example
 * // Basic text input
 * input({ type: 'text', attrs:'name="username" placeholder="Enter username"'})
 * // Returns: '<input type="text" class="input" name="username" placeholder="Enter username"/>'
 * 
 * @example
 * // Email input with validation
 * input({
 *   type: 'email',
 *   attrs: 'name="email" id="email-field" placeholder="your@email.com" required'
 * })
 * // Returns: '<input type="email" class="input" name="email" id="email-field" placeholder="your@email.com" required/>'
 * 
 * @example
 * // Password input with custom class
 * input({
 *   type: 'password',
 *   className: 'secure-input',
 *   attrs:'name="password" minlength="8" autocomplete="new-password"'
 * })
 * // Returns: '<input type="password" class="input secure-input" name="password"  minlength="8" autocomplete="new-password"/>'
 * 
 * @example
 * // Number input with min/max
 * input({
 *   type: 'number',
 *   attrs: 'name="age" value="25" min="0" max="120" step="1"'
 * })
 * // Returns: '<input type="number" class="input" name="age" value="25" min="0" max="120" step="1"/>'
 * 
 * @example
 * // Checkbox input
 * input({
 *   type: 'checkbox',
 *   attrs: 'name="terms" id="terms-checkbox" value="accepted" checked'
 * })
 * // Returns: '<input type="checkbox" class="input" name="terms" id="terms-checkbox" value="accepted" checked/>'
 * 
 * @example
 * // File input with accept
 * input({
 *   type: 'file',
 *   attrs: 'name="avatar" accept="image/png, image/jpeg"'
 * })
 * // Returns: '<input type="file" class="input" name="avatar" accept="image/png, image/jpeg"/>'
 * 
 * @example
 * // Accessible input with ARIA
 * input({
 *   type: 'text',
 *   attrs: 'name="search" aria-label="Search products" aria-describedby="search-help"'
 * })
 * // Returns: '<input type="text" class="input" name="search" aria-label="Search products" aria-describedby="search-help"/>'
 */
export const input = ({
    type = 'text',
    attrs = '',
    className = ''
}) => {
    // Validate prop types
    validatePropTypes(
        { type, className },
        { 
            type: 'string',
            className: 'string'
        },
        { componentName: 'input', componentType: 'atom' }
    );
    
    // Validate input type
    const validTypes = [
        'text', 'email', 'password', 'number', 'tel', 'url', 'search',
        'date', 'time', 'datetime-local', 'month', 'week',
        'checkbox', 'radio', 'file', 'color', 'range',
        'hidden', 'submit', 'reset', 'button'
    ];
    
    if (!validTypes.includes(type)) {
        console.warn(
            `[b0nes Warning] Unknown input type: "${type}". ` +
            `Valid types are: ${validTypes.join(', ')}. ` +
            `Defaulting to "text".`
        );
    }
    
    // Process attributes (supports string or object)
    const attrsStr = attrsToString(attrs);
    
    // Normalize and escape classes
    const classes = normalizeClasses(['input', className]);
    
    return `<input type="${type}" class="${classes}"${attrsStr}/>`;
};
