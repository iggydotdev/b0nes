# b0nes Framework - Development Guide for AI Agents and Contributors

> Zero dependencies. Node.js + JavaScript only. JSDoc for type safety.
> This document is the single source of truth for how to develop, test, build, and ship b0nes.

---

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Critical Rules](#critical-rules)
3. [Build Pipeline - How It Works](#build-pipeline---how-it-works)
4. [Known Issues and Solutions](#known-issues-and-solutions)
5. [Testing Strategy](#testing-strategy)
6. [Adding New Features](#adding-new-features)
7. [Improvement Roadmap](#improvement-roadmap)

---

## Project Architecture

```
src/
  framework/
    build/
      cli.js              # CLI entry point (build, dev, clean commands)
      pipeline/
        ssg.js             # Main SSG build orchestrator (8 steps)
        generateRoute.js   # Renders a single route to HTML
        colocatedAssets.js  # Copies CSS/images from page directories
        copyFrameworkRuntime.js  # Copies client JS to output
        copyComponentBehaviors.js # Copies component client.js files
        bundle.js          # Production page-level bundling
        compileTemplates.js # SPA template compilation
        ssrFallback.js     # Generates fallback pages for SSR routes
        buildPathName.js   # Resolves dynamic route params to paths
        generateMetaTags.js # HTML meta tag generation
        generateStylesheetTag.js # Stylesheet link tag generation
    core/
      compose.js           # THE core function - composes component trees to HTML
      render.js            # Wraps composed HTML into full page document
      router/
        index.js           # URLPattern-based routing
        groups.js           # Route grouping
      compose_utils/
        safeRenderComponent.js  # Error boundary for component rendering
        errorFallbackRenderer.js # Dev/prod error display
        errorTracker.js     # Error collection (closure-based)
        createRenderCache.js # LRU cache for rendered components
        validateComponent.js # Component schema validation
    server/
      index.js             # Dev server (Node http module)
      handlers/
        autoRoutes.js       # File-system route discovery
        servePages.js       # SSR page handler
        staticFiles.js      # Static file serving
        resolveAssetPath.js # Relative-to-absolute path resolution
        serveB0nes.js       # Framework runtime serving
        serveBehaviorFiles.js
        serveRuntimeFiles.js
        serveTemplates.js
        getServerConfig.js
    client/
      b0nes.js             # Browser runtime (progressive enhancement)
      compose.js           # Client-side composition
      fsm.js               # Finite state machine (SPA routing, forms)
      store.js             # Redux-style state store
    shared/
      assetPath.js          # Dev/prod asset path resolution
      registry.js           # Component registry
      mapper.js             # Component type/name mapping
      urlPattern.js         # URLPattern polyfill/utilities
      tryResolveFile.js     # File resolution with fallbacks
      sanitizePaths.js      # Path security
      getContentType.js     # MIME type detection
      export.js             # Module export utilities
      download.js           # File download utilities
    config/
      envs.js               # Environment detection (isDev, isProd)
      stylesheets.js        # Global stylesheet config
  components/
    atoms/       # Smallest units (button, text, input, image, etc.)
    molecules/   # Composed atoms (card, dropdown, modal, tabs)
    organisms/   # Full sections (header, footer, hero, cta, slides)
    utils/       # Component helpers (validateProps, escapeHtml, etc.)
  pages/         # File-system routed pages
  styles/        # Global stylesheets
```

### Key Concepts

- **Composition over inheritance**: Components are pure functions that return HTML strings
- **Component format**: `{ type: 'atom', name: 'button', props: { slot: 'Click me' } }`
- **Slot pattern**: `props.slot` is the child content (string, array, or nested components)
- **Progressive enhancement**: HTML renders server-side, `data-b0nes-*` attributes enable client behavior
- **Hybrid rendering**: Routes can be SSG (static) or SSR (dynamic) based on `meta.render` or component type

---

## Critical Rules

These are non-negotiable constraints. Violating them breaks the framework's identity.

1. **ZERO npm dependencies.** Everything uses Node.js built-in modules only.
2. **No TypeScript files.** Use JSDoc annotations (`@param`, `@returns`, `@typedef`) for IDE type safety.
3. **Components are pure functions.** `(props) => string`. No classes, no `this`, no side effects.
4. **No build tool chain.** No webpack, no esbuild, no vite. The build pipeline IS the framework.
5. **Tests use `node:test` and `node:assert`.** No Jest, no Vitest, no Mocha.
6. **ESM only.** All files use `import`/`export`. No CommonJS `require()`.

---

## Build Pipeline - How It Works

The build runs through `ssg.js` in 8 sequential steps:

```
Step 1: Clean output directory (if --clean flag)
Step 2: Create output directory
Step 3: Compile SPA templates (recursively finds /templates/ dirs)
Step 4: Discover routes via file-system (autoRoutes.js)
Step 5: Build each route (sequential or parallel via worker_threads)
  - For each route:
    a. Load the page module
    b. Copy co-located assets (CSS, images in same dir as page)
    c. Determine SSG vs SSR
    d. Compose components to HTML
    e. Optionally create production bundle
    f. Generate HTML file via generateRoute()
Step 6: Copy framework runtime (client/, shared/ -> assets/js/)
Step 7: Copy component client behaviors (*.js -> assets/js/behaviors/)
Step 8: Generate SSR fallback pages for dynamic routes
```

### Build Commands

```bash
npm run build                    # Standard build
npm run build:verbose            # With detailed logging
npm run build:clean              # Clean + parallel build
node src/framework/build/cli.js build --production  # With bundling
```

---

## Known Issues and Solutions

### ISSUE 1: Co-located Assets Not Copying Correctly

**Symptom**: CSS/images placed next to page files (e.g., `src/pages/blog/styles.css`) don't appear in the build output.

**Root Cause**: `colocatedAssets.js` relies on `route.filePath` being set by `autoRoutes.js`. If the route discovery doesn't attach `filePath`, assets are silently skipped.

**Where to fix**: `src/framework/server/handlers/autoRoutes.js` - Ensure every discovered route object includes a `filePath` property pointing to the source page file.

**Verification**: After a build, check that `public/<route-path>/` contains the co-located files. Run with `--verbose` to see `Copied asset:` messages.

**Current ignore patterns** (in `colocatedAssets.js`):
- `index.js`, `page.js`, `[*.js`, `*.test.js`, `*.spec.js`

**Allowed extensions**:
- `.css`, `.js`, `.json`, `.svg`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.woff`, `.woff2`, `.ttf`, `.eot`

**If adding new asset types**: Update the `allowedExtensions` array in `copyColocatedAssets()`.

### ISSUE 2: Asset Paths Break Between Dev and Prod

**Symptom**: Stylesheets or scripts work in dev but 404 in production builds (or vice versa).

**Root Cause**: Dev serves files from source locations (`/client/b0nes.js`), prod serves from `/assets/js/client/b0nes.js`. The `assetPath.js` module handles this mapping, but page-level relative paths (like `./custom.css`) need `resolveAssetPath.js` to resolve against `meta.currentPath`.

**Where to fix**:
- `src/framework/shared/assetPath.js` - Global dev/prod path mapping
- `src/framework/server/handlers/resolveAssetPath.js` - Relative path resolution
- `src/framework/build/pipeline/generateRoute.js` - Passes `currentPath` to meta

**Key insight**: `generateRoute.js` sets `meta.currentPath` to the route pathname. This gets passed to `renderPage()` which uses it to resolve relative stylesheet and script paths. If `currentPath` is wrong or missing, relative assets break.

### ISSUE 3: copyComponentBehaviors Copies Too Much

**Symptom**: Build output contains test files, index.js component files, and other non-client files in `assets/js/behaviors/`.

**Root Cause**: `copyComponentBehaviors.js` copies ALL `.js` files from the components directory, not just `client.js` files. The `findClientFiles` function checks for `.js` extension but the comment says ".client.js files".

**Where to fix**: `src/framework/build/pipeline/copyComponentBehaviors.js` - Change the filter in `findClientFiles` to only match `client.js` files:

```javascript
// CURRENT (copies everything):
} else if (file.name.endsWith('.js')) {

// SHOULD BE (copies only client behaviors):
} else if (file.name === 'client.js') {
```

### ISSUE 4: Production Bundle Transform Is Fragile

**Symptom**: Bundled components don't initialize because the `export` keyword wasn't stripped correctly.

**Root Cause**: `bundle.js` does a simple string replace of `export const client =` and `export default client`. If a component uses a different export pattern (named export, re-export, etc.), the transform fails silently.

**Where to fix**: `src/framework/build/pipeline/bundle.js` - The transform logic needs to handle more export patterns or enforce a single export convention in component `client.js` files.

### ISSUE 5: Build Cache Hash Is Weak

**Symptom**: Changes to components don't trigger rebuilds because the cache thinks the route hasn't changed.

**Root Cause**: `ssg.js` `hashRoute()` hashes the route pattern and the `load` function's `.toString()`. It does NOT hash the actual file contents of the page or its component dependencies. So if you change a component used by a page, the page isn't rebuilt.

**Where to fix**: `ssg.js` `hashRoute()` should read and hash the actual page file contents (via `route.filePath`) and ideally its component imports too.

---

## Testing Strategy

### Current State

- **24 test files** exist (23 component tests + 1 compose test)
- Tests use `node:test` (built-in) and `node:assert`
- Run with: `npm test` (executes `node --test 'src/**/*.test.js'`)
- Pattern: Import the component function, call it with props, assert HTML output

### What Has Tests

| Module | Has Tests |
|--------|-----------|
| atoms (14 components) | Yes - all 14 |
| molecules (4 components) | Yes - all 4 |
| organisms (5 components) | Yes - all 5 |
| compose.js | Yes - 6 tests |
| **Everything below: NO** | |
| createRenderCache.js | NO |
| errorTracker.js | NO |
| safeRenderComponent.js | NO |
| errorFallbackRenderer.js | NO |
| validateComponent.js | NO |
| assetPath.js | NO |
| resolveAssetPath.js | NO |
| buildPathName.js | NO |
| generateRoute.js | NO |
| colocatedAssets.js | NO |
| copyFrameworkRuntime.js | NO |
| copyComponentBehaviors.js | NO |
| bundle.js | NO |
| ssg.js | NO |
| render.js | NO |
| fsm.js | NO |
| store.js | NO |
| router/index.js | NO |
| sanitizePaths.js | NO |
| mapper.js | NO |
| registry.js | NO |

### Priority Test Additions (ordered by risk of breakage)

**Tier 1 - Pure functions, easy to test, high breakage risk:**

1. `createRenderCache.js` - LRU cache logic, eviction, hit/miss tracking
2. `errorTracker.js` - Error collection, max limit, filtering
3. `resolveAssetPath.js` - Path resolution (THE source of asset bugs)
4. `assetPath.js` - Dev/prod path mapping
5. `buildPathName.js` - Dynamic route param substitution
6. `validateComponent.js` - Component schema validation
7. `sanitizePaths.js` - Security-critical path sanitization
8. `registry.js` - Component registration and lookup

**Tier 2 - More complex, need filesystem mocking:**

9. `generateRoute.js` - Route-to-HTML generation
10. `colocatedAssets.js` - Asset copying logic
11. `render.js` - Full page HTML generation
12. `bundle.js` - Production bundling

**Tier 3 - Client-side, need browser-like env or careful isolation:**

13. `fsm.js` - State machine transitions, guards, history
14. `store.js` - State management, subscriptions

### Test File Convention

Every test file lives next to its source:
```
src/framework/core/compose_utils/createRenderCache.js
src/framework/core/compose_utils/createRenderCache.test.js
```

### Test Template

```javascript
import test from 'node:test';
import assert from 'node:assert';
import { functionUnderTest } from './moduleUnderTest.js';

test('functionUnderTest - describes expected behavior', () => {
    const result = functionUnderTest(input);
    assert.strictEqual(result, expected);
});

test('functionUnderTest - handles edge case', () => {
    const result = functionUnderTest(null);
    assert.strictEqual(result, fallbackValue);
});

test('functionUnderTest - throws on invalid input', () => {
    assert.throws(() => functionUnderTest(invalid), {
        message: /expected error pattern/
    });
});
```

---

## Adding New Features

### Adding a New Component

```bash
npm run generate atom badge    # Creates src/components/atoms/badge/
```

This generates:
- `index.js` - Component function
- `client.js` - Client-side behavior (optional)
- `badge.test.js` - Test file

Component function signature:
```javascript
/**
 * @param {Object} props
 * @param {string} props.slot - Child content
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.attrs] - Additional HTML attributes
 * @returns {string} HTML string
 */
const badge = (props = {}) => {
    const { slot = '', className = '', attrs = '' } = props;
    return `<span class="badge ${className}" ${attrs}>${slot}</span>`;
};
export default badge;
```

### Adding a New Build Pipeline Step

1. Create the step in `src/framework/build/pipeline/yourStep.js`
2. Export a function: `export async function yourStep(outputDir, options) {}`
3. Import it in `ssg.js`
4. Add it between the existing steps (maintain the numbered step comments)
5. Write tests for the step function in isolation

### Adding a New Server Handler

1. Create handler in `src/framework/server/handlers/yourHandler.js`
2. Export a function that takes `(req, res, config)` and returns `boolean` (handled or not)
3. Import and add to the handler chain in `server/index.js`

---

## Improvement Roadmap

### Phase 1: Stability (Current Priority)

- [ ] Fix `copyComponentBehaviors.js` to only copy `client.js` files (not all JS)
- [ ] Fix `hashRoute()` in `ssg.js` to hash actual file contents, not function toString
- [ ] Add Tier 1 unit tests (8 test files for pure utility functions)
- [ ] Fix CLI default port from 5000 to 3000 (already done on framework-review branch)
- [ ] Add `EADDRINUSE` error recovery to dev server (already done on framework-review branch)

### Phase 2: Developer Experience

- [ ] Add `--watch` flag to build CLI for incremental rebuilds
- [ ] Improve error messages with actionable hints (e.g., "Did you forget to export components?")
- [ ] Add `npm run build:check` command that validates all routes without generating HTML
- [ ] Add source maps for production bundles

### Phase 3: Production Readiness

- [ ] Harden bundle.js export transforms (support all export patterns or enforce convention)
- [ ] Add content hashing to asset filenames for cache busting (instead of `?v=` query param)
- [ ] Add HTML minification option for production builds
- [ ] Add CSS inlining for critical path styles
- [ ] Add Tier 2 tests (filesystem-dependent build pipeline tests)

### Phase 4: Feature Parity

- [ ] API routes (simple HTTP handlers in a `routes/` directory)
- [ ] Middleware system (auth, logging, rate limiting)
- [ ] Image optimization (responsive images, WebP conversion)
- [ ] Plugin system (allow community extensions)

---

## Common Patterns for AI Agents

### When asked to fix a build issue:
1. Check `ssg.js` build steps 1-8 for the failing step
2. Run with `--verbose` to see detailed output
3. Check if `route.filePath` is populated (common source of silent failures)
4. Check asset path resolution chain: `assetPath.js` -> `resolveAssetPath.js` -> `render.js`

### When asked to add a component:
1. Use the generator: `npm run generate <type> <name>`
2. Follow the existing pattern in the same component tier
3. Write tests that assert the HTML output string
4. If the component has client behavior, export a `client` object from `client.js`

### When asked to debug asset issues:
1. Check if the asset is co-located (same directory as page file)
2. Check if the extension is in `allowedExtensions`
3. Check if the route has `filePath` set
4. Check if `meta.currentPath` is being passed through `generateRoute.js`
5. Compare dev paths (`/client/...`) vs prod paths (`/assets/js/client/...`)

### When asked to modify the build:
1. Never modify steps 1-2 (directory setup) without good reason
2. Steps 3-5 are the core content generation
3. Steps 6-7 are asset copying (most common source of bugs)
4. Step 8 is SSR fallback (only matters for dynamic routes)
5. Always test with both `npm run build` and `npm run build -- --production`
