# Text, components, and explicit HTML

Plain strings in built-in component content are escaped. This applies to direct calls,
server composition, and browser composition. Attribute values and page metadata are
escaped separately; object attributes reject inline event handlers and `srcdoc`.
URL attributes reject executable schemes such as `javascript:` and `data:`.

```js
import { text, button, html, toHTMLString } from './src/index.js';
const label = text({ is: 'strong', slot: 'Save & continue' });
const control = button({ slot: label }); // nested component, no double escaping
const explicit = button({ slot: html('<strong>Save</strong>') });
const responseBody = toHTMLString(control);
```

`html()` accepts strings and already-rendered components. It is a trust assertion,
not a sanitizer: never wrap user input in it. `{ html: '<strong>Save</strong>' }`
remains an explicit raw HTML form in descriptors. Components passed to `html()`
retain their behavior dependencies, including after a JSON round-trip. Serialized
dependency identifiers are validated when restored. Use `compose()` for `{ type, name, props }`
descriptors; direct component slots accept rendered components and arrays.

Built-in component results are now immutable `TrustedHTML` string objects rather
than primitive strings. Template interpolation and string methods work. At HTTP,
file, or strict-equality boundaries use `String(result)` or `toHTMLString(result)`.
Concatenation and `.join()` produce plain strings and lose the marker: pass arrays
of rendered components instead, or explicitly mark the completed developer-authored
markup. `compose()` still returns a primitive HTML string.

Custom renderers can use `defineComponent(render, 'molecule:my-name')`. The wrapper
marks output; the renderer must escape text and attributes itself. Do not mark an
unescaped renderer safe. Prefer `processSlot`, `escapeAttr`, and `attrsToString`.

## Scripts

Use `meta.scripts: ['/scripts/app.js']` for external module scripts, or
`meta.inlineScripts: ['console.log("ready")']` for developer-authored module code.
Inline scripts reject closing script tags. Use `scriptData(value)` to serialize
JSON embedded in a script element, then read it with `textContent` and `JSON.parse`.
Do not interpolate untrusted data directly into JavaScript source.

Raw `html()` can contain intentional scripts or markup. Legacy string `attrs`
are also a trusted escape hatch; prefer object attributes for dynamic values.
Escaping does not sanitize intentionally trusted HTML, CSS, or script contents.
Text/box `is` overrides reject executable raw-text elements; use explicit markup
or script metadata for those cases. Stylesheet entries always produce CSS links;
place JavaScript CDN URLs in `meta.scripts`.

## Build errors and behavior registration

Builds fail on missing or throwing components and broken SPA templates.
`--allow-render-errors` explicitly permits diagnostic fallback markup for component
render failures. A failed build may contain partial output; publish only after a
successful exit. Use clean production builds to remove deleted routes.

Custom runtime behaviors now register with qualified identifiers, for example
`window.b0nes.register('molecules:tabs', behavior)`. A bare name is rejected so
same-named components in different categories cannot overwrite one another.
