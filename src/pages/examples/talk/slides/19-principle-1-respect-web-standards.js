export default {
          title: 'Principle #1 - Respect Web Standards',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-green-400">HTML/CSS/JS Work Fine</h2>
              <pre class="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg text-pink-300 text-lg md:text-2xl font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl"><code>// Vanilla
&lt;button onclick="alert('Hi!')"&gt;
  Click Me
&lt;/button&gt;

// Framework "magic"
import { Button } from 'ui-lib';
&lt;Button onClick={() => alert('Hi!')};&gt;
  Click Me
&lt;/Button&gt;

// Both render the same DOM
// One downloaded a library 🤷</code></pre>
            </div>
          `
        };