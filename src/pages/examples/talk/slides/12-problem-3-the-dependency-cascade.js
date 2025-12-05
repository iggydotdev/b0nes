export default  {
          title: 'Problem #3 - The Dependency Cascade',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-blue-400">The Infinite Chain</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-cyan-300 text-xl md:text-2xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl"><code>React needs React-DOM
React-DOM needs scheduler
scheduler needs...

*20 dependencies deep*

Just to render a button</code></pre></div>
          `
        };