import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes, createComponentError } from '../../utils/componentError.js';
import { attrsToString } from '../../utils/attrsToString.js';

/**
 * Source component - An HTML source element for media resources
 * 
 * Renders an HTML source element used inside picture or video elements to specify
 * multiple media resources. Allows browsers to choose the most appropriate source
 * based on format support, screen size, or other factors. Essential for responsive
 * images and cross-browser video compatibility.
 * 
 * Two types:
 * 1. Image sources (for picture element) - use 'src' attribute
 * 2. Video sources (for video element) - use 'srcset' attribute
 * 
 * @param {Object} props - Component properties
 * @param {('image'|'video')} props.type - Source type: 'image' for picture, 'video' for video element
 * @param {string} [props.src] - Image source URL (required for type='image')
 * @param {string} [props.srcset] - Video source URL (required for type='video')
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'media="(min-width: 800px)" type="image/webp"')
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * 
 * @returns {string} Rendered HTML source element (self-closing)
 * 
 * @throws {ComponentError} If required props are missing or invalid
 * 
 * @example
 * // Image source for picture element (WebP format)
 * source({
 *   type: 'image',
 *   src: '/images/photo.webp',
 *   attrs: 'type="image/webp"'
 * })
 * // Returns: '<source src="/images/photo.webp" class="img-src" type="image/webp" />'
 * 
 * @example
 * // Image source with media query (responsive)
 * source({
 *   type: 'image',
 *   src: '/images/photo-large.jpg',
 *   attrs: 'media="(min-width: 1024px)" type="image/jpeg"'
 * })
 * // Returns: '<source src="/images/photo-large.jpg" class="img-src" media="(min-width: 1024px)" type="image/jpeg" />'
 * 
 * @example
 * // Image source with srcset and sizes (resolution switching)
 * source({
 *   type: 'image',
 *   src: '/images/photo.jpg',
 *   attrs: 'srcset="/images/photo-400.jpg 400w, /images/photo-800.jpg 800w"\
 *           sizes="(max-width: 600px) 400px, 800px" type="image/jpeg"'
 * })
 * 
 * @example
 * // Video source (MP4 format)
 * source({
 *   type: 'video',
 *   srcset: '/videos/movie.mp4',
 *   attrs: 'type="video/mp4"'
 * })
 * // Returns: '<source src="/videos/movie.mp4" class="video-src" type="video/mp4" />'
 * 
 * @example
 * // Video source (WebM format)
 * source({
 *   type: 'video',
 *   srcset: '/videos/movie.webm',
 *   attrs: 'type="video/webm"'
 * })
 * // Returns: '<source src="/videos/movie.webm" class="video-src" type="video/webm" />'
 * 
 * @example
 * // AVIF image source (modern format)
 * source({
 *   type: 'image',
 *   src: '/images/hero.avif',
 *   attrs: 'type="image/avif"',
 *   className: 'modern-format'
 * })
 * // Returns: '<source src="/images/hero.avif" class="img-src modern-format" type="image/avif"/>'
 */
export const source = ({
    type,
    src,
    srcset,
    attrs = '',
    className = ''
}) => {
    // Validate required props
    validateProps(
        { type },
        ['type'],
        { componentName: 'source', componentType: 'atom' }
    );
    
    // Validate prop types
    validatePropTypes(
        { type, className },
        { 
            type: 'string',
            className: 'string'
        },
        { componentName: 'source', componentType: 'atom' }
    );
    
    // Validate type is either 'image' or 'video'
    if (type !== 'image' && type !== 'video') {
        throw createComponentError(
            `Invalid type: "${type}". Must be either "image" or "video".`,
            { componentName: 'source', componentType: 'atom', props: { type } }
        );
    }
    
    // Validate that appropriate source attribute is provided
    if (type === 'image' && !src) {
        throw createComponentError(
            'Image sources require a "src" attribute.',
            { componentName: 'source', componentType: 'atom', props: { type, src } }
        );
    }
    
    if (type === 'video' && !srcset) {
        throw createComponentError(
            'Video sources require a "srcset" attribute.',
            { componentName: 'source', componentType: 'atom', props: { type, srcset } }
        );
    }
    
    // Process attributes (supports string or object)
    const attrsStr = attrsToString(attrs);
    
    // Determine the source attribute based on type
    // Note: HTML spec uses 'srcset' for picture sources, but for simplicity
    // we use 'src' for images and 'srcset' for videos in our API
    let sourceAttr = '';
    if (type === 'video') {
        sourceAttr = ` srcset="${srcset}"`;
    } else {
        // type === 'image'
        sourceAttr = ` src="${src}"`;
    }
    
    // Determine base class based on type
    const baseClass = type === 'video' ? 'video-src' : 'img-src';
    
    // Normalize and escape classes
    const classes = normalizeClasses([baseClass, className]);
    
    return `<source${sourceAttr} class="${classes}"${attrsStr}/>`;
};
