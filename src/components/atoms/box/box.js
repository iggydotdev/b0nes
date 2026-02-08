import { normalizeClasses } from '../../utils/normalizeClasses.js';
import { processSlotTrusted } from '../../utils/processSlot.js';
import { validateProps, validatePropTypes, createComponentError } from '../../utils/componentError.js';
import { attrsToString } from '../../utils/attrsToString.js';

/**
 * Box component - A flexible container element
 * 
 * Renders a generic HTML container element (div, section, article, aside, etc.)
 * with customizable content and styling. The most flexible component for creating
 * layout structures and grouping content. Can be any block-level HTML element.
 * 
 * @param {Object} props - Component properties
 * @param {string} [props.is='div'] - HTML tag name (e.g., 'div', 'section', 'article', 'aside', 'main', 'nav', 'header', 'footer')
 * @param {string | Array<string>} [props.slot=''] - Box content or child components
 * @param {string} [props.attrs=''] - Additional HTML attributes (e.g., 'data-section="intro" role="region"')
 * @param {string} [props.className=''] - Additional CSS classes to apply

 * @returns {string} Rendered HTML container element
 * 
 * @throws {createComponentError} If prop types are invalid
 * 
 * @example
 * // Basic div container
 * box({ slot: 'Content goes here' })
 * // Returns: '<div class="box">Content goes here</div>'
 * 
 * @example
 * // Semantic section with custom class
 * box({
 *   is: 'section',
 *   className: 'hero-section',
 *   slot: '<h1>Welcome</h1><p>To our site</p>'
 * })
 * // Returns: '<section class="box hero-section"><h1>Welcome</h1><p>To our site</p></section>'
 * 
 * @example
 * // Article container with ID
 * box({
 *   is: 'article',
 *   attrs: 'id="main-article"',
 *   slot: 'Article content here...'
 * })
 * // Returns: '<article class="box" id="main-article">Article content here...</article>'
 * 
 * @example
 * // Aside with ARIA role
 * box({
 *   is: 'aside',
 *   attrs='role="complementary" aria-label="Related articles"',
 *   slot: '<h2>Related</h2><ul>...</ul>'
 * })
 * // Returns: '<aside class="box" role="complementary" aria-label="Related articles"><h2>Related</h2><ul>...</ul></aside>'
 * 
 * @example
 * // Nested content with array slot
 * box({
 *   is: 'main',
 *   slot: [
 *     '<header>Page Header</header>',
 *     '<section>Content</section>',
 *     '<footer>Page Footer</footer>'
 *   ]
 * })
 * // Returns: '<main class="box"><header>Page Header</header><section>Content</section><footer>Page Footer</footer></main>'
 * 
 * @example
 * // Container with data attributes
 * box({
 *   className: 'card elevated',
 *   attrs: 'data-card-type="product" data-id="123"',
 *   slot: 'Product card content'
 * })
 * // Returns: '<div class="box card elevated" data-card-type="product" data-id="123">Product card content</div>'
 */
export const box = ({
    is = 'div',
    slot = '',
    attrs = '',
    className = '',
}) => {
    // Validate prop types
    validatePropTypes(
        { is, className },
        { 
            is: 'string',
            className: 'string'
        },
        { componentName: 'box', componentType: 'atom' }
    );
    
    // Validate that 'is' is not empty
    if (is.trim().length === 0) {
        throw createComponentError(
            'The "is" prop cannot be empty. Specify an HTML tag like "div", "section", "article", etc.',
            { componentName: 'box', componentType: 'atom', props: { is, slot } }
        );
    }
    
    // Validate that 'is' contains only valid tag name characters
    if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(is)) {
        throw createComponentError(
            `Invalid HTML tag name: "${is}". Tag names must start with a letter and contain only letters, numbers, and hyphens.`,
            { componentName: 'box', componentType: 'atom', props: { is, slot } }
        );
    }
    
    // Warn about potentially problematic tags
    const scriptTags = ['script', 'style', 'iframe', 'object', 'embed'];
    if (scriptTags.includes(is.toLowerCase())) {
        console.warn(
            `[b0nes Warning] Using "${is}" tag in box component. ` +
            `This may pose security or rendering issues. Consider using a different approach.`
        );
    }
    
    // Recommend semantic HTML
    const semanticTags = ['section', 'article', 'aside', 'nav', 'main', 'header', 'footer'];
    if (is === 'div' && slot && typeof slot === 'string' && slot.includes('<h1')) {
        console.info(
            `[b0nes Info] Consider using a semantic HTML tag (${semanticTags.join(', ')}) ` +
            `instead of div for better accessibility and SEO.`
        );
    }
    
    // Process attributes (supports string or object)
    const attrsStr = attrsToString(attrs);
    
    // Normalize and escape classes
    const classes = normalizeClasses(['box', className]);
    
    // Process slot content (trust component-rendered HTML)
    const slotContent = processSlotTrusted(slot);
    
    return `<${is} class="${classes}"${attrsStr}>${slotContent}</${is}>`;
};
