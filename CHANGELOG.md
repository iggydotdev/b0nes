# Changelog

All notable changes to b0nes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
