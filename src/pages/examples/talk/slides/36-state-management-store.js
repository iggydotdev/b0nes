export default {
          title: 'State Management: Store',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-purple-400">Redux-style Store</h2>
              <pre class="bg-gray-800 p-4 rounded-lg text-pink-300 text-sm md:text-base font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl overflow-auto"><code>// client/store.js
const store = createStore({
  state: { count: 0 },
  actions: {
    increment: (state) => ({ count: state.count + 1 }),
    decrement: (state) => ({ count: state.count - 1 })
  },
  getters: {
    doubled: (state) => state.count * 2
  }
});

store.dispatch('increment'); // count = 1
store.getState();            // { count: 1 }
store.computed('doubled');   // 2

// Subscribe to changes
store.subscribe((change) => {
  console.log('State updated!', change);
});

// Redux without the boilerplate hell.</code></pre>
            </div>
          `
        };
