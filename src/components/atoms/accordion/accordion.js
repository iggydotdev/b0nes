import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes, createComponentError } from '../../utils/componentError.js';
import { escapeAttr } from '../../utils/escapeAttr.js';

/**
 * Accordion component - An HTML details/summary element for collapsible content
 * 
 * Renders an HTML details element with a summary (clickable header) and collapsible
 * content. Uses native HTML details/summary for accessibility and no JavaScript required.
 * Perfect for FAQs, expandable sections, and progressive disclosure patterns.
 * 
 * @param {Object} props - Component properties
 * @param {string | Array<string>} props.titleSlot - Summary/header content (always visible)
 * @param {string | Array<string>} props.detailsSlot - Collapsible content (hidden until expanded)
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'open data-section="faq"')
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * 
 * @returns {string} Rendered HTML details/summary element
 * 
 * @throws {createComponentError} If required props (titleSlot, detailsSlot) are missing
 * 
 * @example
 * // Basic accordion (closed by default)
 * accordion({
 *   titleSlot: 'What is b0nes?',
 *   detailsSlot: 'b0nes is a zero-dependency framework for building web applications.'
 * })
 * // Returns: '<details class="accordion"><summary>What is b0nes?</summary>b0nes is a zero-dependency framework...</details>'
 * 
 * @example
 * // Accordion open by default
 * accordion({
 *   titleSlot: 'Getting Started',
 *   detailsSlot: '<p>Install with npm: <code>npm install b0nes</code></p>',
 *   attrs: 'open'
 * })
 * // Returns: '<details class="accordion" open><summary>Getting Started</summary><p>Install with npm: <code>npm install b0nes</code></p></details>'
 * 
 * @example
 * // Accordion with custom styling
 * accordion({
 *   titleSlot: 'Advanced Features',
 *   detailsSlot: 'SSR, SSG, routing, and more...',
 *   className: 'faq-item highlighted'
 * })
 * // Returns: '<details class="accordion faq-item highlighted"><summary>Advanced Features</summary>SSR, SSG, routing, and more...</details>'
 * 
 * @example
 * // Accordion with ID and data attributes
 * accordion({
 *   titleSlot: 'Question 1',
 *   detailsSlot: 'Answer to question 1',
 *   attrs: 'id="faq-1" data-category="general"'
 * })
 * // Returns: '<details class="accordion" id="faq-1" data-category="general"><summary>Question 1</summary>Answer to question 1</details>'
 * 
 * @example
 * // Accordion with nested HTML content
 * accordion({
 *   titleSlot: '<strong>Important Notice</strong>',
 *   detailsSlot: [
 *     '<p>This is paragraph 1.</p>',
 *     '<p>This is paragraph 2.</p>',
 *     '<ul><li>Point 1</li><li>Point 2</li></ul>'
 *   ]
 * })
 * // Returns: '<details class="accordion"><summary><strong>Important Notice</strong></summary><p>This is paragraph 1.</p>...</details>'
 * 
 * @example
 * // Accessible accordion with aria-label
 * accordion({
 *   titleSlot: 'Privacy Settings',
 *   detailsSlot: 'Manage your privacy preferences here.',
 *   ariaLabel: 'Privacy settings configuration panel'
 * })
 * // Returns: '<details class="accordion" aria-label="Privacy settings configuration panel"><summary>Privacy Settings</summary>Manage your privacy preferences here.</details>'
 */
export const accordion = ({
    titleSlot,
    detailsSlot,
    attrs = '',
    className = '',
}) => {
    // Validate required props
    validateProps(
        { titleSlot, detailsSlot },
        ['titleSlot', 'detailsSlot'],
        { componentName: 'accordion', componentType: 'atom' }
    );
    
    // Validate prop types
    validatePropTypes(
        { attrs, className },
        { 
            attrs: 'string',
            className: 'string'
        },
        { componentName: 'accordion', componentType: 'atom' }
    );
    
    // Warn if titleSlot is empty (bad UX)
    if (typeof titleSlot === 'string' && titleSlot.trim().length === 0) {
        console.warn(
            `[b0nes Warning] Accordion has empty titleSlot. ` +
            `Users need a visible summary/header to click.`
        );
    }
    
    // Warn if detailsSlot is empty (probably a mistake)
    if (typeof detailsSlot === 'string' && detailsSlot.trim().length === 0) {
        console.warn(
            `[b0nes Warning] Accordion has empty detailsSlot. ` +
            `There's no content to expand.`
        );
    }
    
    // Process attributes
    attrs = attrs ? ` ${attrs}` : '';
    
    // Normalize and escape classes
    const classes = normalizeClasses(['accordion', className]);
    
    // Process title slot (the summary/header)
    const titleContent = processSlotTrusted(titleSlot);
    
    // Process details slot (the collapsible content)
    const detailsContent = processSlotTrusted(detailsSlot);
    
    return `<details class="${classes}"${attrs}><summary>${titleContent}</summary>${detailsContent}</details>`;
};