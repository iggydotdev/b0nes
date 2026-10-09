# Page recipes

The CLI creates a minimal working page. Full starter templates are intentionally
not bundled. Run `npx b0nes my-site --skip-git`, then `cd my-site` and `npm run dev`.
There is no dependency installation step. `npm test` checks the generated home
page; `npm run build:production` creates a clean static build and `npm run preview`
serves it using Node alone.

## Static page

Create `src/pages/about/index.js`:

```js
export const meta = { title: 'About', interactive: false };
export const components = [
  { type: 'atom', name: 'text', props: { is: 'h1', slot: 'About us' } },
  { type: 'atom', name: 'text', props: { is: 'p', slot: 'Small pages, plain JavaScript.' } }
];
```

## Blog or documentation pages

Create one directory per article, such as `src/pages/blog/first-post/index.js`.
Export `meta` and `components` as above. For data-driven routes, create
`src/pages/blog/[slug]/index.js`:

```js
export const meta = { title: 'Blog', render: 'ssg' };
export async function externalData() {
  return [{ slug: 'hello', title: 'Hello', body: 'My first post.' }];
}
export const components = post => [
  { type: 'atom', name: 'text', props: { is: 'h1', slot: post.title } },
  { type: 'atom', name: 'text', props: { is: 'p', slot: post.body } }
];
```

Each returned record supplies the dynamic path parameter. Text stays escaped.
An empty array is valid: a successful rebuild removes the route's old generated
pages. Duplicate records that generate the same URL, or URLs overlapping another
static/dynamic page, fail the build and keep the previous output. Static routes
take precedence when matching requests; equivalent parameter patterns are rejected.
Keep shared navigation/layout descriptors in an imported module, and reuse them
in page arrays. Put `style.css` alongside a page and include it through
`meta.stylesheets: ['./style.css']`.

## Interactive content

```js
export const components = [{ type: 'molecule', name: 'tabs', props: {
  tabs: [{ label: 'Overview', content: 'Introduction' },
         { label: 'Details', content: 'More information' }]
} }];
```

Tabs remain readable without JavaScript. Modal dialogs and other interactive
widgets require JavaScript; offer a normal link or visible content when users
need an alternative. The framework does not guarantee WCAG conformance for an
application: test its actual content, styles, keyboard flow, and assistive technology.
See [HTML and migration](HTML.md) for nesting components and intentional scripts.

## Native forms

The built-in three-step form accepts a normal submission endpoint:

```js
export const components = [{ type: 'organism', name: 'multi-step-form', props: {
  action: '/contact', method: 'post'
} }];
```

Provide a server handler for `/contact` that processes the submitted `name`,
`email`, and optional `age` fields. Without JavaScript every labelled field and
the native submit/reset buttons remain available. Enhancement hides later steps,
validates before advancing, moves focus, and announces the current step. Valid
submissions remain native form submissions; this component does not create a
server endpoint or display a simulated success response. Each instance owns its
state, and destroying its behavior restores the readable native form.


## SPA navigation

Keep SPA configuration in your page's browser script. For example,
`src/pages/app/index.js` can export:

```js
export const meta = { title: 'App', scripts: ['./spa-config.js'] };
export const components = [
  { type: 'organism', name: 'spa', props: { slot: 'App content is available here.' } }
];
```

Create `src/pages/app/spa-config.js` and set the configuration before the runtime
initializes the SPA. Avoid awaiting asynchronous work before this assignment:

```js
window.spaConfig = {
  routes: [
    {
      name: 'home', url: '/app',
      template: '<h2>Home</h2><a href="/app/details" data-fsm-event="GOTO_DETAILS">Details</a>'
    },
    {
      name: 'details', url: '/app/details',
      template: [
        { type: 'atom', name: 'text', props: { is: 'h2', slot: 'Details' } },
        { type: 'atom', name: 'link', props: { url: '/app', slot: 'Home',
            attrs: { 'data-fsm-event': 'GOTO_HOME' } } }
      ]
    }
  ]
};
```

Route templates accept compiled HTML strings, component descriptors, or functions
returning either (including async functions). Whole HTML strings are trusted
compiled markup; use component props for user text so it is escaped. Dynamic URL
parameters such as `/app/:id` reach template functions through their context;
triggers pass parameters with `data-param-id` or a JSON `data-fsm-data` attribute.
Back and forward navigation restores the matching route and its parameters.
Provide server pages or an appropriate hosting fallback for URLs users can open
directly, and include readable initial content for users without JavaScript.

An optional `store` refreshes function templates after changes; static templates
update their `data-b0nes-bind` properties without rebuilding the view. Bindings
support text (`textContent`, `innerText`, `value`, `title`, `className`,
`placeholder`, `alt`, `ariaLabel`, `ariaDescription`) and boolean properties
(`checked`, `disabled`, `selected`, `hidden`, `multiple`, `readOnly`, `required`,
`open`). `href` and `src` bindings reject executable URL schemes; HTML properties
such as `innerHTML` and `srcdoc` and event-handler properties are unsupported.
Entry-hook context updates supply the template data and navigation URL. Replaced
views dispose their previous behaviors and initialize newly rendered components.
`onInit({ fsm, store, root })` exposes the router for custom controls. Destroying
the SPA through `window.b0nes.destroy(root)` removes its listeners and subscriptions.
For direct `connectFSMtoDOM()` use, call the returned cleanup function to detach,
or its `render()` method to refresh the current template without changing history.
