export default {
          title: 'SPAs with FSM Router',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-orange-400">Client-Side Routing</h2>
              <pre class="bg-gray-800 p-4 rounded-lg text-cyan-300 text-xs md:text-sm font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl overflow-auto"><code>// Define routes
const routes = [
  { name: 'home', url: '/', template: '&lt;h1&gt;Home&lt;/h1&gt;' },
  { name: 'about', url: '/about', template: '&lt;h1&gt;About&lt;/h1&gt;' },
  { name: 'blog', url: '/blog/:id', template: (params) => 
      \`&lt;h1&gt;Post \${params.id}&lt;/h1&gt;\`
  }
];

// Create router FSM
const { fsm } = createRouterFSM(routes);

// Connect to DOM
connectFSMtoDOM(fsm, document.getElementById('app'), routes);

// Navigate via events
<button data-fsm-event="GOTO_ABOUT">About</button>

// Or programmatically
fsm.send('GOTO_BLOG', { id: 123 });

// Handles URL changes, history, back/forward.
// React Router complexity: ZERO.</code></pre>
            </div>
          `
        };