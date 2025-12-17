// src/pages/examples/spa/index.js
import { createStore } from '/client/store.js';

// Import templates (now they're client-side only!)
import { components as homeComponents } from './templates/home.js';
import { components as todosComponents } from './templates/todos.js';
import { components as todoComponents } from './templates/todo.js';
import { components as aboutComponents } from './templates/about.js';

// NOW window exists because we're in the browser!
console.log('[SPA] Setting up config...');
window.spaConfig = {
    store: createStore({
        state: { 
            user: 'Grok', 
            todos: [
                { id: 1, text: 'Learn b0nes', done: true },
                { id: 2, text: 'Build SPA', done: false }
            ]
        },
        actions: {
            toggleTodo: (state, id) => ({
                todos: state.todos.map(t => 
                    t.id === id ? { ...t, done: !t.done } : t
                )
            })
        }
    }),
    
    routes: [
        {
            name: 'home',
            url: '/',
            template: homeComponents
        },
        {
            name: 'todos',
            url: '/todos',
            template: () => todosComponents(window.spaConfig.store.getState().todos)
        },
        {
            name: 'todo',
            url: '/todos/:id',
            template: (params) => {
                const todo = window.spaConfig.store.getState()
                    .todos.find(t => t.id == params.id);
                return todo ? todoComponents(todo) : [
                    { type: 'atom', name: 'text', props: { is: 'p', slot: 'Todo not found' } }
                ];
            }
        },
        {
            name: 'about',
            url: '/about',
            template: aboutComponents
        }
    ]
};

console.log('[SPA] Config loaded!');