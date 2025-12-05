export default {
          title: 'Component Composition',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-green-400">Components Return Strings</h2>
              <pre class="bg-gray-800 p-4 rounded-lg text-pink-300 text-sm md:text-lg font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl"><code>// src/components/atoms/button/button.js
export const button = ({
    type = 'button',
    attrs = '', 
    className = '',
    slot,
}) => {
    // Validate required props
    validateProps(
        { slot },
        ['slot'],
        { componentName: 'button', componentType: 'atom' }
    );
    
    // Validate prop types
    validatePropTypes(
        { type, attrs, className, slot },
        { 
            type: 'string',
            attrs: 'string',
            className: 'string',
            // slot can be string or array
        },
        { componentName: 'button', componentType: 'atom' }
    );
    
    // Validate button type
    const validTypes = ['button', 'submit', 'reset'];
    if (!validTypes.includes(type)) {
        throw new Error(
            \`Invalid button type: "\${type}". Must be one of: \${validTypes.join(', ')}\`
        );
    }
    
    // Process attributes
    attrs = attrs ? \` \${attrs}\` : '';

    // Normalize classes
    const classes = normalizeClasses(['btn', className]);
    
    // Process slot content (trust component-rendered HTML)
    const slotContent = processSlotTrusted(slot);
    
    return \`<button type="\${type}" class="\${classes}"\${attrs}>\${slotContent}</button>\`;
};


// That's a component. No JSX. No transpilation.
// Just a function that returns HTML.

// Use it:
button({ slot: 'Click Me', type: 'submit' })
// → '&lt;button type="submit"&gt;Click Me&lt;/button&gt;'

// Compose them:
const page = [
  { type: 'atom', name: 'button', props: { slot: 'Hi' } }
];

compose(page) 
// → '&lt;button&gt;Hi&lt;/button&gt;'</code></pre>
            </div>
          `
        };