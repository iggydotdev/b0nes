# b0nes upgrade path

b0nes is a **scaffolding** framework: `npx b0nes my-app` **copies** framework code into your project. You own the files. That is a feature — and it makes upgrades a deliberate design problem.

This document is the upgrade contract: what we overwrite, what we never touch, and how the CLI behaves.

---

## The problem

| Model | Upgrade story |
|-------|----------------|
| Library (`npm install b0nes`) | Bump version in `package.json` |
| **b0nes (vendored copy)** | Framework lives under `src/framework/` in *your* repo |

Without tooling, “upgrade” means manually diffing against upstream — which almost nobody does.

---

## Goals

1. **Safe by default** — never clobber user pages or custom components.
2. **Reversible** — backups + git-friendly.
3. **Honest** — show what will change before writing (`--dry-run`).
4. **Zero deps** — pure Node, same as the rest of b0nes.
5. **Works offline from the package** — `npx b0nes@latest upgrade` uses the package that npx just fetched as the source of truth.

Non-goals (for now):

- Automatic semantic merges of hand-edited framework files
- Hot-swapping to a pure `node_modules` dependency model (documented as a future option only)

---

## Ownership model

Every path under a b0nes project falls into one tier:

| Tier | Paths (default) | On `upgrade` |
|------|-----------------|--------------|
| **A — Framework** | `src/framework/**` + required shared rendering utilities (listed below) | **Replaced** with package version (default) |
| **B — Stock components** | Built-in atoms/molecules/organisms + remaining utilities + registry | Replaced only with **`--components`** |
| **C — User land** | `src/pages/**`, `public/**`, project `package.json`, custom component folders | **Never** overwritten |
| **D — Meta** | `.b0nes/**` | Updated by the CLI (manifest, backups, checksums) |

Default upgrades also include these files under `src/components/utils/`: `html.js`, `escapeHtml.js`, `escapeAttr.js`, `safeUrl.js`, `attrsToString.js`, `processSlot.js`, and `componentError.js`. The framework and components share these rendering contracts; upgrading only `src/framework` can leave missing imports or incompatible slot handling.

Custom utility files and the component generator remain outside the default upgrade. Existing differing shared utilities without a recorded checksum require `--force`, because the CLI cannot distinguish older stock code from local edits. `--force` retains the usual backup behavior.

### Custom components

A component directory is **user-owned** if it does **not** exist in the b0nes package stock tree. Example: you ran `npm run generate atom pricing-card` → `src/components/atoms/pricing-card/` is never deleted or overwritten.

Stock components you *edited* (e.g. changed `button.js`) are still “stock paths”:

- Default upgrade: component renderers are left alone; framework code and the shared rendering utilities update.
- `upgrade --components`: overwritten from package; if checksums show local edits, CLI **warns** first (and refuses without `--force`; `--yes` only skips the interactive confirmation).

---

## Project manifest

Created by `npx b0nes <name>` and updated by `upgrade`:

```text
.b0nes/
  manifest.json      # version, template, timestamps, policy
  checksums.json     # sha256 of last-applied framework (+ optional components)
  backups/
    <iso-timestamp>/ # full copy of replaced trees before write
```

### `manifest.json` shape

```json
{
  "schemaVersion": 1,
  "frameworkVersion": "0.2.1",
  "createdWith": "0.2.1",
  "createdAt": "2026-07-29T12:00:00.000Z",
  "upgradedAt": null,
  "template": "basic",
  "policy": {
    "frameworkPaths": [
      "src/framework",
      "src/components/utils/html.js",
      "src/components/utils/escapeHtml.js",
      "src/components/utils/escapeAttr.js",
      "src/components/utils/safeUrl.js",
      "src/components/utils/attrsToString.js",
      "src/components/utils/processSlot.js",
      "src/components/utils/componentError.js"
    ],
    "componentPaths": [
      "src/components/atoms",
      "src/components/molecules",
      "src/components/organisms",
      "src/components/utils",
      "src/components/library.js",
      "src/components/index.js"
    ],
    "userPaths": ["src/pages", "public"]
  }
}
```

Projects **without** `.b0nes/manifest.json` (created before this feature) can still upgrade:

- CLI infers a b0nes project if `src/framework` exists.
- Writes a manifest with `frameworkVersion: "unknown"` then applies the new package version.
- Recommends committing git state first.

---

## CLI

```bash
# From a b0nes project root
npx b0nes@latest upgrade
npx b0nes upgrade --dry-run
npx b0nes upgrade --components
npx b0nes upgrade --components --force
npx b0nes upgrade --yes          # skip interactive confirm
npx b0nes upgrade --no-backup    # not recommended
```

### Algorithm

1. Resolve **project root** (cwd, or walk up looking for `src/framework` + optional `.b0nes`).
2. Resolve **source root** = installed `b0nes` package (`npx` / local `node_modules` / monorepo).
3. Read package `version` → target version.
4. Read project manifest → current version.
5. Build file plan:
   - Tier A always, including the required shared rendering utilities.
   - Tier B if `--components`.
6. For each target file:
   - `missing` | `identical` | `outdated` | `local-modified` (checksum vs last apply) | `local-only` (skip).
7. Print plan. Exit on `--dry-run`.
8. Confirm (unless `--yes`).
9. Backup planned paths → `.b0nes/backups/<timestamp>/`.
10. Snapshot planned files and metadata, then copy source → project.
11. Refresh checksums + manifest (`frameworkVersion`, `upgradedAt`), or restore
    original files and metadata if any copy/write fails.
12. Print pointer to `CHANGELOG.md` / `docs/UPGRADE.md` for breaking notes.

### Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success or dry-run complete |
| 1 | Not a b0nes project / I/O error |
| 2 | Aborted (user declined or blocked without `--force`) |

---

## Upgrading to 0.4.0

This minor release includes native form submission and store/FSM behavior changes.
b0nes remains dependency-free and uses only `0.x.x` minor and patch releases.
Review [the 0.4.0 changelog](../CHANGELOG.md#040---2026-10-10) before upgrading.

From the root of a vendored project, with your work committed:

```sh
npx b0nes@0.4.0 upgrade --components --dry-run
npx b0nes@0.4.0 upgrade --components
npm test
node src/framework/build/cli.js build --clean --parallel --production
```

`--components` includes the native multi-step form renderer and behavior; a default
framework-only upgrade leaves existing stock components in place. Review any local
edit warnings before choosing `--force`, which keeps backups but replaces those
managed edits. It never permits following symlinks. Projects using b0nes as a library
can update their package version instead of running the vendored upgrade command.

Before the clean build, move any hand-maintained output assets into source or keep
and restore a copy. `--clean` removes unmanaged output after a successful build.
One successful clean build removes pages and source files left by older releases
without a build manifest; later normal builds remove only obsolete generated files.
Check the build exit code before deploying.

- **Native forms:** configure `action` and `method`, and verify the application or
  hosting server actually handles that URL and HTTP method. Submit valid `name`,
  `email`, and optional `age` values with enhancement enabled and with JavaScript
  disabled. The component no longer simulates success or supplies a server endpoint.
  Each form owns its state; destroying its behavior restores the native form.
  See the [native form recipe](RECIPES.md#native-forms).
- **FSM requests:** `connectStoreToFSM()` sends an event when `fsmEvent` changes.
  Clear a string request before sending the same string again, or supply a fresh
  `{ event, data }` object per request. Unrelated updates, reset/time travel, and
  connecting an existing store do not replay stored requests. Keep the application's
  `fsm/setState` action to receive transition feedback and call the returned
  disconnect function when the owning view is destroyed.
- **Production requests:** SSR pages need the Node server or another SSR integration;
  static preview cannot execute them. With the build complete, run
  `NODE_ENV=production node src/framework/server/index.js` and check your configured
  host/port and application endpoints. Request each representative SSG/SSR URL twice,
  then another dynamic parameter: SSG responses should contain the built record,
  while SSR responses should reflect the requested parameter. Confirm title,
  description, and assets as well as body content. Generated SSR fallback files
  preserve page metadata but still require a running SSR service.

---

## Recommended user workflow

```bash
cd my-app
git status   # clean tree preferred
git checkout -b chore/b0nes-upgrade

npx b0nes@latest upgrade --dry-run
npx b0nes@latest upgrade

npm test
npm run build
# fix anything from CHANGELOG breaking changes

git add -A && git commit -m "chore: upgrade b0nes framework"
```

If something goes wrong:

```bash
# Restore from CLI backup
cp -R .b0nes/backups/<timestamp>/src/. src/

# Or git
git checkout -- src/framework src/components/utils
```

---

## Versioning & breaking changes

Upgrade preflight rejects symlinks inside managed source/destination trees and
inside `.b0nes` metadata or backup paths, including dangling links. `--force`
allows replacing locally edited stock files; it does not allow following links.
Unsafe paths fail before any upgrade writes. Ordinary file copies and metadata
writes repeat containment checks and refuse final-file symlinks where the platform
supports `O_NOFOLLOW`. File and metadata writes share a recovery snapshot:
unexpected I/O errors restore overwritten files, remove new managed files, and
restore manifest/checksums. This also applies to `--no-backup`; requested user
backups remain available. If recovery itself fails, the error reports the retained
snapshot path. Process termination or power loss can still interrupt recovery;
use the printed backup or git for those cases.

- **Framework patch/minor**: `upgrade` should be routine.
- **Breaking changes**: called out in `CHANGELOG.md` under `### Breaking`. Upgrade still replaces files; **your pages** may need manual edits (compose escape rules, FSM attrs, Node engine, etc.).
- Scaffolded `package.json` `engines` is **not** auto-bumped (user land). CLI may *warn* if project engines are below the package requirement.

---

## Future options (not in MVP)

### 1. Checksum-perfect “stock” detection
Ship `checksums` per release in the npm package for every stock file so upgrades can detect drift even without a prior `.b0nes/checksums.json`.

### 2. Hybrid “linked core”
Optional mode: `src/framework` re-exports from `b0nes/framework` dependency while pages stay local. Better for teams that want `npm update`; weaker “own every line” story.

### 3. Codemods
For renames (e.g. import path fixes), small `migrations/0.3.0.js` scripts run after file copy.

### 4. `b0nes doctor`
Report version, modified stock files, Node engines mismatch, missing manifest.

---

## MVP shipped in this repo

| Piece | Status |
|-------|--------|
| Design (this doc) | ✅ |
| `.b0nes/manifest.json` on create | ✅ |
| `b0nes upgrade` + `--dry-run` + `--components` + backup | ✅ |
| Checksums for local-modified warnings | ✅ |
| Never touch `src/pages` | ✅ |
| Codemods / linked core | ❌ later |

---

## Summary

**You keep owning the code.**  
**Upgrade = re-sync framework (and optionally stock components) from the package you trust, with dry-run, backups, and a hard line around pages.**

That is the upgrade path: deliberate, reversible, and aligned with “the framework disappears into your codebase.”
