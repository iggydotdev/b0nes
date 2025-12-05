export default {
          title: 'Putting It All Together',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-yellow-400">The Full Stack</h2>
              <pre class="bg-gray-800 p-4 rounded-lg text-green-300 text-sm md:text-lg font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl"><code>// 1. Auto-routes discover pages
pages/blog/[slug].js → /blog/:slug

// 2. Compose renders to HTML
compose(components) → '&lt;div&gt;...&lt;/div&gt;'

// 3. Server sends HTML + b0nes.js
renderPage(html, { interactive: true })

// 4. Client hydrates [data-b0nes]
b0nes.init() → attach behaviors

// 5. FSM + Store manage state
fsm.send('NEXT') + store.dispatch('save')

Result: Full-featured site 🚀</code></pre>
            </div>
          `
        };