// ============================================
// USAGE EXAMPLE: Your DDD Brisbane Talk
// ============================================

// src/pages/talk/index.js
import { stylesheetPresets } from '../../../framework/config/stylesheets.js'

export const meta = {
  title: 'Your framework downloaded 700mb to render a button',
  description: 'DDD Brisbane 2025 - A talk about over-engineering solutions',
  stylesheets: stylesheetPresets.pico(),
};

export const components = [
  {
    type: 'organism',
    name: 'slides',
    props: {
      slides: [
        // ============= OPENING =============
        {
          title: 'Hook',
          content: `
            <div class="slide-hero">
              <h1>Your Framework Downloaded 700mb</h1>
              <h2>to render a button</h2>
            </div>
          `
        },
        
        // ============= SECTION 1: WHY =============
        {
          title: 'The Problem - Current State',
          content: `
            <h2>The Current State</h2>
            <ul>
              <li>Bundle sizes: 500mb+ (uncompressed)</li>
              <li>Users wait seconds for instant apps</li>
              <li>Massive abstraction surface area</li>
              <li>Each abstraction causes new problems</li>
            </ul>
          `
        },
        {
          title: 'Why - Over-abstraction Spiral',
          content: `
            <h2>The Over-Abstraction Spiral</h2>
            <pre>Problem: Complex UIs
→ Solution: Add components
→ Problem: State complexity
→ Solution: Add state management
→ Problem: Bundle size
→ Solution: Add optimization layer
→ Problem: Complexity...</pre>
          `
        },
        {
          title: 'Why - Wrong Metrics',
          content: `
            <h2>Optimizing for the Wrong Metrics</h2>
            <p><strong>We measure:</strong> Developer speed</p>
            <p><strong>Users care about:</strong> Performance & reliability</p>
            <p>Fast to write ≠ Fast to run</p>
            <p>Easy abstraction ≠ Maintainable system</p>
          `
        },
        {
          title: 'Why - JavaScript Tax',
          content: `
            <h2>The JavaScript Tax</h2>
            <ul>
              <li>Parsing: Time spent reading code</li>
              <li>Compilation: Time spent preparing to run</li>
              <li>Execution: Time spent actually running</li>
              <li>Multiplied across millions of users</li>
            </ul>
            <p>Mobile users & constrained networks hit hardest</p>
          `
        },
        
        // ============= SECTION 2: HOW =============
        {
          title: 'Solutions - Principle 1',
          content: `
            <h2>Principle 1: Respect Web Standards</h2>
            <ul>
              <li>Use HTML/CSS/JavaScript as they exist</li>
              <li>Progressive enhancement built-in</li>
              <li>Minimal proprietary abstractions</li>
              <li>Debuggable with browser DevTools</li>
            </ul>
          `
        },
        {
          title: 'Solutions - Principle 2',
          content: `
            <h2>Principle 2: JavaScript as Enhancement</h2>
            <ul>
              <li>Ask "do we need JS?" before writing it</li>
              <li>No hydration step = no mismatch bugs</li>
              <li>No runtime overhead for static content</li>
              <li>Direct DOM manipulation when needed</li>
            </ul>
          `
        },
        {
          title: 'Solutions - Principle 3',
          content: `
            <h2>Principle 3: Minimize Dependencies</h2>
            <ul>
              <li>Small bundle size (less to download)</li>
              <li>Optional or minimal build step</li>
              <li>Easy to understand and maintain</li>
              <li>Incremental adoption</li>
            </ul>
          `
        },
        {
          title: 'Solutions - Principle 4',
          content: `
            <h2>Principle 4: Measure What Matters</h2>
            <ul>
              <li>Focus on end-user experience</li>
              <li>Performance as first-class feature</li>
              <li>Simplicity as a feature</li>
              <li>Maintenance burden as a cost</li>
            </ul>
          `
        },
        {
          title: 'Solutions - Principle 5',
          content: `
            <h2>Principle 5: Framework-Lite</h2>
            <ul>
              <li>Templating where needed, not forced</li>
              <li>Interactivity where needed, not assumed</li>
              <li>Composable patterns</li>
              <li>Built-in escape hatches</li>
            </ul>
          `
        },
        
        // ============= SECTION 3: WHAT =============
        {
          title: 'Introducing b0nes',
          content: `
            <div class="slide-hero">
              <h1>What is b0nes?</h1>
              <p>A framework built on these principles</p>
              <p>What if we actually followed them?</p>
            </div>
          `
        },
        {
          title: 'b0nes - Key Features',
          content: `
            <h2>How b0nes Implements These Solutions</h2>
            <ul>
              <li>✓ Respects web standards (no magic)</li>
              <li>✓ JavaScript as enhancement (optional)</li>
              <li>✓ Zero npm dependencies</li>
              <li>✓ Framework-lite approach</li>
            </ul>
          `
        },
        {
          title: 'b0nes - Benefits for Users',
          content: `
            <h2>Benefits for Users</h2>
            <ul>
              <li>🚀 Instant interactivity</li>
              <li>📊 Better performance</li>
              <li>🌍 Works in constrained environments</li>
              <li>♿ Accessible by default</li>
            </ul>
          `
        },
        {
          title: 'b0nes - Benefits for Developers',
          content: `
            <h2>Benefits for Developers</h2>
            <ul>
              <li>🧠 Simpler mental model</li>
              <li>🐛 Easier debugging</li>
              <li>📝 Less boilerplate</li>
              <li>🎓 Smaller learning curve</li>
            </ul>
          `
        },
        {
          title: 'b0nes - Benefits for Teams',
          content: `
            <h2>Benefits for Teams</h2>
            <ul>
              <li>📦 Smaller codebase</li>
              <li>👥 Easier onboarding</li>
              <li>🛡️ Reduced maintenance</li>
              <li>⚠️ Lower abstraction risk</li>
            </ul>
          `
        },
        
        // ============= CLOSING =============
        {
          title: 'Final Thought',
          content: `
            <div class="slide-hero">
              <h2>Your framework didn't download 700mb to render a button.</h2>
              <p>You downloaded 700mb to feel productive while rendering a button.</p>
              <p><strong>There's a difference.</strong></p>
            </div>
          `
        },
        {
          title: 'Call to Action',
          background: '#1a1a1a',
          content: `
            <div class="slide-hero" style="color: white;">
              <h1>Are you ready to pick a bone?</h1>
              <p style="font-size: 1.2em; margin-top: 2em;">
                <a href="https://github.com/iggydotdev/b0nes" style="color: #00ff00;">github.com/iggydotdev/b0nes</a>
              </p>
            </div>
          `
        }
      ]
    }
  }
];

// ============================================
// CSS STYLING FOR SLIDES
// ============================================

/* Add this to your stylesheet or global CSS */

/*
.slides {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.slides-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  background: #f5f5f5;
}

.slide {
  width: 100%;
  height: 100%;
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  text-align: center;
  background: #fff;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.slide.active {
  display: flex;
  opacity: 1;
}

.slide-content {
  max-width: 900px;
  width: 100%;
  text-align: left;
}

.slide-content h1 {
  font-size: 3.5rem;
  margin: 0 0 0.5rem 0;
}

.slide-content h2 {
  font-size: 2.5rem;
  margin: 0 0 1.5rem 0;
}

.slide-content ul {
  font-size: 1.5rem;
  line-height: 2;
  list-style-position: inside;
}

.slide-content pre {
  background: #f0f0f0;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 1.2rem;
  text-align: left;
}

.slide-number {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 0.9rem;
  color: #999;
}

.slides-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
  background: #f9f9f9;
  border-top: 1px solid #eee;
}

.slide-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.slide-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #999;
}

.slide-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slide-indicator {
  font-size: 1rem;
  color: #666;
}

.slides-info {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-size: 0.9rem;
  color: #999;
}

.slide-hero {
  text-align: center;
}

.slide-hero h1 {
  margin-bottom: 1rem;
}

.slide-hero p {
  font-size: 1.3rem;
  color: #666;
  line-height: 1.8;
}

/* Mobile */
@media (max-width: 768px) {
  .slide {
    padding: 2rem;
  }
  
  .slide-content h1 {
    font-size: 2rem;
  }
  
  .slide-content h2 {
    font-size: 1.5rem;
  }
  
  .slide-content ul {
    font-size: 1rem;
  }
  
  .slides-controls {
    gap: 1rem;
  }
  
  .slide-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

/* Fullscreen mode */
.slides:-webkit-full-screen {
  width: 100%;
  height: 100%;
}

.slides:-moz-full-screen {
  width: 100%;
  height: 100%;
}

.slides:fullscreen {
  width: 100%;
  height: 100%;
}
*/
