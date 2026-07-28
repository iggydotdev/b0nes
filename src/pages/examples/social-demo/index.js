// src/pages/examples/social-demo/index.js
//
// A social-timeline UI, Twitter/X-*shaped* — three column layout, post
// cards, composer, like/retweet counters. Not their blue, not their
// logo, not their exact type scale. Reuses the paper/ink/accent tokens
// from the bear-demo theme.css so the example site stays one coherent
// design system instead of five unrelated ones.
//
// Requires: the timeline organism (server/index/client.js) dropped into
// src/components/organisms/timeline/ — auto-registered by library.js,
// no manual index.js wiring needed.

export const meta = {
  title: 'Timeline — b0nes × bear.css',
  description: 'A social feed shell with Store-driven interactions. No backend.',
  stylesheets: ['./bear.css']
};

// Deterministic avatar colors from the accent family — no image pipeline,
// no external avatar service, just initials on a flat color.
const AVATAR_COLORS = ['#3D5AFE', '#7C3AED', '#0EA5E9', '#059669', '#DC2626'];

const avatar = (initials, index) => ({
  type: 'atom',
  name: 'box',
  props: {
    className: 'center-xy w-xl h-xl rounded-full flex-none',
    attrs: { style: `background:${AVATAR_COLORS[index % AVATAR_COLORS.length]}` },
    slot: { type: 'atom', name: 'text', props: { is: 'span', className: 'font-bold text-sm', attrs: { style: 'color:#fff' }, slot: initials } }
  }
});

const actionButton = (id, action, label, count) => ({
  type: 'atom',
  name: 'button',
  props: {
    className: 'cluster gap-xs items-center text-sm text-subtle hover:text-accent transition-colors',
    attrs: { 'data-action': action, type: 'button' },
    slot: [
      label,
      { type: 'atom', name: 'text', props: { is: 'span', className: 'font-mono text-xs', attrs: { 'data-field': action === 'toggleLike' ? 'likes' : 'retweets', 'data-base': String(count) }, slot: String(count) } }
    ]
  }
});

const post = (id, initials, colorIndex, name, handle, time, body, likes, retweets) => ({
  type: 'atom',
  name: 'box',
  props: {
    className: 'cluster gap-md p-lg border-b border-default items-start',
    attrs: { 'data-post': id },
    slot: [
      avatar(initials, colorIndex),
      {
        type: 'atom', name: 'box', props: {
          className: 'stack gap-xs flex-1',
          slot: [
            {
              type: 'atom', name: 'box', props: {
                className: 'cluster gap-xs items-baseline',
                slot: [
                  { type: 'atom', name: 'text', props: { is: 'span', className: 'font-semibold', slot: name } },
                  { type: 'atom', name: 'text', props: { is: 'span', className: 'text-sm text-subtle', slot: `${handle} · ${time}` } }
                ]
              }
            },
            { type: 'atom', name: 'text', props: { is: 'p', className: 'text-base leading-loose', slot: body } },
            {
              type: 'atom', name: 'box', props: {
                className: 'cluster gap-2xl pt-sm',
                slot: [
                  actionButton(id, 'reply', '💬', 0),
                  actionButton(id, 'toggleRetweet', '⟲', retweets),
                  actionButton(id, 'toggleLike', '♥', likes)
                ]
              }
            }
          ]
        }
      }
    ]
  }
});

const navLink = (label, active = false) => ({
  type: 'atom',
  name: 'link',
  props: {
    url: '#',
    slot: label,
    className: `text-lg p-sm ${active ? 'font-bold text-accent' : 'text-subtle hover:text-accent'} transition-colors`
  }
});

const trend = (tag, count) => ({
  type: 'atom',
  name: 'box',
  props: {
    className: 'stack gap-xs p-md border-b border-default',
    slot: [
      { type: 'atom', name: 'text', props: { is: 'span', className: 'font-semibold text-sm', slot: tag } },
      { type: 'atom', name: 'text', props: { is: 'span', className: 'text-xs text-subtle font-mono', slot: `${count} posts` } }
    ]
  }
});

export const components = [
  {
    type: 'atom',
    name: 'box',
    props: {
      is: 'main',
      className: 'grid grid-cols-1 grid-cols-4@m gap-lg max-w-l mx-auto',
      slot: [
        // ── Left nav ────────────────────────────────────────────
        {
          type: 'atom', name: 'box', props: {
            className: 'hidden flex-col@m stack gap-xs p-lg col-span-1@m',
            slot: [
              { type: 'atom', name: 'text', props: { is: 'span', className: 'font-bold text-lg mb-md', slot: 'b0nes' } },
              navLink('Home', true),
              navLink('Explore'),
              navLink('Notifications'),
              navLink('Messages'),
              { type: 'atom', name: 'button', props: { slot: 'Post', className: 'mt-md p-md rounded-full bg-accent font-semibold' } }
            ]
          }
        },

        // ── Center timeline ─────────────────────────────────────
        {
          type: 'atom', name: 'box', props: {
            className: 'stack col-span-2@m border-l border-r border-default',
            slot: [
              { type: 'atom', name: 'text', props: { is: 'h1', className: 'font-bold text-lg p-lg border-b border-default', slot: 'Home' } },

              // Composer — static, no submit wired up. That's a form
              // handler + a database, not a rendering problem.
              {
                type: 'atom', name: 'box', props: {
                  className: 'cluster gap-md p-lg border-b border-default items-start',
                  slot: [
                    avatar('IG', 0),
                    {
                      type: 'atom', name: 'box', props: {
                        className: 'stack gap-md flex-1',
                        slot: [
                          { type: 'atom', name: 'textarea', props: { className: 'w-full text-lg', attrs: { placeholder: "What's happening?", rows: 2 } } },
                          {
                            type: 'atom', name: 'box', props: {
                              className: 'cluster justify-between items-center',
                              slot: [
                                { type: 'atom', name: 'text', props: { is: 'span', className: 'text-xs text-subtle', slot: 'Static demo — nothing posts anywhere' } },
                                { type: 'atom', name: 'button', props: { slot: 'Post', className: 'p-sm px-lg rounded-full bg-accent font-semibold text-sm' } }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },

              {
                type: 'organism', name: 'timeline', props: {
                  slot: [
                    post('1', 'IG', 0, 'Iggy', '@iggydotdev', '2h',
                      'Shipped a compose.js patch today. structured slots (headerSlot, titleSlot) now compose recursively, not just the literal `slot` prop. Should have caught that in code review.',
                      42, 8),
                    post('2', 'B0', 1, 'b0nes', '@b0nesdotdev', '4h',
                      'npx create-b0nes-app copies itself into your repo and disappears. No entry in package.json afterward. The scaffold-and-vanish is a feature, not a gap.',
                      128, 31),
                    post('3', 'BC', 2, 'bear.css', '@bearcssdotdev', '6h',
                      '6.7kb gzipped. Five-level token hierarchy: raw → primitives → tokens → properties → compositions. No purge step because there was never a build step to purge.',
                      76, 19),
                    post('4', 'IG', 0, 'Iggy', '@iggydotdev', '9h',
                      "Reminder: this whole timeline is rendering client-side counter state through a Redux-shaped Store with zero dependencies. The like button you just clicked ran on nothing but closures.",
                      201, 44)
                  ]
                }
              }
            ]
          }
        },

        // ── Right rail ──────────────────────────────────────────
        {
          type: 'atom', name: 'box', props: {
            className: 'hidden flex-col@m stack gap-lg p-lg col-span-1@m',
            slot: [
              { type: 'atom', name: 'input', props: { type: 'search', className: 'w-full', attrs: { placeholder: 'Search' } } },
              {
                type: 'atom', name: 'box', props: {
                  className: 'rounded-lg border border-default overflow-hidden',
                  slot: [
                    { type: 'atom', name: 'text', props: { is: 'h2', className: 'font-bold p-md border-b border-default', slot: 'Trending' } },
                    trend('#ZeroDependencies', 1204),
                    trend('#b0nes', 892),
                    trend('#NoBuildStep', 431)
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  }
];
