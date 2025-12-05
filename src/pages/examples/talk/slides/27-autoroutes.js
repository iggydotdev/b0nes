export default {
          title: 'Auto-Routes: File = Route',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-cyan-400">Zero Config Routing</h2>
              <pre class="bg-gray-800 p-4 rounded-lg text-green-300 text-base md:text-xl font-mono w-full max-w-[90vw] md:max-w-3xl"><code>// File structure = URL structure
src/pages/
├── index.js           → /
├── about/index.js     → /about
├── blog/
│   ├── index.js       → /blog
│   └── [slug].js      → /blog/:slug
└── api/users.js       → /api/users

// No config files
// No route definitions
// Just create files 🎉</code></pre>
              <p class="mt-6 text-xl md:text-2xl text-yellow-400 text-center">Next.js taught us this. We just made it <span class="font-bold">zero-dependency</span>.</p>
            </div>
          `
        };