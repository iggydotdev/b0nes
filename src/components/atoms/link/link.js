import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes, createComponentError } from '../../utils/componentError.js';
import { attrsToString } from '../../utils/attrsToString.js';

/**
 * Link component - An HTML anchor element for navigation
 * 
 * Renders an HTML anchor (<a>) element with URL validation, security features,
 * and customizable styling. Automatically adds rel="noopener noreferrer" for
 * external links that open in new tabs to prevent security vulnerabilities.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.url - The destination URL (href attribute)
 * @param {string} props.slot - Link text or child components
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'data-track="click"')
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * 
 * @returns {string} Rendered HTML anchor element
 * 
 * @throws {ComponentError} If required props (url, slot) are missing or have invalid types
 * 
 * @example
 * // Basic internal link
 * link({ url: '/about', slot: 'About Us' })
 * // Returns: '<a href="/about" class="link">About Us</a>'
 * 
 * @example
 * // External link with security (opens in new tab)
 * link({ 
 *   url: 'https://example.com',
 *   slot: 'Visit Example',
 *   attrs: 'target="_blank" rel="noopener noreferrer"'
 * })
 * // Returns: '<a href="https://example.com" class="link" target="_blank" rel="noopener noreferrer">Visit Example</a>'
 * 
 * @example
 * // Link with custom styling and attributes
 * link({
 *   url: '/contact',
 *   slot: 'Get in Touch',
 *   className: 'btn primary',
 *   attrs: 'data-track="nav-click" id="contact-link"'
 * })
 * // Returns: '<a href="/contact" class="link btn primary" data-track="nav-click" id="contact-link">Get in Touch</a>'
 * 
 * @example
 * // Accessible link with aria-label
 * link({
 *   url: '/profile',
 *   slot: '<img src="avatar.jpg" alt=""/>',
 *   attrs: 'aria-label="View user profile"'
 * })
 * // Returns: '<a href="/profile" class="link" aria-label="View user profile"><img src="avatar.jpg" alt=""/></a>'
 * 
 * @example
 * // Download link
 * link({
 *   url: '/files/document.pdf',
 *   slot: 'Download PDF',
 *   attrs: 'download'
 * })
 * // Returns: '<a href="/files/document.pdf" class="link" download>Download PDF</a>'
 */
export const link = ({
    url,
    slot,
    attrs = '',
    className = ''
}) => {
    // Validate required props
    validateProps(
        { url, slot },
        ['url', 'slot'],
        { componentName: 'link', componentType: 'atom' }
    );
    
    // Validate prop types
    validatePropTypes(
        { url, className },
        { 
            url: 'string',
            className: 'string'
        },
        { componentName: 'link', componentType: 'atom' }
    );
    
    // Validate URL is not empty
    if (url.trim().length === 0) {
        throw createComponentError(
            'URL cannot be empty',
            { componentName: 'link', componentType: 'atom', props: { url, slot } }
        );
    }
      
    // Process attributes (supports string or object)
    const attrsStr = attrsToString(attrs);
    
    // Normalize and escape classes
    const classes = normalizeClasses(['link', className]);
    
    // Process slot content (trust component-rendered HTML)
    const slotContent = processSlotTrusted(slot);
        
    return `<a href="${url}" class="${classes}"${attrsStr}>${slotContent}</a>`;
};
