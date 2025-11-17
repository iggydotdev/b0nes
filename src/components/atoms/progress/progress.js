// src/components/atoms/progress/progress.js
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes, createComponentError } from '../../utils/componentError.js';
import { escapeAttr } from '../../utils/escapeAttr.js';

/**
 * Progress component - An HTML progress element for showing completion
 * 
 * Renders an HTML progress element for indicating task completion or progress.
 * Perfect for multi-step forms, loading indicators, skill levels, and any
 * scenario where you need to show "how far along" something is.
 * 
 * The progress element is semantic, accessible, and styleable with CSS.
 * 
 * @param {Object} props - Component properties
 * @param {number} [props.value=0] - Current progress value (0 to max)
 * @param {number} [props.max=100] - Maximum value (defaults to 100 for percentage)
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'id="upload-progress"')
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * 
 * @returns {string} Rendered HTML progress element
 * 
 * @throws {ComponentError} If prop types are invalid
 * 
 * @example
 * // Basic percentage progress (0-100)
 * progress({ value: 75 })
 * // Returns: '<progress class="progress" value="75" max="100">75%</progress>'
 * 
 * @example
 * // Multi-step form progress (step 2 of 5)
 * progress({ value: 2, max: 5 })
 * // Returns: '<progress class="progress" value="2" max="5">2 of 5</progress>'
 * 
 * @example
 * // Indeterminate progress (loading/processing)
 * progress({ max: 100 })
 * // Returns: '<progress class="progress" max="100"></progress>'
 * 
 * @example
 * // With custom styling and ID
 * progress({ 
 *   value: 60, 
 *   max: 100,
 *   className: 'upload-progress large',
 *   attrs: 'id="file-upload"'
 * })
 * // Returns: '<progress class="progress upload-progress large" value="60" max="100" id="file-upload">60%</progress>'
 * 
 * @example
 * // File download progress
 * progress({
 *   value: 45,
 *   max: 100,
 *   attrs: 'aria-label="Download progress" aria-describedby="download-status"'
 * })
 * // Returns: '<progress class="progress" value="45" max="100" aria-label="Download progress" aria-describedby="download-status">45%</progress>'
 * 
 * @example
 * // Task completion (3 of 10 tasks)
 * progress({
 *   value: 3,
 *   max: 10,
 *   className: 'task-progress'
 * })
 * // Returns: '<progress class="progress task-progress" value="3" max="10">3 of 10</progress>'
 */
export const progress = ({
    value = 0,
    max = 100,
    attrs = '',
    className = ''
}) => {
    // Validate prop types
    validatePropTypes(
        { value, max, attrs, className },
        { 
            value: 'number',
            max: 'number',
            attrs: 'string',
            className: 'string'
        },
        { componentName: 'progress', componentType: 'atom' }
    );
    
    // Validate value is not negative
    if (value < 0) {
        console.warn(
            `[b0nes Warning] Progress value cannot be negative. ` +
            `Got: ${value}. Setting to 0.`
        );
        value = 0;
    }
    
    // Validate max is positive
    if (max <= 0) {
        throw createComponentError(
            `Max value must be greater than 0. Got: ${max}`,
            { componentName: 'progress', componentType: 'atom', props: { value, max } }
        );
    }
    
    // Warn if value exceeds max
    if (value > max) {
        console.warn(
            `[b0nes Warning] Progress value (${value}) exceeds max (${max}). ` +
            `This may cause unexpected rendering.`
        );
    }
    
    // Process attributes
    attrs = attrs ? ` ${attrs}` : '';
    
    // Normalize and escape classes
    const classes = normalizeClasses(['progress', className]);
    
    // Generate fallback text for browsers that don't support <progress>
    // or for screen readers
    let fallbackText = '';
    if (value === 0 && max === 100) {
        // Indeterminate progress
        fallbackText = 'Loading...';
    } else if (max === 100) {
        // Percentage progress
        fallbackText = `${Math.round((value / max) * 100)}%`;
    } else {
        // Step progress (e.g., "2 of 5")
        fallbackText = `${value} of ${max}`;
    }
    
    return `<progress class="${classes}" value="${value}" max="${max}"${attrs}>${fallbackText}</progress>`;
};