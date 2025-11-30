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
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-4 md:p-8 bg-gray-900 text-white">
              <h1 class="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-red-400">Your framework downloaded<br><strong>700 MB</strong></h1>
              <h2 class="text-2xl md:text-4xl font-semibold text-gray-300 mb-4 md:mb-8">to render a button</h2>
              <img src="https://media.tenor.com/MYZgsN2TDJAAAAAM/this-is.gif" loading="lazy" alt="This is fine dog" class="w-full max-w-[80vw] md:max-w-xl mx-auto rounded-lg shadow-xl border-4 border-red-600">
              <p class="mt-4 md:mt-8 text-xl md:text-2xl text-red-400 font-medium">(yes, that’s a real create-next-app screenshot)</p>
            </div>
          `
        },

        // ============ WHY – The Overengineering Saga ============
        {
          title: 'Why? – A Brief History of Web Dev Drama',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-purple-400">From Humble HTML to Framework Hell</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-green-300 text-lg md:text-2xl font-mono leading-relaxed mb-4 md:mb-8 w-full max-w-[90vw] md:max-w-2xl"><code>1990s: HTML – "Look, text on a page!"
+ CSS: "Make it pretty... ish"
+ JS: "Sprinkle some interactivity"

2006: jQuery – "Finally, cross-browser sanity!"

2010: AngularJS – "MVC for the web! Templates! Directives!"

2013+: Framework Wars – React, Vue, Svelte, Angular 2+, Solid...

2025: Next.js – "SSR! SSG! RSC! ...700MB node_modules?"</code></pre>
              <img src="https://media.tenor.com/f4MzvvjwUhAAAAAM/spongebob-mocking.gif" loading="lazy" alt="Mocking SpongeBob" class="w-full max-w-[80vw] md:max-w-xl mt-4 rounded-lg shadow-md">
              <p class="mt-4 md:mt-8 text-xl md:text-3xl text-gray-300 text-center">We chased "productivity."<br>Ended up with overengineering fatigue.</p>
            </div>
          `
        },
        {
          title: 'Why? – The Current State (2025)',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-yellow-400">We lost the plot</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-blue-300 text-lg md:text-2xl font-mono leading-relaxed mb-4 md:mb-8 w-full max-w-[90vw] md:max-w-2xl"><code>npx create-next-app → 847 packages
node_modules → 412 MB
Time to interactive → 3.2s on 4G
Lines to make a button clickable → 47</code></pre>
              <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3F2d3I3bTh5aDc0cnV3NmNjeWRwZm5xZG53YzM0M3c2MjdvaTM5NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H62NIrYc3ZzUG273k2/giphy.gif" loading="lazy" alt="Its never gonna end" class="w-full max-w-[80vw] md:max-w-2xl mt-4 rounded-lg shadow-md">
              <p class="mt-4 md:mt-8 text-xl md:text-3xl text-red-400 text-center">Optimized for devs. Users? "Hold my 5G."</p>
            </div>
          `
        },
        {
          title: 'Why? – The Over-Abstraction Spiral',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-red-400">Abstractions on abstractions on...</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-indigo-300 text-lg md:text-2xl font-mono leading-relaxed mb-4 md:mb-8 w-full max-w-[90vw] md:max-w-2xl"><code>Problem: Complex UIs → Add components
Problem: State → Add Redux/Zustand
Problem: Bundle size → Add code splitting
Problem: Complexity → Add another layer
Problem: Now you need a PhD to debug</code></pre>
              <img src="https://media.tenor.com/7tGhjTpUh4QAAAAM/drake-drizzy.gif" loading="lazy" alt="Drake hotline bling" class="w-full max-w-[80vw] md:max-w-xl rounded-lg shadow-md">
              <p class="mt-4 md:mt-8 text-xl md:text-3xl text-gray-300 text-center">Each "fix" spawns two new problems.<br>Like hydra, but less mythical.</p>
            </div>
          `
        },
        {
          title: 'Why? – The TypeScript Paradox',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-orange-400">TS: Extra Logic to... Be Like JS?</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-pink-300 text-sm md:text-xl font-mono leading-relaxed mb-4 md:mb-8 w-full max-w-[90vw] md:max-w-3xl"><code>// JS with JSDoc
/** @type {string} */
let name = 'b0nes';

// TS
let name: string = 'b0nes';

// But wait... TS compiles to JS anyway!
// So why the extra build step + complexity?</code></pre>
              <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXJqNjZpZG5uZmU4NHBxOHN2dTBwMHlyamtnMjFxYzlvOXBxb2M1NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nTfdeBvfgzV26zjoFP/giphy.gif" loading="lazy" alt="Keanu Reeves Confused" class="w-full max-w-[80vw] md:max-w-xl rounded-lg shadow-md">
              <p class="mt-4 md:mt-8 text-xl md:text-3xl text-gray-300 text-center">We added a language to fix JS...<br>That transpiles back to JS. 🤦</p>
            </div>
          `
        },
        {
          title: 'Why? – NPM Ecosystem Blues',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-blue-400">NPM: Where Packages Go to Die</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-cyan-300 text-lg md:text-2xl font-mono leading-relaxed mb-4 md:mb-8 w-full max-w-[90vw] md:max-w-2xl"><code>Maintainer ghosts → No updates
Breaking changes → "Just rewrite everything!"
No migration guides → "Figure it out, champ"
Your perfect app? Obsolete in 6 months.</code></pre>
              <img src="https://media.tenor.com/MYZgsN2TDJAAAAAM/this-is.gif" loading="lazy" alt="This is fine dog" class="w-full max-w-[80vw] md:max-w-xl rounded-lg shadow-md border-4 border-red-600">
              <p class="mt-4 md:mt-8 text-xl md:text-3xl text-red-400 text-center">Dependency hell is real.<br>And it's in your node_modules.</p>
            </div>
          `
        },
        {
          title: 'Why? – The JavaScript Tax',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-yellow-400">Every Millisecond Counts × Millions</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-lime-300 text-lg md:text-2xl font-mono leading-relaxed mb-4 md:mb-8 w-full max-w-[90vw] md:max-w-2xl"><code>Parsing: 200–400 ms
Compilation: 300–600 ms
Execution: 400–800 ms
Total: ~1.5s of JS tax before anything happens</code></pre>
              <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3F2d3I3bTh5aDc0cnV3NmNjeWRwZm5xZG53YzM0M3c2MjdvaTM5NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H62NIrYc3ZzUG273k2/giphy.gif" loading="lazy" alt="Its never gonna end" class="w-full max-w-[80vw] md:max-w-2xl mt-4 rounded-lg shadow-md">
              <p class="mt-4 md:mt-8 text-xl md:text-3xl text-gray-300 text-center">Users on potato phones? Good luck.</p>
            </div>
          `
        },

        // ============ HOW – The Escape Plan ============
        {
          title: 'How? – Principle 1: Respect Web Standards',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-green-400">Use HTML/CSS/JS as Intended</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-pink-300 text-sm md:text-xl font-mono leading-relaxed mb-4 md:mb-8 w-full max-w-[90vw] md:max-w-3xl"><code>// Vanilla JS button
&lt;button onclick="alert('Clicked!')"&gt;Click&lt;/button&gt;

// Framework "magic"
import { Button } from 'fancy-lib';
&lt;Button onClick={() => alert('Clicked!')} /&gt;

// Spoiler: Both render the same DOM. One downloads a library.</code></pre>
              <p class="text-xl md:text-3xl mt-4 md:mt-8 text-gray-300 text-center">The web platform is powerful.<br>Stop reinventing it.</p>
            </div>
          `
        },
        {
          title: 'How? – Principle 2: JS as Enhancement',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-teal-400">Ask: "Do We Even Need JS Here?"</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-blue-300 text-sm md:text-xl font-mono leading-relaxed mb-4 md:mb-8 w-full max-w-[90vw] md:max-w-2xl"><code>// No hydration = No mismatches
// No runtime = Instant load
// Graceful degradation built-in
// Direct DOM when needed? Fine.</code></pre>
              <img src="https://media.tenor.com/8RKdKkyTEKkAAAAe/hshs.png" loading="lazy" alt="Success kid" class="w-full max-w-[80vw] md:max-w-md mt-4 rounded-lg shadow-md">
              <p class="text-xl md:text-3xl mt-4 md:mt-8 text-green-400 text-center">Progressive enhancement: Works without JS.<br>Better with it. Novel idea!</p>
            </div>
          `
        },
        {
          title: 'How? – Principle 3: Minimize Dependencies',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-orange-400">Zero NPM Drama</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-indigo-300 text-sm md:text-xl font-mono leading-relaxed mb-4 md:mb-8 w-full max-w-[90vw] md:max-w-2xl"><code>// No dependencies = No upgrades
// No upgrades = No breaking changes
// Small bundle = Happy users
// Easy maintain = Happy you</code></pre>
              <p class="text-xl md:text-3xl mt-4 md:mt-8 text-gray-300 text-center">NPM ecosystem broken?<br>Don't use it. Problem solved.</p>
            </div>
          `
        },
        {
          title: 'How? – Principle 4: Measure What Matters',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-purple-400">Users > Dev Ego</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-cyan-300 text-sm md:text-xl font-mono leading-relaxed mb-4 md:mb-8 w-full max-w-[90vw] md:max-w-2xl"><code>// Wrong: "How fast can I code?"
// Right: "How fast does it run?"
// Bonus: Simplicity reduces bugs.
// Maintenance? Now a breeze.</code></pre>
              <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXJqNjZpZG5uZmU4NHBxOHN2dTBwMHlyamtnMjFxYzlvOXBxb2M1NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nTfdeBvfgzV26zjoFP/giphy.gif" loading="lazy" alt="Keanu Reeves Confused" class="w-full max-w-[80vw] md:max-w-xl rounded-lg shadow-md">
              <p class="text-xl md:text-3xl mt-4 md:mt-8 text-red-400 text-center">DevEx is great. Until users bail.</p>
            </div>
          `
        },
        {
          title: 'How? – Principle 5: Framework-Lite',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-green-400">Only What You Need, Nothing More</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-lime-300 text-sm md:text-xl font-mono leading-relaxed mb-4 md:mb-8 w-full max-w-[90vw] md:max-w-2xl"><code>// Templating? Optional.
// Interactivity? Optional.
// Routing? Optional.
// Build step? Optional.
// Pay for what you use. Radical!</code></pre>
              <p class="text-3xl md:text-5xl mt-4 md:mt-8 text-gray-300 text-center font-extrabold">Simplicity isn't lazy.<br>It's smart.</p>
            </div>
          `
        },

        // ============ WHAT – The Shameless Plug ============
        {
          title: 'What? – Meet b0nes',
          content: `
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-4 md:p-8 bg-gray-900 text-white">
              <h1 class="text-5xl md:text-7xl font-extrabold text-teal-400 mb-4 md:mb-8">b0nes</h1>
              <p class="text-xl md:text-3xl text-gray-300 mb-2 md:mb-4 max-w-3xl">Zero-dependency toolkit: SSR, SSG, SPA, state machines, forms – pure JS.</p>
              <p class="text-xl md:text-3xl text-green-400 mb-2 md:mb-4">Bundle: &lt;10 KB. Learning: One afternoon.</p>
              <p class="text-xl md:text-3xl text-yellow-400 mb-4 md:mb-8">Mitigates all that Why/How nonsense.</p>
              <img src="https://media.tenor.com/8RKdKkyTEKkAAAAe/hshs.png" loading="lazy" alt="Success kid" class="w-full max-w-[80vw] md:max-w-md mt-4 rounded-lg shadow-md">
            </div>
          `
        },
        {
          title: 'What? – How b0nes Fixes the Mess',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-orange-400">Principles in Action</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-purple-300 text-lg md:text-2xl font-mono leading-relaxed mb-4 md:mb-8 w-full max-w-[90vw] md:max-w-2xl"><code>✓ Web standards? Honored.
✓ JS enhancement? Default.
✓ Dependencies? Zero.
✓ Metrics? User-first.
✓ Framework-lite? Everything optional.</code></pre>
              <p class="text-xl md:text-3xl mt-4 md:mt-8 text-green-400 text-center">Abstractions? Minimal.<br>TS? JSDoc suffices.<br>NPM? Not invited.</p>
            </div>
          `
        },
        {
          title: 'What? – Live Demo or Riot',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-red-400">Adding a Page in 5 Seconds</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-cyan-300 text-sm md:text-2xl font-mono leading-relaxed mb-4 md:mb-8 w-full max-w-[90vw] md:max-w-3xl"><code># Live on stage
echo "export const meta = { title: 'Live' };
export const components = [
  { type: 'atom', name: 'text', props: { is: 'h1', slot: 'Born live!' } }
];" > live.js

# Refresh → /live exists. Magic? Nah, simplicity.</code></pre>
              <p class="text-4xl md:text-6xl mt-6 md:mt-12 text-yellow-400 font-extrabold animate-pulse">Your move, frameworks.</p>
            </div>
          `
        },
        {
          title: 'Final Thought',
          content: `
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-4 md:p-8 bg-black text-white">
              <h2 class="text-3xl md:text-5xl font-bold text-red-400 mb-3 md:mb-6">Your framework didn't download 700 MB to render a button.</h2>
              <p class="text-xl md:text-3xl text-gray-300 mb-3 md:mb-6">You downloaded 700 MB to feel productive while rendering a button.</p>
              <p class="text-2xl md:text-4xl font-extrabold text-white mb-4 md:mb-8"><strong>There's a difference.</strong></p>
              <img src="https://media.tenor.com/f4MzvvjwUhAAAAAM/spongebob-mocking.gif" loading="lazy" alt="Spongebob mocking" class="w-full max-w-[80vw] md:max-w-md mt-4 rounded-lg shadow-lg">
            </div>
          `
        },
        {
          title: 'Call to Action',
          content: `
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-4 md:p-8 bg-gray-900 text-white">
              <h1 class="text-4xl md:text-6xl font-extrabold text-green-400 mb-4 md:mb-8">Ready to pick a b0ne?</h1>
              <p class="text-2xl md:text-4xl mt-4 md:mt-8">
                <a href="https://github.com/iggydotdev/b0nes" class="text-cyan-400 hover:text-cyan-300 underline font-semibold transition duration-300">github.com/iggydotdev/b0nes</a>
              </p>
              <p class="mt-6 md:mt-12 text-xl md:text-3xl text-gray-400">npx b0nes my-app → Ship simple.</p>
              <img src="https://media.tenor.com/8RKdKkyTEKkAAAAe/hshs.png" loading="lazy" alt="Success kid" class="w-full max-w-[80vw] md:max-w-sm mt-4 md:mt-8 rounded-lg shadow-lg">
            </div>
          `
        }
      ]
    }
  }
];