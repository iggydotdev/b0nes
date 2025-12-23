// src/components/organisms/spa/templates/todo.js

export const components = (todo) => [
  {
    type: 'atom',
    name: 'box',
    props: {
      slot: [
        {
          type: 'atom',
          name: 'text',
          props: { is: 'h1', slot: 'Todo Detail' }
        },
        {
          type: 'atom',
          name: 'text',
          props: {
            is: 'p',
            slot: [
              {
                type: 'atom',
                name: 'text',
                props: { 
                  is: 'strong', 
                  slot: '{{currentTodoText}}' 
                }
              }
            ]
          }
        },
        {
          type: 'atom',
          name: 'text',
          props: {
            is: 'p',
            slot: 'Status: {{currentStatus}}'
          }
        },
        {
          type: 'atom',
          name: 'input',
          props: {
            type: 'checkbox',
            attrs: `data-action="toggle" data-id="${todo.id}"`,
            checked: '{{currentTodo.done}}'
          }
        },
        {
          type: 'atom',
          name: 'button',
          props: {
            attrs: `data-action="toggle" data-id="${todo.id}"`,
            slot: 'Toggle'
          }
        },
        {
          type: 'atom',
          name: 'button',
          props: {
            attrs: 'data-fsm-event="GOTO_TODOS"',
            slot: '← Back to List'
          }
        }
      ]
    }
  }
];

export default components;