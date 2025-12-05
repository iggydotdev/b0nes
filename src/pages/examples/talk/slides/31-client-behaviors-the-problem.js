export default {
          title: 'Client Behaviors: The Problem',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-red-400">Server Rendered ≠ Interactive</h2>
              <pre class="bg-gray-800 p-4 rounded-lg text-gray-300 text-lg md:text-2xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-2xl"><code>// Server gives you:
'&lt;div class="tabs"&gt;
  &lt;button class="tab-btn"&gt;Tab 1&lt;/button&gt;
  &lt;button class="tab-btn"&gt;Tab 2&lt;/button&gt;
  &lt;div class="tab-panel"&gt;Content&lt;/div&gt;
&lt;/div&gt;'

// Cool HTML. But it does nothing.
// No clicks. No interaction. Dead fish.</code></pre>
              <p class="mt-6 text-2xl text-yellow-400 text-center">We need JavaScript. But <span class="font-bold">how much?</span></p>
            </div>
          `
        };