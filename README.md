# create-b0nes-app

[![npm version](https://badge.fury.io/js/create-b0nes-app.svg)](https://www.npmjs.com/package/create-b0nes-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)

**The Disappearing Framework.**

b0nes is a complete web development toolkit built for humans and **AI Agents**. Build modern websites with components, routing, state management, and an MCP server—all in pure JavaScript, with **zero dependencies**.

```javascript
// Everything you need, nothing you don't
✅ Components (atoms → molecules → organisms)
✅ Server-Side Rendering (SSR) & Static Site Generation (SSG)
✅ AI-Native MCP Server Built-in
✅ HMR (Live Reload via SSE)
✅ Zero npm dependencies
```

## Why b0nes?

### The Problem with Modern Web Development

```bash
# Traditional setup:
npx create-react-app my-app    # 847 packages, 412 MB
npm install redux react-router # More dependencies...
npm run build                   # 500KB+ JavaScript bundle

# You: "I just wanted to build a website..." 😰
```

### The b0nes Solution

```bash
# b0nes setup:
npx create-b0nes-app my-site   # 0 packages, <1 MB
cd my-site
npm run dev                    # Start building immediately

# You: "Wait, where is the node_modules folder?" 🎉
```

**Because b0nes is a scaffolding tool, not a library, the framework code is copied directly into your `src/` folder. You own the code. It literally disappears into your codebase.**


**Learn the entire framework in an afternoon. Use it for years.**

---

## Features

- 🧩 **Atomic Design System** - Well-organized component hierarchy (atoms → molecules → organisms)
- 🎯 **Pure JavaScript** - No TypeScript, no frameworks, no build tools required
- 📦 **Zero Dependencies** - Runs on Node.js built-ins only
- 🚀 **SSR & SSG** - Built-in server-side rendering and static site generation
- 🔄 **State Management** - Redux-style store without the complexity
- 🤖 **State Machines** - XState-style FSM for flow control AND SPA routing
- ✨ **Progressive Enhancement** - Works without JavaScript, better with it
- 🧪 **Auto-Testing** - Built-in test discovery and runner
- 🎨 **CSS-Agnostic** - Use Tailwind, vanilla CSS, or any framework you want
- 🔌 **Interactive Components** - Tabs, modals, dropdowns with zero dependencies
- 📦 **Component Installer** - Install community components from URLs

---

## Quick Start in 5 Minutes ⚡

### Prerequisites
- Node.js v20+ installed
- A terminal
- That's it!

### Step 1: Clone & Explore (30 seconds)

```bash
git clone https://github.com/iggydotdev/b0nes.git
cd b0nes
ls src/components/atoms    # Explore available components
```

### Step 2: Start Dev Server (30 seconds)

```bash
npm run dev:watch
```

Open http://localhost:5000 - You'll see a working site! 🎉

### Step 3: Create Your First Component (2 minutes)

```bash
npm run generate atom badge
```

This creates:
```
src/components/atoms/badge/
├── index.js
├── badge.js
└── badge.test.js
```

Edit `src/components/atoms/badge/badge.js`:

```javascript
import { processSlotTrusted } from '../../utils/processSlot.js';
import { normalizeClasses } from '../../utils/normalizeClasses.js';

export const badge = ({ slot, variant = 'default', className = '', attrs = '' }) => {
    attrs = attrs ? ` ${attrs}` : '';
    const classes = normalizeClasses(['badge', `badge-${variant}`, className]);
    const slotContent = processSlotTrusted(slot);
    
    return `<span class="${classes}"${attrs}>${slotContent}</span>`;
};
```

### Step 4: Use Your Component (1 minute)

Edit `src/framework/pages/home.js`:

```javascript
export const components = [
    {
        type: 'organism',
        name: 'hero',
        props: {
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: { is: 'h1', slot: 'Welcome to b0nes' }
                },
                {
                    type: 'atom',
                    name: 'badge',
                    props: { slot: 'New!', variant: 'primary' }
                }
            ]
        }
    }
];
```

Refresh http://localhost:5000 - See your changes live! ✨

### Step 5: Build for Production (30 seconds)

```bash
npm run build
```

Your static site is ready in `public/`:
```
public/
├── index.html
├── demo/
│   └── index.html
└── blog/
    └── [postid]/
        └── index.html
```

### Step 6: Deploy Anywhere (30 seconds)

```bash
# Serve locally
npx serve public

# Or deploy to:
# - Netlify (drag & drop public/ folder)
# - Vercel (vercel --prod)
# - GitHub Pages
# - Any static host!
```

---

## What You Just Did ✅

- ✅ Built a component-based site
- ✅ Zero npm dependencies installed
- ✅ No build tools configured
- ✅ Pure JavaScript + HTML
- ✅ Production-ready output
- ✅ Ready to deploy

---

## Components

### Available Components

**Atoms (15 basic elements):**
- `accordion` - Collapsible content
- `badge` - Status indicators/labels
- `box` - Flexible container (div, section, article, etc.)
- `button` - Clickable button
- `divider` - Horizontal rule
- `image` - Image element
- `input` - Form input
- `link` - Anchor element
- `picture` - Responsive images
- `source` - Media source element
- `text` - Any text element (p, h1-h6, span, etc.)
- `textarea` - Multi-line input
- `video` - Video element

**Molecules (4 compound components):**
- `card` - Content card with header/media/content slots
- `tabs` - Interactive tabbed interface ⚡
- `modal` - Overlay dialog ⚡
- `dropdown` - Click-to-toggle menu ⚡

**Organisms (4 page sections):**
- `header` - Page/section header
- `footer` - Page/section footer
- `hero` - Hero section
- `cta` - Call-to-action section

⚡ = Requires b0nes.js for client-side interactivity

### Component Usage

#### Simple Button

```javascript
// Direct usage
import { button } from './components/atoms/button/button.js';

const html = button({ 
    type: 'submit', 
    slot: 'Click Me',
    className: 'primary large'
});
```

#### Nested Components

```javascript
// In page composition
{
    type: 'organism',
    name: 'hero',
    props: {
        slot: [
            {
                type: 'atom',
                name: 'text',
                props: { is: 'h1', slot: 'Welcome' }
            },
            {
                type: 'atom',
                name: 'button',
                props: { slot: 'Get Started' }
            }
        ]
    }
}
```

### Component Generator

Generate new components with proper structure:

```bash
# Create an atom
npm run generate atom my-button

# Create a molecule
npm run generate molecule my-card

# Create an organism
npm run generate organism my-header
```

### Component Installer

Install community components from URLs:

```bash
# Install from URL
npm run install-component https://example.com/components/my-card

# Preview without installing
npm run install-component https://example.com/card --dry-run

# Force overwrite existing
npm run install-component https://example.com/card --force
```

**Component Manifest Format:**

```json
{
  "name": "my-card",
  "version": "1.0.0",
  "type": "molecule",
  "description": "A custom card component",
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "files": {
    "component": "./my-card.js",
    "test": "./my-card.test.js",
    "client": "./molecule.my-card.client.js"
  },
  "dependencies": [],
  "tags": ["card", "layout"]
}
```

---

## Interactive Components

b0nes includes a **zero-dependency client-side runtime** for progressive enhancement.

### Tabs

Keyboard-accessible tabbed interface with arrow key navigation:

```javascript
{
    type: 'molecule',
    name: 'tabs',
    props: {
        tabs: [
            { label: 'Overview', content: 'Overview content...' },
            { label: 'Features', content: 'Feature 1' },
            { label: 'Docs', content: 'Documentation...' }
        ]
    }
}
```

**Features:**
- Click to switch tabs
- Arrow keys for navigation
- ARIA-compliant markup
- Works without JS (shows all content)

### Modal

Accessible overlay dialog with focus management:

```javascript
// 1. Define the modal
{
    type: 'molecule',
    name: 'modal',
    props: {
        id: 'welcome-modal',
        title: 'Welcome!',
        slot: 'Thanks for visiting our site!'
    }
}

// 2. Add a trigger button
{
    type: 'atom',
    name: 'button',
    props: {
        attrs: 'data-modal-open="welcome-modal"',
        slot: 'Show Welcome Message'
    }
}
```

**Features:**
- Click overlay or X to close
- Escape key to close
- Focus trap when open
- Body scroll lock
- ARIA-compliant

### Dropdown

Click-to-toggle menu with outside-click detection:

```javascript
{
    type: 'molecule',
    name: 'dropdown',
    props: {
        trigger: 'Actions ▾',
        slot: [
            {
                type: 'atom',
                name: 'link',
                props: { url: '#edit', slot: 'Edit' }
            },
            {
                type: 'atom',
                name: 'link',
                props: { url: '#delete', slot: 'Delete' }
            }
        ]
    }
}
```

**Features:**
- Click to toggle
- Outside click to close
- Escape key to close
- ARIA-compliant

### How It Works

```
Server renders HTML with data-b0nes attributes
            ↓
Client loads /b0nes.js runtime (optional)
            ↓
Runtime discovers components
            ↓
Attaches interactive behaviors
            ↓
Progressive enhancement complete!
```

**Disable interactivity for specific pages:**

```javascript
// In routes.js
meta: { 
    title: 'Static Page',
    interactive: false  // Don't load b0nes.js
}
```

---

## State Management

b0nes includes a **Redux-style store** without the complexity:

### Basic Store

```javascript
import { createStore } from './framework/client/store.js';

const store = createStore({
    state: { 
        count: 0,
        todos: []
    },
    actions: {
        increment: (state) => ({ 
            count: state.count + 1 
        }),
        addTodo: (state, todo) => ({ 
            todos: [...state.todos, todo] 
        })
    },
    getters: {
        todoCount: (state) => state.todos.length
    }
});

// Usage
store.dispatch('increment');
store.dispatch('addTodo', { id: 1, text: 'Learn b0nes' });

console.log(store.getState());           // { count: 1, todos: [...] }
console.log(store.computed('todoCount')); // 1

// Subscribe to changes
const unsubscribe = store.subscribe((change) => {
    console.log('State changed:', change);
    console.log('New state:', change.state);
});
```

### Store Modules

Organize large applications with modules:

```javascript
import { combineModules, createModule } from './framework/client/store.js';

const userModule = createModule({
    state: { name: '', email: '' },
    actions: {
        login: (state, userData) => ({ ...userData })
    }
});

const cartModule = createModule({
    state: { items: [] },
    actions: {
        addItem: (state, item) => ({ 
            items: [...state.items, item] 
        })
    }
});

const store = createStore(
    combineModules({ 
        user: userModule, 
        cart: cartModule 
    })
);

// Namespaced access
store.dispatch('user/login', { name: 'John', email: 'john@example.com' });
store.dispatch('cart/addItem', { id: 1, name: 'Product' });
```

### Middleware

Add cross-cutting concerns:

```javascript
import { 
    loggerMiddleware, 
    persistenceMiddleware 
} from './framework/client/store.js';

const store = createStore({
    state: { cart: [] },
    actions: { /* ... */ },
    middleware: [
        loggerMiddleware,              // Logs all state changes
        persistenceMiddleware('cart')  // Auto-saves to localStorage
    ]
});
```

---

## State Machines (FSM)

b0nes includes XState-style finite state machines for flow control AND SPA routing. It's functional, uses closures for private state, and is perfect for authentication, multi-step forms, UI flows, and single-page apps.

### Basic FSM

Perfect for authentication, multi-step forms, and UI flows:

```javascript
import { createFSM } from './framework/client/fsm.js';

const authFSM = createFSM({
    initial: 'logged-out',
    states: {
        'logged-out': {
            on: { LOGIN: 'logging-in' }
        },
        'logging-in': {
            actions: {
                onEntry: (context, data) => {
                    console.log('Starting login...');
                    // Return context updates if needed
                    return { loading: true };
                },
                onExit: (context, data) => {
                    console.log('Exiting login...');
                }
            },
            on: { 
                SUCCESS: 'logged-in',
                FAILURE: 'logged-out'
            }
        },
        'logged-in': {
            on: { LOGOUT: 'logged-out' }
        }
    },
    context: { user: null } // Initial context
});

// Usage
authFSM.send('LOGIN', { username: 'grok' }); // Transition with data
authFSM.getState();                          // 'logging-in'
authFSM.is('logged-in');                     // false
authFSM.can('LOGOUT');                       // false
authFSM.getContext();                        // { user: null, loading: true }
authFSM.getHistory();                        // Array of transitions
authFSM.updateContext({ user: 'grok' });     // Update without transition
authFSM.reset();                             // Back to initial

// Subscribe to changes
const unsubscribe = authFSM.subscribe((transition) => {
    console.log('Transition:', transition);  // { from, to, event, data, timestamp }
});

// Visualize
console.log(authFSM.toMermaid());            // Mermaid diagram string
```

### FSM with Guards (Conditional Transitions)

Transitions can be functions for dynamic targets:

```javascript
const checkoutFSM = createFSM({
    initial: 'cart',
    states: {
        'cart': {
            on: { 
                CHECKOUT: (context, data) => context.items.length > 0 ? 'payment' : 'cart'
            }
        },
        'payment': {
            on: { SUCCESS: 'complete' }
        },
        'complete': {}
    },
    context: { items: [] }
});
```

### Composed FSMs (Parallel Machines)

Run multiple FSMs together:

```javascript
import { composeFSM } from './framework/client/fsm.js';

const composed = composeFSM({
    auth: authFSM,
    checkout: checkoutFSM
});

composed.getAllStates();     // { auth: 'logged-out', checkout: 'cart' }
composed.getAllContexts();   // Combined contexts
composed.send('auth', 'LOGIN'); // Send to specific machine
composed.broadcast('RESET'); // Send to all that can handle it

// Subscribe to any transition
composed.subscribe((change) => {
    console.log(change);     // { machine: 'auth', from, to, ... }
});
```

### FSM Router - SPAs Made Easy

For routing, use createRouterFSM to generate an FSM from routes, then connectFSMtoDOM to wire it to the UI. This handles rendering templates, updating URLs, browser history, and event delegation.

```javascript
import { createRouterFSM, connectFSMtoDOM } from './framework/client/fsm.js';

const routes = [
    {
        name: 'start',
        url: '/demo/fsm/start',
        template: "<h1>FSM Demo</h1><button data-fsm-event='GOTO_STEP2'>Next</button>",
        onEnter: (context, data) => console.log('Entered start')
    },
    {
        name: 'step2',
        url: '/demo/fsm/step2',
        template: "<h1>Step 2</h1><button data-fsm-event='GOTO_START'>Back</button>"
    },
    {
        name: 'success',
        url: '/demo/fsm/success',
        template: "<h1>Success!</h1>"
    }
];

const { fsm, routes: fsmRoutes } = createRouterFSM(routes); // Creates FSM with GOTO_ events

// Connect to DOM (handles render, clicks, popstate)
const rootEl = document.querySelector('[data-bones-fsm]');
const cleanup = connectFSMtoDOM(fsm, rootEl, routes);

// Navigate programmatically
fsm.send('GOTO_STEP2');

// Cleanup when done
cleanup();
```

#### Key notes: 

- Routes get auto-connected with GOTO_[NAME] events.
- Use data-fsm-event on buttons/links for transitions.
- onEnter/onExit become state actions.
- Handles browser back/forward via popstate.
- Initial state matches current URL if possible.

### Multi-Step Form with FSM Router

```javascript
const routes = [
    {
        name: 'start',
        url: '/form/start',
        template: "<h1>Start</h1><button data-fsm-event='GOTO_STEP2'>Next</button>"
    },
    {
        name: 'step2',
        url: '/form/step2',
        template: "<h1>Step 2</h1><button data-fsm-event='GOTO_START'>Back</button><button data-fsm-event='GOTO_SUCCESS'>Submit</button>"
    },
    {
        name: 'success',
        url: '/form/success',
        template: "<h1>Success!</h1><button data-fsm-event='GOTO_START'>Reset</button>"
    }
];

const { fsm } = createRouterFSM(routes);
connectFSMtoDOM(fsm, document.getElementById('app'), routes);
```

```

**Why FSM?**
- ✅ Impossible states become impossible
- ✅ All transitions are explicit
- ✅ Easy to visualize and test
- ✅ Self-documenting code
- ✅ Prevents bugs from invalid state combinations
- ✅ Built-in SPA routing with FSM Router

---

## Routing & Pages

### Static Routes (SSG/SSR)

```javascript
// src/framework/routes.js
import { URLPattern } from './utils/urlPattern.js';
import { components as homeComponents } from './pages/home.js';

export const routes = [
    {
        name: 'Home',
        pattern: new URLPattern({ pathname: '/' }),
        meta: { title: 'Home' },
        components: homeComponents
    },
    {
        name: 'About',
        pattern: new URLPattern({ pathname: '/about' }),
        meta: { title: 'About Us' },
        components: aboutComponents
    }
];
```

### Dynamic Routes (SSG/SSR)

```javascript
{
    name: 'Blog Post',
    pattern: new URLPattern({ pathname: '/blog/:slug' }),
    meta: { title: 'Blog Post' },
    components: (data) => [
        {
            type: 'organism',
            name: 'hero',
            props: {
                slot: [
                    {
                        type: 'atom',
                        name: 'text',
                        props: { is: 'h1', slot: data.title }
                    }
                ]
            }
        }
    ],
    externalData: async () => {
        // Fetch blog post data
        const response = await fetch('https://api.example.com/posts');
        return await response.json();
    }
}
```

### Creating Pages

```javascript
// src/framework/pages/home.js
export const components = [
    {
        type: 'organism',
        name: 'header',
        props: {
            slot: [
                { type: 'atom', name: 'link', props: { url: '/examples/home', slot: 'Home' } },
                { type: 'atom', name: 'link', props: { url: '/about', slot: 'About' } }
            ]
        }
    },
    {
        type: 'organism',
        name: 'hero',
        props: {
            slot: [
                { type: 'atom', name: 'text', props: { is: 'h1', slot: 'Welcome' } },
                { type: 'atom', name: 'button', props: { slot: 'Get Started' } }
            ]
        }
    },
    {
        type: 'organism',
        name: 'footer',
        props: {
            slot: [
                { type: 'atom', name: 'text', props: { is: 'p', slot: '© 2025' } }
            ]
        }
    }
];
```

---

## Testing

### Component Tests

Tests use simple assertion pattern:

```javascript
// src/components/atoms/button/button.test.js
import button from './index.js';

export const test = () => {
    const actual = button({ 
        type: 'submit', 
        slot: 'Click Me',
        className: 'primary'
    });
    
    const expected = '<button type="submit" class="btn primary">Click Me</button>';
    
    return actual === expected 
        ? true 
        : console.error({actual, expected}) || false;
};
```

Run all tests:

```bash
npm run test
```

Output:
```
📦 Testing atoms:
testing file: button.test.js
  ✓ PASS
testing file: link.test.js
  ✓ PASS

Test Summary: 23/23 passed
```

---

## Styling

b0nes is **CSS-agnostic by design**. You choose how to style your components.

### Why No Built-in CSS?

- ✅ No forced design opinions
- ✅ No CSS specificity conflicts
- ✅ No breaking changes on updates
- ✅ Works with any CSS strategy
- ✅ Smaller bundle size

### Recommended Approaches

#### Option 1: Tailwind CSS

```bash
npm install -D tailwindcss
npx tailwindcss init
```

```javascript
// Use Tailwind classes in components
button({
    slot: 'Click Me',
    className: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded'
})
```

#### Option 2: Vanilla CSS

```css
/* public/styles.css */
.btn {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    border: none;
    cursor: pointer;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}
```

#### Option 3: CSS Framework Presets

```javascript
import { stylesheetPresets } from './framework/renderPage.js';

// Tailwind CSS
meta: { stylesheets: stylesheetPresets.tailwind() }

// Water.css (classless)
meta: { stylesheets: stylesheetPresets.water('dark') }

// Pico CSS
meta: { stylesheets: stylesheetPresets.pico() }

// Open Props
meta: { stylesheets: stylesheetPresets.openProps() }

// Combine multiple
meta: { 
    stylesheets: stylesheetPresets.combine(
        stylesheetPresets.water('auto'),
        '/styles/custom.css'
    )
}
```

---

## Real-World Examples

### Complete Landing Page

```javascript
// src/framework/pages/landing.js
export const components = [
    {
        type: 'organism',
        name: 'header',
        props: {
            className: 'sticky-header',
            slot: [
                { type: 'atom', name: 'link', props: { url: '/examples/home', slot: 'Home' }},
                { type: 'atom', name: 'link', props: { url: '/pricing', slot: 'Pricing' }},
                { type: 'atom', name: 'link', props: { url: '/docs', slot: 'Docs' }}
            ]
        }
    },
    {
        type: 'organism',
        name: 'hero',
        props: {
            className: 'hero-gradient',
            slot: [
                { type: 'atom', name: 'text', props: { is: 'h1', slot: 'Ship Faster' }},
                { type: 'atom', name: 'text', props: { is: 'p', slot: 'Zero deps. Pure JS. Simple.' }},
                { type: 'atom', name: 'button', props: { slot: 'Get Started', className: 'cta-button' }}
            ]
        }
    },
    {
        type: 'atom',
        name: 'box',
        props: {
            is: 'section',
            className: 'features',
            slot: [
                {
                    type: 'molecule',
                    name: 'card',
                    props: {
                        headerSlot: 'Zero Dependencies',
                        contentSlot: 'Never breaks, always works'
                    }
                },
                {
                    type: 'molecule',
                    name: 'card',
                    props: {
                        headerSlot: 'Complete Toolkit',
                        contentSlot: 'Everything you need included'
                    }
                }
            ]
        }
    },
    {
        type: 'organism',
        name: 'cta',
        props: {
            slot: [
                { type: 'atom', name: 'text', props: { is: 'h2', slot: 'Ready to build?' }},
                { type: 'atom', name: 'button', props: { slot: 'Start Now' }}
            ]
        }
    },
    {
        type: 'organism',
        name: 'footer',
        props: {
            slot: { type: 'atom', name: 'text', props: { is: 'p', slot: '© 2025 Your Company' }}
        }
    }
];
```

---

## Project Structure

```
b0nes/
├── src/
│   ├── components/              # Component Library
│   │   ├── atoms/              # Basic elements (15 components)
│   │   ├── molecules/          # Compound components (4 components)
│   │   ├── organisms/          # Page sections (4 components)
│   │   └── utils/              # Component utilities
│   │       ├── generator/      # Component generator
│   │       ├── tester.js       # Test runner
│   │       ├── processSlot.js  # Slot processing
│   │       ├── normalizeClasses.js
│   │       └── componentError.js
│   └── framework/              # Framework Core
│       ├── client/             # Client-side runtime
│       │   ├── b0nes.js       # Component initialization
│       │   ├── store.js       # State management
│       │   └── fsm.js         # State machines + SPA routing
│       ├── pages/             # Page templates
│       ├── utils/build/       # Build tools
│       ├── compose.js         # Component composition
│       ├── router.js          # URL routing
│       ├── routes.js          # Route definitions
│       ├── renderPage.js      # HTML generation
│       └── server.js          # Dev server
├── package.json
├── README.md
└── LICENSE
```

---

## API Reference

### Core Functions

#### compose(components)
Recursively composes component tree into HTML.

```javascript
import { compose } from './framework/compose.js';

const html = compose([
    { type: 'atom', name: 'text', props: { is: 'p', slot: 'Hello' } }
]);
```

#### renderPage(content, meta)
Wraps composed HTML in full page template.

```javascript
import { renderPage } from './framework/renderPage.js';

const html = renderPage(content, { 
    title: 'My Page',
    interactive: true,  // Include b0nes.js (default: true)
    stylesheets: ['/styles/main.css']
});
```

#### router(url, routes)
Matches URL to route and returns route info.

```javascript
import { router } from './framework/router.js';

const route = router(new URL('http://localhost/'), routes);
// Returns: { params, query, meta, components, ... }
```

---

## Deployment

### Build for Production

```bash
npm run build
```

Outputs to `public/`:
```
public/
├── index.html
├── demo/
│   └── index.html
└── blog/
    └── post-1/
        └── index.html
```

### Deploy to Netlify

1. Build your site: `npm run build`
2. Drag & drop the `public/` folder to Netlify
3. Done!

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

### Deploy to GitHub Pages

```bash
npm run build
git subtree push --prefix public origin gh-pages
```

---

## Performance

### Build Performance
- ⚡ **Fast builds** - ~100ms for small sites
- ⚡ **No transpilation** - Pure JavaScript
- ⚡ **No bundling** - Direct HTML output

### Runtime Performance
- ⚡ **Zero hydration** - Server-rendered HTML
- ⚡ **Minimal JavaScript** - Only for interactive components
- ⚡ **Progressive enhancement** - Works without JS

### Lighthouse Scores (Typical)
- 🟢 Performance: 100
- 🟢 Accessibility: 100
- 🟢 Best Practices: 100
- 🟢 SEO: 100

---

## Comparison

| Feature | b0nes | Next.js | Astro | 11ty |
|---------|-------|---------|-------|------|
| **Dependencies** | 0 | 847+ | 320+ | 180+ |
| **Learning Curve** | 1 day | 2 weeks | 1 week | 3 days |
| **State Management** | ✅ Built-in | ❌ BYO | ❌ BYO | ❌ BYO |
| **State Machines** | ✅ Built-in | ❌ BYO | ❌ BYO | ❌ BYO |
| **SPA Router** | ✅ FSM-based | ✅ Built-in | ❌ BYO | ❌ BYO |
| **Build Tool** | ❌ Not required | ✅ Required | ✅ Required | ⚠️ Optional |
| **Client JS** | Progressive | Required | Optional | Optional |
| **TypeScript** | Optional | Built-in | Built-in | Optional |

---

## Roadmap

### v0.3.0
- [ ] TypeScript declaration files (.d.ts)
- [ ] More interactive components (carousel, accordion with animation)
- [ ] Improved documentation with maybe video tutorials
- [ ] Component marketplace/registry

### v0.4.0
- [ ] Plugin system
- [ ] Middleware support for routing
- [ ] View Transitions API integration
- [ ] Component playground (Storybook-like)
- [ ] Hot module replacement (HMR)

and more to come!

---

## Philosophy

### Why Zero Dependencies?

**Stability.** Code that depends on nothing never breaks from dependency updates.

**Simplicity.** No version conflicts, no security vulnerabilities from dependencies, no maintenance overhead.

**Longevity.** This code will run 10 years from now without changes.

### Why Pure JavaScript?

**Accessibility.** Everyone can read and understand the code, from juniors to AI.

**Portability.** No compilation step, no toolchain lock-in, runs anywhere Node.js runs.

**Simplicity.** What you see is what runs. No hidden transformations.

### Why HTML-First?

**Standards.** HTML has been around for 30+ years and will be around for 30+ more.

**Performance.** Server-rendered HTML is the fastest way to deliver content.

**Accessibility.** Semantic HTML is naturally accessible.

### Why FSM for Routing?

**Predictability.** All possible states and transitions are explicit.

**Debugging.** State machines are easy to visualize and test.

**Safety.** We can infer valid states and events.

**Flexibility.** FSM works for SPAs, multi-step forms, game states, and more.

---

## Contributing

Contributions are welcome! Please ensure:
- All tests pass: `npm run test`
- New components follow atomic design patterns
- JSDoc comments are included
- Zero dependencies maintained
- Follow existing code style

**Areas we'd love help with:**
- More interactive components (carousel, date picker, etc.)
- FSM visualization tools
- Performance optimizations
- Documentation improvements
- Example projects and tutorials

---

## Known Issues (v0.2.0)

- Some tests need improvement (will use node:test in future)
- Component generator has template replacement issues (being addressed)
- Dynamic route generation needs more robust error handling
- FSM Router needs more examples and documentation

We're aware of these and they'll be addressed in upcoming releases.

---

## Frequently Asked Questions

### Why not just use React/Next.js?

b0nes is for different use cases:
- **Use React/Next.js** for: Complex SPAs, real-time apps, large teams
- **Use b0nes** for: Content sites, landing pages, docs, blogs, simple SPAs

### Can I use TypeScript?

Yes! While b0nes is written in pure JS, you can:
1. Use JSDoc for type hints (no compilation needed)
2. Add your own TypeScript layer on top
3. We're working on official .d.ts files for v0.3.0

### How does FSM compare to React Router?

FSM Router:
- ✅ Explicit state transitions
- ✅ Built-in state management
- ✅ Works with or without URLs
- ✅ Perfect for multi-step flows
- ❌ More verbose for simple routing

React Router:
- ✅ Simpler for basic routing
- ✅ Larger ecosystem
- ❌ Implicit state transitions
- ❌ Requires separate state management

### Can I build a SPA with b0nes?

**Absolutely!** Use the FSM Router:

```javascript
const routes = [
    { name: 'home', url: '/examples/home', template: '<h1>Home</h1>' },
    { name: 'about', url: '/about', template: '<h1>About</h1>' }
];

const { fsm } = createRouterFSM(routes);
connectFSMtoDOM(fsm, document.getElementById('app'), routes);
```

### Is this production-ready?

**For static sites: Yes!** (v0.2.0+)
- Zero dependencies = rock solid
- SSG output is just HTML/CSS/JS

**For SPAs: Getting there!** (v0.2.0)
- FSM Router is new but tested
- Use for new projects, not mission-critical apps yet
- We're working toward v1.0.0 for production SPAs

### How do I handle forms?

```javascript
// Multi-step form with FSM
const routes = [
    { name: 'step1', url: '/step1', template: '<input id="name" /><button data-fsm-event="GOTO_STEP2">Next</button>' }
];

const { fsm } = createRouterFSM(routes);
connectFSMtoDOM(fsm, app, routes);
```

### How do I fetch data?

```javascript
// In route definition
{
    name: 'Blog Post',
    pattern: new URLPattern({ pathname: '/blog/:slug' }),
    components: blogPostComponents,
    externalData: async (params) => {
        const res = await fetch(`https://api.example.com/posts/${params.slug}`);
        return await res.json();
    }
}
```

### Can I use this with Tailwind?

**Yes!** b0nes is CSS-agnostic:

```bash
npm install -D tailwindcss
npx tailwindcss init
```

Or use the built-in preset:

```javascript
import { stylesheetPresets } from './framework/renderPage.js';

meta: {
    stylesheets: stylesheetPresets.tailwind()
}
```

---

## License

MIT License - See [LICENSE](LICENSE) file

Copyright (c) 2025 Ignacio Garcia Villanueva

---

## Final Thoughts

This is an attempt to do something different. Not to replace anything, but to propose another way.

We've been overengineering solutions for too long. It's time to question our choices and ask: **"Is this really worth it?"**

**b0nes is for developers who:**
- Want to understand how their framework works
- Value simplicity over complexity
- Prefer explicit over implicit
- Care about longevity and stability
- Don't want to rewrite their app every 2 years

If you think this is useful, let me know.  
If you learn something from this, let me know.

Let's build something useful together.

**Many thanks!**  
— Iggy

---

## Links

- 🌐 **GitHub**: https://github.com/iggydotdev/b0nes
- 📦 **npm**: https://www.npmjs.com/package/b0nes
- 🐛 **Issues**: https://github.com/iggydotdev/b0nes/issues
- 💬 **Discussions**: https://github.com/iggydotdev/b0nes/discussions
- 📧 **Email**: iggy.dev@pm.me
- 🐦 **Twitter**: [@iggydotdev](https://twitter.com/iggydotdev)

---

**⭐ Star this repo if you find it useful!**

**🤝 Contributions welcome!** Check out our [Contributing Guide](CONTRIBUTING.md)

**📢 Share your b0nes projects!** We'd love to see what you build.