// src/pages/examples/talk/index.js
import { stylesheetPresets } from '../../../framework/config/stylesheets.js';

export const meta = {
  title: 'Your framework downloaded 700 MB to render a button',
  description: 'DDD Brisbane 2025 – b0nes: the revenge of vanilla JS',
  stylesheets: stylesheetPresets.combine(
    './custom.css'
  ),
  scripts: ['./tailwind.js']
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
            </div>
          `
        },

        // ============ WHY AM I HERE ============
        {
          title: 'Why Am I Telling You This?',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 md:mb-8 text-blue-400">Full Disclosure</h2>
              <p class="text-2xl md:text-3xl text-gray-300 mb-4 text-center max-w-3xl">I'm not here to dunk on frameworks.</p>
              <p class="text-2xl md:text-3xl text-gray-300 mb-4 text-center max-w-3xl">I've built websites for 15+ years.</p>
              <p class="text-2xl md:text-3xl text-gray-300 mb-4 text-center max-w-3xl">And somewhere along the way...</p>
              <p class="text-3xl md:text-5xl text-red-400 font-bold mb-8 text-center">We lost the plot.</p>
              <p class="text-xl md:text-2xl text-green-400 text-center max-w-3xl">This is me trying to find it again.</p>
            </div>
          `
        },

        // ============ HISTORY ============
        {
          title: 'A Brief History of Web Dev Drama',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-purple-400">From Humble HTML to Framework Hell</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-green-300 text-lg md:text-2xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl"><code>1990s: HTML – "Look, text on a page!"
       + CSS: "Make it pretty... ish"
       + JS: "Sprinkle some interactivity"

2006: jQuery – "Finally, cross-browser!"

2010: AngularJS – "MVC for the web!"

2013+: Framework Wars Begin

2025: "How did we get here?"</code></pre>
            </div>
          `
        },

        {
          title: 'Chasing Productivity',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <p class="text-3xl md:text-4xl text-gray-300 mb-6 text-center max-w-4xl">We chased <span class="text-blue-400 font-bold">"productivity"</span></p>
              <p class="text-3xl md:text-4xl text-gray-300 mb-6 text-center max-w-4xl">Ended up with <span class="text-red-400 font-bold">complexity fatigue</span></p>
              <img src="https://media.tenor.com/8RKdKkyTEKkAAAAe/hshs.png" loading="lazy" alt="Success kid gone wrong" class="w-full max-w-[60vw] md:max-w-md mt-4 rounded-lg shadow-md">
            </div>
          `
        },

        // ============ THE CURRENT STATE ============
        {
          title: 'The Current State (2025)',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-yellow-400">We Lost the Plot</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-blue-300 text-xl md:text-3xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl"><code>npx create-next-app
→ 847 packages
→ 412 MB node_modules
→ 3.2s to interactive
→ 47 lines for a button</code></pre>
            </div>
          `
        },

        {
          title: 'Benefits vs Reality',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3F2d3I3bTh5aDc0cnV3NmNjeWRwZm5xZG53YzM0M3c2MjdvaTM5NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H62NIrYc3ZzUG273k2/giphy.gif" loading="lazy" alt="Its never gonna end" class="w-full max-w-[80vw] md:max-w-2xl rounded-lg shadow-md">
              <p class="mt-8 text-2xl md:text-3xl text-red-400 text-center max-w-3xl">Optimized for <span class="font-bold">developer experience</span></p>
              <p class="mt-4 text-2xl md:text-3xl text-gray-300 text-center max-w-3xl">Users? <span class="text-yellow-400">"Good luck with that 5G"</span></p>
            </div>
          `
        },

        // ============ PROBLEM #1 ============
        {
          title: 'Problem #1 - The Over-Abstraction Spiral',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-red-400">Abstractions All The Way Down</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-indigo-300 text-xl md:text-2xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl"><code>Problem: Complex UIs
Solution: Add components

Problem: State management
Solution: Add Redux

Problem: Bundle size
Solution: Code splitting

Problem: Too complex to debug
Solution: Add another layer

Result: 🤯</code></pre>
            </div>
          `
        },

        {
          title: 'The Hydra Effect',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <img src="https://media.tenor.com/7tGhjTpUh4QAAAAM/drake-drizzy.gif" loading="lazy" alt="Drake hotline bling" class="w-full max-w-[80vw] md:max-w-xl rounded-lg shadow-md">
              <p class="mt-8 text-2xl md:text-4xl text-gray-300 text-center max-w-4xl">Each "fix" spawns <span class="text-red-400 font-bold">two new problems</span></p>
              <p class="mt-4 text-xl md:text-2xl text-gray-400 text-center">Like a Hydra, but with more Stack Overflow tabs</p>
            </div>
          `
        },

        // ============ PROBLEM #2 ============
        {
          title: 'Problem #2 - The TypeScript Paradox',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-orange-400">The Compilation Inception</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-pink-300 text-base md:text-xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl"><code>// We added a language to fix JS...
// That compiles back to JS...
// To fix problems JS already solved...

TypeScript → transpile → JavaScript
JSX → transpile → JavaScript  
Sass → transpile → CSS
ES2024 → transpile → ES5

// At what point did we forget
// the browser already runs JS?</code></pre>
            </div>
          `
        },

        {
          title: 'The Infinite Compile Loop',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXJqNjZpZG5uZmU4NHBxOHN2dTBwMHlyamtnMjFxYzlvOXBxb2M1NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nTfdeBvfgzV26zjoFP/giphy.gif" loading="lazy" alt="Keanu Reeves Confused" class="w-full max-w-[80vw] md:max-w-xl rounded-lg shadow-md">
              <p class="mt-8 text-2xl md:text-4xl text-gray-300 text-center max-w-4xl">We got lost in the <span class="text-yellow-400 font-bold">meta-programming maze</span></p>
              <p class="mt-4 text-xl md:text-2xl text-gray-400 text-center">Compiling compilers to compile the compiler</p>
            </div>
          `
        },

        // ============ PROBLEM #3 ============
        {
          title: 'Problem #3 - The Dependency Cascade',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-blue-400">The Infinite Chain</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-cyan-300 text-xl md:text-2xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl"><code>React needs React-DOM
React-DOM needs scheduler
scheduler needs...

*20 dependencies deep*

Just to render:
<button>Click Me</button></code></pre>
            </div>
          `
        },

        {
          title: 'NPM Ecosystem Blues',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-purple-400">Where Packages Go to Die</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-lime-300 text-xl md:text-2xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl"><code>Maintainer ghosts → No updates
Breaking changes → "Rewrite it!"
No migration guide → "Good luck!"

Your perfect app?
Obsolete in 6 months 💀</code></pre>
            </div>
          `
        },

        {
          title: 'Dependency Hell',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <img src="https://media.tenor.com/MYZgsN2TDJAAAAAM/this-is.gif" loading="lazy" alt="This is fine dog" class="w-full max-w-[80vw] md:max-w-xl rounded-lg shadow-md border-4 border-red-600">
              <p class="mt-8 text-2xl md:text-4xl text-red-400 text-center max-w-4xl">Dependency hell is <span class="font-bold">real</span></p>
              <p class="mt-4 text-xl md:text-2xl text-gray-300 text-center">And it's living in your node_modules</p>
            </div>
          `
        },

        // ============ PROBLEM #4 ============
        {
          title: 'Problem #4 - Performance Tax',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-yellow-400">Every Millisecond × Millions</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-orange-300 text-xl md:text-3xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl"><code>Parse:    200-400 ms
Compile:  300-600 ms  
Execute:  400-800 ms

Total: ~1.5s of JS tax
Before anything renders</code></pre>
            </div>
          `
        },

        {
          title: 'The User Reality',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-red-400">The Real Cost</h2>
              <div class="text-left max-w-3xl">
                <p class="text-2xl md:text-3xl text-gray-300 mb-4">📱 <span class="text-yellow-400">Low-end Android</span>: 5-8 seconds</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-4">🌐 <span class="text-blue-400">Slow 3G</span>: 10+ seconds</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-4">🔋 <span class="text-green-400">Battery drain</span>: Significant</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-8">💸 <span class="text-purple-400">Data costs</span>: Real money</p>
                <p class="text-2xl md:text-3xl text-red-400 font-bold text-center">Users on potato phones? Left behind.</p>
              </div>
            </div>
          `
        },

        // ============ THE COMPARISON ============
        {
          title: 'The Side-by-Side Reality Check',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-8 text-green-400">Let's Get Real</h2>
              <div class="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-4xl w-full">
                <table class="w-full text-xl md:text-2xl">
                  <thead>
                    <tr class="border-b-2 border-gray-600">
                      <th class="text-left p-4 text-purple-400">Metric</th>
                      <th class="text-center p-4 text-red-400">Next.js</th>
                      <th class="text-center p-4 text-green-400">Vanilla</th>
                    </tr>
                  </thead>
                  <tbody class="font-mono">
                    <tr class="border-b border-gray-700">
                      <td class="p-4 text-gray-300">Dependencies</td>
                      <td class="text-center p-4 text-red-300">847</td>
                      <td class="text-center p-4 text-green-300 font-bold">0</td>
                    </tr>
                    <tr class="border-b border-gray-700">
                      <td class="p-4 text-gray-300">node_modules</td>
                      <td class="text-center p-4 text-red-300">412 MB</td>
                      <td class="text-center p-4 text-green-300 font-bold">0 MB</td>
                    </tr>
                    <tr class="border-b border-gray-700">
                      <td class="p-4 text-gray-300">Time to Interactive</td>
                      <td class="text-center p-4 text-red-300">3.2s</td>
                      <td class="text-center p-4 text-green-300 font-bold">~0s</td>
                    </tr>
                    <tr class="border-b border-gray-700">
                      <td class="p-4 text-gray-300">Learning Curve</td>
                      <td class="text-center p-4 text-red-300">2 weeks</td>
                      <td class="text-center p-4 text-green-300 font-bold">You know it</td>
                    </tr>
                    <tr>
                      <td class="p-4 text-gray-300">Breaking Changes</td>
                      <td class="text-center p-4 text-red-300">Every 6mo</td>
                      <td class="text-center p-4 text-green-300 font-bold">Never</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="mt-8 text-2xl md:text-3xl text-yellow-400 text-center font-bold">The numbers don't lie.</p>
            </div>
          `
        },

        // ============ WHAT CAN WE DO ============
        {
          title: 'What Can We Do About It?',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-blue-400">Time to Question Everything</h2>
              <p class="text-2xl md:text-3xl text-gray-300 mb-4 text-center max-w-3xl">What if we stopped adding layers?</p>
              <p class="text-2xl md:text-3xl text-gray-300 mb-4 text-center max-w-3xl">What if we started removing them?</p>
              <p class="text-2xl md:text-3xl text-gray-300 mb-8 text-center max-w-3xl">What if we built tools that said <span class="text-red-400 font-bold">"no"</span> by default?</p>
              <img src="https://i.imgflip.com/30yfz4.jpg" alt="Shocked Pikachu" class="w-full max-w-[60vw] md:max-w-md rounded-lg shadow-md">
            </div>
          `
        },

        // ============ PRINCIPLES ============
        {
          title: 'Principle #1 - Respect Web Standards',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-green-400">HTML/CSS/JS Work Fine</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-pink-300 text-lg md:text-2xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl"><code>// Vanilla
<button onclick="alert('Hi!')">
  Click Me
</button>

// Framework "magic"
import { Button } from 'ui-lib';
<Button onClick={() => alert('Hi!')}>
  Click Me
</Button>

// Both render the same DOM
// One downloaded a library 🤷</code></pre>
            </div>
          `
        },

        {
          title: 'Principle #2 - Progressive Enhancement',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-teal-400">Do We Even Need JS Here?</h2>
              <div class="max-w-3xl">
                <p class="text-2xl md:text-3xl text-gray-300 mb-6 text-center">✅ Works without JS</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-6 text-center">✅ Enhanced with JS</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-6 text-center">✅ No hydration mismatches</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-8 text-center">✅ Instant first render</p>
              </div>
              <img src="https://media.tenor.com/8RKdKkyTEKkAAAAe/hshs.png" loading="lazy" alt="Success kid" class="w-full max-w-[60vw] md:max-w-md rounded-lg shadow-md">
            </div>
          `
        },

        {
          title: 'Principle #3 - Zero Dependencies',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-orange-400">Escape NPM Drama</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-indigo-300 text-xl md:text-3xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl"><code>0 dependencies
= 0 upgrades
= 0 breaking changes
= Happy developers
= Happy users
= Problem solved ✨</code></pre>
            </div>
          `
        },

        {
          title: 'Principle #4 - Measure What Matters',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-8 text-purple-400">Users > Dev Ego</h2>
              <div class="max-w-3xl text-center">
                <p class="text-2xl md:text-3xl text-red-400 mb-6 line-through">❌ "How fast can I code?"</p>
                <p class="text-2xl md:text-3xl text-green-400 mb-8 font-bold">✅ "How fast does it run?"</p>
                <p class="text-xl md:text-2xl text-gray-300">DX is great... until users bounce</p>
              </div>
            </div>
          `
        },

        {
          title: 'Principle #5 - Simplicity First',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-green-400">Only What You Need</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-lime-300 text-xl md:text-3xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl"><code>Templating? Optional
Routing? Optional
State? Optional
Build step? Optional

Pay for what you use
Radical concept! 🤯</code></pre>
            </div>
          `
        },

        {
          title: 'The Rich Hickey Wisdom',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <blockquote class="text-xl md:text-2xl text-gray-300 italic mb-6 max-w-4xl text-center border-l-4 border-green-400 pl-6">
                "Simplicity is hard work. But there's a huge payoff. The person who has a genuinely simpler system is going to be able to affect the greatest change with the least work."
              </blockquote>
              <p class="text-2xl md:text-3xl text-green-400 font-bold">— Rich Hickey</p>
              <p class="mt-8 text-xl md:text-2xl text-gray-400 text-center max-w-3xl">Simplicity isn't lazy. It's <span class="text-yellow-400 font-bold">smart</span>.</p>
            </div>
          `
        },

        // ============ THE SOLUTION ============
        {
          title: 'Meet b0nes',
          content: `
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-4 md:p-8 bg-gray-900 text-white">
              <h1 class="text-5xl md:text-7xl font-extrabold text-teal-400 mb-6">Meet b0nes 🦴</h1>
              <img src="./b0nes.png" loading="lazy" alt="B0nes logo" class="w-full max-w-[60vw] md:max-w-sm mt-2 rounded-lg shadow-lg bg-white">
              <p class="text-xl md:text-2xl text-gray-300 mb-2 mt-6 max-w-3xl">Zero-dependency toolkit</p>
              <p class="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl">SSR • SSG • SPA • State • Forms</p>
              <p class="text-2xl md:text-3xl text-green-400 mb-2 font-bold">Learning curve: One afternoon</p>
              <p class="text-2xl md:text-3xl text-yellow-400 mb-4 font-bold">Maintenance: Minimal</p>
              <p class="text-xl md:text-2xl text-purple-400">Pure JavaScript. No drama.</p>
            </div>
          `
        },

        {
          title: 'How b0nes Fixes the Mess',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-orange-400">Principles → Practice</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-purple-300 text-xl md:text-3xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl"><code>✓ Web standards? Honored
✓ Progressive? Default
✓ Dependencies? Zero
✓ User-first? Always
✓ Framework-lite? Yes

TypeScript? JSDoc works
NPM? Not invited
Build step? Optional</code></pre>
            </div>
          `
        },

        {
          title: 'This Presentation',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-8 text-green-400">Real Projects, Real Results</h2>
              <div class="max-w-3xl text-left">
                <p class="text-2xl md:text-3xl text-gray-300 mb-4">🎯 This presentation was <span class="text-blue-400 font-bold">built with b0nes</span></p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-4">⚡ Zero build errors</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-4">🚀 Deployed in <10 seconds</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-4">📱 Works offline (it's just HTML)</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-8">🎨 Custom styles without a build step</p>
                <p class="text-2xl md:text-3xl text-yellow-400 text-center font-bold">Not a toy. A tool.</p>
              </div>
            </div>
          `
        },

        // ============ LIVE DEMO ============
        {
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
        },

        // ============ FINAL THOUGHTS ============
        {
          title: 'The Real Question',
          content: `
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-4 md:p-8 bg-black text-white">
              <h2 class="text-3xl md:text-5xl font-bold text-red-400 mb-6">Your framework didn't download 700 MB to render a button</h2>
              <p class="text-2xl md:text-3xl text-gray-300 mb-6 max-w-4xl">You downloaded 700 MB to <span class="text-yellow-400 font-bold">feel productive</span> while rendering a button</p>
              <p class="text-3xl md:text-4xl font-extrabold text-white mb-8">There's a difference.</p>
              <img src="https://media.tenor.com/f4MzvvjwUhAAAAAM/spongebob-mocking.gif" loading="lazy" alt="Spongebob mocking" class="w-full max-w-[80vw] md:max-w-md rounded-lg shadow-lg">
            </div>
          `
        },

        // ============ RECAP ============
        {
          title: 'Recap',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-4xl md:text-6xl font-bold mb-8 text-purple-400">What We Learned</h2>
              <div class="max-w-3xl text-left space-y-6">
                <p class="text-2xl md:text-3xl text-gray-300">📈 Frameworks got complex chasing "productivity"</p>
                <p class="text-2xl md:text-3xl text-gray-300">🎯 We lost sight of fundamentals</p>
                <p class="text-2xl md:text-3xl text-gray-300">😞 Users paid the price</p>
                <p class="text-2xl md:text-3xl text-green-400 font-bold">🦴 b0nes: Back to basics, but smarter</p>
              </div>
              <p class="mt-12 text-3xl md:text-4xl text-yellow-400 font-bold">Simplicity wins. Every time.</p>
            </div>
          `
        },

        // ============ CALL TO ACTION ============
        {
          title: 'Call to Action',
          content: `
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-4 md:p-8 bg-gray-900 text-white">
              <h1 class="text-4xl md:text-6xl font-extrabold text-green-400 mb-4">Ready to Pick a b0ne?</h1>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-cyan-300 text-2xl md:text-4xl font-mono mb-8"><code>npx b0nes my-app</code></pre>
              <p class="text-xl md:text-2xl text-gray-400 mb-6">github.com/iggydotdev/b0nes</p>
              <img src="./qr-code.png" loading="lazy" alt="QR code for b0nes" class="w-full max-w-[60vw] md:max-w-sm rounded-lg shadow-lg bg-white">
              <p class="mt-8 text-2xl md:text-3xl text-purple-400">Questions? Let's chat.</p>
            </div>
          `
        }
      ]
    }
  }
];