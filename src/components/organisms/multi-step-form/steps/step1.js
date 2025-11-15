export const step1 = [
  { type: 'atom', name: 'text', props: { is: 'h3', slot: 'Step 1 – Name' } },
  { type: 'atom', name: 'label', props: { slot: [
    { type: 'atom', name: 'text', props: { slot: 'Name' } },
    { type: 'atom', name: 'input', props: { type: 'text', name: 'name', placeholder: 'Your name', required: true } }
  ]}},
  { type: 'atom', name: 'button', props: { slot: 'Next →', 'data-fsm-event': 'NEXT' } }
];