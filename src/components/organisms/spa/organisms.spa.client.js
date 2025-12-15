// import { text } from '../../atoms/index.js'

import {createStore} from '/client/store.js';
import { createRouterFSM, connectFSMtoDOM } from '/client/fsm.js';

// Import templates
import {components as homeComponents} from '/spa/templates/home.js';
import {components as aboutComponents} from '/spa/templates/about.js';
import {components as todoComponents} from '/spa/templates/todo.js';
import {components as todosComponents} from '/spa/templates/todos.js';


export const client = (el) => {
    // Global store
    console.log(el)
    window.store = createStore({
    state: { 
        user: 'Grok', 
        todos: [
        { id: 1, text: 'Learn b0nes', done: true },
        { id: 2, text: 'Build SPA', done: false },
        { id: 3, text: 'Win conference', done: false }
        ],
        currentTodo: null
    },
    actions: {
        toggleTodo: (state, id) => ({
        todos: state.todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
        }),
        setCurrentTodo: (state, id) => ({ currentTodo: state.todos.find(t => t.id === id) })
    }
    });

    const spaRoutes = [
    {
        name: 'home',
        url: '/',
        template: homeComponents
        },
        {
            name: 'todos',
            url: '/todos',
            template: todosComponents(window.store.getState().todos)
        },
        {
            name: 'todo',
            url: '/todos/:id',
            template: (params) => {
            const todo = window.store.getState().todos.find(t => t.id == params.id);
            return todo ? todoComponents(todo) : 'Todo not found';
            }
        },
        {
            name: 'about',
            url: '/about',
            template: aboutComponents
        }
    ];

    const { fsm } = createRouterFSM(spaRoutes);
    connectFSMtoDOM(fsm, document.querySelector(el), spaRoutes);

    // Store → re-render on change (simple example)
    window.store.subscribe(() => {
    // Force re-render current page
    const current = fsm.getState();
    fsm.send(`GOTO_${current.toUpperCase()}`); // hacky but works for demo
    }); 
    
    
    // Event delegation

    root.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="toggle"]')) {
            e.preventDefault();
            const id = parseInt(e.target.dataset.id);
            window.store.dispatch('toggleTodo', id);
            
            // Re-render current page
            const currentState = fsm.getState();
            fsm.send(`GOTO_${currentState.toUpperCase()}`);
        }
    });
    
    return () => {
        console.log('[SPA] Cleanup');
    };
}


// src/components/organisms/spa/organisms.spa.client.js

// import { createStore } from '/client/store.js';
// import { createRouterFSM, connectFSMtoDOM } from '/client/fsm.js';

// export const client = (root) => {
//   window.appStore = createStore({
//     state: {
//       user: 'Grok',
//       todos: [
//         { id: 1, text: 'Learn b0nes', done: true },
//         { id: 2, text: 'Build SPA', done: false },
//         { id: 3, text: 'Win conference', done: false }
//       ],
//       currentTodoId: null
//     },
//     actions: {
//       toggleTodo: (state, id) => ({
//         todos: state.todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
//       }),
//       setCurrentTodo: (state, id) => ({ currentTodoId: id })
//     }
//   });

//   const getCurrentTodo = () => {
//     const s = window.appStore.getState();
//     return s.todos.find(t => t.id === s.currentTodoId);
//   };

//   const routes = [
//     {
//       name: 'home',
//       url: '/',
//       template: `
//         <h1>Home</h1>
//         <p>Welcome, ${window.appStore.getState().user}!</p>
//         <button data-fsm-event="GOTO_TODOS">Todos</button>
//         <button data-fsm-event="GOTO_ABOUT">About</button>
//       `
//     },
//     {
//       name: 'todos',
//       url: '/todos',
//       template: `
//         <h1>Todos</h1>
//         <ul>
//           ${window.appStore.getState().todos.map(todo => `
//             <li>
//               <label>
//                 <input type="checkbox" ${todo.done ? 'checked' : ''} data-action="toggle" data-id="${todo.id}">
//                 ${todo.done ? '<s>' : ''}${todo.text}${todo.done ? '</s>' : ''}
//               </label>
//               <button data-fsm-event="GOTO_TODO" data-param="${todo.id}">View</button>
//             </li>
//           `).join('')}
//         </ul>
//         <button data-fsm-event="GOTO_HOME">Home</button>
//       `
//     },
//     {
//       name: 'todo',
//       url: '/todos/:id',
//       template: (params) => {
//         const todo = getCurrentTodo();
//         if (!todo) return '<p>Todo not found</p>';
//         return `
//           <h1>${todo.text}</h1>
//           <p>Status: ${todo.done ? 'Done ✅' : 'Pending'}</p>
//           <button data-action="toggle" data-id="${todo.id}">Toggle</button>
//           <button data-fsm-event="GOTO_TODOS">Back</button>
//         `;
//       }
//     },
//     {
//       name: 'about',
//       url: '/about',
//       template: `
//         <h1>About</h1>
//         <p>b0nes: zero deps, FSM router, explicit state. The future is vanilla.</p>
//         <button data-fsm-event="GOTO_HOME">Home</button>
//       `
//     }
//   ];

//   const { fsm } = createRouterFSM(routes);
//   connectFSMtoDOM(fsm, root, routes);

//   window.appStore.subscribe(() => {
//     const current = fsm.getState();
//     fsm.send(`GOTO_${current.toUpperCase()}`);
//   });

//   root.addEventListener('click', e => {
//     if (e.target.matches('[data-action="toggle"]')) {
//       const id = Number(e.target.dataset.id);
//       window.appStore.dispatch('toggleTodo', id);
//     }
//   });
// };