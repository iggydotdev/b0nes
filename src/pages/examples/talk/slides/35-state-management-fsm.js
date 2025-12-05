export default         {
          title: 'State Management: FSM',
          content: `
            <div class="p-4 md:p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-6 text-teal-400">Finite State Machines</h2>
              <pre class="bg-gray-800 p-4 rounded-lg text-lime-300 text-sm md:text-base font-mono leading-relaxed w-full max-w-[90vw] md:max-w-3xl overflow-auto"><code>// Multi-step form with FSM
const fsm = createFSM({
  initial: 'step1',
  states: {
    step1: { on: { NEXT: 'step2' } },
    step2: { on: { NEXT: 'step3', BACK: 'step1' } },
    step3: { on: { SUBMIT: 'success', BACK: 'step2' } },
    success: {}
  }
});

fsm.send('NEXT'); // step1 → step2
fsm.send('BACK'); // step2 → step1
fsm.is('step1');  // true
fsm.can('NEXT');  // true

// Impossible states? Impossible.
// XState without the 200KB download.</code></pre>
            </div>
          `
        };