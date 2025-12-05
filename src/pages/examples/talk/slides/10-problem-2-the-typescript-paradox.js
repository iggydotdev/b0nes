export default {
          title: 'Problem #2 - The TypeScript Paradox',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-orange-400">The Compilation Inception</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-pink-300 text-base md:text-xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl"><code>// We added a language to fix JS...
// That compiles back to JS...
// To fix problems JS already solved...

TypeScript → transpile → JavaScript
JSX → transpile → JavaScript  
Sass → transpile → CSS
ES2024 → transpile → ES5

// At what point did we forget
// the browser already runs JS?</code></pre>
            </div>
          `
        };