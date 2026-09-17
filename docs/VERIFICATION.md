# Verification recipes

All tests and build tooling use Node built-ins. No npm dependencies are required.

## Node regression suite

Run `npm test` on Node 22 or newer. Build tests use temporary projects and cover
sequential/parallel output, dynamic routes, page edits, clean/custom output,
transitive module changes, generated ESM entries, and failed data generation.
Store tests cover ordinary, nested, computed, unchanged, and reentrant notifications.
Composition tests cover dependency replay through cached ancestors and route context.

## Browser behavior

Run `npm run test:browser` from the repository root, then open
http://localhost:5068. The page runs browser assertions and reports each result.
It also leaves working controls available for manual keyboard testing.

- `/`: tab IDs, ARIA associations, arrows/Home/End, cleanup, modal focus wrap,
  outside focus containment, Escape, focus/scroll restoration, and empty dialogs.
- `/no-js`: HTML rendered without behavior scripts; all tab panels remain visible.
- `/production`: the shipped multi-step form and tabs loaded through a generated
  ES-module entry. Enter a name and select Next to exercise the form's imports.

Stop the server with Ctrl+C. It binds to loopback and removes its temporary build.
The Chromium CI job runs the same page with `npm run test:browser:ci`.
Set `CHROME_BIN` to an installed Chromium executable if it is not `google-chrome`.
The runner uses Node child processes and the fixture's HTTP result endpoint; it
adds no npm dependencies. It fails on assertions, early exit, or a 45-second timeout.

The browser checks also cover nested component controls, category-qualified
behavior registration, cleanup without callbacks, and production client composition
on localhost. Node tests pack the actual npm artifact and exercise scaffolding,
tests, and a production build from that artifact.

## Build behavior

Every route is rendered afresh; persistent HTML cache skipping is disabled.
The `cache` option and `--no-cache` flag remain accepted for compatibility.
This trades incremental build speed for correctness when modules read files,
environment variables, or remote data. Each route uses a fresh worker module graph;
`--parallel` controls concurrency, capped at eight workers. The in-process component render cache remains. SPA template compilation also uses
a fresh worker so repeated builds reload transitive imports.

`npm run benchmark:build -- 10 100` measures clean sequential and parallel builds
in temporary projects. Results depend on CPU and filesystem; no fixed speed is promised.

Use `--clean` when removing routes or changing the set of dynamic URLs to remove
old output files. Keep source assets outside the output directory when doing so.

Production `.bundle.js` files are native ESM registration entries, not concatenated
or minified JavaScript. They load copied behavior modules with their imports intact.
No external bundler is needed. Shared runtime files retain both the `shared` and
legacy `utils` URLs.

## Dynamic SSG recipe

A page at `src/pages/posts/[slug].js` can enumerate static pages as follows:

```js
export const externalData = async () => [
  { slug: 'hello', title: 'Hello' },
  { slug: 'world', title: 'World' }
];

export const components = data => [{
  type: 'atom',
  name: 'text',
  props: { is: 'h1', slot: data.title }
}];
```

`npm run build` generates `/posts/hello/index.html` and `/posts/world/index.html`.
A dynamic page without `externalData` remains an SSR route. An explicit
`meta.render: 'ssr'` also stays SSR. Errors in data generation fail the build.

## Sample build measurement

On this WSL checkout using Node 24.10.0 (single run, simple heading pages):

| Routes | Sequential | Parallel |
| --- | --- | --- |
| 10 | 0.730 s | 0.331 s |
| 100 | 5.820 s | 1.170 s |

The benchmark verifies each expected HTML file exists. These are local measurements,
not performance guarantees. Fresh per-route module isolation is retained.

Regression coverage also rejects unsafe dynamic URL segments and symlink output
targets, verifies CLI failures for asset-copy errors, checks directory-relative asset
URLs and public test-file exclusions, and builds behavior entries from serialized
component results. Dynamic parameters are single URL segments; spaces and Unicode
are percent-encoded, while traversal and embedded path separators are rejected.
