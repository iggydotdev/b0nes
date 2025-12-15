export const meta = { title: 'b0nes SPA Demo', interactive: true };

export const components = [
    { type: 'organism', name: 'header', props: { slot: [
        { type: 'atom', name: 'link', props: { slot: ['b0nes SPA'], url: '/examples/spa' } },
        { type: 'atom', name: 'link', props: { slot: ['Todos'], attrs: 'data-fsm-event="GOTO_TODOS"', url: '#todos' }},
        { type: 'atom', name: 'link', props: { slot: ['About'], attrs: 'data-fsm-event="GOTO_ABOUT"', url: "#about" }}
    ]}},
  
  {type: 'organism', name: 'spa', props: {slot: ['Loading...']}}
];