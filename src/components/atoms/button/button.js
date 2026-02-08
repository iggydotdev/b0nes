import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes } from '../../utils/componentError.js';
import { attrsToString } from '../../utils/attrsToString.js';

/**
 * Button component - A clickable button element
 * 
 * Renders an HTML button element with customizable type, styling, and content.
 * Automatically handles prop validation, HTML escaping, and class normalization.
 * 
 * @param {Object} props - Component properties
 * @param {('button'|'submit'|'reset')} [props.type='button'] - Button type attribute
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'id="submit-btn" disabled')
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * @param {string | Array<string>} props.slot - Button content (text or child components)
 * 
 * @returns {string} Rendered HTML button element
 * 
 * @throws {createComponentError} If required props are missing or invalid types provided
 * 
 * @example
 * // Basic button
 * button({ slot: 'Click Me' })
 * // Returns: '<button type="button" class="btn">Click Me</button>'
 * 
 * @example
 * // Submit button with custom classes
 * button({ 
 *   type: 'submit', 
 *   slot: 'Submit Form',
 *   className: 'primary large'
 * })
 * // Returns: '<button type="submit" class="btn primary large">Submit Form</button>'
 * 
 * @example
 * // Button with additional attributes
 * button({ 
 *   slot: 'Delete',
 *   className: 'danger',
 *   attrs: 'data-confirm="true" disabled'
 * })
 * // Returns: '<button type="button" class="btn danger" data-confirm="true" disabled>Delete</button>'
 * 
 * @example
 * // Button with nested components
 * button({
 *   slot: [
 *     'text({is:"span", classeName:"icon", slot:['→']})',
 *     ' Continue'
 *   ],
 *   type: 'submit'
 * })
 * // Returns: '<button type="submit" class="btn"><span class="icon">→</span> Continue</button>'
 */
export const button = ({
    type = 'button',
    attrs = '', 
    className = '',
    slot,
}) => {
    // Validate required props
    validateProps(
        { slot },
        ['slot'],
        { componentName: 'button', componentType: 'atom' }
    );
    
    // Validate prop types
    validatePropTypes(
        { type, className, slot },
        { 
            type: 'string',
            className: 'string',
            // slot can be string or array
        },
        { componentName: 'button', componentType: 'atom' }
    );
    
    // Validate button type
    const validTypes = ['button', 'submit', 'reset'];
    if (!validTypes.includes(type)) {
        throw new Error(
            `Invalid button type: "${type}". Must be one of: ${validTypes.join(', ')}`
        );
    }
    
    // Process attributes (supports string or object)
    const attrsStr = attrsToString(attrs);

    // Normalize classes
    const classes = normalizeClasses(['btn', className]);
    
    // Process slot content (trust component-rendered HTML)
    const slotContent = processSlotTrusted(slot);
    
    return `<button type="${type}" class="${classes}"${attrsStr}>${slotContent}</button>`;
};
