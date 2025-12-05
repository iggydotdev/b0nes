export default {
          title: 'The Compose Function',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-orange-400">Recursion All The Way Down</h2>
              <pre class="bg-gray-800 p-4 rounded-lg text-lime-300 text-sm md:text-base font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl overflow-auto"><code>// compose.js - simplified
export const compose = (components) => {
  return components.map(comp => {
    // Get the component function from registry
    const fn = library[comp.type][comp.name];
    
    // If slot has nested components, compose them first
    if (Array.isArray(comp.props.slot)) {
      comp.props.slot = compose(comp.props.slot);
    }
    
    // Call the function with props
    return fn(comp.props);
  }).join('\\n');
};

// Recursion handles nesting
// Registry holds all components
// No virtual DOM. Just strings. 🎯</code></pre>
             
            </div>
          `
        };