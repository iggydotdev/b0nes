// Blog listing page
export const components = [
  {
    type: 'organism',
    name: 'header',
    props: {
      slot: [
        { type: 'atom', name: 'link', props: { url: '/examples/home', slot: 'Home' } },
        { type: 'atom', name: 'link', props: { url: '/blog', slot: 'Blog' } }
      ]
    }
  },
  {
    type: 'atom',
    name: 'box',
    props: {
      is: 'main',
      className: 'blog-listing',
      slot: [
        {
          type: 'atom',
          name: 'text',
          props: { is: 'h1', slot: 'Blog' }
        },
        {
          type: 'molecule',
          name: 'card',
          props: {
            headerSlot: 'First Post',
            contentSlot: 'This is your first blog post!',
            linkSlot: { 
              type: 'atom', 
              name: 'link', 
              props: { url: '/blog/first-post', slot: 'Read More' } 
            }
          }
        }
      ]
    }
  }
];