import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes, createComponentError } from '../../utils/componentError.js';
import { escapeHtml } from '../../utils/escapeHtml.js';
import { escapeAttr } from '../../utils/escapeAttr.js';
/**
 * Textarea component - An HTML textarea element for multi-line text input
 * 
 * Renders an HTML textarea element with validation, accessibility features,
 * and customizable styling. Supports multi-line text input with optional
 * rows/cols sizing, character limits, and form integration.
 * 
 * @param {Object} props - Component properties
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'rows="5" cols="40" maxlength="500"')
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * 
 * @returns {string} Rendered HTML textarea element
 * 
 * @throws {createComponentError} If prop types are invalid
 * 
 * @example
 * // Basic textarea
 * textarea({ 
 *   attrs: 'name="message" placeholder="Enter your message here..."'
 * })
 * // Returns: '<textarea class="textarea" name="message" placeholder="Enter your message here..."/>'
 * 
 * @example
 * // Textarea with dimensions and character limit
 * textarea({
 *   attrs: 'name="bio" id="user-bio" rows="5" cols="50"  maxlength="500" placeholder="Tell us about yourself..."'
 * })
 * // Returns: '<textarea class="textarea" name="bio" id="user-bio" rows="5" cols="50" maxlength="500" placeholder="Tell us about yourself..."/>'
 * 
 * @example
 * // Textarea with default value (pre-filled)
 * textarea({
 *   attrs: 'name="comment" rows="3" value="This is my initial comment"'
 * })
 * // Returns: '<textarea class="textarea" name="comment" rows="3" value="This is my initial comment"/>'
 * 
 * @example
 * // Required textarea with custom class
 * textarea({
 *   className: 'feedback-box large',
 *   attrs: 'name="feedback" required data-required="true"'
 * })
 * // Returns: '<textarea class="textarea feedback-box large" name="feedback" required data-required="true"/>'
 * 
 * @example
 * // Disabled textarea (read-only display)
 * textarea({
 *   attrs: 'name="terms" rows="10" disabled value="Terms and conditions text here..."'
 * })
 * // Returns: '<textarea class="textarea" name="terms" rows="10" disabled value="Terms and conditions text here..."/>'
 * 
 * @example
 * // Accessible textarea with ARIA
 * textarea({
 *   attrs: 'name="notes" aria-label="Additional notes" aria-describedby="notes-help" spellcheck="true"'
 * })
 * // Returns: '<textarea class="textarea" name="notes" aria-label="Additional notes" aria-describedby="notes-help" spellcheck="true"/>'
 */
export const textarea = ({
    attrs = '',
    className = ''
}) => {
    // Validate prop types
    validatePropTypes(
        { attrs, className },
        { 
            attrs: 'string',
            className: 'string',
        },
        { componentName: 'textarea', componentType: 'atom' }
    );
    
    // Process attributes
    attrs = attrs ? ` ${attrs}` : '';
        
    // Normalize and escape classes
    const classes = normalizeClasses(['textarea', className]);
    
    // TODO: TO VALIDATE YET -- 
    // Escape the value content (this goes inside the textarea tags)
    // Important: textarea content must be HTML-escaped to prevent XSS
    // const escapedValue = escapeHtml(value);
    //return `<textarea class="${classes}"${attrs}>${escapedValue}</textarea>`;    
    return `<textarea class="${classes}"${attrs}/>`;
};