# Changelog

All notable changes to b0nes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-10-08

### Added

- Explicit trusted markup through `html()`, component results wrapped by `defineComponent()`, and JSON script payloads escaped by `scriptData()`.
- `b0nes upgrade` with dry runs, checksums, local-edit protection, and backups. Default upgrades include the shared rendering utilities required by the framework.
- A minimal dependency-free scaffold and [page recipes](docs/RECIPES.md) in place of bundled starter templates.
- Automatic GitHub and npm releases after a version-bumping PR merges into `main`. CI validates Node 22, Node 24, and Chromium before publishing the exact merge commit; versions remain on `0.x.x`.

### Fixed

- Builds report page failures instead of silently publishing stale HTML; dynamic SSG routes participate in route discovery, and production pages use valid native JavaScript modules.
- Render-cache hits retain nested component dependencies, and filtered store subscriptions receive matching updates.
- Production servers protect source modules and contain filesystem access, reject malformed requests, and prevent symlink escapes during serving and asset copying.
- SPA rendering, navigation history, route lifecycle callbacks, cleanup, and asynchronous navigation races.
- Asynchronous store middleware returns the committed state; persistence runs after the commit completes.
- Dynamic SSG and SSR pages resolve the same relative asset URLs, including nested component helpers and serialized component results.
- Default upgrades include required shared utilities when upgrading older projects; the lockfile CLI entry now matches `bin/b0nes.js`.
- Component text, attributes, and URL handling; keyboard/focus behavior and cleanup in interactive components.

### Changed

- Node.js 22 or newer is required. CI checks Node 22 and 24; npm publishing uses Node 24.
- The CLI entry supports both project creation and upgrades. Removed starter templates are replaced by the minimal scaffold and documented recipes.
- Builds load page modules in fresh workers so edits are reflected on subsequent builds. Published pages do not reuse persistent HTML caches.
- Runtime and development dependencies remain at zero.

### Breaking / migration

- Plain strings in slots are escaped as text. Use component results or nested component descriptors for structure, and `html()` / `{ html: '...' }` only for markup you trust. Custom components should use `defineComponent()` and escape their own inputs; `html()` is a trust assertion, not a sanitizer.
- Use `npx b0nes <name>` for the minimal scaffold; the removed `--template` options are no longer supported. See [page recipes](docs/RECIPES.md) for larger starting points.
- After upgrading an existing project, run `npm run build:clean` to remove files left by older builds. Check [the upgrade contract](docs/UPGRADE.md) before applying changes to locally edited framework files.
- Asynchronous store middleware must return or await `next(action)` so dispatch and persistence can wait for the commit.

---

## [0.2.0] - 2026-01-04

### Added

- **Parallel Static Site Generation** - Multi-core builds using `worker_threads` for significantly faster build times
- **Production Page Bundling** - Client-side component bundling for static routes with automatic dependency collection and bundle injection
- **Structured Router** - Priority-based route matching (exact → extension → prefix → pattern → catch-all) with route grouping support
- **Client Behaviors** - Interactive components: dropdown, modal, tabs, multi-step form, slides, and SPA
- **CLI Commands** - New `build`, `clean`, `serve` commands with flags: `--verbose`, `--parallel`, `--clean`, `--production`
- **b0nes-css** - New CSS system with core, grid, layout, reset, responsive, tokens, and utilities modules
- **Slides Component** - New organism for building presentations with 45 example slides
- **Enhanced SSG Caching** - Intelligent caching with hash-based change detection

### Changed

- **Framework Reorganization** - Split into `core/`, `server/`, `build/`, `shared/` modules for cleaner separation of concerns
- **Migrated Tests to Node.js Built-in Test Runner** - Removed custom `tester.js`, all 52 tests now use `node:test`
- **Refactored Routing** - Improved server handling and route resolution
- **Enhanced Action Handling** - Integrated compose for dynamic templates

### Fixed

- Static asset path resolution in production builds
- HTTP/2 support configuration
- Lazy loading on images for better performance
- Co-located asset handling for pages

### Removed

- Custom `tester.js` test runner (replaced by Node.js built-in)
- Deprecated example routes
- Unused router.js file

---

## [0.1.11] - Previous Release

Initial stable release with core features:
- Zero-dependency component library
- SSR/SSG framework
- Atomic design system (atoms, molecules, organisms)
- State management (Store)
- State machines (FSM)
- Component generator
