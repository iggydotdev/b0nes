import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes, createComponentError } from '../../utils/componentError.js';
import { escapeAttr } from '../../utils/escapeAttr.js';

/**
 * Image component - An HTML img element for displaying images
 * 
 * Renders an HTML img element with source validation, accessibility features,
 * and customizable styling. Always includes alt attribute for accessibility.
 * Supports responsive images with srcset and sizes attributes.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.src - The image source URL (absolute or relative path)
 * @param {string} [props.alt=''] - Alternative text for accessibility (highly recommended)
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'width="800" height="600" loading="lazy"')
 * @param {string} [props.className=''] - Additional CSS classes to apply

 * 
 * @returns {string} Rendered HTML img element (self-closing)
 * 
 * @throws {ComponentError} If required prop (src) is missing or has invalid type
 * 
 * @example
 * // Basic image with alt text
 * image({ 
 *   src: 'https://picsum.photos/800/600',
 *   alt: 'Beautiful landscape photo'
 * })
 * // Returns: '<img src="https://picsum.photos/800/600" alt="Beautiful landscape photo" class="image"/>'
 * 
 * @example
 * // Image with dimensions and lazy loading
 * image({
 *   src: '/images/hero.jpg',
 *   alt: 'Hero banner',
 *   attrs: 'width: "1200" height: "400" loading: "lazy"'
 * })
 * // Returns: '<img src="/images/hero.jpg" alt="Hero banner" class="image" width="1200" height="400" loading="lazy"/>'
 * 
 * @example
 * // Image with custom classes
 * image({
 *   src: '/profile.jpg',
 *   alt: 'User profile picture',
 *   className: 'avatar rounded'
 * })
 * // Returns: '<img src="/profile.jpg" alt="User profile picture" class="image avatar rounded"/>'
 * 
 * @example
 * // Responsive image with srcset
 * image({
 *   src: '/images/photo.jpg',
 *   alt: 'Responsive image',
 *   attrs: 'srcset: "/images/photo-400.jpg 400w, /images/photo-800.jpg 800w, /images/photo-1200.jpg 1200w",\
 *           sizes: "(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px",'
 * })
 * // Returns: '<img src="/images/photo.jpg" srcset="..." sizes="..." alt="Responsive image" class="image"/>'
 * 
 * @example
 * // Decorative image (empty alt for screen readers to skip)
 * image({
 *   src: '/decorations/divider.svg',
 *   alt: '',
 *   attrs: 'role="presentation"'
 * })
 * // Returns: '<img src="/decorations/divider.svg" alt="" class="image" role="presentation"/>'
 */
export const image = ({
    src,
    alt, 
    attrs = '',
    className = '',
}) => {
    // Validate required props
    validateProps(
        { src },
        ['src'],
        { componentName: 'image', componentType: 'atom' }
    );
    
    // Validate prop types
    validatePropTypes(
        { src, alt, attrs, className },
        { 
            src: 'string',
            alt: 'string',
            attrs: 'string',
            className: 'string'
        },
        { componentName: 'image', componentType: 'atom' }
    );
    
    // Validate src is not empty
    if (src.trim().length === 0) {
        throw createComponentError(
            'The "src" prop cannot be empty. Provide a valid image URL or path.',
            { componentName: 'image', componentType: 'atom', props: { src } }
        );
    }
    
    // Warn if alt text is missing (accessibility concern)
    if (alt === undefined || alt === null) {
        console.warn(
            `[b0nes Warning] Image at "${src}" is missing alt text. ` +
            `This is bad for accessibility. Provide descriptive alt text or use alt="" for decorative images.`
        );
    }
    
    // Security: Warn about potentially dangerous protocols in src
    const dangerousProtocols = ['javascript:', 'data:text/html', 'vbscript:'];
    const srcLower = src.toLowerCase().trim();
    if (dangerousProtocols.some(protocol => srcLower.startsWith(protocol))) {
        console.warn(
            `[b0nes Warning] Potentially dangerous URL protocol in image src: "${src}". ` +
            `This may pose a security risk.`
        );
    }
    
    // Process attributes
    attrs = attrs ? ` ${attrs}` : '';
    
    // Normalize and escape classes
    const classes = normalizeClasses(['image', className]);
    
    return `<img src="${src}" class="${classes}" alt="${alt}"${attrs}/>`;
};