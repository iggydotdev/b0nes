import { box } from '../../atoms/index.js';
import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validatePropTypes } from '../../utils/componentError.js';
import { escapeAttr } from '../../utils/escapeAttr.js';
import { attrsToString } from '../../utils/attrsToString.js';

/**
 * Card component - A flexible content container molecule
 * 
 * Renders a card component using the box atom with structured content areas.
 * Supports two modes:
 * 1. Custom mode: Use the slot prop for full control over card content
 * 2. Structured mode: Use headerSlot, mediaSlot, linkSlot, contentSlot for organized layout
 * 
 * Cards are commonly used for:
 * - Product displays
 * - Blog post previews
 * - User profiles
 * - Feature highlights
 * - Gallery items
 * 
 * @param {Object} props - Component properties
 * @param {string | Array<string>} [props.slot] - Custom card content (overrides structured slots)
 * @param {string | Array<string>} [props.headerSlot] - Card header content (title, badges, etc.)
 * @param {string | Array<string>} [props.mediaSlot] - Card media content (images, videos)
 * @param {string | Array<string>} [props.linkSlot] - Card action links or buttons
 * @param {string | Array<string>} [props.contentSlot] - Main card content (description, details)
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'data-product-id="123"')
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * @param {string} [props.id] - Card ID attribute
 * @param {string} [props.role] - ARIA role attribute (default: none, consider 'article' for semantic cards)
 * 
 * @returns {string} Rendered HTML card element (div with card class)
 * 
 * @example
 * // Custom card with full control
 * card({
 *   className: 'profile-card',
 *   slot: [
 *     '<img src="/avatar.jpg" alt="User"/>',
 *     '<h3>John Doe</h3>',
 *     '<p>Software Developer</p>'
 *   ]
 * })
 * // Returns: '<div class="box card profile-card"><img src="/avatar.jpg" alt="User"/><h3>John Doe</h3><p>Software Developer</p></div>'
 * 
 * @example
 * // Structured card with all sections
 * card({
 *   headerSlot: '<h2>Product Name</h2>',
 *   mediaSlot: '<img src="/product.jpg" alt="Product"/>',
 *   contentSlot: '<p>Product description goes here...</p>',
 *   linkSlot: '<a href="/products/123">View Details</a>'
 * })
 * // Returns: '<div class="box card"><h2>Product Name</h2><img src="/product.jpg" alt="Product"/><a href="/products/123">View Details</a><p>Product description goes here...</p></div>'
 * 
 * @example
 * // Blog post card
 * card({
 *   className: 'blog-card',
 *   headerSlot: [
 *     '<span class="date">Jan 15, 2025</span>',
 *     '<h3>Blog Post Title</h3>'
 *   ],
 *   mediaSlot: '<img src="/blog-cover.jpg" alt="Blog cover"/>',
 *   contentSlot: '<p>Brief excerpt from the blog post...</p>',
 *   linkSlot: '<a href="/blog/post-slug">Read More →</a>'
 * })
 * 
 * @example
 * // Minimal card with just header and content
 * card({
 *   headerSlot: '<h4>Card Title</h4>',
 *   contentSlot: 'Simple card content without media or links.'
 * })
 * // Returns: '<div class="box card"><h4>Card Title</h4>Simple card content without media or links.</div>'
 * 
 * @example
 * // Card with ID and semantic role
 * card({
 *   id: 'featured-product',
 *   role: 'article',
 *   className: 'featured',
 *   headerSlot: '<h2>Featured Item</h2>',
 *   contentSlot: '<p>Special featured content</p>',
 *   attrs: 'data-featured="true"'
 * })
 * // Returns: '<div class="box card featured" id="featured-product" role="article" data-featured="true">...</div>'
 * 
 * @example
 * // Interactive card with button
 * card({
 *   className: 'action-card',
 *   headerSlot: '<h3>Get Started</h3>',
 *   contentSlot: '<p>Sign up today and get 30 days free!</p>',
 *   linkSlot: '<button class="btn primary">Sign Up Now</button>'
 * })
 */
export const card = ({
    slot,
    headerSlot,
    mediaSlot,
    linkSlot,
    contentSlot,
    attrs = '',
    className = '',
    id,
    role
}) => {
    // Validate prop types
    validatePropTypes(
        { className },
        { 
            className: 'string'
        },
        { componentName: 'card', componentType: 'molecule' }
    );
    
    // Determine if using custom mode or structured mode
    const hasCustomSlot = slot !== undefined && slot !== null && slot !== '';
    const hasStructuredSlots = headerSlot || mediaSlot || linkSlot || contentSlot;
    
    // Warn if both modes are used (custom slot takes precedence)
    if (hasCustomSlot && hasStructuredSlots) {
        console.warn(
            `[b0nes Warning] Card has both 'slot' and structured slots (headerSlot, mediaSlot, etc.). ` +
            `The 'slot' prop takes precedence and structured slots will be ignored.`
        );
    }
    
    // Warn if card is completely empty
    if (!hasCustomSlot && !hasStructuredSlots) {
        console.warn(
            `[b0nes Warning] Card has no content. ` +
            `Provide either a 'slot' prop or structured slots (headerSlot, contentSlot, etc.).`
        );
    }
    
    // Process attributes (supports string or object)
    const escapedAttrs = attrsToString(attrs);
    
    // Add id attribute if provided
    const idAttr = id ? ` id="${escapeAttr(id)}"` : '';
    
    // Add role attribute if provided
    const roleAttr = role ? ` role="${escapeAttr(role)}"` : '';
    
    // Build the final content
    let finalContent;
    
    if (hasCustomSlot) {
        // Custom mode: use slot directly
        finalContent = processSlotTrusted(slot);
    } else {
        // Structured mode: combine all structured slots in order
        // Order: header → media → link → content
        const header = processSlotTrusted(headerSlot) || '';
        const media = processSlotTrusted(mediaSlot) || '';
        const link = processSlotTrusted(linkSlot) || '';
        const content = processSlotTrusted(contentSlot) || '';
        
        finalContent = `${header}${media}${link}${content}`;
    }
    
    // Normalize classes - card class plus any custom classes
    const classes = normalizeClasses(['card', className]);
    
    // Use box component as the base
    // Construct attrs string for box with id, role, and other attrs
    const boxAttrs = `${idAttr}${roleAttr}${escapedAttrs}`.trim();
    
    return box({
        is: 'div',
        className: classes,
        attrs: boxAttrs,
        slot: finalContent
    });
};
