export const step3 = [
  { type: 'atom', name: 'box', props: { 'data-step': '3', hidden: true, slot: [
        { type: 'atom', name: 'text', props: { is: 'h3', slot: 'Step 3 – Age' } },
        { type: 'atom', name: 'input', props: { type: 'number', name: 'age', placeholder: '42' } },
        { type: 'atom', name: 'button', props: { slot: '← Back', 'data-action': 'back' } },
        { type: 'atom', name: 'button', props: { slot: 'Submit', 'data-action': 'submit' } }
      ]}}
];