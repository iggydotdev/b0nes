
export const components = [
  {
    type: 'atom',
    name: 'box',
    props: {
      slot: [
        {
          type: 'atom',
          name: 'text',
          props: { is: 'h1', slot: 'About' }
        },
        {
          type: 'atom',
          name: 'text',
          props: { 
            is: 'p', 
            slot: 'b0nes: Zero deps, FSM router, explicit state. The future is vanilla.' 
          }
        },
        {
          type: 'atom',
          name: 'button',
          props: {
            attrs: 'data-fsm-event="GOTO_HOME"',
            slot: '← Home'
          }
        }
      ]
    }
  }
];