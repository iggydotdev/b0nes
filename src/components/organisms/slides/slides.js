// src/components/organisms/slides/slides.js
import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes } from '../../utils/componentError.js';
import { attrsToString } from '../../utils/attrsToString.js';
import { box } from '../../atoms/index.js';

/**
 * Slides component - A presentation slides organism
 * 
 * Creates a full-screen presentation with keyboard navigation, click controls,
 * and slide tracking. Perfect for talks, demos, and visual storytelling.
 * 
 * @param {Object} props - Component properties
 * @param {Array<Object>} props.slides - Array of slide objects
 *   Each slide object should have:
 *   - content: (string|array) Slide HTML content
 *   - title: (string, optional) Slide title for metadata
 *   - background: (string, optional) Background color/image
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.attrs=''] - Additional HTML attributes
 * 
 * @returns {string} Rendered HTML slides container
 * 
 * @example
 * slides({
 *   slides: [
 *     { 
 *       title: 'Title Slide',
 *       content: '<h1>My Talk</h1><p>By You</p>'
 *     },
 *     { 
 *       title: 'Content Slide',
 *       content: '<h2>Key Points</h2><ul><li>Point 1</li></ul>'
 *     },
 *     { 
 *       title: 'End Slide',
 *       content: '<h1>Thank You</h1><p>Questions?</p>',
 *       background: '#f0f0f0'
 *     }
 *   ]
 * })
 */
export const slides = ({
    slides = [],
    className = '',
    attrs = ''
}) => {
    // Validate required props
    validateProps(
        { slides },
        ['slides'],
        { componentName: 'slides', componentType: 'organism' }
    );
    
    // Validate prop types
    validatePropTypes(
        { className },
        { 
            className: 'string'
        },
        { componentName: 'slides', componentType: 'organism' }
    );
    
    if (!Array.isArray(slides) || slides.length === 0) {
        console.warn(
            `[b0nes Warning] Slides component requires an array of slides with at least one slide.`
        );
        return '';
    }
    
    // Generate slide elements
    const slideElements = slides.map((slide, index) => {
        const isActive = index === 0 ? ' active' : '';
        const bgStyle = slide.background ? ` style="background: ${slide.background}"` : '';
        const slideContent = typeof slide.content === 'string' 
            ? slide.content 
            : Array.isArray(slide.content) 
            ? slide.content.join('') 
            : '';
        
        return `
    <div class="slide${isActive}" data-slide="${index}"${bgStyle} role="region" aria-label="Slide ${index + 1} of ${slides.length}${slide.title ? ': ' + slide.title : ''}">
        <div class="slide-content">
            ${slideContent}
        </div>
        <div class="slide-number">${index + 1} / ${slides.length}</div>
    </div>`;
    }).join('');
    
    // Process attributes (supports string or object)
    const attrsStr = attrsToString(attrs);
    
    // Normalize classes
    const classes = normalizeClasses(['slides', className]);
    
    return `<div class="${classes}" data-b0nes="organisms:slides" role="presentation"${attrsStr}>
    <div class="slides-container">
        ${slideElements}
    </div>
    
    <div class="slides-controls">
        <button class="slide-btn prev" aria-label="Previous slide" data-action="prev">← Prev</button>
        <div class="slide-indicator">
            <span class="current">1</span> / <span class="total">${slides.length}</span>
        </div>
        <button class="slide-btn next" aria-label="Next slide" data-action="next">Next →</button>
    </div>
    
    <div class="slides-info" aria-live="polite" aria-atomic="true">
        <span class="current-title"></span>
    </div>
</div>`;
};
