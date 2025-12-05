export default {
          title: 'Client Behaviors: The Solution',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-green-400">Progressive Enhancement Pattern</h2>
              <pre class="bg-gray-800 p-4 rounded-lg text-cyan-300 text-sm md:text-base font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl overflow-auto"><code>// 1. Server renders with data attribute
'&lt;div class="tabs" data-b0nes="molecules:tabs"&gt;
  &lt;!-- HTML here --&gt;
&lt;/div&gt;'

// 2. Client runtime discovers it
window.b0nes.init(); // finds [data-b0nes]

// 3. Loads behavior on-demand
import('/molecules/tabs/tabs.client.js')
  .then(module => {
    module.client(element); // attach behavior
  });

// Total JS for tabs: ~2KB 🚀</code></pre>
            </div>
          `
        };