// src/pages/examples/bear-demo/index.js
//
// Same two-file philosophy as before (JSON composition + one CSS file),
// just with the density of a real SaaS landing page instead of a
// Bootstrap-1.0-circa-2012 hero-and-three-cards toy.
//
// Requires the compose.js patch (recursive structured-slot composition)
// for the FAQ accordion below to render — without it, titleSlot/detailsSlot
// silently go blank.

export const meta = {
  title: 'b0nes × bear.css',
  description: 'A modern static site with zero build step and zero dependencies.',
  stylesheets: ['./bear.css']
};

const feature = (title, body) => ({
  type: 'molecule',
  name: 'card',
  props: {
    className: 'stack gap-sm p-lg border border-default rounded-lg bg-raised',
    slot: [
      { type: 'atom', name: 'text', props: { is: 'h3', className: 'font-semibold', slot: title } },
      { type: 'atom', name: 'text', props: { is: 'p', className: 'text-sm text-subtle', slot: body } }
    ]
  }
});

const stat = (number, label) => ({
  type: 'atom',
  name: 'box',
  props: {
    className: 'stack items-center gap-xs',
    slot: [
      { type: 'atom', name: 'text', props: { is: 'span', className: 'text-2xl font-bold', slot: number } },
      { type: 'atom', name: 'text', props: { is: 'span', className: 'text-sm text-subtle uppercase tracking-wide', slot: label } }
    ]
  }
});

const pricingCard = (tier, price, features, recommended = false) => ({
  type: 'atom',
  name: 'box',
  props: {
    className: `stack gap-md p-xl rounded-lg border ${recommended ? 'border-accent' : 'border-default'} bg-raised relative`,
    slot: [
      ...(recommended
        ? [{ type: 'atom', name: 'badge', props: { slot: 'Recommended', className: 'bg-accent w-fit' } }]
        : []),
      { type: 'atom', name: 'text', props: { is: 'h3', className: 'text-lg font-semibold', slot: tier } },
      {
        type: 'atom', name: 'text', props: {
          is: 'p',
          className: 'text-3xl font-bold',
          slot: [price, { type: 'atom', name: 'text', props: { is: 'span', className: 'text-sm text-subtle font-normal', slot: '/mo' } }]
        }
      },
      { type: 'atom', name: 'divider', props: {} },
      {
        type: 'atom', name: 'box', props: {
          is: 'ul',
          className: 'stack gap-sm',
          slot: features.map(f => ({ type: 'atom', name: 'text', props: { is: 'li', className: 'text-sm text-subtle', slot: `— ${f}` } }))
        }
      },
      {
        type: 'atom', name: 'button', props: {
          slot: 'Choose plan',
          className: `p-md rounded-md font-semibold ${recommended ? 'bg-accent' : 'bg-sunken'}`
        }
      }
    ]
  }
});

const faqItem = (q, a) => ({
  type: 'atom',
  name: 'accordion',
  props: {
    className: 'border-b border-default py-sm',
    titleSlot: { type: 'atom', name: 'text', props: { is: 'span', className: 'font-semibold', slot: q } },
    detailsSlot: { type: 'atom', name: 'text', props: { is: 'p', className: 'text-sm text-subtle pt-sm', slot: a } }
  }
});

export const components = [
  // ── Sticky header ──────────────────────────────────────────
  {
    type: 'organism',
    name: 'header',
    props: {
      className: 'sticky inset-block-start-none z-sticky cluster justify-between items-center p-md px-xl border-b bg-surface',
      slot: [
        { type: 'atom', name: 'text', props: { is: 'span', className: 'font-bold text-lg', slot: 'b0nes' } },
        {
          type: 'atom', name: 'box', props: {
            className: 'cluster gap-lg items-center',
            slot: [
              { type: 'atom', name: 'link', props: { url: '#features', slot: 'Features', className: 'text-sm text-subtle hover:text-accent transition-colors' } },
              { type: 'atom', name: 'link', props: { url: '#pricing', slot: 'Pricing', className: 'text-sm text-subtle hover:text-accent transition-colors' } },
              { type: 'atom', name: 'link', props: { url: '#faq', slot: 'FAQ', className: 'text-sm text-subtle hover:text-accent transition-colors' } },
              { type: 'atom', name: 'link', props: { url: '#cta', slot: 'Get Started', className: 'p-sm px-md rounded-md bg-accent text-sm font-semibold' } }
            ]
          }
        }
      ]
    }
  },

  // ── Hero ────────────────────────────────────────────────────
  {
    type: 'organism',
    name: 'hero',
    props: {
      className: 'stack items-center text-center gap-md py-3xl px-lg max-w-m mx-auto',
      slot: [
        { type: 'atom', name: 'badge', props: { slot: 'v0.2.0 — now with an MCP server', className: 'bg-sunken text-xs' } },
        { type: 'atom', name: 'text', props: { is: 'h1', className: 'text-3xl font-bold text-balance', slot: 'Ship it without the toolchain.' } },
        { type: 'atom', name: 'text', props: { is: 'p', className: 'text-lg text-subtle max-w-narrow text-pretty', slot: 'b0nes composes your HTML from plain JSON. bear.css styles it from plain utility classes. No bundler ever gets a vote.' } },
        {
          type: 'atom', name: 'box', props: {
            className: 'cluster gap-md',
            slot: [
              { type: 'atom', name: 'link', props: { url: '#cta', slot: 'Get Started', className: 'p-md px-lg rounded-md bg-accent font-semibold transition-colors' } },
              { type: 'atom', name: 'link', props: { url: 'https://github.com/iggydotdev/b0nes', slot: 'View on GitHub', className: 'p-md px-lg rounded-md border border-default font-semibold transition-colors hover:bg-raised' } }
            ]
          }
        }
      ]
    }
  },

  // ── Stats strip ─────────────────────────────────────────────
  {
    type: 'atom',
    name: 'box',
    props: {
      is: 'section',
      className: 'grid grid-cols-3 gap-lg p-xl px-2xl max-w-m mx-auto divide-x',
      slot: [stat('0', 'npm dependencies'), stat('6.7kb', 'bear.css gzipped'), stat('1', 'afternoon to learn')]
    }
  },

  // ── Features ────────────────────────────────────────────────
  {
    type: 'atom',
    name: 'box',
    props: {
      is: 'section',
      attrs: { id: 'features' },
      className: 'grid grid-cols-1 grid-cols-3@m gap-lg p-2xl max-w-m mx-auto',
      slot: [
        feature('Zero Dependencies', 'Both frameworks run on Node built-ins and a browser. Nothing to audit, nothing to update at 2am on a Friday.'),
        feature('You Own The Fork', 'Scaffold, then it disappears. No package.json entry haunting you six months from now.'),
        feature('AI-Native By Design', 'Pure functions, JSON config trees. An LLM can read this whole codebase in one context window.')
      ]
    }
  },

  // ── Testimonial ─────────────────────────────────────────────
  {
    type: 'atom',
    name: 'box',
    props: {
      is: 'section',
      className: 'stack items-center text-center gap-md p-2xl max-w-narrow mx-auto',
      slot: [
        { type: 'atom', name: 'text', props: { is: 'p', className: 'text-xl italic text-strong text-balance', slot: '"We deleted 847 packages and our build time went from four minutes to zero, because there is no build."' } },
        { type: 'atom', name: 'text', props: { is: 'span', className: 'text-sm text-subtle uppercase tracking-wide', slot: '— a developer, probably' } }
      ]
    }
  },

  // ── Pricing ─────────────────────────────────────────────────
  {
    type: 'atom',
    name: 'box',
    props: {
      is: 'section',
      attrs: { id: 'pricing' },
      className: 'stack gap-lg p-2xl max-w-m mx-auto',
      slot: [
        { type: 'atom', name: 'text', props: { is: 'h2', className: 'text-2xl font-bold text-center', slot: 'Pricing' } },
        {
          type: 'atom', name: 'box', props: {
            className: 'grid grid-cols-1 grid-cols-3@m gap-lg',
            slot: [
              pricingCard('Free', '$0', ['All components', 'MCP server', 'Community support']),
              pricingCard('Pro', '$0', ['Everything in Free', 'Priority issue triage', 'Early access to page builder'], true),
              pricingCard('Enterprise', '$0', ['Everything in Pro', 'It is still just JSON and CSS', 'Nobody actually pays for this'])
            ]
          }
        }
      ]
    }
  },

  // ── FAQ ─────────────────────────────────────────────────────
  {
    type: 'atom',
    name: 'box',
    props: {
      is: 'section',
      attrs: { id: 'faq' },
      className: 'stack gap-md p-2xl max-w-narrow mx-auto',
      slot: [
        { type: 'atom', name: 'text', props: { is: 'h2', className: 'text-2xl font-bold text-center', slot: 'FAQ' } },
        faqItem('Do I need a build step?', 'No. b0nes ships HTML strings, bear.css ships one CSS file. Both are read directly by the browser.'),
        faqItem('Can I use this with Tailwind instead?', 'Sure, but then why did you read this far.'),
        faqItem('Is this production ready?', 'For static sites, yes. For SPAs, "getting there" — check the roadmap before you bet the company on it.')
      ]
    }
  },

  // ── CTA ─────────────────────────────────────────────────────
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

  // ── Footer ──────────────────────────────────────────────────
  {
    type: 'organism',
    name: 'footer',
    props: {
      className: 'stack gap-lg p-2xl border-t',
      slot: [
        {
          type: 'atom', name: 'box', props: {
            className: 'grid grid-cols-2 grid-cols-4@m gap-lg max-w-m mx-auto w-full',
            slot: [
              { type: 'atom', name: 'box', props: { className: 'stack gap-sm', slot: [
                { type: 'atom', name: 'text', props: { is: 'span', className: 'text-sm font-semibold', slot: 'Product' } },
                { type: 'atom', name: 'link', props: { url: '#features', slot: 'Features', className: 'text-sm text-subtle hover:text-accent' } },
                { type: 'atom', name: 'link', props: { url: '#pricing', slot: 'Pricing', className: 'text-sm text-subtle hover:text-accent' } }
              ]}},
              { type: 'atom', name: 'box', props: { className: 'stack gap-sm', slot: [
                { type: 'atom', name: 'text', props: { is: 'span', className: 'text-sm font-semibold', slot: 'Resources' } },
                { type: 'atom', name: 'link', props: { url: '#faq', slot: 'FAQ', className: 'text-sm text-subtle hover:text-accent' } },
                { type: 'atom', name: 'link', props: { url: 'https://github.com/iggydotdev/b0nes', slot: 'GitHub', className: 'text-sm text-subtle hover:text-accent' } }
              ]}}
            ]
          }
        },
        {
          type: 'atom', name: 'box', props: {
            className: 'cluster justify-between p-md border-t text-sm text-subtle max-w-m mx-auto w-full',
            slot: [
              { type: 'atom', name: 'text', props: { is: 'span', slot: '© 2026 — no npm audit required' } },
              { type: 'atom', name: 'text', props: { is: 'span', slot: 'Built with b0nes + bear.css' } }
            ]
          }
        }
      ]
    }
  }
];