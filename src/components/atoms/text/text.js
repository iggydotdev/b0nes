import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes, createComponentError } from '../../utils/componentError.js';
import { escapeAttr } from '../../utils/escapeAttr.js';

/**
 * Text component - A flexible text container element
 * 
 * Renders any HTML text element (p, span, h1-h6, div, strong, em, etc.) with 
 * customizable content and styling. Useful for semantic HTML and consistent typography.
 * Supports all standard HTML text tags for maximum flexibility.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.is - HTML tag name (e.g., 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'strong', 'em', 'mark', 'small', 'label')
 * @param {string | Array<string>} props.slot - Text content or child components
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'id="title" data-section="intro"')
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * 
 * @returns {string} Rendered HTML text element
 * 
 * @throws {ComponentError} If required props (is, slot) are missing or have invalid types
 * 
 * @example
 * // Basic paragraph
 * text({ is: 'p', slot: 'This is a paragraph of text.' })
 * // Returns: '<p class="text">This is a paragraph of text.</p>'
 * 
 * @example
 * // Heading with custom class
 * text({ 
 *   is: 'h1', 
 *   slot: 'Welcome to My Site',
 *   className: 'page-title large'
 * })
 * // Returns: '<h1 class="text page-title large">Welcome to My Site</h1>'
 * 
 * @example
 * // Span with ID and attributes
 * text({
 *   is: 'span',
 *   slot: 'Status: Active',
 *   attrs: 'id="status" data-status="active"'
 * })
 * // Returns: '<span class="text" id="status" data-status="active">Status: Active</span>'
 * 
 * @example
 * // Label with ARIA attributes for accessibility
 * text({
 *   is: 'label',
 *   slot: 'Email Address',
 *   attrs: 'for="email-input" aria-label="Enter your email address"'
 * })
 * // Returns: '<label class="text" for="email-input" aria-label="Enter your email address">Email Address</label>'
 * 
 * @example
 * // Nested content with array slot
 * text({
 *   is: 'p',
 *   slot: [
 *     'This is ',
 *     '<strong>important</strong>',
 *     ' information.'
 *   ]
 * })
 * // Returns: '<p class="text">This is <strong>important</strong> information.</p>'
 * 
 * @example
 * // Semantic elements
 * text({ is: 'strong', slot: 'Bold text' })
 * text({ is: 'em', slot: 'Italic text' })
 * text({ is: 'mark', slot: 'Highlighted text' })
 * text({ is: 'small', slot: 'Small print' })
 */
export const text = ({
    is,
    slot,
    attrs = '',
    className = ''
}) => {
    // Validate required props
    validateProps(
        { is, slot },
        ['is', 'slot'],
        { componentName: 'text', componentType: 'atom' }
    );
    
    // Validate prop types
    validatePropTypes(
        { is, attrs, className },
        { 
            is: 'string',
            attrs: 'string',
            className: 'string'
        },
        { componentName: 'text', componentType: 'atom' }
    );
    
    // Validate that 'is' is not empty
    if (is.trim().length === 0) {
        throw createComponentError(
            'The "is" prop cannot be empty. Specify an HTML tag like "p", "h1", "span", etc.',
            { componentName: 'text', componentType: 'atom', props: { is, slot } }
        );
    }
    
    // Validate that 'is' contains only valid tag name characters
    // Allow letters, numbers, and hyphens (for custom elements)
    if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(is)) {
        throw createComponentError(
            `Invalid HTML tag name: "${is}". Tag names must start with a letter and contain only letters, numbers, and hyphens.`,
            { componentName: 'text', componentType: 'atom', props: { is, slot } }
        );
    }
    
    // Warn about potentially problematic tags
    const scriptTags = ['script', 'style', 'iframe', 'object', 'embed'];
    if (scriptTags.includes(is.toLowerCase())) {
        console.warn(
            `[b0nes Warning] Using "${is}" tag in text component. ` +
            `This may pose security or rendering issues. Consider using a different approach.`
        );
    }
    
    // Process attributes
    attrs = attrs ? ` ${attrs}` : '';
        
    // Normalize and escape classes
    const classes = normalizeClasses(['text', className]);
    
    // Process slot content (trust component-rendered HTML)
    const slotContent = processSlotTrusted(slot);
        
    return `<${is} class="${classes}"${attrs}>${slotContent}</${is}>`;
};