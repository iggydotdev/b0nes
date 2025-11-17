export const meta = { title: 'Blog Post' };

const fetchPost = async (params) => {
  console.log(`SLUG PASSED: ${params.slug2}`)
  return ({title: 'b0nes is great', body: `b0nes is a complete web development toolkit with **zero dependencies**. Build modern websites with components, routing, state management, and progressive enhancement—all in pure JavaScript.`})
}

export async function components(params) {
  const post = await fetchPost(params); // or read from fs, whatever
  return [
    { type: 'organism', name: 'header', props: { slot: ['asd']} },
    { type: 'atom', name: 'text', props: { is: 'h1', slot: post.title } },
    { type: 'atom', name: 'text', props: { is: 'p', slot: post.body } },
    { type: 'organism', name: 'footer', props: { slot: ['asd']} }
  ];
}