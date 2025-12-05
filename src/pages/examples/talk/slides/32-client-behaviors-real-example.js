export default {
          title: 'Client Behaviors: Real Example',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-purple-400">Tabs Behavior</h2>
              <pre class="bg-gray-800 p-4 rounded-lg text-pink-300 text-xs md:text-sm font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl overflow-auto"><code>// molecules/tabs/molecules.tabs.client.js
export const client = (el) => {
  const buttons = el.querySelectorAll('.tab-btn');
  const panels = el.querySelectorAll('.tab-panel');
  
  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      // Hide all panels
      panels.forEach(p => p.hidden = true);
      buttons.forEach(b => b.classList.remove('active'));
      
      // Show clicked panel
      panels[i].hidden = false;
      btn.classList.add('active');
    });
  });
  
  // Return cleanup (optional)
  return () => {
    buttons.forEach(b => b.replaceWith(b.cloneNode(true)));
  };
};

// Vanilla JS. No framework. No problem.</code></pre>
            </div>
          `
        };