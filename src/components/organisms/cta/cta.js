import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { validateProps, validatePropTypes, createComponentError } from '../../utils/componentError.js';
import { escapeAttr } from '../../utils/escapeAttr.js';
import { box } from '../../atoms/index.js';

/**
 * CTA component - A call-to-action section for driving user engagement
 * 
 * Renders a call-to-action (CTA) section using the box atom with role="cta".
 * CTA sections are designed to encourage users to take a specific action,
 * such as signing up, downloading, purchasing, or contacting. Typically includes
 * persuasive text, value propositions, and prominent action buttons.
 * 
 * Common use cases:
 * - Email signup CTAs
 * - Free trial promotions
 * - Product purchase CTAs
 * - Download/install prompts
 * - Contact/consultation requests
 * - Newsletter subscriptions
 * 
 * @param {Object} props - Component properties
 * @param {string | Array<string>} props.slot - CTA content (headline, description, button, etc.)
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'data-conversion="signup"')
 * @param {string} [props.className=''] - Additional CSS classes to apply
 * @param {string} [props.id] - CTA section ID attribute
 * @param {string} [props.ariaLabel] - Accessible label for screen readers
 * @param {string} [props.variant] - CTA style variant (e.g., 'primary', 'secondary', 'urgent')
 * 
 * @returns {string} Rendered HTML CTA section (div with role="cta")
 * 
 * @throws {ComponentError} If required prop (slot) is missing
 * 
 * @example
 * // Basic CTA with headline and button
 * cta({
 *   slot: [
 *     '<h2>Ready to Get Started?</h2>',
 *     '<p>Join thousands of users already using our platform</p>',
 *     '<button class="btn primary">Sign Up Free</button>'
 *   ]
 * })
 * // Returns: '<div class="box cta" role="cta"><h2>Ready to Get Started?</h2>...</div>'
 * 
 * @example
 * // Email signup CTA
 * cta({
 *   className: 'newsletter-cta',
 *   slot: [
 *     '<h3>Stay Updated</h3>',
 *     '<p>Get weekly tips and insights delivered to your inbox</p>',
 *     '<form class="inline-form">',
 *     '  <input type="email" placeholder="your@email.com"/>',
 *     '  <button type="submit">Subscribe</button>',
 *     '</form>'
 *   ]
 * })
 * // Returns: '<div class="box cta newsletter-cta" role="cta">...</div>'
 * 
 * @example
 * // Urgent CTA with variant
 * cta({
 *   variant: 'urgent',
 *   className: 'sale-cta',
 *   slot: [
 *     '<h2>Limited Time Offer!</h2>',
 *     '<p>Save 50% - Offer ends in 24 hours</p>',
 *     '<a href="/pricing" class="btn large">Claim Your Discount</a>'
 *   ]
 * })
 * // Returns: '<div class="box cta urgent sale-cta" role="cta">...</div>'
 * 
 * @example
 * // Download CTA
 * cta({
 *   className: 'download-cta centered',
 *   slot: [
 *     '<h2>Download Our App</h2>',
 *     '<p>Available on iOS and Android</p>',
 *     '<div class="download-buttons">',
 *     '  <a href="/ios"><img src="/app-store.svg" alt="Download on App Store"/></a>',
 *     '  <a href="/android"><img src="/google-play.svg" alt="Get it on Google Play"/></a>',
 *     '</div>'
 *   ]
 * })
 * 
 * @example
 * // Simple contact CTA with ID
 * cta({
 *   id: 'contact-cta',
 *   slot: [
 *     '<h3>Have Questions?</h3>',
 *     '<p>Our team is here to help</p>',
 *     '<a href="/contact" class="btn">Contact Us</a>'
 *   ]
 * })
 * // Returns: '<div class="box cta" id="contact-cta" role="cta">...</div>'
 * 
 * @example
 * // Accessible CTA with aria-label
 * cta({
 *   ariaLabel: 'Sign up for free trial call-to-action',
 *   slot: [
 *     '<h2>Try It Free for 30 Days</h2>',
 *     '<p>No credit card required</p>',
 *     '<button class="btn primary large">Start Free Trial</button>',
 *     '<p class="fine-print">Cancel anytime</p>'
 *   ]
 * })
 * // Returns: '<div class="box cta" role="cta" aria-label="Sign up for free trial call-to-action">...</div>'
 * 
 * @example
 * // Multi-action CTA
 * cta({
 *   className: 'multi-action',
 *   slot: [
 *     '<h2>Choose Your Plan</h2>',
 *     '<div class="actions">',
 *     '  <button class="btn primary">Start Free</button>',
 *     '  <button class="btn secondary">View Pricing</button>',
 *     '  <a href="/demo">Schedule Demo</a>',
 *     '</div>'
 *   ]
 * })
 */
export const cta = ({
    slot,
    attrs = '',
    className = '',
    id,
    ariaLabel,
    variant
}) => {
    // Validate required props
    validateProps(
        { slot },
        ['slot'],
        { componentName: 'cta', componentType: 'organism' }
    );
    
    // Validate prop types
    validatePropTypes(
        { attrs, className },
        { 
            attrs: 'string',
            className: 'string'
        },
        { componentName: 'cta', componentType: 'organism' }
    );
    
    // Validate slot is not empty
    if ((typeof slot === 'string' && slot.trim().length === 0) || 
        (Array.isArray(slot) && slot.length === 0)) {
        console.warn(
            `[b0nes Warning] CTA has empty content. ` +
            `CTAs should contain persuasive text and action buttons/links.`
        );
    }
    
    // Suggest including an action element (button or link)
    const slotString = Array.isArray(slot) ? slot.join('') : slot;
    const hasAction = slotString.includes('<button') || 
                      slotString.includes('<a ') || 
                      slotString.includes('<a>');
    
    if (!hasAction) {
        console.warn(
            `[b0nes Warning] CTA section should include an action element ` +
            `(button or link) for users to interact with.`
        );
    }
    
    // Suggest including a heading
    const hasHeading = slotString.match(/<h[1-6]/);
    if (!hasHeading) {
        console.info(
            `[b0nes Info] CTA section should typically include a heading ` +
            `(h2-h4) to communicate the value proposition.`
        );
    }
    
    // Process attributes
    const escapedAttrs = attrs ? ` ${escapeAttr(attrs)}` : '';
    
    // Add id attribute if provided
    const idAttr = id ? ` id="${escapeAttr(id)}"` : '';
    
    // Add aria-label for accessibility if provided
    const ariaLabelAttr = ariaLabel 
        ? ` aria-label="${escapeAttr(ariaLabel)}"` 
        : '';
    
    // Build classes array with variant if provided
    const classArray = ['cta'];
    if (variant) {
        classArray.push(variant);
    }
    if (className) {
        classArray.push(className);
    }
    
    // Normalize classes
    const classes = normalizeClasses(classArray);
    
    // Process slot content
    const slotContent = processSlotTrusted(slot);
    
    // Combine all attributes for box
    const boxAttrs = `role="cta"${idAttr}${ariaLabelAttr}${escapedAttrs}`.trim();
    
    // Use box component as the base
    return box({
        is: 'div',
        className: classes,
        attrs: boxAttrs,
        slot: slotContent
    });
};