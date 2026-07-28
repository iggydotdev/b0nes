// src/pages/examples/playground/index.js
//
// Paste a compose() config — JSON-shaped or literal function calls — hit
// render, see the HTML and a live preview. Runs entirely in the visitor's
// browser: dynamically imports your real component render functions from
// wherever this site is deployed, no server round-trip, nothing to secure
// on your end because the code never leaves their tab.

export const meta = {
  title: 'Playground — b0nes × bear.css',
  description: 'Paste a b0nes compose() config and see the result instantly.',
  stylesheets: ['./bear.css'],
  scripts: ['./playground.js']
};

export const components = [
  {
    type: 'atom',
    name: 'box',
    props: {
      is: 'main',
      className: 'grid grid-cols-1 grid-cols-2@m gap-xl p-2xl max-w-l mx-auto',
      slot: [
        // ── Input side ──────────────────────────────────────────
        {
          type: 'atom', name: 'box', props: {
            className: 'stack gap-md',
            slot: [
              { type: 'atom', name: 'text', props: { is: 'h1', className: 'text-2xl font-bold', slot: 'Playground' } },
              { type: 'atom', name: 'text', props: { is: 'p', className: 'text-sm text-subtle', slot: 'Paste a component array — JSON-shaped configs, direct function calls, or a mix of both.' } },
              {
                type: 'atom', name: 'box', props: {
                  className: 'cluster gap-sm',
                  slot: [
                    { type: 'atom', name: 'button', props: { slot: 'JSON example', className: 'p-sm px-md rounded-md border border-default text-sm', attrs: { 'data-example': 'json', type: 'button' } } },
                    { type: 'atom', name: 'button', props: { slot: 'Page module example', className: 'p-sm px-md rounded-md border border-default text-sm', attrs: { 'data-example': 'fn', type: 'button' } } }
                  ]
                }
              },
              {
                type: 'atom', name: 'textarea', props: {
                  className: 'w-full font-mono text-sm p-md border border-default rounded-md',
                  attrs: { id: 'playground-input', rows: 16, spellcheck: 'false' }
                }
              },
              {
                type: 'atom', name: 'box', props: {
                  className: 'cluster justify-between items-center',
                  slot: [
                    { type: 'atom', name: 'button', props: { slot: 'Render', className: 'p-sm px-lg rounded-md bg-accent font-semibold text-sm', attrs: { id: 'playground-render', type: 'button' } } },
                    { type: 'atom', name: 'text', props: { is: 'span', className: 'text-xs text-subtle', slot: '⌘/Ctrl + Enter' } }
                  ]
                }
              },
              {
                type: 'atom', name: 'box', props: {
                  is: 'p', className: 'text-sm text-danger',
                  attrs: { id: 'playground-error', hidden: true }
                }
              }
            ]
          }
        },

        // ── Output side ─────────────────────────────────────────
        {
          type: 'atom', name: 'box', props: {
            className: 'stack gap-md',
            slot: [
              { type: 'atom', name: 'text', props: { is: 'span', className: 'text-xs text-subtle uppercase tracking-wide font-mono', slot: 'preview' } },
              {
                type: 'atom', name: 'box', props: {
                  className: 'border border-default rounded-md overflow-hidden bg-surface-raised',
                  slot: { type: 'atom', name: 'box', props: {
                    is: 'iframe',
                    className: 'w-full h-2xl',
                    attrs: { id: 'playground-preview', sandbox: 'allow-same-origin', style: 'height:20rem;border:0;display:block;width:100%;' }
                  }}
                }
              },
              { type: 'atom', name: 'text', props: { is: 'span', className: 'text-xs text-subtle uppercase tracking-wide font-mono', slot: 'html output' } },
              {
                type: 'atom', name: 'box', props: {
                  is: 'pre',
                  className: 'font-mono text-xs p-md border border-default rounded-md overflow-x-auto bg-surface-raised',
                  attrs: { id: 'playground-html' }
                }
              }
            ]
          }
        }
      ]
    }
  }
];