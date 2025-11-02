# b0nes Framework

[![npm version](https://badge.fury.io/js/b0nes.svg)](https://www.npmjs.com/package/b0nes)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)

**The framework that fits in your head.**

b0nes is a complete web development toolkit with **zero dependencies**. Build modern websites with components, routing, state management, and progressive enhancement—all in pure JavaScript.

```javascript
// Everything you need, nothing you don't
✅ Components (atoms → molecules → organisms)
✅ Server-Side Rendering (SSR)
✅ Static Site Generation (SSG)
✅ State Management (built-in Store)
✅ State Machines (built-in FSM)
✅ Client-side Interactivity
✅ Zero npm dependencies
```

## Why b0nes?

### The Problem with Modern Web Development

```bash
# Traditional setup:
npx create-react-app my-app    # 847 packages, 412 MB
npm install redux react-router # More dependencies...
npm run build                   # 500KB+ JavaScript bundle

# Junior dev: "I just wanted to build a website..." 😰
```

### The b0nes Solution

```bash
# b0nes setup:
git clone b0nes.git            # 0 packages, <1 MB
cd b0nes
node src/framework/index.js    # Start building immediately

# Junior dev: "This makes sense!" 🎉
```

**Learn the entire framework in an afternoon. Use it for years.**

---

## Features

- 🧩 **Atomic Design System** - Well-organized component hierarchy (atoms → molecules → organisms)
- 🎯 **Pure JavaScript** - No TypeScript, no frameworks, no build tools required
- 📦 **Zero Dependencies** - Runs on Node.js built-ins only
- 🚀 **SSR & SSG** - Built-in server-side rendering and static site generation
- 🔄 **State Management** - Redux-style store without the complexity
- 🤖 **State Machines** - XState-style FSM for flow control
- ✨ **Progressive Enhancement** - Works without JavaScript, better with it
- 🧪 **Auto-Testing** - Built-in test discovery and runner
- 🎨 **CSS-Agnostic** - Use Tailwind, vanilla CSS, or any framework you want
- 🔌 **Interactive Components** - Tabs, modals, dropdowns with zero dependencies

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
    
    return `${slotContent}`;
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

**Atoms (14 basic elements):**
- `accordion` - Collapsible content
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

1. Install Components from URLs

```bash
npm run install-component https://example.com/components/my-card
```

2. Two Installation Modes

Copy Mode (Default):

- Downloads files to your project
- Works offline
- Can modify locally
- No external dependencies

Reference Mode:
```bash
npm run install-component https://example.com/card --reference
```

- Loads from URL at runtime
- Always latest version
- Smaller project size
- Requires internet

3. Component Manifest System

Authors create a simple manifest:
```json
{
  "name": "my-card",
  "version": "1.0.0",
  "type": "molecule",
  "files": {
    "component": "./my-card.js",
    "test": "./my-card.test.js",
    "client": "./molecule.my-card.client.js"
  }
}
```

4. Automatic Registry Updates
The installer automatically:

- ✅ Downloads component files
- ✅ Updates component index
- ✅ Checks dependencies
- ✅ Validates manifest
- ✅ Runs tests

🎯 Real-World Workflow
As Component Author

- Create component following b0nes patterns
- Add manifest (b0nes.manifest.json)
- Host on GitHub (or anywhere)
- Share URL with community

```
https://raw.githubusercontent.com/username/repo/main/components/card
```

As Component User

Install component:

```bash
npm run install-component https://github.com/username/repo/main/components/card
```

Use immediately:

```javascript
{
  type: 'molecule',
  name: 'card',  // Now available!
  props: { /* ... */ }
}
```

A Standard format for sharing would follow this:

```json 
{
  "name": "component-name",
  "version": "1.0.0",
  "type": "atom|molecule|organism",
  "files": {
    "component": "./file.js",
    "test": "./file.test.js",
    "client": "./client.js"
  },
  "dependencies": [],
  "tags": [],
  "repository": "...",
  "demo": "..."
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

b0nes includes **XState-style finite state machines** for flow control:

### Basic FSM

Perfect for authentication, multi-step forms, and UI flows:

```javascript
import { createFSM } from './framework/client/fsm.js';

const authFSM = createFSM({
    initial: 'logged-out',
    states: {
        'logged-out': {
            on: { LOGIN: 'authenticating' }
        },
        'authenticating': {
            on: { 
                SUCCESS: 'logged-in',
                ERROR: 'logged-out'
            },
            actions: {
                onEntry: (context) => {
                    console.log('Starting authentication...');
                }
            }
        },
        'logged-in': {
            on: { LOGOUT: 'logged-out' }
        }
    }
});

// Usage
authFSM.send('LOGIN');       // Transition to 'authenticating'
authFSM.getState();          // 'authenticating'
authFSM.is('logged-in');     // false
authFSM.can('LOGOUT');       // false (not in correct state)
```

### Multi-Step Form with FSM

```javascript
const checkoutFSM = createFSM({
    initial: 'cart',
    states: {
        cart: {
            on: { CHECKOUT: 'shipping' }
        },
        shipping: {
            on: { 
                CONTINUE: 'payment',
                BACK: 'cart'
            }
        },
        payment: {
            on: { 
                SUBMIT: 'processing',
                BACK: 'shipping'
            }
        },
        processing: {
            on: { 
                SUCCESS: 'complete',
                ERROR: 'payment'
            }
        },
        complete: {}
    }
});

// Subscribe to state changes
checkoutFSM.subscribe((transition) => {
    console.log(`${transition.from} → ${transition.to}`);
    updateUI(transition.to);
});

// User flow
checkoutFSM.send('CHECKOUT');  // cart → shipping
checkoutFSM.send('CONTINUE');  // shipping → payment
checkoutFSM.send('SUBMIT');    // payment → processing
```

### FSM + Store Integration

Combine state machines (flow control) with store (data management):

```javascript
import { connectStoreToFSM } from './framework/client/store.js';

const formStore = createStore({
    state: { 
        step1Data: {},
        step2Data: {},
        step3Data: {}
    },
    actions: {
        updateStep1: (state, data) => ({ 
            step1Data: { ...state.step1Data, ...data } 
        }),
        updateStep2: (state, data) => ({ 
            step2Data: { ...state.step2Data, ...data } 
        })
    }
});

const formFSM = createFSM({
    initial: 'step1',
    states: {
        step1: { on: { NEXT: 'step2' } },
        step2: { on: { NEXT: 'step3', BACK: 'step1' } },
        step3: { on: { SUBMIT: 'complete' } }
    }
});

// Sync FSM state to store automatically
const disconnect = connectStoreToFSM(formStore, formFSM);

// Now they work together
formStore.dispatch('updateStep1', { name: 'John' });
formFSM.send('NEXT');
```

**Why FSM?**
- ✅ Impossible states become impossible
- ✅ All transitions are explicit
- ✅ Easy to visualize and test
- ✅ Self-documenting code
- ✅ Prevents bugs from invalid state combinations

---

## Routing & Pages

### Static Routes

```javascript
// src/framework/routes.js
import { URLPattern } from 'node:url';
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

### Dynamic Routes

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
                { type: 'atom', name: 'link', props: { url: '/', slot: 'Home' } },
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
    
    const expected = 'Click Me';
    
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

```javascript
// Include in renderPage

```

#### Option 3: CSS Modules

```javascript
// For component-scoped styles
import styles from './button.module.css';

button({
    slot: 'Click Me',
    className: styles.button
})
```

#### Option 4: Open Props

Modern CSS variables with zero build step:

```html

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
                { type: 'atom', name: 'link', props: { url: '/', slot: 'Home' }},
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

### Multi-Step Form with State

```javascript
// Form state management
const formStore = createStore({
    state: {
        currentStep: 1,
        personalInfo: { name: '', email: '' },
        shipping: { address: '', city: '' },
        payment: { cardNumber: '' }
    },
    actions: {
        nextStep: (state) => ({ 
            currentStep: state.currentStep + 1 
        }),
        prevStep: (state) => ({ 
            currentStep: state.currentStep - 1 
        }),
        updatePersonalInfo: (state, data) => ({
            personalInfo: { ...state.personalInfo, ...data }
        }),
        updateShipping: (state, data) => ({
            shipping: { ...state.shipping, ...data }
        })
    }
});

// Form flow control
const formFSM = createFSM({
    initial: 'personal',
    states: {
        personal: { on: { NEXT: 'shipping' } },
        shipping: { on: { NEXT: 'payment', BACK: 'personal' } },
        payment: { on: { SUBMIT: 'complete', BACK: 'shipping' } },
        complete: {}
    }
});

// Sync them
connectStoreToFSM(formStore, formFSM);
```

---

## Project Structure

```
b0nes/
├── src/
│   ├── components/              # Component Library
│   │   ├── atoms/              # Basic elements (14 components)
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
│       │   └── fsm.js         # State machines
│       ├── pages/             # Page templates
│       ├── utils/build/       # Build tools
│       ├── compose.js         # Component composition
│       ├── router.js          # URL routing
│       ├── routes.js          # Route definitions
│       ├── renderPage.js      # HTML generation
│       └── index.js           # Dev server
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
    interactive: true  // Include b0nes.js (default: true)
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
| **Build Tool** | ❌ Not required | ✅ Required | ✅ Required | ⚠️ Optional |
| **Client JS** | Progressive | Required | Optional | Optional |
| **TypeScript** | Optional | Built-in | Built-in | Optional |

---

## Roadmap

### v0.3.0
- [ ] TypeScript declaration files (.d.ts)
- [ ] FSM visualization tools
- [ ] Store devtools browser extension
- [ ] More interactive components (accordion, tooltip)
- [ ] Improved documentation with video tutorials

### v0.4.0
- [ ] Plugin system
- [ ] Middleware support for routing
- [ ] View Transitions API integration
- [ ] Islands architecture
- [ ] Component playground (Storybook-like)

### v1.0.0
- [ ] Production-grade error handling
- [ ] Performance monitoring
- [ ] CLI tool with scaffolding
- [ ] Official starter templates
- [ ] Comprehensive test coverage

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

---

## Contributing

Contributions are welcome! Please ensure:
- All tests pass: `npm run test`
- New components follow atomic design patterns
- JSDoc comments are included
- Zero dependencies maintained

---

## Known Issues (v0.2.0)

- Some tests need improvement (will use node:test in future)
- Component generator has template replacement issues (being addressed)
- Dynamic route generation needs more robust error handling

We're aware of these and they'll be addressed in upcoming releases.

---

## License

MIT License - See [LICENSE](LICENSE) file

Copyright (c) 2025 Ignacio Garcia Villanueva

---

## Final Thoughts

This is an attempt to do something different. Not to replace anything, but to propose another way.

We've been overengineering solutions for too long. It's time to question our choices and ask: **"Is this really worth it?"**

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
- 📧 **Email**: iggy.dev@pm.me

---

**⭐ Star this repo if you find it useful!**
