# Changelog

All notable changes to b0nes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **`b0nes upgrade`** — re-sync vendored `src/framework` from the b0nes package into an existing project (`--dry-run`, `--components`, `--force`, `--yes`, backups under `.b0nes/backups/`)
- **`.b0nes/manifest.json` + checksums** — stamped on `npx b0nes <name>`; tracks framework version and detects locally modified stock files
- **`docs/UPGRADE.md`** — ownership model (framework / stock components / user land) and upgrade contract

### Changed

- **Node engine** - Minimum Node.js version lowered from `>=24` to `>=22` (Active LTS; Node 20 is EOL)
- **npm package size** - Heavy demos excluded from the published tarball via `.npmignore` (talk deck, SPA/playground/social demos, large PNGs). Full examples remain in the git repo for local validation. Scaffold templates (`basic`, `blog`, `documentation`) still ship with npm for `npx b0nes`.
- CI matrix tests Node 22 and 24; npm publish uses Node 22
- CLI entry is multi-command (`bin/b0nes.js`): `create` / default scaffold + `upgrade`

### Fixed

- `setErrorFallback` no longer throws (proper mutable renderer API)
- Relative asset path rewriting now applies to rendered props
- Modal/tabs client behaviors return cleanup functions
- FSM connector params use `data-param-*` / `data-fsm-data` (no TODO heuristic)
- Escape-by-default in `compose` (plain text escaped; component nodes trusted; `{ html }` opt-in)

### Documentation

- README and `llms.txt` document composition security, FSM params, examples git-vs-npm policy, and upgrade path

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
