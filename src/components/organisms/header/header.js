import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes } from '../../utils/componentError.js';

/**
 * Header component - A semantic header element for page/section headers
 * 
 * Renders an HTML header element typically used for site headers, navigation bars,
 * or section headers. Semantic HTML5 element that helps structure your page and
 * improves accessibility. Commonly contains logos, navigation, search, and actions.
 * 
 * Common use cases:
 * - Site-wide navigation header
 * - Article headers with title and metadata
 * - Section headers within pages
 * - Modal/dialog headers
 * 
 * @param {Object} props - Component properties
 * @param {string | Array<string>} props.slot - Header content (logo, nav, actions, etc.)
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'data-sticky="true"')
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * 
 * @returns {string} Rendered HTML header element
 * 
 * @throws {ComponentError} If required prop (slot) is missing
 * 
 * @example
 * // Basic site header with logo and nav
 * header({
 *   slot: [
 *     '<a href="/" class="logo">MySite</a>',
 *     '<nav>',
 *     '  <a href="/">Home</a>',
 *     '  <a href="/about">About</a>',
 *     '  <a href="/contact">Contact</a>',
 *     '</nav>'
 *   ]
 * })
 * // Returns: '<header class="header"><a href="/" class="logo">MySite</a><nav>...</nav></header>'
 * 
 * @example
 * // Main site header with banner role
 * header({
 *   attrs: 'role="banner"',
 *   className: 'site-header',
 *   slot: [
 *     '<div class="logo">Brand</div>',
 *     '<nav class="main-nav">Navigation links...</nav>',
 *     '<div class="actions">Login | Sign Up</div>'
 *   ]
 * })
 * // Returns: '<header class="header site-header" role="banner">...</header>'
 * 
 * @example
 * // Article header with metadata
 * header({
 *   className: 'article-header',
 *   slot: [
 *     '<h1>Article Title</h1>',
 *     '<p class="meta">By John Doe • Jan 15, 2025</p>'
 *   ]
 * })
 * // Returns: '<header class="header article-header"><h1>Article Title</h1><p class="meta">...</p></header>'
 * 
 * @example
 * // Sticky header with ID
 * header({
 *   className: 'sticky',
 *   attrs: 'id="main-header" data-sticky="true"',
 *   slot: '<nav>Navigation content</nav>'
 * })
 * // Returns: '<header class="header sticky" id="main-header" data-sticky="true"><nav>Navigation content</nav></header>'
 * 
 * @example
 * // Accessible header with aria-label
 * header({
 *   attrs: 'aria-label="Main site navigation"',
 *   slot: [
 *     '<a href="/">Home</a>',
 *     '<a href="/products">Products</a>',
 *     '<a href="/about">About</a>'
 *   ]
 * })
 * // Returns: '<header class="header" aria-label="Main site navigation">...</header>'
 * 
 * @example
 * // Section header within content
 * header({
 *   className: 'section-header',
 *   slot: [
 *     '<h2>Section Title</h2>',
 *     '<p class="subtitle">Section description goes here</p>'
 *   ]
 * })
 * // Returns: '<header class="header section-header"><h2>Section Title</h2>...</header>'
 */
export const header = ({
    slot,
    attrs = '',
    className = '',
}) => {
    // Validate required props
    validateProps(
        { slot },
        ['slot'],
        { componentName: 'header', componentType: 'organism' }
    );
    
    // Validate prop types
    validatePropTypes(
        { attrs, className },
        { 
            attrs: 'string',
            className: 'string'
        },
        { componentName: 'header', componentType: 'organism' }
    );
    
    // Validate slot is not empty
    if ((typeof slot === 'string' && slot.trim().length === 0) || 
        (Array.isArray(slot) && slot.length === 0)) {
        console.warn(
            `[b0nes Warning] Header has empty content. ` +
            `Headers should contain navigation, branding, or section titles.`
        );
    }
    
    // Info: Suggest using role="banner" for main site header
    const slotString = Array.isArray(slot) ? slot.join('') : slot;
    if (slotString.includes('<nav') && !role) {
        console.info(
            `[b0nes Info] Main site header with navigation should have role="banner" ` +
            `for better accessibility.`
        );
    }
    
    // Process attributes
    attrs = attrs ? ` ${attrs}` : '';
    
    // Normalize and escape classes
    const classes = normalizeClasses(['header', className]);
    
    // Process slot content
    const slotContent = processSlotTrusted(slot);
    
    return `<header class="${classes}"${attrs}>${slotContent}</header>`;
};