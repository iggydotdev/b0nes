export const components = [ { type: 'atom', name: 'box', props: { 'data-step': 'success', hidden: true, slot: [
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
      { type: 'atom', name: 'p', props: { slot: [
        { type: 'atom', name: 'text', props: { slot: 'FSM state: ' } },
        { type: 'atom', name: 'strong', props: { 'data-status': '', slot: 'step1' } }
      ]}}
    ]