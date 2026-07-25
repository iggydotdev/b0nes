// src/pages/examples/playground/playground.js
//
// Two input shapes, same rendering path:
//
//   1. Raw config array   — [{ type, name, props }, ...]
//   2. Page module         — export const meta = {...}; export const components = [...];
//
// Both end up as an array of component configs fed into the REAL client
// compose() (framework/client/compose.js), which already dynamically
// imports whatever component a config references, on demand, by
// type/name. No preloading, no function scope injection — compose()
// already covers every component that exists.

const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const composePath = isDev ? '/client/compose.js' : '/assets/js/client/compose.js';
const { compose } = await import(composePath);

const input = document.getElementById('playground-input');
const renderBtn = document.getElementById('playground-render');
const errorEl = document.getElementById('playground-error');
const htmlOut = document.getElementById('playground-html');
const previewFrame = document.getElementById('playground-preview');

const PREVIEW_STYLES = `
  <link rel="stylesheet" href="${location.origin}/examples/bear-demo/bear.css">
  <link rel="stylesheet" href="${location.origin}/examples/bear-demo/theme.css">
  <style>body{margin:0;padding:1.5rem;}</style>
`;

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

function clearError() {
  errorEl.textContent = '';
  errorEl.hidden = true;
}

/**
 * Turns pasted text into { components, meta }.
 * Detects shape by the first non-whitespace character — `[`/`{` means a
 * raw config array, anything else is treated as a page module.
 */
async function evaluate(code) {
  const trimmed = code.trim();

  if (/^[[{]/.test(trimmed)) {
    const fn = new Function(`"use strict"; return (${trimmed});`);
    return { components: fn(), meta: {} };
  }

  // Page module form. Real dynamic import via a Blob URL — this is an
  // actual ES module at that point, so closures/helpers/ternaries all
  // just work exactly like they do in a real src/pages/**/index.js file.
  //
  // Caveat: relative imports (`../../framework/...`) won't resolve —
  // blob: URLs have no meaningful path to resolve against. If you need
  // an import in pasted code, use an absolute path from site root
  // (e.g. `/framework/config/stylesheets.js`), or just inline the value.
  const blobUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
  try {
    const mod = await import(/* webpackIgnore: true */ blobUrl);
    const raw = mod.components ?? mod.default;
    const components = typeof raw === 'function' ? await raw() : raw;
    return { components, meta: mod.meta || {} };
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

async function render() {
  clearError();
  const code = input.value.trim();
  if (!code) return;

  let evaluated;
  try {
    evaluated = await evaluate(code);
  } catch (err) {
    showError(`Parse error: ${err.message}`);
    return;
  }

  const items = Array.isArray(evaluated.components) ? evaluated.components : [evaluated.components];

  let html;
  try {
    html = await compose(items);
  } catch (err) {
    showError(`Render error: ${err.message}`);
    return;
  }

  htmlOut.textContent = html;
  const title = evaluated.meta?.title ? `<title>${evaluated.meta.title}</title>` : '';
  previewFrame.srcdoc = `<!DOCTYPE html><html><head>${title}${PREVIEW_STYLES}</head><body>${html}</body></html>`;
}

const JSON_EXAMPLE = `[
  { type: 'atom', name: 'text', props: { is: 'h2', slot: 'Hello from a config array' } },
  { type: 'molecule', name: 'card', props: {
      slot: [
        { type: 'atom', name: 'text', props: { is: 'h3', slot: 'Card title' } },
        { type: 'atom', name: 'text', props: { is: 'p', slot: 'Card body text.' } }
      ]
  }}
]`;

const MODULE_EXAMPLE = `export const meta = {
  title: 'Playground Preview',
  stylesheets: ['../bear-demo/bear.css']
};

const feature = (title, body) => ({
  type: 'atom', name: 'text', props: { is: 'p', slot: \`\${title}: \${body}\` }
});

export const components = [
  { type: 'organism', name: 'hero', props: {
      slot: [
        { type: 'atom', name: 'text', props: { is: 'h1', slot: 'Pasted straight from a page file' } },
        feature('Note', 'helper functions above the export just work, this is a real module')
      ]
  }}
];`;

renderBtn.addEventListener('click', render);
input.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') render();
});

document.querySelectorAll('[data-example]').forEach((btn) => {
  btn.addEventListener('click', () => {
    input.value = btn.dataset.example === 'json' ? JSON_EXAMPLE : MODULE_EXAMPLE;
    render();
  });
});

input.value = JSON_EXAMPLE;
render();