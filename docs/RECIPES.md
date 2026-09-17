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
