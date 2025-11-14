// Documentation page (dynamic)
export const components = (data) => [
  {
    type: 'organism',
    name: 'header',
    props: {
      slot: [
        { type: 'atom', name: 'link', props: { url: '/examples/home', slot: 'Home' } },
        { type: 'atom', name: 'link', props: { url: '/docs/getting-started', slot: 'Docs' } }
      ]
    }
  },
  {
    type: 'atom',
    name: 'box',
    props: {
      is: 'main',
      className: 'docs-content',
      slot: [
        {
          type: 'atom',
          name: 'text',
          props: { is: 'h1', slot: data?.title || 'Documentation' }
        },
        {
          type: 'atom',
          name: 'text',
          props: { is: 'div', slot: data?.content || 'Documentation content...' }
        }
      ]
    }
  }
];