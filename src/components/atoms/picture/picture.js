import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes, createComponentError } from '../../utils/componentError.js';
import { escapeAttr } from '../../utils/escapeAttr.js';

/**
 * Picture component - An HTML picture element for responsive images
 * 
 * Renders an HTML picture element that contains multiple source elements for
 * responsive images and art direction. Allows serving different images based on
 * screen size, resolution, or format support. Must include an img element as
 * fallback (last child in slot).
 * 
 * The picture element enables:
 * - Serving WebP/AVIF to browsers that support them
 * - Different images at different viewport sizes (art direction)
 * - Resolution switching with srcset
 * - Bandwidth optimization
 * 
 * @param {Object} props - Component properties
 * @param {string | Array<string>} props.slot - Child content (source elements and required img element)
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'data-lazy="true"')
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * 
 * @returns {string} Rendered HTML picture element
 * 
 * @throws {ComponentError} If required prop (slot) is missing
 * 
 * @example
 * // Basic picture with WebP and fallback
 * picture({
 *   slot: [
 *     '<source srcset="/images/photo.webp" type="image/webp"/>',
 *     '<source srcset="/images/photo.jpg" type="image/jpeg"/>',
 *     '<img src="/images/photo.jpg" alt="Photo"/>'
 *   ]
 * })
 * // Returns: '<picture class="picture"><source srcset="/images/photo.webp" type="image/webp"/><source srcset="/images/photo.jpg" type="image/jpeg"/><img src="/images/photo.jpg" alt="Photo"/></picture>'
 * 
 * @example
 * // Responsive image with different sizes
 * picture({
 *   slot: [
 *     '<source media="(min-width: 800px)" srcset="/images/photo-large.jpg"/>',
 *     '<source media="(min-width: 400px)" srcset="/images/photo-medium.jpg"/>',
 *     '<img src="/images/photo-small.jpg" alt="Responsive photo"/>'
 *   ]
 * })
 * // Returns: '<picture class="picture"><source media="(min-width: 800px)".../>...</picture>'
 * 
 * @example
 * // Art direction (different crops for mobile/desktop)
 * picture({
 *   className: 'hero-image',
 *   slot: [
 *     '<source media="(min-width: 1024px)" srcset="/images/hero-landscape.jpg"/>',
 *     '<source media="(min-width: 768px)" srcset="/images/hero-square.jpg"/>',
 *     '<img src="/images/hero-portrait.jpg" alt="Hero banner"/>'
 *   ]
 * })
 * // Returns: '<picture class="picture hero-image">...</picture>'
 * 
 * @example
 * // Multiple formats with 2x resolution
 * picture({
 *   slot: [
 *     '<source srcset="/images/photo.avif 1x, /images/photo@2x.avif 2x" type="image/avif"/>',
 *     '<source srcset="/images/photo.webp 1x, /images/photo@2x.webp 2x" type="image/webp"/>',
 *     '<img src="/images/photo.jpg" srcset="/images/photo@2x.jpg 2x" alt="High-res photo"/>'
 *   ]
 * })
 * 
 * @example
 * // Picture with ID and lazy loading
 * picture({
 *   attrs: 'id="main-picture" data-component="responsive-image"',
 *   slot: [
 *     '<source srcset="/images/banner.webp" type="image/webp"/>',
 *     '<img src="/images/banner.jpg" alt="Banner" loading="lazy"/>'
 *   ]
 * })
 * // Returns: '<picture class="picture" id="main-picture" data-component="responsive-image">...</picture>'
 */
export const picture = ({
    slot,
    attrs = '',
    className = '',
}) => {
    // Validate required props
    validateProps(
        { slot },
        ['slot'],
        { componentName: 'picture', componentType: 'atom' }
    );
    
    // Validate prop types
    validatePropTypes(
        { attrs, className },
        { 
            attrs: 'string',
            className: 'string'
        },
        { componentName: 'picture', componentType: 'atom' }
    );
    
    // Validate slot is not empty
    if ((typeof slot === 'string' && slot.trim().length === 0) || 
        (Array.isArray(slot) && slot.length === 0)) {
        throw createComponentError(
            'Picture element requires child content (source elements and an img element).',
            { componentName: 'picture', componentType: 'atom', props: { slot } }
        );
    }
    
    // Warn if slot doesn't appear to contain an img element (required by HTML spec)
    const slotString = Array.isArray(slot) ? slot.join('') : slot;
    if (!slotString.includes('<img')) {
        console.warn(
            `[b0nes Warning] Picture element should contain an <img> element as fallback. ` +
            `The img should be the last child for proper browser support.`
        );
    }
    
    // Warn if slot doesn't contain any source elements (makes picture pointless)
    if (!slotString.includes('<source')) {
        console.warn(
            `[b0nes Warning] Picture element has no <source> elements. ` +
            `Use the <img> component directly if you don't need responsive images.`
        );
    }
    
    // Info: Suggest WebP/AVIF formats for modern browsers
    if (slotString.includes('<source') && 
        !slotString.includes('webp') && 
        !slotString.includes('avif')) {
        console.info(
            `[b0nes Info] Consider adding WebP or AVIF source elements ` +
            `for better compression and performance in modern browsers.`
        );
    }
    
    // Process attributes
    attrs = attrs ? ` ${attrs}` : '';
    
    // Normalize and escape classes
    const classes = normalizeClasses(['picture', className]);
    
    // Process slot content (source and img elements)
    const slotContent = processSlotTrusted(slot);
    
    return `<picture class="${classes}"${attrs}>${slotContent}</picture>`;
};