// 🦴 b0nes Pre-compiled SPA Templates
// ⚠️  DO NOT EDIT - This file is auto-generated at build time
// Generated: 2025-12-15T21:22:48.528Z

// Static templates (pre-compiled HTML)
const staticTemplates = {
  "about": "<div class=\"box\"><h1 class=\"text\">About</h1>\n<p class=\"text\">b0nes: Zero deps, FSM router, explicit state. The future is vanilla.</p>\n<button type=\"button\" class=\"btn\" data-fsm-event=\"GOTO_HOME\">← Home</button></div>",
  "home": "<div class=\"box\"><h1 class=\"text\">Home</h1>\n<p class=\"text\">Welcome!</p>\n<button type=\"button\" class=\"btn\" data-fsm-event=\"GOTO_TODOS\">Go to Todos</button></div>"
};

// Dynamic templates (functions that return HTML)
const dynamicTemplates = {
  todo: (todo) => [
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
                  slot: todo.text 
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
            slot: `Status: ${todo.done ? 'Done ✅' : 'Not done'}`
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
],
  todos: (todos) => [
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
]
};

// Export all templates (static + dynamic)
export const templates = {
  ...staticTemplates,
  ...dynamicTemplates
};

// Individual exports for convenience
export const about = templates.about;
export const home = templates.home;
export const todo = templates.todo;
export const todos = templates.todos;

export default templates;
