export const meta = { title: 'Blog Post' };

export async function components(params) {
  const post = await fetchPost(params.slug); // or read from fs, whatever
  return [
    { type: 'organism', name: 'header', props: {} },
    { type: 'atom', name: 'text', props: { is: 'h1', slot: post.title } },
    { type: 'atom', name: 'text', props: { slot: post.body } },
    { type: 'organism', name: 'footer', props: {} }
  ];
}