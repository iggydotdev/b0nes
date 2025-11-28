import { stylesheetPresets } from '../../../framework/config/stylesheets.js';

export const meta = {
  title: 'Your framework downloaded 700 MB to render a button',
  description: 'DDD Brisbane 2025 – b0nes: the revenge of vanilla JS',
  // Using a Tailwind CDN for demonstration. In a real project, you'd likely use a build process.
  stylesheets: stylesheetPresets.combine(
    'https://cdn.tailwindcss.com', // Tailwind CSS CDN
    './custom.css' // dark mode, huge code fonts, meme-ready (can still be used for specific overrides)
  )
};

export const components = [
  {
    type: 'organism',
    name: 'slides',
    props: {
      slides: [
        // ============ HOOK ============
        {
          title: 'Hook',
          content: `
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-8 bg-gray-900 text-white">
              <h1 class="text-6xl font-extrabold leading-tight mb-4 text-red-400">Your framework downloaded<br><strong>700 MB</strong></h1>
              <h2 class="text-4xl font-semibold text-gray-300 mb-8">to render a button</h2>
              <img src="https://media.tenor.com/MYZgsN2TDJAAAAAM/this-is.gif" loading="lazy" alt="This is fine dog" class="max-w-xl mx-auto rounded-lg shadow-xl border-4 border-red-600">
              <p class="mt-8 text-2xl text-red-400 font-medium">(yes, that’s a real create-next-app screenshot)</p>
            </div>
          `
        },

        // ============ WHY – The Pain ============
        {
          title: 'The Current State (2025)',
          content: `
            <div class="p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-5xl font-bold mb-8 text-purple-400">We lost the plot</h2>
              <pre class="bg-gray-800 p-6 rounded-lg shadow-lg text-green-300 text-2xl font-mono leading-relaxed mb-8 w-full max-w-2xl"><code>npx create-next-app → 847 packages
node_modules → 412 MB
Time to interactive → 3.2 s on 4G
Lines to make a button clickable → 47</code></pre>
              <img src="https://media.tenor.com/f4MzvvjwUhAAAAAM/spongebob-mocking.gif" loading="lazy" alt="Mocking SpongeBob" class="max-w-xl mt-4 rounded-lg shadow-md">
              <p class="mt-8 text-3xl text-gray-300 text-center">We optimized for developer speed.<br>Users pay the price.</p>
            </div>
          `
        },
        {
          title: 'The Over-Abstraction Spiral',
          content: `
            <div class="p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-5xl font-bold mb-8 text-yellow-400">It never ends</h2>
              <pre class="bg-gray-800 p-6 rounded-lg shadow-lg text-blue-300 text-2xl font-mono leading-relaxed mb-8 w-full max-w-2xl"><code>Problem: Complex UIs
→ Add components
→ Problem: State
→ Add Redux / Zustand
→ Problem: Bundle size
→ Add code splitting
→ Problem: Complexity
→ Add another abstraction layer
→ ∞</code></pre>
              <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3F2d3I3bTh5aDc0cnV3NmNjeWRwZm5xZG53YzM0M3c2MjdvaTM5NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H62NIrYc3ZzUG273k2/giphy.gif" loading="lazy" alt="Its never gonna end" class="max-w-2xl mt-4 rounded-lg shadow-md">
            </div>
          `
        },
        {
          title: 'The JavaScript Tax',
          content: `
            <div class="p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-5xl font-bold mb-8 text-red-400">Every millisecond × millions of users</h2>
              <pre class="bg-gray-800 p-6 rounded-lg shadow-lg text-indigo-300 text-2xl font-mono leading-relaxed mb-8 w-full max-w-2xl"><code>Parsing    : 200–400 ms
Compilation: 300–600 ms
Execution  : 400–800 ms
Total      : ~1.5 s of JS just to start</code></pre>
              <img src="https://media.tenor.com/7tGhjTpUh4QAAAAM/drake-drizzy.gif" loading="lazy" alt="Drake hotline bling" class="max-w-xl rounded-lg shadow-md">
            </div>
          `
        },

        // ============ HOW – The Principles (ALL OF THEM, NO MISSING) ============
        {
          title: 'Principle 1 – Respect Web Standards',
          content: `
            <div class="p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-5xl font-bold mb-8 text-green-400">Use HTML/CSS/JS as they were meant to be used</h2>
              <pre class="bg-gray-800 p-6 rounded-lg shadow-lg text-pink-300 text-xl font-mono leading-relaxed mb-8 w-full max-w-3xl"><code>// b0nes
export const button = ({slot}) => 
  => \`&lt;button&gt;\${slot}&lt;/button&gt;\`;

// React 2025
const Button = memo(forwardRef(
  ({onClick, children}) => 
    &lt;button onClick={useCallback(onClick)}&gt;{children}&lt;/button&gt;
));</code></pre>
              <img src="https://media.tenor.com/JPiEKf_wEKkAAAAe/hshs.png" loading="lazy" alt="Success kid" class="max-w-md rounded-lg shadow-md">
            </div>
          `
        },
        {
          title: 'Principle 2 – JavaScript as Enhancement',
          content: `
            <div class="p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-5xl font-bold mb-8 text-blue-400">No JS = works. With JS = better.</h2>
              <pre class="bg-gray-800 p-6 rounded-lg shadow-lg text-yellow-300 text-xl font-mono leading-relaxed mb-8 w-full max-w-2xl"><code>&lt;form action="/submit"&gt;
  &lt;input name="name"&gt;
  &lt;button&gt;Submit&lt;/button&gt;
&lt;/form&gt;

// b0nes adds AJAX only if JS is present
// No hydration bugs. Ever.</code></pre>
              <p class="text-4xl mt-8 text-gray-300 text-center font-semibold">This isn't retro.<br>This is respect.</p>
            </div>
          `
        },
        {
          title: 'Principle 3 – Minimize Dependencies',
          content: `
            <div class="p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-5xl font-bold mb-8 text-red-400">Zero is the only safe number</h2>
              <pre class="bg-gray-800 p-6 rounded-lg shadow-lg text-orange-300 text-2xl font-mono leading-relaxed mb-8 w-full max-w-2xl"><code>npm ls | wc -l
React app → 1847
b0nes app → 1 (just b0nes itself)</code></pre>
              <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHNvOWI2ZTBvYTJlNHg2bTB6ZGdxeHkxODdvbWEzdjJsZmI2bGE5cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/r0q8JfQLzevKR24Anc/giphy.gif" loading="lazy" alt="Steve Jobs - Zero" class="max-w-xl rounded-lg shadow-md">
            </div>
          `
        },
        {
          title: 'Principle 4 – Measure What Matters',
          content: `
            <div class="p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-5xl font-bold mb-8 text-purple-400">We measure developer speed<br>Users measure performance</h2>
              <pre class="bg-gray-800 p-6 rounded-lg shadow-lg text-cyan-300 text-xl font-mono leading-relaxed mb-8 w-full max-w-2xl"><code>// What we optimize for
Developer experience ↑↑↑

// What users actually get
Time to interactive ↓↓↓
Bundle size ↑↑↑
Battery drain ↑↑↑</code></pre>
              <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXJqNjZpZG5uZmU4NHBxOHN2dTBwMHlyamtnMjFxYzlvOXBxb2M1NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nTfdeBvfgzV26zjoFP/giphy.gif" loading="lazy" alt="Keanu Reeves Confused" class="max-w-xl rounded-lg shadow-md">
            </div>
          `
        },
        {
          title: 'Principle 5 – Framework-Lite',
          content: `
            <div class="p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-5xl font-bold mb-8 text-green-400">Templating where needed<br>Interactivity where needed<br>Everything optional</h2>
              <pre class="bg-gray-800 p-6 rounded-lg shadow-lg text-lime-300 text-xl font-mono leading-relaxed mb-8 w-full max-w-2xl"><code>// You only pay for what you use
No routing? No problem.
No state? No problem.
No build step? No problem.</code></pre>
              <p class="text-5xl mt-8 text-gray-300 text-center font-extrabold">Simplicity is a feature.</p>
            </div>
          `
        },

        // ============ WHAT – The Magic ============
        {
          title: 'What is b0nes?',
          content: `
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-8 bg-gray-900 text-white">
              <h1 class="text-7xl font-extrabold text-teal-400 mb-8">b0nes</h1>
              <p class="text-3xl text-gray-300 mb-4 max-w-3xl">A zero-dependency toolkit that does SSR, SSG, SPA, state machines, and forms — all in pure JS.</p>
              <p class="text-3xl text-green-400 mb-4">Bundle size: &lt; 10 KB</p>
              <p class="text-3xl text-yellow-400 mb-8">Learning curve: one afternoon</p>
              <img src="https://media.tenor.com/8RKdKkyTEKkAAAAe/hshs.png" loading="lazy" alt="Success kid" class="max-w-md mt-4 rounded-lg shadow-md">
            </div>
          `
        },
        {
          title: 'Live Demo or Riot',
          content: `
            <div class="p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-5xl font-bold mb-8 text-orange-400">Watch me add a page in 5 seconds</h2>
              <pre class="bg-gray-800 p-6 rounded-lg shadow-lg text-purple-300 text-2xl font-mono leading-relaxed mb-8 w-full max-w-3xl"><code># Live on stage
echo "export const meta = { title: 'Live' };
export const components = [
  { type: 'atom', name: 'text', props: { is: 'h1', slot: 'Born live on stage' } }
];" > 

# Refresh → /live exists instantly</code></pre>
              <p class="text-6xl mt-12 text-red-500 font-extrabold animate-pulse">Your move, Next.js</p>
            </div>
          `
        },
        {
          title: 'Final Thought',
          background: '#000',
          content: `
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-8 bg-black text-white">
              <h2 class="text-5xl font-bold text-red-400 mb-6">Your framework didn't download 700 MB to render a button.</h2>
              <p class="text-3xl text-gray-300 mb-6">You downloaded 700 MB to feel productive while rendering a button.</p>
              <p class="text-4xl font-extrabold text-white mb-8"><strong>There's a difference.</strong></p>
              <img src="https://media.tenor.com/f4MzvvjwUhAAAAAM/spongebob-mocking.gif" loading="lazy" alt="Spongebob mocking" class="max-w-md mt-4 rounded-lg shadow-lg">
            </div>
          `
        },
        {
          title: 'Call to Action',
          background: '#1a1a1a',
          content: `
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-8 bg-gray-900 text-white">
              <h1 class="text-6xl font-extrabold text-green-400 mb-8">Are you ready to pick a bone?</h1>
              <p class="text-4xl mt-8">
                <a href="https://github.com/iggydotdev/b0nes" class="text-cyan-400 hover:text-cyan-300 underline font-semibold transition duration-300">github.com/iggydotdev/b0nes</a>
              </p>
              <p class="mt-12 text-3xl text-gray-400">npx b0nes my-app → start shipping</p>
              <img src="https://media.tenor.com/8RKdKkyTEKkAAAAe/hshs.png" loading="lazy" alt="Success kid" class="max-w-sm mt-8 rounded-lg shadow-lg">
            </div>
          `
        }
      ]
    }
  }
];