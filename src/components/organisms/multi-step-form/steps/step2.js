export const step2 = [
{ type: 'atom', name: 'box', props: { 'data-step': '2', hidden: true, slot: [
        { type: 'atom', name: 'text', props: { is: 'h3', slot: 'Step 2 – Email' } },
        { type: 'atom', name: 'input', props: { type: 'email', name: 'email', placeholder: 'you@example.com', required: true } },
        { type: 'atom', name: 'button', props: { slot: '← Back', 'data-action': 'back' } },
        { type: 'atom', name: 'button', props: { slot: 'Next →', 'data-action': 'next' } }
      ]}},
];