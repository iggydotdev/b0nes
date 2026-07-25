// Client behavior for organisms:timeline
// Mirrors the pattern already established in multi-step-form/client.js:
// createStore + delegated click handling + a render() that patches only
// the DOM nodes that changed. No backend — the "database" is whatever
// numbers the server already rendered into data-base attributes.

import { createStore } from '/assets/js/client/store.js';

export const client = (root) => {
    // Seed store state from what SSR already put on the page. The server
    // is still the source of truth for initial counts — JS just takes
    // over the interaction from there.
    const seed = {};
    root.querySelectorAll('[data-post]').forEach((post) => {
        const id = post.dataset.post;
        seed[id] = {
            liked: false,
            retweeted: false,
            likes: Number(post.querySelector('[data-field="likes"]').dataset.base),
            retweets: Number(post.querySelector('[data-field="retweets"]').dataset.base)
        };
    });

    const store = createStore({
        state: { posts: seed },
        actions: {
            toggleLike: (state, id) => {
                const post = state.posts[id];
                const liked = !post.liked;
                return {
                    posts: {
                        ...state.posts,
                        [id]: { ...post, liked, likes: post.likes + (liked ? 1 : -1) }
                    }
                };
            },
            toggleRetweet: (state, id) => {
                const post = state.posts[id];
                const retweeted = !post.retweeted;
                return {
                    posts: {
                        ...state.posts,
                        [id]: { ...post, retweeted, retweets: post.retweets + (retweeted ? 1 : -1) }
                    }
                };
            }
        }
    });

    const render = () => {
        const { posts } = store.getState();
        Object.entries(posts).forEach(([id, p]) => {
            const post = root.querySelector(`[data-post="${id}"]`);
            if (!post) return;

            post.querySelector('[data-field="likes"]').textContent = p.likes;
            post.querySelector('[data-field="retweets"]').textContent = p.retweets;

            // Toggle existing bear.css utility classes directly — no
            // bespoke "active" CSS needed, the utility layer already
            // has the color we want.
            post.querySelector('[data-action="toggleLike"]').classList.toggle('text-accent', p.liked);
            post.querySelector('[data-action="toggleRetweet"]').classList.toggle('text-accent', p.retweeted);
        });
    };

    const handleClick = (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const postEl = btn.closest('[data-post]');
        if (!postEl) return;
        store.dispatch(btn.dataset.action, postEl.dataset.post);
    };

    root.addEventListener('click', handleClick);
    store.subscribe(render);

    return () => root.removeEventListener('click', handleClick);
};
