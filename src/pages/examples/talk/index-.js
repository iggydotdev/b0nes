
// src/pages/examples/talk/index.js
import { stylesheetPresets } from '../../../framework/config/stylesheets.js';
import slides from './slides/index.js';

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
        ...slides,

        // ============ SETTING THE STAGE (10:00-12:00) ============

        

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