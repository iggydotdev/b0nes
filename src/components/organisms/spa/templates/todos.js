// src/components/organisms/spa/templates/todos.js
// Templates can be functions that return configs!

export const components = (todos) => [
  {
    type: 'atom',
    name: 'box',
    props: {
      slot: [
        {
          type: 'atom',
          name: 'text',
          props: { is: 'h1', slot: 'Todos' }
        },
        {
          type: 'atom',
          name: 'box',
          props: {
            is: 'ul',
            slot: todos.map(todo => ({
              type: 'atom',
              name: 'box',
              props: {
                is: 'li',
                slot: [
                  {
                    type: 'atom',
                    name: 'text',
                    props: {
                      is: 'label',
                      attrs: `for="todo-${todo.id}"`,
                      slot: [
                        {
                          type: 'atom',
                          name: 'input',
                          props: {
                            type: 'checkbox',
                            attrs: `${todo.done ? 'checked' : ''} data-action="toggle" data-id="${todo.id}" id="todo-${todo.id}"`
                          }
                        },
                        ` ${todo.text}`
                      ]
                    }
                  },
                  {
                    type: 'atom',
                    name: 'button',
                    props: {
                      attrs: `data-fsm-event="GOTO_TODO" data-param="${todo.id}"`,
                      slot: 'View'
                    }
                  }
                ]
              }
            }))
          }
        },
        {
          type: 'atom',
          name: 'button',
          props: {
            attrs: 'data-fsm-event="GOTO_HOME"',
            slot: 'Back Home'
          }
        }
      ]
    }
  }
];