import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validatePropTypes } from '../../utils/componentError.js';

/**
 * Divider component - An HTML hr element for visual content separation
 * 
 * Renders an HTML horizontal rule (hr) element for creating visual breaks
 * between sections of content. Semantic element that helps structure content
 * and improve readability. Useful for separating content blocks, sections,
 * or creating visual rhythm in layouts.
 * 
 * @param {Object} [props={}] - Component properties (all optional)
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'data-section="break" aria-hidden="true"')
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * 
 * @returns {string} Rendered HTML hr element (self-closing)
 * 
 * @example
 * // Basic divider
 * divider()
 * // Returns: '<hr class="divider"/>'
 * 
 * @example
 * // Divider with custom class
 * divider({ className: 'section-break thick' })
 * // Returns: '<hr class="divider section-break thick"/>'
 * 
 * @example
 * // Divider with ID for styling
 * divider({ 
 *   attrs: 'id="main-divider",
 *   className: 'gradient'
 * })
 * // Returns: '<hr class="divider gradient" id="main-divider"/>'
 * 
 * @example
 * // Decorative divider (hidden from screen readers)
 * divider({ 
 *   attrs: 'aria-hidden=true',
 *   className: 'fancy-decoration'
 * })
 * // Returns: '<hr class="divider fancy-decoration" aria-hidden="true"/>'
 * 
 * @example
 * // Divider with data attributes
 * divider({ 
 *   attrs: 'data-spacing="large" data-style="dashed"'
 * })
 * // Returns: '<hr class="divider" data-spacing="large" data-style="dashed"/>'
 * 
 * @example
 * // Multiple dividers with different styles
 * divider({ className: 'solid' })
 * divider({ className: 'dashed' })
 * divider({ className: 'dotted' })
 */
export const divider = ({
    attrs = '',
    className = ''
} = {}) => {
    // Validate prop types
    validatePropTypes(
        { attrs, className },
        { 
            attrs: 'string',
            className: 'string'
        },
        { componentName: 'divider', componentType: 'atom' }
    );
    
    // Process attributes
    attrs = attrs ? ` ${attrs}` : '';
    
    // Normalize and escape classes
    const classes = normalizeClasses(['divider', className]);
    
    return `<hr class="${classes}"${attrs}/>`;
};