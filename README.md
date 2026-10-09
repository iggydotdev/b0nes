# b0nes

[![npm version](https://badge.fury.io/js/b0nes.svg)](https://www.npmjs.com/package/b0nes)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org/)

b0nes is a JavaScript component library and Node.js framework for server rendering
and static sites. The framework, CLI, tests, and browser runtime have **zero npm
dependencies**. They use Node built-ins and native browser ES modules.

Scaffolding copies the framework into your project: you own and can edit the code.
The npm package also exposes rendering helpers for library use. Components are
organized as atoms, molecules, and organisms; pages compose them through ordinary
JavaScript functions or descriptors.

## Quick start

Use Node.js 22 or newer:

```sh
npx b0nes my-site
cd my-site
npm run dev
```

Open **http://localhost:3000**. No dependency installation step is required in the
generated project. Add `--skip-git` to the create command to skip Git initialization.

```sh
npm test
npm run build
npm run preview
```

The build writes `public/`; preview serves it on port 3000 using Node alone.
Stop the development server before starting preview on the same port.
For a clean production build, use `npm run build:production`.

The scaffold is deliberately small. Larger starter templates have been replaced
with [page recipes](docs/RECIPES.md).

## Project layout

```text
src/
  pages/          # Your routes and co-located assets
  components/     # Component renderers, category registries, and utilities
  framework/      # Server, build pipeline, browser runtime, and core rendering
  scripts/        # Component installer
  mcp/            # MCP server and tools
docs/
  HTML.md         # Text, explicit HTML, and migration notes
  RECIPES.md      # Page and interaction examples
public/           # Generated output and optional user-managed assets
.b0nes/           # Upgrade manifest, checksums, and backups
```

Generated projects use imports from these directories. They do not have a
`src/index.js` entry point.

## Pages and routing

Create `src/pages/index.js`:

```js
import { text, button } from '../components/atoms/index.js';
import { html } from '../components/utils/index.js';

export const meta = { title: 'Home', description: 'My b0nes site' };

export const components = [
  text({ is: 'h1', slot: 'Hello & welcome' }),
  button({ slot: text({ is: 'strong', slot: 'Save & continue' }) }),
  html('<aside>Developer-authored markup</aside>')
];
```

Descriptors are an alternative to direct component calls:

```js
export const components = [
  { type: 'atom', name: 'text', props: { is: 'h1', slot: 'Hello & welcome' } },
  { type: 'molecule', name: 'card', props: { slot: 'Card content' } }
];
```

| Page module | URL |
| --- | --- |
| `src/pages/index.js` | `/` |
| `src/pages/about/index.js` | `/about` |
| `src/pages/posts/[slug]/index.js` | `/posts/:slug` |
| `src/pages/posts/[slug].js` | `/posts/:slug` |

Static routes take precedence over dynamic ones, and earlier literal path segments
take precedence over parameters. Equivalent parameter patterns, such as
`/posts/:id` and `/posts/:slug`, are rejected. Files such as `about.js` are
helpers or assets; use `about/index.js` for a static page.

### Static generation and server rendering

Arrays of components are static by default. A component function renders on the
Node server by default; on a dynamic route, an `externalData()` function instead
enumerates records for static generation. Set `meta.render: 'ssr'` to explicitly
require server rendering.

For example, create `src/pages/posts/[slug]/index.js`:

```js
export const meta = { title: 'Posts', render: 'ssg', interactive: false };

export async function externalData() {
  return [
    { slug: 'hello', title: 'Hello' },
    { slug: 'world', title: 'World' }
  ];
}

export const components = post => [
  { type: 'atom', name: 'text', props: { is: 'h1', slot: post.title } }
];
```

This generates `public/posts/hello/index.html` and
`public/posts/world/index.html`. Each record must supply the dynamic parameters.
An empty array is valid and removes previously generated pages for that route
after a successful rebuild. Duplicate generated destinations fail the build,
including overlapping static/dynamic pages and repeated data records.

For runtime pages, export a function without static data enumeration:

```js
// src/pages/users/[id]/index.js
export const meta = { title: 'User', render: 'ssr' };

export const components = ({ id }) => [
  { type: 'atom', name: 'text', props: { is: 'h1', slot: `User ${id}` } }
];
```

Static preview serves generated files; it cannot execute SSR pages. Build first,
then run the Node production server for an application containing SSR routes:

```sh
npm run build:production
NODE_ENV=production node src/framework/server/index.js
```

### Build behavior

Builds render into a private staging directory. Route, template, runtime, or asset
failures preserve the previous output, including with `--clean`. Publish only
after a successful exit.

Successful rebuilds use `.b0nes-build-manifest.json` to remove obsolete generated
pages, assets, and runtime files. The normal CLI build preserves unmanaged files
you placed in `public/`. `--clean` also removes unmanaged output, after the new
build succeeds. Keep source assets elsewhere when using clean builds. An output
from an older version without a manifest needs one successful clean build to
discard its legacy files.

Missing page directories fail the build; an existing empty page directory is
valid. Concurrent builds targeting the same output are rejected. The output
promotion uses directory renames; it does not promise uninterrupted serving while
a build is promoted.

```sh
npm run build -- --verbose
npm run build -- --parallel --production
npm run build -- --output=dist
```

Production entries use native ES modules with imports preserved. They are not
minified bundles. Every route rebuilds; `--no-cache` remains a compatibility flag.
See [verification and build details](docs/VERIFICATION.md).

### Styles and scripts

Keep page assets beside the page module:

```js
export const meta = {
  title: 'App',
  stylesheets: ['./style.css'],
  scripts: ['./app.js']
};
```

Stylesheet entries create CSS links. Script entries create module scripts. Assets
can also live in `public/` and use absolute URLs such as `/styles/site.css`.
Co-located page assets are public; keep secrets and server-only data outside those
asset directories.

Set `meta.interactive: false` to omit the b0nes behavior runtime on a static page.
Your explicitly requested scripts still load.

## Text, HTML, and custom components

Plain strings in built-in component content are escaped. Rendered components can
be nested directly, including in arrays. `html()` accepts a string or an
already-rendered component and marks it as intentional HTML; **it is not a
sanitizer**. Do not pass user input to it.

Built-in direct calls return immutable `TrustedHTML` string objects. Use
`String(result)` or `toHTMLString(result)` at HTTP and file boundaries.
Concatenation and `.join()` lose the trust marker; preserve arrays of rendered
components when nesting. `compose()` returns a primitive HTML string.

Object attributes are escaped and reject executable URL schemes, inline event
handlers, and `srcdoc`. Legacy string attributes are trusted raw markup.

For a custom `src/components/molecules/notice/notice.js` renderer:

```js
import { defineComponent, processSlot, attrsToString } from '../../utils/index.js';

export const notice = defineComponent(({ slot, attrs = {} } = {}) =>
  `<section${attrsToString(attrs)}>${processSlot(slot)}</section>`,
  'molecule:notice'
);
```

`defineComponent()` marks output and tracks dependencies; your renderer remains
responsible for escaping its text and attributes. Generate the component first
to register it in the category barrel.

For intentional scripts, prefer `meta.scripts` or developer-authored
`meta.inlineScripts`. Inline scripts reject closing script tags. Use
`scriptData(value)` for JSON embedded in an HTML script element, then read it with
`textContent` and `JSON.parse`:

```js
import { html, scriptData } from '../components/utils/index.js';

const data = { message: 'Hello <world>' };
export const components = [
  html(`<script type="application/json" id="initial-data">${scriptData(data)}</script>`)
];
```

Raw HTML may contain intentional scripts; escaping does not sanitize trusted HTML,
CSS, or JavaScript. See [the HTML contract and migration notes](docs/HTML.md).

### Rendering as a library

Inside a scaffold, import the actual core files from a module in the project root:

```js
import { text } from './src/components/atoms/index.js';
import { compose } from './src/framework/core/compose.js';
import { renderPage } from './src/framework/core/render.js';

const body = compose([text({ is: 'h1', slot: 'Hello' })], { strict: true });
const page = renderPage(body, { title: 'Example', interactive: false });
```

For an application using the npm package directly, `npm install b0nes` exposes:

```js
import { text, html, compose, renderPage } from 'b0nes';
// Category exports are also available from b0nes/atoms,
// b0nes/molecules, b0nes/organisms, and b0nes/utils.
```

Core utilities have selected TypeScript declarations. Component prop declarations
are not a complete typed API.

## Browser behavior and native forms

The runtime initializes behaviors marked with `data-b0nes`. Custom behaviors use
qualified identifiers, for example
`window.b0nes.register('molecules:notice', behavior)`.
Dispose initialized behaviors with `window.b0nes.destroy(root)`.

Tabs remain readable without JavaScript. The multi-step form initially exposes
all labelled fields and native submit/reset controls:

```js
export const components = [
  { type: 'organism', name: 'multi-step-form', props: {
    action: '/contact', method: 'post'
  } }
];
```

Provide your own `/contact` handler for `name`, `email`, and optional `age`.
Enhancement adds steps, validation, focus movement, and status announcements;
valid submissions remain native form submissions. Destroying enhancement restores
the native form.

Modal dialogs, SPA navigation, and other JavaScript interactions need appropriate
fallback links or visible content. b0nes does not guarantee application-level
accessibility conformance; verify your content, styles, keyboard navigation, and
assistive technology behavior.

SPA routes accept compiled HTML, component descriptors, or template functions.
Set `window.spaConfig` in a page script before enhancement and provide real pages
or a hosting fallback for directly opened URLs. See [SPA recipes](docs/RECIPES.md#spa-navigation).

## Store and state machines

The store supports immutable state, actions, computed getters, filtered
subscriptions, middleware, and optional modules. From a module in the project root:

```js
import { createStore } from './src/framework/client/store.js';
import { createFSM } from './src/framework/client/fsm.js';

const store = createStore({
  state: { count: 0 },
  actions: {
    increment: state => ({ count: state.count + 1 })
  },
  getters: {
    doubled: state => state.count * 2
  }
});

const unsubscribe = store.subscribe(({ state }) => {
  console.log(state.count);
}, { path: 'count' });

await store.dispatch('increment');
console.log(store.computed('doubled')); // 2
unsubscribe();

const flow = createFSM({
  initial: 'editing',
  states: {
    editing: { on: { SUBMIT: 'submitted' } },
    submitted: { on: { EDIT: 'editing' } }
  }
});
flow.send('SUBMIT');
```

Browser page scripts can import `/assets/js/client/store.js` and
`/assets/js/client/fsm.js`. Synchronous actions return committed state immediately;
asynchronous actions return a promise. Custom middleware must return or await
`next()` before running effects that depend on committed state.

`connectStoreToFSM()` handles newly changed `fsmEvent` requests and synchronizes
transitions through your `fsm/setState` action. Use a fresh `{ event, data }`
request object to repeat an event. Unrelated updates, reset, time travel, and the
connection's own state synchronization do not replay a persistent request.

## Generate and install components

```sh
npm run generate -- atom notice
npm run generate -- molecule feature-card
```

The generator creates the renderer, index, and test, and updates the category
registry so descriptors can use the new component. Names use lowercase letters,
numbers, and hyphens.

Install a community component from an HTTP(S) manifest or directory URL:

```sh
npm run install-component -- https://example.com/components/notice/b0nes.manifest.json
npm run install-component -- https://example.com/components/notice/ --dry-run
```

Manifest file URLs resolve relative to the fetched manifest URL. Installations
validate downloaded modules and register the component. Existing components
require `--force` to replace. A dry run checks the manifest and local dependencies
without installing files. Installing loads downloaded JavaScript; use sources
you trust.

## MCP

The included MCP server exposes component discovery, rendering, generation, and
installation over stdio. Configure clients to invoke **Node directly**:

```json
{
  "mcpServers": {
    "b0nes": {
      "command": "node",
      "args": ["/absolute/path/to/my-site/src/mcp/server.js"],
      "cwd": "/absolute/path/to/my-site"
    }
  }
}
```

The working directory must be the project root. JSON-RPC responses use stdout;
diagnostics use stderr. Avoid launching the transport through `npm run mcp`,
because npm's script banners can contaminate stdout.

## Upgrades, checks, and releases

```sh
npx b0nes@latest upgrade --dry-run
npx b0nes@latest upgrade
```

Default upgrades update the framework and its required shared rendering utilities.
Stock component updates require `--components`. Local changes are checked against
recorded checksums; overwriting them requires `--force` and keeps the usual
backups. Your pages, public assets, and custom component folders are preserved.
See [the upgrade contract](docs/UPGRADE.md).

Run `npm test` in a generated project. From this repository, additional checks are:

```sh
npm test
npm run test:browser
npm run test:browser:ci
npm run test:integration:ci
```

Browser CI checks use an installed Chromium executable and Node built-ins, without
adding npm dependencies. See [verification recipes](docs/VERIFICATION.md).

b0nes stays in **0.x by design** as it evolves. Releases use minor or patch version
increments; major releases are outside the project's release policy. Review
[CHANGELOG.md](CHANGELOG.md) and the [release workflow](docs/RELEASING.md) when
upgrading or publishing.

[MIT license](LICENSE).