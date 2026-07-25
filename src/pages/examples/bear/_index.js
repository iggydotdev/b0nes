// src/pages/examples/bear-demo/index.js
//
// b0nes handles structure. bear.css handles style. Neither owns the other.
// No React. No Next. No Tailwind JIT compiler chugging away in the background.
// Just JSON -> HTML strings, and a single 6.7kb CSS file doing the rest.

export const meta = {
  title: 'b0nes × bear.css',
  description: 'A modern static site with zero build step and zero dependencies.',
  // Relative path = colocated asset. b0nes copies this file next to the
  // generated page at build time, and dev-mode resolves it via the referer
  // fallback in staticFiles.js. This is the ONLY reliable way to serve a
  // local stylesheet right now — the global /styles/ prefix route is
  // broken (see getServerConfig.js, missing STYLES_BASE).
  stylesheets: ['./bear.css']
};

export const components = [
  {
    type: 'organism',
    name: 'header',
    props: {
      className: 'cluster justify-between items-center p-md border-b',
      slot: [
        { type: 'atom', name: 'text', props: { is: 'span', className: 'font-bold text-lg', slot: 'b0nes' } },
        {
          type: 'atom',
          name: 'box',
          props: {
            className: 'cluster gap-lg',
            slot: [
              { type: 'atom', name: 'link', props: { url: '#features', slot: 'Features', className: 'text-subtle hover:text-accent transition-colors' } },
              { type: 'atom', name: 'link', props: { url: '#cta', slot: 'Get Started', className: 'text-subtle hover:text-accent transition-colors' } }
            ]
          }
        }
      ]
    }
  },

  {
    type: 'organism',
    name: 'hero',
    props: {
      className: 'stack items-center text-center gap-md py-2xl px-lg',
      slot: [
        { type: 'atom', name: 'text', props: { is: 'h1', className: 'text-3xl font-bold text-balance', slot: 'Ship it without the toolchain.' } },
        { type: 'atom', name: 'text', props: { is: 'p', className: 'text-lg text-subtle max-w-narrow text-pretty', slot: 'b0nes composes your HTML. bear.css styles it. No bundler ever gets a vote.' } },
        {
          type: 'atom',
          name: 'link',
          props: {
            url: '#cta',
            slot: 'See it in action',
            className: 'p-md px-lg rounded-md bg-accent text-default font-semibold transition-colors hover:bg-accent'
          }
        }
      ]
    }
  },

  {
    type: 'atom',
    name: 'box',
    props: {
      is: 'section',
      attrs: { id: 'features' },
      className: 'grid grid-cols-1 grid-cols-3@m gap-lg p-2xl max-w-m mx-auto',
      slot: [
        {
          type: 'molecule',
          name: 'card',
          props: {
            className: 'stack gap-sm p-lg border border-default rounded-lg bg-raised',
            slot: [
              { type: 'atom', name: 'text', props: { is: 'h3', className: 'font-semibold', slot: 'Zero Dependencies' } },
              { type: 'atom', name: 'text', props: { is: 'p', className: 'text-sm text-subtle', slot: 'Both frameworks run on nothing but Node built-ins and a browser. Nothing to audit, nothing to update.' } }
            ]
          }
        },
        {
          type: 'molecule',
          name: 'card',
          props: {
            className: 'stack gap-sm p-lg border border-default rounded-lg bg-raised',
            slot: [
              { type: 'atom', name: 'text', props: { is: 'h3', className: 'font-semibold', slot: 'You Own The Fork' } },
              { type: 'atom', name: 'text', props: { is: 'p', className: 'text-sm text-subtle', slot: 'Scaffold, then it disappears. No package.json entry haunting you in six months.' } }
            ]
          }
        },
        {
          type: 'molecule',
          name: 'card',
          props: {
            className: 'stack gap-sm p-lg border border-default rounded-lg bg-raised',
            slot: [
              { type: 'atom', name: 'text', props: { is: 'h3', className: 'font-semibold', slot: 'AI-Native By Design' } },
              { type: 'atom', name: 'text', props: { is: 'p', className: 'text-sm text-subtle', slot: 'Pure functions, JSON config trees. An LLM can read this codebase in one context window.' } }
            ]
          }
        }
      ]
    }
  },

  {
    type: 'organism',
    name: 'cta',
    props: {
      attrs: { id: 'cta' },
      className: 'stack items-center text-center gap-md p-2xl bg-sunken rounded-lg m-lg',
      slot: [
        { type: 'atom', name: 'text', props: { is: 'h2', className: 'text-2xl font-bold', slot: 'Ready to build?' } },
        { type: 'atom', name: 'button', props: { slot: 'npx create-b0nes-app my-site', className: 'p-md px-lg rounded-md bg-accent font-mono text-sm' } }
      ]
    }
  },

  {
    type: 'organism',
    name: 'footer',
    props: {
      className: 'cluster justify-between p-md border-t text-sm text-subtle',
      slot: [
        { type: 'atom', name: 'text', props: { is: 'span', slot: '© 2026 — no npm audit required' } },
        { type: 'atom', name: 'link', props: { url: 'https://github.com/iggydotdev/b0nes', slot: 'GitHub', className: 'hover:text-accent transition-colors' } }
      ]
    }
  }
];