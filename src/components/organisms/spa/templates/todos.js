import { fromConfig } from '../../../../framework/utils/mapper.js';
// ===================================
// PATTERN 2: Dynamic Template (Function)
// ===================================
// src/components/organisms/spa/templates/todos.js

// ✅ Exports function that takes data and returns component config
// Function gets preserved in compiled output, called with data at runtime
export const components = (todos) => fromConfig([
  {
    type: 'atom',
    name: 'box',
    props: {
      slot: [
        {
          type: 'atom',
          name: 'text',
          props: { is: 'h1', slot: 'My Todos' }
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
                      slot: [
                        {
                          type: 'atom',
                          name: 'input',
                          props: {
                            type: 'checkbox',
                            attrs: `${todo.done ? 'checked' : ''} data-action="toggle" data-id="${todo.id}"`
                          }
                        },
                        todo.done ? ` ✅ ${todo.text}` : ` ${todo.text}`
                      ]
                    }
                  },
                  {
                    type: 'atom',
                    name: 'button',
                    props: {
                      attrs: `data-fsm-event="GOTO_TODO" data-param="${todo.id}"`,
                      slot: 'Details'
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
            slot: '← Back Home'
          }
        }
      ]
    }
  }
]);

