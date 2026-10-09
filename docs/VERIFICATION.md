# Verification recipes

All tests and build tooling use Node built-ins. No npm dependencies are required.

## Node regression suite

Run `npm test` on Node 22 or newer. Build tests use temporary projects and cover
sequential/parallel output, dynamic routes, page edits, clean/custom output,
transitive module changes, generated ESM entries, and failed data generation.
Store tests cover ordinary, nested, computed, unchanged, and reentrant notifications,
asynchronous actions, concurrent module updates, post-commit persistence, and action
failures that leave state and history unchanged. Synchronous actions stay synchronous.
Composition tests cover dependency replay through cached ancestors and route context.
HTTP tests start real servers and verify malformed requests return 400 without
interrupting later requests. They check production source isolation, symlink
containment, development asset loading, and legacy runtime URLs. Upgrade tests
render an older component library after a default upgrade and verify customized
shared utilities are preserved or backed up when forced.

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

SPA checks cover compiled strings, dynamic URL parameters, back/forward navigation,
entry-hook context, stale asynchronous templates, store-driven views, safe bindings,
and child behavior cleanup. Load page-owned `window.spaConfig` before enhancement;
see [SPA recipes](RECIPES.md#spa-navigation).

The browser checks also cover nested component controls, category-qualified
behavior registration, cleanup without callbacks, and production client composition
on localhost. Node tests pack the actual npm artifact and exercise scaffolding,
tests, and a production build from that artifact.

Run `npm run test:integration:ci` for the combined legacy-project upgrade check.
It packs the npm artifact, upgrades a representative 0.2.1 vendored installation,
preserves customized components/pages/public assets, builds dynamic SSG and compiled
SPA templates, and starts the upgraded production SSR server. Chromium checks
initial navigation, click/back/forward history, escaped content, asynchronous store
updates, and SSG/SSR asset loading. It uses the same installed Chromium executable
as the behavior runner and is also part of CI.

## Build behavior

Every route is rendered afresh; persistent HTML cache skipping is disabled.
The `cache` option and `--no-cache` flag remain accepted for compatibility.
This trades incremental build speed for correctness when modules read files,
environment variables, or remote data. Each route uses a fresh worker module graph;
`--parallel` controls concurrency, capped at eight workers. The in-process component render cache remains. SPA template compilation also uses
a fresh worker so repeated builds reload transitive imports.

`npm run benchmark:build -- 10 100` measures clean sequential and parallel builds
in temporary projects. Results depend on CPU and filesystem; no fixed speed is promised.

Builds render in a private sibling staging directory and promote it only after
all routes, SPA templates, runtime modules, and assets succeed. Promotion failures
restore the previous directory. Even `--clean` leaves the previous output intact
if rendering fails. Concurrent builds for the same output are rejected by a lock.
If a process is forcibly terminated, check that it is no longer running before
removing the sibling `.public.b0nes-build-lock` file (the prefix follows the output
name); private staging or recovery-backup directories may also remain.

The reserved `.b0nes-build-manifest.json` tracks generated files and directories.
Successful rebuilds remove obsolete generated pages, dynamic URLs, bundles, and
assets. Normal CLI builds (`clean: false`) preserve unmanaged files and empty user
directories. `--clean` (or the API default `clean: true`) removes unmanaged output
only after a successful build; keep user assets outside the output for this mode.
Old builds without a manifest require one successful clean build to remove legacy
output. Do not delete or hand-edit the manifest between builds.

The directory swap uses a same-filesystem backup and rename so it works without
external dependencies. There is a brief interval between the two renames when the
output path is absent; it is not a promise of uninterrupted serving during a build.
A failed rollback reports and retains the recovery backup instead of deleting it.

Production `.bundle.js` files are native ESM registration entries, not concatenated
or minified JavaScript. They load copied behavior modules with their imports intact.
No external bundler is needed. Shared runtime files retain both the `shared` and
legacy `utils` URLs.

Dynamic SPA templates also retain a native ESM module graph. Only imported modules
are emitted under `assets/js/template-modules/`, preserving relative paths across
components, helpers, re-exports, cycles, JSON imports, and literal `import()` calls.
Dependencies must be browser-compatible relative modules within `src/`; server
modules, source symlinks, bare/Node imports, and computed `import()` paths fail the
build. Use static imports or literal lazy imports. The compiler's V8 parser runs
in its own worker with the required Node flag; users need no extra flags or packages.
Standalone `generateCompiledTemplates()` callers outside a `src/` tree can set
`sourceRoot` explicitly. Imported browser dependencies become public assets.

Removing or renaming the pages directory is a build error and keeps the previous
output. An existing empty pages directory remains valid and removes old generated
pages on a successful rebuild.

## Server assets

The production SSR server reads HTTP assets only from `public/`; it does not
fall back to `src/pages`. Build before starting it. Runtime aliases such as
`/client/compose.js` and `/utils/urlPattern.js` resolve inside the same public root.
Symlinks that leave the asset root, or point to forbidden files, return 404.

Production page requests use the same render-mode policy as builds: SSG routes
serve their generated HTML, including `externalData()` fields and production
scripts. Missing explicit SSG artifacts return 404; default dynamic routes retain
their existing SSR fallback for URLs absent from the build. SSR routes render at request time even
when an SSR fallback file exists. Development renders source modules and passes
the matching complete fetched record to dynamic SSG factories.
HTTP regressions cover encoded slugs, HEAD requests, and unsafe generated HTML links.

Development reads co-located assets and browser modules from source, while page
entry modules (`index.js`, `page.js`, `[slug].js`, and `:slug.js`) stay server-only.
The build excludes these page modules from co-located assets.
Co-located assets stay at the source directory's URL: `src/pages/posts/[slug].js`
shares `/posts/style.css` across its generated pages. Both component and metadata
URLs use that same base in SSG and SSR. Dynamic folder names are percent-encoded
in shared asset URLs. Direct helper results with relative assets retain the props
needed for context resolution, including nested and JSON-serialized results with
plain props. Composition cache keys include this asset base. Other co-located
JavaScript and JSON files are public assets; keep private helpers and data elsewhere.
Build copies reject source symlinks and output symlinks instead of following them.
Run `npm run build:clean` after upgrading to remove any source files published by
an older build.

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
