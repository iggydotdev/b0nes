export const multiStepForm = ({ className = '', attrs = '' } = {}) => [
//   { type: 'atom', name: 'progress', props: { max: 3, value: 1, className: 'mb-4' } },
  { type: 'atom', name: 'box', props: { 
    is: 'div', 
    className,
    attrs: `data-b0nes="organisms:multi-step-form" ${attrs}`,
    slot: [
      // All steps are rendered, client will hide/show
      { type: 'atom', name: 'box', props: { attrs: 'data-step="step1"', slot: [
        { type: 'atom', name: 'text', props: { is: 'h3', slot: 'Step 1 – Name' } },
        { type: 'atom', name: 'input', props: { type: 'text', attrs:"name='name' placeholder='Your name' required" } },
        { type: 'atom', name: 'button', props: { slot: 'Next →', attrs:"data-action='next'" } }
      ]}},
      { type: 'atom', name: 'box', props: { attrs:"data-step='2' hidden", slot: [
        { type: 'atom', name: 'text', props: { is: 'h3', slot: 'Step 2 – Email' } },
        { type: 'atom', name: 'input', props: { type: 'email', attrs:"name='email' placeholder='you@example.com' required" } },
        { type: 'atom', name: 'button', props: { slot: '← Back', 'data-action': 'back' } },
        { type: 'atom', name: 'button', props: { slot: 'Next →', 'data-action': 'next' } }
      ]}},
      { type: 'atom', name: 'box', props: { attrs:"data-ste='3' hidden", slot: [
        { type: 'atom', name: 'text', props: { is: 'h3', slot: 'Step 3 – Age' } },
        { type: 'atom', name: 'input', props: { type: 'number', attrs: "name='age' placeholder='42'" } },
        { type: 'atom', name: 'button', props: { slot: '← Back', 'data-action': 'back' } },
        { type: 'atom', name: 'button', props: { slot: 'Submit', 'data-action': 'submit' } }
      ]}},
      { type: 'atom', name: 'box', props: { 'data-step': 'success', hidden: true, slot: [
        { type: 'atom', name: 'text', props: { is: 'h3', slot: '🎉 Success!' } },
        { type: 'atom', name: 'box', props: { slot: [
          { type: 'atom', name: 'text', props: { slot: 'Name: ' } },
          { type: 'atom', name: 'strong', props: { 'data-field': 'name', slot: '' } }
        ]}},
        { type: 'atom', name: 'box', props: { slot: [
          { type: 'atom', name: 'text', props: { slot: 'Email: ' } },
          { type: 'atom', name: 'strong', props: { 'data-field': 'email', slot: '' } }
        ]}},
        { type: 'atom', name: 'box', props: { slot: [
          { type: 'atom', name: 'text', props: { slot: 'Age: ' } },
          { type: 'atom', name: 'strong', props: { 'data-field': 'age', slot: '' } }
        ]}},
        { type: 'atom', name: 'button', props: { slot: 'Start Over', 'data-action': 'reset' } }
      ]}},
      
        { type: 'atom', name: 'text', props: { is:'p', slot: [
            'FSM state: ',
            { type: 'atom', name: 'text', props: { is:'strong', attrs: 'data-status=""', slot: 'step1' }}
        ]}}
      ]}}
    ]