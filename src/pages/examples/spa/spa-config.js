import { createStore, loggerMiddleware } from '/client/store.js';
import { compose } from '/client/compose.js'; // Client-side compose for dynamic templates

// 🎯 Import templates individually
// In Dev: these are component configs (arrays)
// In Prod: these are pre-compiled HTML strings
import home from './templates/home.js';
import todos from './templates/todos.js';
import todo from './templates/todo.js';
import about from './templates/about.js';

console.log('[SPA] Setting up config with individual templates...');

window.spaConfig = {
    store: createStore({
        middleware: [loggerMiddleware],
        state: { 
            user: 'Grok', 
            selectedId: null,
            todos: [
                { id: 1, text: 'Learn b0nes', done: true },
                { id: 2, text: 'Build SPA', done: false },
                { id: 3, text: 'Ship it', done: false }
            ]
        },
        actions: {
            toggleTodo: (state, id) => ({
                todos: state.todos.map(t => 
                    t.id === id ? { ...t, done: !t.done } : t
                )
            }),
            selectTodo: (state, id) => ({ selectedId: id })
        },
        getters: {
            currentTodo: (state) => state.todos.find(t => t.id === state.selectedId) || {},
            currentTodoText: (state) => {
                const todo = state.todos.find(t => t.id === state.selectedId);
                return todo ? todo.text : '';
            },
            currentStatus: (state) => {
                const todo = state.todos.find(t => t.id === state.selectedId);
                return todo ? (todo.done ? 'Done ✅' : 'Not done') : 'Unknown';
            }
        }
    }),
    
    routes: [
        {
            name: 'home',
            url: '/',
            template: home
        },
        {
            name: 'todos',
            url: '/todos',
            template: () => {
                const todosData = window.spaConfig.store.getState().todos;
                return typeof todos === 'function' ? todos(todosData) : todos;
            }
        },
        {
            name: 'todo',
            url: '/todos/:id',
            template: (params) => {
                const todoData = window.spaConfig.store.getState()
                    .todos.find(t => t.id == params.id);
                
                if (!todoData) {
                    return [{
                        type: 'atom',
                        name: 'text',
                        props: { is: 'h1', slot: 'Todo not found' }
                    }];
                }
                
                return typeof todo === 'function' ? todo(todoData) : todo;
            },
            onEnter: (context, data) => {
                window.spaConfig.store.dispatch('selectTodo', Number(data.id));
            }
        },
        {
            name: 'about',
            url: '/about',
            template: about
        }
    ]
};

console.log('[SPA] Config loaded with', window.spaConfig.routes.length, 'routes!');