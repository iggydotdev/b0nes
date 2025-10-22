import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validatePropTypes, createComponentError } from '../../utils/componentError.js';
import { escapeAttr } from '../../utils/escapeAttr.js';

/**
 * Video component - An HTML video element for embedding video content
 * 
 * Renders an HTML video element with support for multiple sources, captions,
 * and playback controls. Can use a direct src attribute or child source elements
 * for multiple video formats. Supports modern video features like autoplay,
 * loop, muted, and poster images.
 * 
 * @param {Object} props - Component properties
 * @param {string} [props.src] - Direct video source URL (shorthand for single source)
 * @param {string | Array<string>} [props.slot=''] - Child content (source elements, track elements, fallback text)
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'controls autoplay muted loop')
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * 
 * @returns {string} Rendered HTML video element
 * 
 * @throws {createComponentError} If prop types are invalid
 * 
 * @example
 * // Basic video with direct source
 * video({
 *   src: '/videos/intro.mp4',
 *   attrs: 'controls'
 * })
 * // Returns: '<video src="/videos/intro.mp4" class="video" controls></video>'
 * 
 * @example
 * // Video with multiple sources (for browser compatibility)
 * video({
 *   attrs: 'controls',
 *   slot: [
 *     '<source src="/videos/intro.mp4" type="video/mp4"/>',
 *     '<source src="/videos/intro.webm" type="video/webm"/>',
 *     'Your browser does not support the video tag.'
 *   ]
 * })
 * // Returns: '<video class="video" controls><source src="/videos/intro.mp4" type="video/mp4"/><source src="/videos/intro.webm" type="video/webm"/>Your browser does not support the video tag.</video>'
 *
 * @example
 * // Video with poster image and dimensions
 * video({
 *   src: '/videos/demo.mp4',
 *   attrs: 'poster="/images/video-thumbnail.jpg" width="640" height="360" controls'
 * })
 * // Returns: '<video src="/videos/demo.mp4" class="video" poster="/images/video-thumbnail.jpg" width="640" height="360" controls></video>'
 * 
 * @example
 * // Autoplay video (muted, for compliance)
 * video({
 *   src: '/videos/background.mp4',
 *   attrs: 'autoplay loop muted',
 *   className: 'background-video'
 * })
 * // Returns: '<video src="/videos/background.mp4" class="video background-video" autoplay loop muted></video>'
 * 
 * @example
 * // Video with captions/subtitles
 * video({
 *   src: '/videos/tutorial.mp4',
 *   attrs: 'controls',
 *   slot: '<track src="/captions/en.vtt" kind="subtitles" srclang="en" label="English"/>'
 * })
 * // Returns: '<video src="/videos/tutorial.mp4" class="video" controls><track src="/captions/en.vtt" kind="subtitles" srclang="en" label="English"/></video>'
 * 
 * @example
 * // Video with preload and custom attributes
 * video({
 *   src: '/videos/large-file.mp4',
 *   attrs: 'preload="metadata" controls playsinline disablepictureinpicture'
 * })
 * // Returns: '<video src="/videos/large-file.mp4" class="video" preload="metadata" controls playsinline disablepictureinpicture></video>'
 */
export const video = ({
    src,
    slot = '',
    attrs = '',
    className = '',
}) => {
    // Validate prop types
    validatePropTypes(
        { attrs, className },
        { 
            attrs: 'string',
            className: 'string'
        },
        { componentName: 'video', componentType: 'atom' }
    );
    
    // Warn if neither src nor slot is provided
    if (!src && (!slot || slot.length === 0)) {
        console.warn(
            `[b0nes Warning] Video has no source. ` +
            `Provide either a 'src' prop or source elements in 'slot'.`
        );
    }
    
    // Process attributes
    attrs = attrs ? ` ${attrs}` : '';
        
    // Normalize and escape classes
    const classes = normalizeClasses(['video', className]);
    
    // Process slot content (source elements, track elements, fallback text)
    const slotContent = processSlotTrusted(slot);
    
    return `<video class="${classes}"${attrs}>${slotContent}</video>`;
};