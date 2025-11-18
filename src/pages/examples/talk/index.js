// // ============================================
// // USAGE EXAMPLE: Your DDD Brisbane Talk
// // ============================================

// // src/pages/talk/index.js
// import { stylesheetPresets } from '../../../framework/config/stylesheets.js'

// export const meta = {
//   title: 'Your framework downloaded 700mb to render a button',
//   description: 'DDD Brisbane 2025 - A talk about over-engineering solutions',
//   stylesheets: stylesheetPresets.combine(
//     stylesheetPresets.pico(),
//     '/talk/custom.css')
// };

// export const components = [
//   {
//     type: 'organism',
//     name: 'slides',
//     props: {
//       slides: [
//         // ============= OPENING =============
//         {
//           title: 'Hook',
//           content: `
//             <div class="slide-hero">
//               <h1>Your Framework Downloaded 700mb</h1>
//               <h2>to render a button</h2>
//             </div>
//           `
//         },
        
//         // ============= SECTION 1: WHY =============
//         {
//           title: 'The Problem - Current State',
//           content: `
//             <h2>The Current State</h2>
//             <ul>
//               <li>Bundle sizes: 500mb+ (uncompressed)</li>
//               <li>Users wait seconds for instant apps</li>
//               <li>Massive abstraction surface area</li>
//               <li>Each abstraction causes new problems</li>
//             </ul>
//           `
//         },
//         {
//           title: 'Why - Over-abstraction Spiral',
//           content: `
//             <h2>The Over-Abstraction Spiral</h2>
//             <pre>Problem: Complex UIs
// → Solution: Add components
// → Problem: State complexity
// → Solution: Add state management
// → Problem: Bundle size
// → Solution: Add optimization layer
// → Problem: Complexity...</pre>
//           `
//         },
//         {
//           title: 'Why - Wrong Metrics',
//           content: `
//             <h2>Optimizing for the Wrong Metrics</h2>
//             <p><strong>We measure:</strong> Developer speed</p>
//             <p><strong>Users care about:</strong> Performance & reliability</p>
//             <p>Fast to write ≠ Fast to run</p>
//             <p>Easy abstraction ≠ Maintainable system</p>
//           `
//         },
//         {
//           title: 'Why - JavaScript Tax',
//           content: `
//             <h2>The JavaScript Tax</h2>
//             <ul>
//               <li>Parsing: Time spent reading code</li>
//               <li>Compilation: Time spent preparing to run</li>
//               <li>Execution: Time spent actually running</li>
//               <li>Multiplied across millions of users</li>
//             </ul>
//             <p>Mobile users & constrained networks hit hardest</p>
//           `
//         },
        
//         // ============= SECTION 2: HOW =============
//         {
//           title: 'Solutions - Principle 1',
//           content: `
//             <h2>Principle 1: Respect Web Standards</h2>
//             <ul>
//               <li>Use HTML/CSS/JavaScript as they exist</li>
//               <li>Progressive enhancement built-in</li>
//               <li>Minimal proprietary abstractions</li>
//               <li>Debuggable with browser DevTools</li>
//             </ul>
//           `
//         },
//         {
//           title: 'Solutions - Principle 2',
//           content: `
//             <h2>Principle 2: JavaScript as Enhancement</h2>
//             <ul>
//               <li>Ask "do we need JS?" before writing it</li>
//               <li>No hydration step = no mismatch bugs</li>
//               <li>No runtime overhead for static content</li>
//               <li>Direct DOM manipulation when needed</li>
//             </ul>
//           `
//         },
//         {
//           title: 'Solutions - Principle 3',
//           content: `
//             <h2>Principle 3: Minimize Dependencies</h2>
//             <ul>
//               <li>Small bundle size (less to download)</li>
//               <li>Optional or minimal build step</li>
//               <li>Easy to understand and maintain</li>
//               <li>Incremental adoption</li>
//             </ul>
//           `
//         },
//         {
//           title: 'Solutions - Principle 4',
//           content: `
//             <h2>Principle 4: Measure What Matters</h2>
//             <ul>
//               <li>Focus on end-user experience</li>
//               <li>Performance as first-class feature</li>
//               <li>Simplicity as a feature</li>
//               <li>Maintenance burden as a cost</li>
//             </ul>
//           `
//         },
//         {
//           title: 'Solutions - Principle 5',
//           content: `
//             <h2>Principle 5: Framework-Lite</h2>
//             <ul>
//               <li>Templating where needed, not forced</li>
//               <li>Interactivity where needed, not assumed</li>
//               <li>Composable patterns</li>
//               <li>Built-in escape hatches</li>
//             </ul>
//           `
//         },
        
//         // ============= SECTION 3: WHAT =============
//         {
//           title: 'Introducing b0nes',
//           content: `
//             <div class="slide-hero">
//               <h1>What is b0nes?</h1>
//               <p>A framework built on these principles</p>
//               <p>What if we actually followed them?</p>
//             </div>
//           `
//         },
//         {
//           title: 'b0nes - Key Features',
//           content: `
//             <h2>How b0nes Implements These Solutions</h2>
//             <ul>
//               <li>✓ Respects web standards (no magic)</li>
//               <li>✓ JavaScript as enhancement (optional)</li>
//               <li>✓ Zero npm dependencies</li>
//               <li>✓ Framework-lite approach</li>
//             </ul>
//           `
//         },
//         {
//           title: 'b0nes - Benefits for Users',
//           content: `
//             <h2>Benefits for Users</h2>
//             <ul>
//               <li>🚀 Instant interactivity</li>
//               <li>📊 Better performance</li>
//               <li>🌍 Works in constrained environments</li>
//               <li>♿ Accessible by default</li>
//             </ul>
//           `
//         },
//         {
//           title: 'b0nes - Benefits for Developers',
//           content: `
//             <h2>Benefits for Developers</h2>
//             <ul>
//               <li>🧠 Simpler mental model</li>
//               <li>🐛 Easier debugging</li>
//               <li>📝 Less boilerplate</li>
//               <li>🎓 Smaller learning curve</li>
//             </ul>
//           `
//         },
//         {
//           title: 'b0nes - Benefits for Teams',
//           content: `
//             <h2>Benefits for Teams</h2>
//             <ul>
//               <li>📦 Smaller codebase</li>
//               <li>👥 Easier onboarding</li>
//               <li>🛡️ Reduced maintenance</li>
//               <li>⚠️ Lower abstraction risk</li>
//             </ul>
//           `
//         },
        
//         // ============= CLOSING =============
//         {
//           title: 'Final Thought',
//           content: `
//             <div class="slide-hero">
//               <h2>Your framework didn't download 700mb to render a button.</h2>
//               <p>You downloaded 700mb to feel productive while rendering a button.</p>
//               <p><strong>There's a difference.</strong></p>
//             </div>
//           `
//         },
//         {
//           title: 'Call to Action',
//           background: '#1a1a1a',
//           content: `
//             <div class="slide-hero" style="color: white;">
//               <h1>Are you ready to pick a bone?</h1>
//               <p style="font-size: 1.2em; margin-top: 2em;">
//                 <a href="https://github.com/iggydotdev/b0nes" style="color: #00ff00;">github.com/iggydotdev/b0nes</a>
//               </p>
//             </div>
//           `
//         }
//       ]
//     }
//   }
// ];


import { stylesheetPresets } from '../../../framework/config/stylesheets.js';

export const meta = {
  title: 'Your framework downloaded 700 MB to render a button',
  description: 'DDD Brisbane 2025 – b0nes: the revenge of vanilla JS',
  stylesheets: stylesheetPresets.combine(
    stylesheetPresets.pico(),
    '/talk/custom.css' // dark mode, huge code fonts, meme-ready
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
            <div class="slide-hero">
              <h1>Your framework downloaded<br><strong>700 MB</strong></h1>
              <h2>to render a button</h2>
              <img src="https://media.tenor.com/MYZgsN2TDJAAAAAM/this-is.gif" alt="This is fine dog" style="max-width:600px;margin-top:2rem;border-radius:12px;box-shadow:0 0 30px #f00;">
              <p style="margin-top:2rem;font-size:1.8rem;color:#ff5555;">(yes, that’s a real create-next-app screenshot)</p>
            </div>
          `
        },

        // ============ WHY – The Pain ============
        {
          title: 'The Current State (2025)',
          content: `
            <h2>We lost the plot</h2>
            <pre style="font-size:1.4rem;"><code>npx create-next-app → 847 packages
node_modules → 412 MB
Time to interactive → 3.2 s on 4G
Lines to make a button clickable → 47</code></pre>
            <img src="https://media.tenor.com/f4MzvvjwUhAAAAAM/spongebob-mocking.gif" alt="Mocking SpongeBob" style="max-width:600px;margin-top:1rem;">
            <p style="margin-top:2rem;font-size:1.6rem;">We optimized for developer speed.<br>Users pay the price.</p>
          `
        },
        {
          title: 'The Over-Abstraction Spiral',
          content: `
            <h2>It never ends</h2>
            <pre style="font-size:1.3rem;"><code>Problem: Complex UIs
→ Add components
→ Problem: State
→ Add Redux / Zustand
→ Problem: Bundle size
→ Add code splitting
→ Problem: Complexity
→ Add another abstraction layer
→ ∞</code></pre>
            <img src="https://media.giphy.com/media/6gSFHyU1mb1LAVw5aT/giphy.gif" alt="Distracted boyfriend" style="max-width:650px;margin-top:1rem;">
          `
        },
        {
          title: 'The JavaScript Tax',
          content: `
            <h2>Every millisecond × millions of users</h2>
            <pre style="font-size:1.4rem;"><code>Parsing    : 200–400 ms
Compilation: 300–600 ms
Execution  : 400–800 ms
Total      : ~1.5 s of JS just to start</code></pre>
            <img src="https://media.tenor.com/7tGhjTpUh4QAAAAM/drake-drizzy.gif" alt="Drake hotline bling" style="max-width:600px;">
          `
        },

        // ============ HOW – The Principles (ALL OF THEM, NO MISSING) ============
        {
          title: 'Principle 1 – Respect Web Standards',
          content: `
            <h2>Use HTML/CSS/JS as they were meant to be used</h2>
            <pre style="font-size:1.3rem;"><code>// b0nes
export const button = ({slot}) => 
  => \`&lt;button&gt;\${slot}&lt;/button&gt;\`;

// React 2025
const Button = memo(forwardRef(
  ({onClick, children}) => 
    &lt;button onClick={useCallback(onClick)}&gt;{children}&lt;/button&gt;
));</code></pre>
            <img src="https://media.tenor.com/JPiEKf_wEKkAAAAe/hshs.png" alt="Success kid" style="max-width:500px;">
          `
        },
        {
          title: 'Principle 2 – JavaScript as Enhancement',
          content: `
            <h2>No JS = works. With JS = better.</h2>
            <pre style="font-size:1.3rem;"><code>&lt;form action="/submit"&gt;
  &lt;input name="name"&gt;
  &lt;button&gt;Submit&lt;/button&gt;
&lt;/form&gt;

// b0nes adds AJAX only if JS is present
// No hydration bugs. Ever.</code></pre>
            <p style="font-size:2rem;margin-top:2rem;">This isn't retro.<br>This is respect.</p>
          `
        },
        {
          title: 'Principle 3 – Minimize Dependencies',
          content: `
            <h2>Zero is the only safe number</h2>
            <pre style="font-size:1.4rem;"><code>npm ls | wc -l
React app → 1847
b0nes app → 1 (just b0nes itself)</code></pre>
            <img src="https://media.tenor.com/3j0Y1fYXb0IAAAAe/zero-deps.png" alt="Zero deps meme" style="max-width:600px;">
          `
        },
        {
          title: 'Principle 4 – Measure What Matters',
          content: `
            <h2>We measure developer speed<br>Users measure performance</h2>
            <pre style="font-size:1.3rem;"><code>// What we optimize for
Developer experience ↑↑↑

// What users actually get
Time to interactive ↓↓↓
Bundle size ↑↑↑
Battery drain ↑↑↑</code></pre>
            <img src="https://media.tenor.com/2e5q4nE2r4AAAAAe/change-my-mind.png" alt="Change my mind" style="max-width:600px;">
          `
        },
        {
          title: 'Principle 5 – Framework-Lite',
          content: `
            <h2>Templating where needed<br>Interactivity where needed<br>Everything optional</h2>
            <pre style="font-size:1.3rem;"><code>// You only pay for what you use
No routing? No problem.
No state? No problem.
No build step? No problem.</code></pre>
            <p style="font-size:2.5rem;margin-top:2rem;">Simplicity is a feature.</p>
          `
        },

        // ============ WHAT – The Magic ============
        {
          title: 'What is b0nes?',
          content: `
            <div class="slide-hero">
              <h1>b0nes</h1>
              <p>A zero-dependency toolkit that does SSR, SSG, SPA, state machines, and forms — all in pure JS.</p>
              <p>Bundle size: &lt; 10 KB</p>
              <p>Learning curve: one afternoon</p>
              <img src="https://media.tenor.com/8RKdKkyTEKkAAAAe/hshs.png" alt="Success kid" style="max-width:500px;margin-top:2rem;">
            </div>
          `
        },
        {
          title: 'Live Demo or Riot',
          content: `
            <h2>Watch me add a page in 5 seconds</h2>
            <pre style="font-size:1.4rem;"><code># Live on stage
echo "export const meta = { title: 'Live' };
export const components = [
  { type: 'atom', name: 'text', props: { is: 'h1', slot: 'Born live on stage' } }
];" > src/pages/live/index.js

# Refresh → /live exists instantly</code></pre>
            <p style="font-size:3rem;margin-top:3rem;">Your move, Next.js</p>
          `
        },
        {
          title: 'Final Thought',
          background: '#000',
          content: `
            <div class="slide-hero" style="color:white;">
              <h2>Your framework didn't download 700 MB to render a button.</h2>
              <p>You downloaded 700 MB to feel productive while rendering a button.</p>
              <p><strong>There's a difference.</strong></p>
              <img src="https://media.tenor.com/f4MzvvjwUhAAAAAM/spongebob-mocking.gif" alt="Spongebob mocking" style="max-width:500px;margin-top:2rem;">
            </div>
          `
        },
        {
          title: 'Call to Action',
          background: '#1a1a1a',
          content: `
            <div class="slide-hero" style="color:white;">
              <h1>Are you ready to pick a bone?</h1>
              <p style="font-size:2rem;margin-top:2rem;">
                <a href="https://github.com/iggydotdev/b0nes" style="color:#00ff00;text-decoration:none;">github.com/iggydotdev/b0nes</a>
              </p>
              <p style="margin-top:3rem;font-size:1.5rem;">npx b0nes my-app → start shipping</p>
              <img src="https://media.tenor.com/8RKdKkyTEKkAAAAe/hshs.png" alt="Success kid" style="max-width:400px;margin-top:2rem;">
            </div>
          `
        }
      ]
    }
  }
];