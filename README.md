# b0nes Framework

[![npm version](https://badge.fury.io/js/b0nes.svg)](https://www.npmjs.com/package/b0nes)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D24.0.0-brightgreen)](https://nodejs.org/)


b0nes is a lightweight, composition-first component library and SSR/SSG framework built with pure JavaScript and no dependencies.

## Features

- 🧩 **Atomic Design System** - Well-organized component hierarchy (atoms → molecules → organisms)
- 🎯 **Pure JavaScript** - No TypeScript, no frameworks. Just functions and JSDoc
- 📦 **Zero Dependencies** - No npm packages required
- 🚀 **Server-Side Rendering** - Built-in SSR support with Node.js
- 🔄 **Static Generation** - Generate static HTML files
- 🧪 **Auto-Testing** - Built-in test discovery and runner
- 🎨 **Composition** - Nested components work seamlessly

## Project Structure

```
b0nes/
├── src/          
│   ├── components/           # Component Library
│   │   │   ├── atoms/        # Basic elements (button, link, text, etc)
│   │   │   ├── molecules/    # Combinations (card, form-group, etc)
│   │   │   └── organisms/    # Sections (header, footer, hero, etc)
│   │   └── utils/
│   └── framework/            # Framework
│       ├── compose.js        # Component composition engine
│       ├── renderPage.js     # HTML template used to render
│       ├── routes.js         # Route definitions
│       ├── routes.js         # Route definitions
│       ├── pages/            # Page templates
│       └──utils/build/
│                 └── ssg.js  # Static site generation
```

## Installation

```bash
git clone https://github.com/iggydotdev/b0nes.git
cd b0nes
```

No npm install needed! Everything runs with Node.js (v24).

## Get Started in 5 Minutes ⚡

### Prerequisites
- Node.js v24 installed
- A terminal
- That's it!

### Step 1: Clone & Explore (30 seconds)

```bash
git clone https://github.com/iggydotdev/b0nes.git
cd b0nes
ls src/components/  # Check out the components type 
ls src/components/atoms #Check out the atom components
...
```

### Step 2: Start Dev Server (30 seconds)

```bash
node src/framework/index.js
```

Dev mode
```bash
npm run dev

```
Dev + hot reload
```bash
npm run dev:watch
```

Open http://localhost:3000 - You'll see a working site! 🎉

### Step 3: Create Your First Component (2 minutes)

```bash
# Generate a new atom component
node src/components/utils/generator/index.js atom badge
```

```bash
# Generate a new atom component
npm run generate atom badge
```

This creates:
```
src/components/atoms/badge/
├── index.js
├── badge.js
└── badge.test.js
```

You can now start tweaking/edit `src/components/atoms/badge/badge.js`:


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
                    props: {
                        is: 'h1',
                        slot: 'Welcome to b0nes'
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        slot: 'Build modern web applications with ease'
                    }
                }
            ]
        }
    }
];
```

Refresh http://localhost:3000 - See your changes live! ✨

### Step 5: Build for Production (30 seconds)

```bash
node src/framework/utils/build/index.js public
```

```bash
npm run build
```

Your static site is ready in `public/`:
```
public/
├── index.html           # Your homepage
└── blog/
    └── [postid]/
        └── index.html   # Dynamic routes
```

### Step 6: Deploy Anywhere (30 seconds)

```bash
# Serve locally
npx serve public

# Or deploy to:
# - Netlify
# - Vercel
# - GitHub Pages
# - Any static host!
```

---

### 🎯 What You Just Did

✅ Built a component-based site  
✅ Zero npm dependencies  
✅ No build tools (except for production)  
✅ Pure JavaScript + HTML  
✅ Ready to deploy  

---

### Real-World Example: Complete Landing Page

Here's a complete landing page in one file:

```javascript
// src/framework/pages/landing.js
export const components = [
    {
        type: 'organism',
        name: 'header',
        props: {
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
            slot: [
                { type: 'atom', name: 'text', props: { is: 'h1', slot: 'Ship Faster' }},
                { type: 'atom', name: 'text', props: { is: 'p', slot: 'Zero deps. Pure JS. Simple.' }},
                { type: 'atom', name: 'button', props: { slot: 'Get Started', className: 'cta' }}
            ]
        }
    },
    {
        type: 'organism',
        name: 'cta',
        props: {
            slot: [
                { type: 'atom', name: 'text', props: { is: 'h2', slot: 'Ready to build?' }},
                { type: 'atom', name: 'button', props: { type: 'submit', slot: 'Start Now' }}
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

Add the route in `src/framework/routes.js`:

```javascript
import { components as landingComponents } from './pages/landing.js';

export const routes = [
    {
        name: 'Landing',
        pattern: new URLPattern({ pathname: '/landing' }),
        meta: { title: 'Landing Page' },
        components: landingComponents
    }
];
```

Build it:

```bash
node src/framework/utils/build/index.js public
```

Done! 🚀

---

## Why b0nes?

### Traditional React Setup:
```bash
npx create-react-app my-app    # 2 minutes, 250MB node_modules
cd my-app
npm start                        # 30 seconds to start
npm run build                    # 1 minute to build
# Result: 500KB+ JavaScript bundle
```

### b0nes Setup:
```bash
git clone b0nes.git          # 10 seconds
cd b0nes
node src/framework/index.js     # Instant
node src/framework/utils/build/index.js public  # 1 second
# Result: Pure HTML, 0KB JavaScript
```

---

## How It Works

```
Your Code (home.js)
        ↓
   Components Array
        ↓
   compose() function
        ↓
   HTML Strings
        ↓
   renderPage()
        ↓
   Static HTML File
```

**That's it.** No JSX compilation. No virtual DOM. No hydration. Just functions returning strings.

---

## Perfect For:

- 📝 Blogs
- 🎨 Marketing sites
- 📚 Documentation
- 🎯 Landing pages
- 💼 Portfolios

---

## Next Steps

- **Add more components**: `node src/components/utils/generator/index.js molecule card`
- **Run tests**: `node src/components/utils/tester.js`
- **Customize styles**: Add your own CSS (no opinions here!)
- **Create pages**: Add routes in `src/framework/routes.js`
- **Read the docs**: Check out the Component API documentation below

## Creating Components

### Atoms (Basic Elements)

```javascript
// src/components/atoms/button/button.js
import { processSlot } from '../../../utils/processSlot.js';

export const button = ({ type = 'button', attrs, className, slot }) => {
    attrs = attrs? ` ${attrs}` : '';
    className = className? ` ${className}` : '';
    slot = processSlot(slot) ?? '';
    return `<button type="${type}" class="btn${className}"${attrs}>${slot}</button>`;
}
```

### Using Components

```javascript
// Standalone
button({ type: 'submit', slot: 'Click Me', className: 'primary' });

// In composition
{
    type: 'atom',
    name: 'button',
    props: {
        type: 'submit',
        slot: 'Submit',
        className: 'primary'
    }
}
```

## Component Generator

Generate new components quickly using the built-in generator:

```bash
# Create an atom
node src/components/utils/generator/index.js atom my-button

# Create a molecule
node src/components/utils/generator/index.js molecule my-card

# Create an organism
node src/components/utils/generator/index.js organism my-header
```

The generator creates:
- `index.js` - Component exports
- `componentName.js` - Component implementation
- `componentName.test.js` - Unit tests

Example output structure:
```
components/
└── atoms/
    └── my-button/
        ├── index.js
        ├── my-button.js
        └── my-button.test.js
```

### Generator Options

- **atom** - Create basic element (button, text, input...)
- **molecule** - Create compound component (card, form-group...)
- **organism** - Create page section (header, footer...)


### Component Props API

All components support:
- **attrs** - Raw HTML attributes (string)
- **className** - CSS classes (string)
- **slot** - Content (string or array of components)

Some components have additional props:
- **text**: `is` (HTML tag)
- **button**: `type` (submit, reset, button)
- **link**: `url` (href)
- **image**: `src` (image source)

## Routing & Pages

### Define Routes

```javascript
// src/framework/routes.js
export const routes = [{
    name: 'Home',
    pattern: new URLPattern({ pathname: '/' }),
    meta: { title: 'Home' },
    components: homeComponents
}];
```

### Create Page Components

```javascript
// src/framework/pages/home.js
export const components = [
    {
        type: 'organism',
        name: 'header',
        props: { slot: [...] }
    },
    {
        type: 'organism',
        name: 'hero',
        props: { slot: [...] }
    }
];
```

## Composition System

Components are composed recursively:

```javascript
const components = [
    {
        type: 'organism',
        name: 'card',
        props: {
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h2',
                        slot: 'Title'
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        slot: 'Description'
                    }
                }
            ]
        }
    }
];

const html = compose(components);
```

## Component Testing

Tests are auto-discovered and run:

```javascript
// src//components/atoms/button/button.test.js
export const test = () => {
    const actual = button({ type: 'submit', slot: 'Click' });
    const expected = '<button type="submit" class="btn">Click</button>';
    return actual === expected? true : console.error({actual, expected}) || false;
};
```

Run all tests:
```bash
node src/components/utils/tester.js
```

## API Reference

### Core Components

#### Atoms
- **button** - `{ type, slot, className, attrs }`
- **link** - `{ url, slot, className, attrs }`
- **text** - `{ is, slot, className, attrs }`
- **image** - `{ src, className, attrs }`
- **input** - `{ type, className, attrs }`
- **textarea** - `{ className, attrs }`
- **box** - `{ is, slot, className, attrs }`
- **accordion** - `{ titleSlot, detailsSlot, className, attrs }`
- **divider** - `{ className, attrs }`
- **video** - `{ src, slot, className, attrs }`
- **picture** - `{ slot, className, attrs }`

#### Molecules
- **card** - `{ slot, headerSlot, mediaSlot, linkSlot, contentSlot, className, attrs }`

#### Organisms
- **header** - `{ slot, className, attrs }`
- **footer** - `{ slot, className, attrs }`
- **hero** - `{ slot, className, attrs }`
- **cta** - `{ slot, className, attrs }`

### Functions

#### compose(components)
Recursively composes component tree into HTML.

```javascript
const html = compose([
    { type: 'atom', name: 'text', props: { is: 'p', slot: 'Hello' } }
]);
// Returns: '<p class="text">Hello</p>'
```

#### renderPage(content, meta)
Wraps composed HTML in full page template.

```javascript
const html = renderPage(content, { title: 'My Page' });
```

#### router(url, routes)
Matches URL to route and returns route info.

```javascript
const route = router(new URL('http://localhost/'), routes);
// Returns: { params, query, meta, components, ... }
```

## Advanced Usage

### Custom Styling

Since there's no CSS, add styles via attrs or className class names ( you will need the global stylesheet. See next):

```javascript
button({
    slot: 'Styled Button',
    attrs: 'style="background: blue; color: white; padding: 10px;"',
    className: 'btn-blue'
})
```

Or include a global stylesheet:

```javascript
// In renderPage, add to <head>
<link rel="stylesheet" href="/styles.css">
```

### Conditional Rendering

Use JavaScript to conditionally build components:

```javascript
const components = [
    showHeader && {
        type: 'organism',
        name: 'header',
        props: { slot: [...] }
    },
    {
        type: 'atom',
        name: 'text',
        props: { is: 'p', slot: content }
    }
].filter(Boolean); // Remove falsy values

const html = compose(components);
```

## Roadmap

- [ ] Develop better routing and dynamic routes
- [ ] Client-side interactivity (tabs, modals, etc)
- [ ] ISR (Incremental Static Regeneration)
- [ ] Plugin system
- [ ] Middleware support
- [ ] CLI tool with scaffolding
- [ ] Develop a component viewer (storybook-like) integration

## License

MIT - See LICENSE file

## Contributing

Contributions welcome! Please ensure:
- All tests pass: `node src/components/utils/tester.js`
- New components follow the pattern
- JSDoc comments included

## Known Issues (v1)
- Some tests are not great. We will leverage node:test in upcoming versions.
- Some components have many individual props (refactoring to attrs object)
- Component generator has an issue where componentName and componentType are being replace several times. It will be addresses.
- Dynamic generated routes are still cooked. 

We're aware of these and they'll be addressed in the next release.


## Before we wrap up. 
This is just an attempt to do something different. I am not replacing anything I am just proposing another way. I think we have for quite some time overengineered solutions that give us more headaches than anything else. We need to question our choices and ask ourselves: "Is this really worth it"?

Obviously contributions are welcome. If you think that you have a better approach propose it but remember this has 0 dependencies, and its core feature is that is easy to understand. 

If you are reading at this point I really appreciate it. 
If you think this is useful let me know. 
If you learn a thing or two with this, let me also know. 

Let's make this something useful for everyone.


Many Thanks!
Iggy
