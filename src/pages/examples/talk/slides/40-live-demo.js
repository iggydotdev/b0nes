export default {
          title: 'Live Demo',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-red-400">Add a Page in 5 Seconds</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-cyan-300 text-base md:text-xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl"><code># Create a page (watch this)
mkdir src/pages/live
cat > src/pages/live/index.js << EOF
export const components = [{
  type: 'atom',
  name: 'text',
  props: {
    is: 'h1',
    slot: 'Born at DDD Brisbane! 🦴'
  }
}]
EOF

# Refresh browser → /live exists
# No build. No config. Just works.</code></pre>
              <p class="text-3xl md:text-4xl mt-8 text-yellow-400 font-extrabold animate-pulse">Your move, frameworks.</p>
            </div>
          `
        };