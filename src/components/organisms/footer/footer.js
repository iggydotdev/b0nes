import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes } from '../../utils/componentError.js';
import { attrsToString } from '../../utils/attrsToString.js';

/**
 * Footer component - A semantic footer element for page/section footers
 * 
 * Renders an HTML footer element typically used for site footers or section footers.
 * Semantic HTML5 element that helps structure your page and improves accessibility.
 * Commonly contains copyright info, links, contact details, and supplementary navigation.
 * 
 * Common use cases:
 * - Site-wide footer with links and info
 * - Article footers with author/meta info
 * - Section footers within pages
 * - Card/component footers with actions
 * 
 * @param {Object} props - Component properties
 * @param {string | Array<string>} props.slot - Footer content (links, copyright, contact, etc.)
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'data-theme="dark"')
 * @param {string} [props.className=''] - Additional CSS classes to apply

 * @returns {string} Rendered HTML footer element
 * 
 * @throws {createComponentError} If required prop (slot) is missing
 * 
 * @example
 * // Basic site footer with copyright
 * footer({
 *   slot: '<p>&copy; 2025 MySite. All rights reserved.</p>'
 * })
 * // Returns: '<footer class="footer"><p>&copy; 2025 MySite. All rights reserved.</p></footer>'
 * 
 * @example
 * // Main site footer with contentinfo role
 * footer({
 *   attrs: 'role="contentinfo"',
 *   className: 'site-footer',
 *   slot: [
 *     '<div class="footer-links">',
 *     '  <a href="/about">About</a>',
 *     '  <a href="/privacy">Privacy</a>',
 *     '  <a href="/terms">Terms</a>',
 *     '</div>',
 *     '<p>&copy; 2025 Company Name</p>'
 *   ]
 * })
 * // Returns: '<footer class="footer site-footer" role="contentinfo">...</footer>'
 * 
 * @example
 * // Article footer with author info
 * footer({
 *   className: 'article-footer',
 *   slot: [
 *     '<div class="author">',
 *     '  <img src="/avatar.jpg" alt="Author"/>',
 *     '  <p>Written by John Doe</p>',
 *     '</div>',
 *     '<div class="tags">',
 *     '  <span>JavaScript</span>',
 *     '  <span>Web Development</span>',
 *     '</div>'
 *   ]
 * })
 * // Returns: '<footer class="footer article-footer">...</footer>'
 * 
 * @example
 * // Footer with multiple columns
 * footer({
 *   className: 'multi-column',
 *   slot: [
 *     '<div class="column">',
 *     '  <h4>Products</h4>',
 *     '  <ul><li><a href="/product-a">Product A</a></li></ul>',
 *     '</div>',
 *     '<div class="column">',
 *     '  <h4>Company</h4>',
 *     '  <ul><li><a href="/about">About Us</a></li></ul>',
 *     '</div>',
 *     '<div class="column">',
 *     '  <h4>Support</h4>',
 *     '  <ul><li><a href="/help">Help Center</a></li></ul>',
 *     '</div>'
 *   ]
 * })
 * 
 * @example
 * // Footer with social links and ID
 * footer({
 *   attrs: 'id="main-footer",
 *   className: 'social-footer',
 *   slot: [
 *     '<div class="social-links">',
 *     '  <a href="https://twitter.com">Twitter</a>',
 *     '  <a href="https://github.com">GitHub</a>',
 *     '</div>',
 *     '<p>Connect with us</p>'
 *   ]
 * })
 * // Returns: '<footer class="footer social-footer" id="main-footer">...</footer>'
 * 
 * @example
 * // Accessible footer with aria-label
 * footer({
 *   attrs: 'aria-label="Site footer with links and information"',
 *   slot: [
 *     '<nav aria-label="Footer navigation">',
 *     '  <a href="/sitemap">Sitemap</a>',
 *     '  <a href="/contact">Contact</a>',
 *     '</nav>',
 *     '<p>Company info here</p>'
 *   ]
 * })
 * // Returns: '<footer class="footer" aria-label="Site footer with links and information">...</footer>'
 */
export const footer = ({
    slot,
    attrs = '',
    className = ''
}) => {
    // Validate required props
    validateProps(
        { slot },
        ['slot'],
        { componentName: 'footer', componentType: 'organism' }
    );
    
    // Validate prop types
    validatePropTypes(
        { className },
        { 
            className: 'string'
        },
        { componentName: 'footer', componentType: 'organism' }
    );
    
    // Validate slot is not empty
    if ((typeof slot === 'string' && slot.trim().length === 0) || 
        (Array.isArray(slot) && slot.length === 0)) {
        console.warn(
            `[b0nes Warning] Footer has empty content. ` +
            `Footers should contain copyright, links, or supplementary information.`
        );
    }
    
    // Info: Suggest using role="contentinfo" for main site footer
    // TODO: Check this 
    // const slotString = Array.isArray(slot) ? slot.join('') : slot;
    // if ((slotString.includes('©') || slotString.includes('copyright'))) {
    //     console.info(
    //         `[b0nes Info] Main site footer with copyright/site info should have role="contentinfo" ` +
    //         `for better accessibility.`
    //     );
    // }
    
    // Process attributes (supports string or object)
    const attrsStr = attrsToString(attrs);
        
    // Normalize and escape classes
    const classes = normalizeClasses(['footer', className]);
    
    // Process slot content
    const slotContent = processSlotTrusted(slot);
    
    return `<footer class="${classes}"${attrsStr}>${slotContent}</footer>`;
};
