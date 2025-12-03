
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
        // ============ HOOK (0:00-1:00) ============
        {
          title: 'Hook',
          content: `
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-4 md:p-8 bg-gray-900 text-white">
              <h1 class="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-red-400">Your framework downloaded<br><strong>700 MB</strong></h1>
              <h2 class="text-2xl md:text-4xl font-semibold text-gray-300 mb-4 md:mb-8">to render a button</h2>              <p class="text-xl md:text-2xl text-yellow-400 mb-8 max-w-3xl">(Well... Actually 451MB)</p>
              <img src="https://media.tenor.com/MYZgsN2TDJAAAAAM/this-is.gif" loading="lazy" alt="This is fine dog" class="w-full max-w-[80vw] md:max-w-xl mx-auto rounded-lg shadow-xl border-4 border-red-600">
            </div>
          `
        },

        // ============ HOW WE GOT HERE (1:00-3:00) ============
        {
          title: 'How We Got Here',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-purple-400">Full Disclosure: I'm Not Here to Dunk</h2>
              <p class="text-2xl md:text-3xl text-gray-300 mb-4 text-center max-w-3xl">I've built websites for 15+ years.</p>
              <p class="text-2xl md:text-3xl text-gray-300 mb-6 text-center max-w-3xl">And somewhere along the way... <span class="text-red-400 font-bold">we lost the plot.</span></p>
              
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-green-300 text-lg md:text-2xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl mt-6"><code>1990s: HTML + CSS + JS
       Simple, understandable

2006: jQuery – Cross-browser magic

2010: AngularJS – MVC for web

2013+: Framework Wars Begin
       React, Vue, Angular, Next...

2025: "Wait, how did we get here?"</code></pre>
            </div>
          `
        },

        // ============ THE 2025 REALITY (3:00-5:00) ============
        {
          title: 'The 2025 Reality Check',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-yellow-400">We Chased "Productivity"</h2>
              
              <div class="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-3xl w-full mb-8">
                <pre class="text-blue-300 text-xl md:text-3xl font-mono leading-relaxed"><code>npx create-next-app
→ 847 packages
→ 412 MB node_modules
→ 3.2s to interactive
→ 47 lines for a button</code></pre>
              </div>

              <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3F2d3I3bTh5aDc0cnV3NmNjeWRwZm5xZG53YzM0M3c2MjdvaTM5NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H62NIrYc3ZzUG273k2/giphy.gif" loading="lazy" alt="Never gonna end" class="w-full max-w-[60vw] md:max-w-md rounded-lg shadow-md">
              
              <p class="mt-6 text-2xl md:text-3xl text-red-400 text-center max-w-3xl">Optimized for <span class="font-bold">developer experience</span></p>
              <p class="mt-2 text-xl md:text-2xl text-gray-300 text-center">Users? <span class="text-yellow-400">"Good luck with that 5G"</span></p>
            </div>
          `
        },

        // ============ PROBLEM #1 (5:00-7:00) ============
        {
          title: 'Problem #1: Over-Abstraction Spiral',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-red-400">Abstractions All The Way Down</h2>
              
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-indigo-300 text-xl md:text-2xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl mb-8"><code>Problem: Complex UIs
Solution: Add components

Problem: State management
Solution: Add Redux

Problem: Bundle size
Solution: Code splitting

Problem: Too complex to debug
Solution: Add another layer

Result: 🤯</code></pre>

              <img src="https://media.tenor.com/7tGhjTpUh4QAAAAM/drake-drizzy.gif" loading="lazy" alt="Drake hotline bling" class="w-full max-w-[60vw] md:max-w-md rounded-lg shadow-md">
              <p class="mt-6 text-2xl md:text-3xl text-gray-300 text-center">Each "fix" spawns <span class="text-red-400 font-bold">two new problems</span></p>
            </div>
          `
        },

        // ============ PROBLEM #2 (7:00-9:00) ============
        {
          title: 'Problem #2: The TypeScript Paradox',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-orange-400">The Compilation Inception</h2>
              
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-pink-300 text-base md:text-xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl mb-8"><code>// We added a language to fix JS...
// That compiles back to JS...
// To fix problems JS already solved...

TypeScript → transpile → JavaScript
JSX → transpile → JavaScript  
Sass → transpile → CSS
ES2024 → transpile → ES5

// At what point did we forget
// the browser already runs JS?</code></pre>

              <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXJqNjZpZG5uZmU4NHBxOHN2dTBwMHlyamtnMjFxYzlvOXBxb2M1NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nTfdeBvfgzV26zjoFP/giphy.gif" loading="lazy" alt="Keanu Confused" class="w-full max-w-[60vw] md:max-w-md rounded-lg shadow-md">
              <p class="mt-6 text-2xl md:text-3xl text-yellow-400 text-center">Compiling compilers to compile the compiler</p>
            </div>
          `
        },

        // ============ PROBLEM #3 (9:00-11:00) ============
        {
          title: 'Problem #3: The Dependency Cascade',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-blue-400">The Infinite Chain</h2>
              
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-cyan-300 text-xl md:text-2xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl mb-6"><code>React needs React-DOM
React-DOM needs scheduler
scheduler needs...

*20 dependencies deep*

Just to render:
<button>Click Me</button></code></pre>

              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-lime-300 text-lg md:text-xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl mb-6"><code>Maintainer ghosts → No updates
Breaking changes → "Rewrite it!"
No migration guide → "Good luck!"

Your perfect app?
Obsolete in 6 months 💀</code></pre>

              <img src="https://media.tenor.com/MYZgsN2TDJAAAAAM/this-is.gif" loading="lazy" alt="This is fine" class="w-full max-w-[60vw] md:max-w-md rounded-lg shadow-md border-4 border-red-600">
            </div>
          `
        },

        // ============ PROBLEM #4 (11:00-13:00) ============
        {
          title: 'Problem #4: Performance Tax',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-yellow-400">Every Millisecond × Millions</h2>
              
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-orange-300 text-xl md:text-3xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl mb-8"><code>Parse:    200-400 ms
Compile:  300-600 ms  
Execute:  400-800 ms

Total: ~1.5s of JS tax
Before anything renders</code></pre>

              <div class="text-left max-w-3xl">
                <p class="text-2xl md:text-3xl text-gray-300 mb-3">📱 <span class="text-yellow-400">Low-end Android</span>: 5-8 seconds</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-3">🌐 <span class="text-blue-400">Slow 3G</span>: 10+ seconds</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-3">🔋 <span class="text-green-400">Battery drain</span>: Significant</p>
                <p class="text-2xl md:text-3xl text-gray-300 mb-6">💸 <span class="text-purple-400">Data costs</span>: Real money</p>
                <p class="text-3xl md:text-4xl text-red-400 font-bold text-center">Users on potato phones? Left behind.</p>
              </div>
            </div>
          `
        },

        // ============ THE COMPARISON (13:00-15:00) ============
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

        // ============ WHAT CAN WE DO (15:00-16:00) ============
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

        // ============ THE 5 PRINCIPLES (16:00-19:00) ============
        {
          title: 'The 5 Principles',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-4xl md:text-6xl font-bold mb-8 text-purple-400">Building Better</h2>
              
              <div class="max-w-4xl space-y-6 text-left">
                <div class="bg-gray-800 p-4 rounded-lg border-l-4 border-green-400">
                  <h3 class="text-2xl md:text-3xl font-bold text-green-400 mb-2">#1 Respect Web Standards</h3>
                  <p class="text-lg md:text-xl text-gray-300">HTML/CSS/JS work fine. Stop reinventing the wheel.</p>
                </div>
                
                <div class="bg-gray-800 p-4 rounded-lg border-l-4 border-teal-400">
                  <h3 class="text-2xl md:text-3xl font-bold text-teal-400 mb-2">#2 Progressive Enhancement</h3>
                  <p class="text-lg md:text-xl text-gray-300">Works without JS → Enhanced with JS → No hydration mismatches</p>
                </div>
                
                <div class="bg-gray-800 p-4 rounded-lg border-l-4 border-orange-400">
                  <h3 class="text-2xl md:text-3xl font-bold text-orange-400 mb-2">#3 Zero Dependencies</h3>
                  <p class="text-lg md:text-xl text-gray-300">0 dependencies = 0 upgrades = 0 breaking changes = ✨</p>
                </div>
                
                <div class="bg-gray-800 p-4 rounded-lg border-l-4 border-purple-400">
                  <h3 class="text-2xl md:text-3xl font-bold text-purple-400 mb-2">#4 Measure What Matters</h3>
                  <p class="text-lg md:text-xl text-gray-300">"How fast can I code?" → "How fast does it run?"</p>
                </div>
                
                <div class="bg-gray-800 p-4 rounded-lg border-l-4 border-green-400">
                  <h3 class="text-2xl md:text-3xl font-bold text-green-400 mb-2">#5 Simplicity First</h3>
                  <p class="text-lg md:text-xl text-gray-300">Only what you need. Pay for what you use. Radical! 🤯</p>
                </div>
              </div>
            </div>
          `
        },

        // ============ RICH HICKEY WISDOM (19:00-20:00) ============
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

        // ============ MEET B0NES (20:00-22:00) ============
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

        // ============ HOW B0NES FIXES IT (22:00-25:00) ============
        {
          title: 'How b0nes Fixes the Mess',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-orange-400">Principles → Practice</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mb-8">
                <pre class="bg-gray-800 p-4 rounded-lg shadow-lg text-purple-300 text-lg md:text-xl font-mono leading-relaxed"><code>✓ Web standards? Honored
✓ Progressive? Default
✓ Dependencies? Zero
✓ User-first? Always
✓ Framework-lite? Yes</code></pre>

                <pre class="bg-gray-800 p-4 rounded-lg shadow-lg text-green-300 text-lg md:text-xl font-mono leading-relaxed"><code>TypeScript? JSDoc works
NPM? Not invited
Build step? Optional
Hydration? Wat?
Breaking changes? Never</code></pre>
              </div>

              <div class="bg-gray-800 p-6 rounded-lg max-w-3xl">
                <h3 class="text-2xl md:text-3xl font-bold text-blue-400 mb-4">Real Results</h3>
                <p class="text-xl md:text-2xl text-gray-300 mb-3">🎯 This presentation was built with b0nes</p>
                <p class="text-xl md:text-2xl text-gray-300 mb-3">⚡ Zero build errors</p>
                <p class="text-xl md:text-2xl text-gray-300 mb-3">🚀 Deployed in <10 seconds</p>
                <p class="text-xl md:text-2xl text-gray-300 mb-3">📱 Works offline (it's just HTML)</p>
                <p class="text-2xl md:text-3xl text-yellow-400 text-center font-bold mt-4">Not a toy. A tool.</p>
              </div>
            </div>
          `
        },

        // ============ LIVE DEMO (25:00-30:00) ============
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

        // ============ THE REAL QUESTION (30:00-32:00) ============
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

        // ============ RECAP (32:00-34:00) ============
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

        // ============ CALL TO ACTION (34:00-36:00) ============
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
        },

        // ============ FEEDBACK SLIDE (36:00-37:00) ============
        {
          title: 'Feedback',
          content: `
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-4 md:p-8 bg-gray-900 text-white">
              <h1 class="text-4xl md:text-6xl font-extrabold text-blue-400 mb-8">Your Feedback Matters!</h1>
              <p class="text-2xl md:text-3xl text-gray-300 mb-6 max-w-3xl">Help make DDD Brisbane better</p>
              <div class="bg-gray-800 p-8 rounded-lg shadow-2xl">
                <p class="text-xl md:text-2xl text-yellow-400 mb-4">📱 Scan to leave feedback</p>
                <div class="bg-white p-6 rounded-lg">
                  <p class="text-black text-lg">[Feedback QR Code Here]</p>
                </div>
              </div>
            </div>
          `
        },

        // ============ SPONSORS SLIDE (37:00-38:00) ============
        {
          title: 'Sponsors',
          content: `
            <div class="flex flex-col items-center justify-center text-center min-h-screen p-4 md:p-8 bg-gray-900 text-white">
              <h1 class="text-4xl md:text-6xl font-extrabold text-green-400 mb-8">Thank You to Our Sponsors!</h1>
              <p class="text-2xl md:text-3xl text-gray-300 mb-12 max-w-3xl">Making DDD Brisbane possible</p>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl">
                <div class="bg-white p-6 rounded-lg h-32 flex items-center justify-center">
                  <p class="text-black font-bold">[Sponsor Logo]</p>
                </div>
                <div class="bg-white p-6 rounded-lg h-32 flex items-center justify-center">
                  <p class="text-black font-bold">[Sponsor Logo]</p>
                </div>
                <div class="bg-white p-6 rounded-lg h-32 flex items-center justify-center">
                  <p class="text-black font-bold">[Sponsor Logo]</p>
                </div>
              </div>
            </div>
          `
        }
      ]
    }
  }
];