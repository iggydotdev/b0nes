# b0nes Framework - Replit Setup

## Overview
This is the **b0nes Framework**, a zero-dependency component library and SSR/SSG framework built with pure JavaScript. It emphasizes simplicity, composition-first architecture, and requires no build tools for development.

**Key Features:**
- Pure JavaScript with zero npm dependencies
- Server-Side Rendering (SSR) and Static Site Generation (SSG)
- Atomic Design System (atoms → molecules → organisms)
- Built-in component composition engine
- No TypeScript, no frameworks - just functions and JSDoc

## Project Status
✅ **Ready to use** - The project has been successfully set up for the Replit environment.

## Recent Changes (October 24, 2025)
- Installed Node.js v24 (required by the project)
- Updated server to bind to `0.0.0.0:5000` for Replit compatibility
- Configured development workflow with hot reload
- Set up deployment configuration for production
- Added Node.js specific entries to .gitignore
- **NEW:** Added client-side interactivity system (b0nes.js runtime)
- **NEW:** Created interactive components: tabs, modal, dropdown
- **NEW:** Added demo page at `/demo` showcasing interactive components

## Project Architecture

### Directory Structure
```
b0nes/
├── src/
│   ├── components/           # Component Library
│   │   ├── atoms/           # Basic elements (button, link, text, dropdown, etc)
│   │   ├── molecules/       # Combinations (card, tabs, modal, etc)
│   │   ├── organisms/       # Sections (header, footer, hero, etc)
│   │   └── utils/           # Component utilities and generators
│   └── framework/           # Framework Core
│       ├── client/          # Client-side interactivity
│       │   └── b0nes.js     # Runtime with component behaviors
│       ├── compose.js       # Component composition engine
│       ├── renderPage.js    # HTML template renderer
│       ├── router.js        # URL routing
│       ├── routes.js        # Route definitions
│       ├── pages/           # Page templates (home, demo, blog)
│       └── utils/build/     # Static site generation
├── package.json             # Project configuration (no dependencies!)
└── README.md               # Comprehensive documentation
```

### How It Works
1. **Pages** are defined as arrays of component configurations in `src/framework/pages/`
2. **Routes** map URLs to pages in `src/framework/routes.js`
3. **Components** are composed recursively using the `compose()` function
4. **Server** renders HTML on-demand for SSR or generates static files for SSG
5. **Client-side runtime** (optional) adds interactivity via `b0nes.js`

## Client-Side Interactivity

The framework now includes a **zero-dependency client-side runtime** that adds interactivity to server-rendered components using a jQuery-style window singleton pattern.

### The b0nes.js Runtime

The runtime provides a global `window.b0nes` object with:
- **Component registry**: Register behaviors for interactive components
- **Auto-initialization**: Automatically discovers and enhances components on page load
- **Event delegation**: Efficient event handling
- **Progressive enhancement**: Works without JavaScript, better with it

### Interactive Components

**Tabs** - Tabbed interface with keyboard navigation
```javascript
{
    type: 'molecule',
    name: 'tabs',
    props: {
        tabs: [
            { label: 'Tab 1', content: '<p>Content 1</p>' },
            { label: 'Tab 2', content: '<p>Content 2</p>' }
        ]
    }
}
```

**Modal** - Overlay dialog with focus management
```javascript
// Modal component
{
    type: 'molecule',
    name: 'modal',
    props: {
        id: 'my-modal',
        title: 'Title',
        slot: '<p>Content</p>'
    }
}

// Trigger button
{
    type: 'atom',
    name: 'button',
    props: {
        attrs: 'data-modal-open="my-modal"',
        slot: 'Open Modal'
    }
}
```

**Dropdown** - Click-to-toggle menu with outside-click detection
```javascript
{
    type: 'atom',
    name: 'dropdown',
    props: {
        trigger: 'Menu',
        slot: '<a href="#">Item 1</a><a href="#">Item 2</a>'
    }
}
```

### Demo Page

Visit `/demo` to see all interactive components in action with examples and usage patterns.

### How It Works

1. **Server renders** components with `data-b0nes` attributes
2. **Client loads** the `/b0nes.js` script (auto-included by default)
3. **Runtime discovers** components via `querySelectorAll('[data-b0nes]')`
4. **Behaviors attach** event listeners and add interactivity
5. **Progressive enhancement**: If JS fails, HTML still works

### Opting Out

To disable client-side interactivity for a specific page:
```javascript
// In routes.js
meta: { 
    title: 'My Page',
    interactive: false  // Don't load b0nes.js
}
```

## Development

### Running the Dev Server
The development server is already running with hot reload enabled. It automatically restarts when you make changes to files.

**Access your site:** Click the webview preview in Replit

**Server details:**
- Port: 5000 (required for Replit)
- Host: 0.0.0.0 (configured for Replit's proxy)
- Command: `npm run dev:watch`

### Available Commands
```bash
# Development with hot reload (currently running)
npm run dev:watch

# Development without hot reload
npm run dev

# Build static site
npm run build

# Run component tests
npm run test

# Generate new component
npm run generate [atom|molecule|organism] [component-name]
```

### Creating Components
Generate a new component using the built-in generator:

```bash
npm run generate atom badge        # Creates atom component
npm run generate molecule card     # Creates molecule component
npm run generate organism navbar   # Creates organism component
```

This creates:
- `index.js` - Component exports
- `[name].js` - Component implementation
- `[name].test.js` - Unit tests

### Adding New Pages
1. Create a new page file in `src/framework/pages/`
2. Export a `components` array with your page structure
3. Add a route in `src/framework/routes.js`
4. The page will be automatically available

Example:
```javascript
// src/framework/pages/about.js
export const components = [
    {
        type: 'organism',
        name: 'header',
        props: { slot: [...] }
    },
    {
        type: 'atom',
        name: 'text',
        props: { is: 'h1', slot: 'About Us' }
    }
];
```

## Deployment

### Production Deployment
This project is configured for Replit's autoscale deployment, which is perfect for server-rendered applications.

**To publish:**
1. Click the "Deploy" button in Replit
2. The application will automatically:
   - Use the production-ready server
   - Scale based on demand
   - Serve your SSR application

**Deployment configuration:**
- Target: Autoscale (optimized for web apps)
- Command: `npm run dev`
- Port: 5000

### Static Site Generation (Alternative)
If you prefer to deploy as a static site:

```bash
# Generate static files
npm run build

# Output will be in public/ directory
# Deploy the public/ folder to any static host:
# - Netlify
# - Vercel
# - GitHub Pages
# - Cloudflare Pages
```

## Component System

### Component Types
- **Atoms**: Basic HTML elements (button, link, text, input, etc.)
- **Molecules**: Combinations of atoms (card, form groups, etc.)
- **Organisms**: Page sections (header, footer, hero, CTA, etc.)

### Component Props API
All components support:
- `attrs` - Raw HTML attributes (string)
- `className` - CSS classes (string)
- `slot` - Content (string or nested components array)

### Example Usage
```javascript
// Single component
{
    type: 'atom',
    name: 'button',
    props: {
        type: 'submit',
        slot: 'Click Me',
        className: 'primary'
    }
}

// Nested components
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

## Technical Notes

### Why No Dependencies?
This framework is intentionally built with zero dependencies to:
- Minimize complexity and maintenance burden
- Ensure long-term stability (no breaking changes from deps)
- Make the codebase easy to understand and modify
- Reduce bundle size and deployment time

### Node.js Version
Requires Node.js v24+ due to the use of modern JavaScript features like `URLPattern` from `node:url`.

### Performance
- **Development**: Hot reload with `--watch` flag
- **Production**: Pure HTML output, zero client-side JavaScript
- **Build time**: Extremely fast (seconds, not minutes)

## Learning Resources

See the comprehensive README.md for:
- Complete API reference
- Step-by-step tutorials
- Real-world examples
- Component composition patterns
- Advanced usage guides

## Architecture Decisions

### SSR vs SSG
The framework supports both:
- **SSR (default)**: Server renders HTML on each request
- **SSG**: Pre-render all pages to static HTML files

Choose based on your needs:
- Use SSR for dynamic content or when SEO + speed isn't critical
- Use SSG for static sites, blogs, documentation (maximum performance)

### Routing
Uses Node.js built-in `URLPattern` API for route matching. Supports:
- Static routes: `/about`, `/contact`
- Dynamic routes: `/blog/:postid`
- External data fetching per route

### Component Composition
Pure function-based composition - components are just functions that return HTML strings. The `compose()` function recursively processes nested component trees.

## Known Issues (from upstream)
- Some tests need improvement (will use node:test in future versions)
- Component generator has minor templating issues
- Dynamic route generation is experimental

These are upstream issues from the original project and will be addressed by the maintainer.

## Support & Resources
- Original Repository: https://github.com/iggydotdev/b0nes
- Author: Ignacio Garcia Villanueva
- License: MIT
