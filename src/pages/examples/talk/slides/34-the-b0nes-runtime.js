export default {
          title: 'The b0nes Runtime',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-blue-400">b0nes.js: The Brain</h2>
              <pre class="bg-gray-800 p-4 rounded-lg text-orange-300 text-xs md:text-sm font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl overflow-auto"><code>// client/b0nes.js - simplified
window.b0nes = {
  behaviors: {},
  
  register(name, fn) {
    this.behaviors[name] = fn;
  },
  
  init(root = document) {
    // Find all [data-b0nes] elements
    root.querySelectorAll('[data-b0nes]').forEach(el => {
      const [type, name] = el.dataset.b0nes.split(':');
      
      // Already initialized? Skip
      if (el.dataset.b0nesInit) return;
      
      // Load behavior on-demand
      import(\`/\${type}s/\${name}/\${type}.\${name}.client.js\`)
        .then(mod => {
          this.register(name, mod.client);
          mod.client(el); // attach
          el.dataset.b0nesInit = 'true';
        });
    });
  }
};

// Auto-init on page load
document.addEventListener('DOMContentLoaded', () => b0nes.init());</code></pre>
              <p class="mt-4 text-lg text-gray-300 text-center">Total size: <span class="text-green-400 font-bold">~3KB gzipped</span></p>
            </div>
          `
        };