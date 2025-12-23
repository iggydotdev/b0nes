// src/components/organisms/spa/organisms.spa.client.js
import { createRouterFSM, connectFSMtoDOM } from '/client/fsm.js';

export const client = async (root) => {
    // Helper to wait for config if it's not there yet (scripts might be loading)
    const getSpaConfig = async (retries = 5, delay = 50) => {
        for (let i = 0; i < retries; i++) {
            if (window.spaConfig) return window.spaConfig;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        return null;
    };

    try {
        const config = await getSpaConfig();
        
        // Check for user config
        if (!config) {
            console.error('[SPA] No window.spaConfig found after waiting. Configure your SPA in the page file!');
            root.innerHTML = '<p style="color:red;">SPA Error: Missing window.spaConfig</p>';
            return;
        }
    
    const { routes, store, onInit } = config;
    
    if (!routes || routes.length === 0) {
        console.error('[SPA] No routes provided in window.spaConfig');
        return;
    }
    
    // 🔗 Reactivity: Granular updates instead of full re-renders
    const updateBindings = () => {
        root.querySelectorAll('[data-b0nes-bind]').forEach(el => {
            const bindings = el.dataset.b0nesBind.split(',');
            
            bindings.forEach(binding => {
                const [path, targetProp] = binding.split(':');
                let value = store.get(path);
                
                // Fallback to computed if needed
                if (value === undefined && store.computed) {
                    value = store.computed(path);
                }

                if (targetProp) {
                    // Explicit property binding (e.g. path:value, path:checked)
                    if (targetProp === 'checked') {
                        el.checked = !!value;
                    } else {
                        // For other properties (value, disabled, etc)
                        const newVal = value !== undefined ? String(value) : '';
                        if (el[targetProp] !== newVal) el[targetProp] = newVal;
                    }
                } else {
                    // Default smart binding
                    if (el.type === 'checkbox' || el.type === 'radio') {
                        el.checked = !!value;
                    } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
                        const newVal = value !== undefined ? String(value) : '';
                        if (el.value !== newVal) el.value = newVal;
                    } else {
                        const newText = String(value !== undefined ? value : '');
                        if (el.textContent !== newText) el.textContent = newText;
                    }
                }
            });
        });
    };

    // Set up FSM router
    const { fsm } = createRouterFSM(routes);
    const cleanup = await connectFSMtoDOM(fsm, root, routes, {
        onRender: () => {
            console.log('[SPA] Render complete, syncing bindings');
            updateBindings();
        }
    });

    // Wire up store if provided
    let storeUnsubscribe;
    if (store) {
        storeUnsubscribe = store.subscribe(() => {
            console.log('[SPA] Store updated, applying granular updates...');
            updateBindings();
            
            // Still allow FSM to react if there's a state change requested in the state?
            // (Standard b0nes pattern: use actions to change state, but here we just update UI)
        });
    }
    
    // Generic event delegation
    const handleClick = (e) => {
        // Toggle action (if store exists)
        const toggleTarget = e.target.closest('[data-action="toggle"]');
        if (toggleTarget && store) {
            const id = Number(toggleTarget.dataset.id);
            const action = toggleTarget.dataset.actionName || 'toggleTodo';
            store.dispatch(action, id);
        }
        
        // Custom actions
        const action = e.target.dataset.action;
        if (action && store && store.can && store.can(action)) {
            store.dispatch(action, e.target.dataset);
        }
    };
    
    root.addEventListener('click', handleClick);
    
    // Call user's onInit if provided
    if (onInit && typeof onInit === 'function') {
        onInit({ fsm, store, root });
    }
    
    // Cleanup function
    return () => {
        cleanup();
        if (storeUnsubscribe) storeUnsubscribe();
        root.removeEventListener('click', handleClick);
    };
    } catch (error) {
        console.error('[SPA] Initialization failed:', error);
        root.innerHTML = `<p style="color:red;">SPA Initialization Error: ${error.message}</p>`;
    }
};

// // src/components/organisms/spa/organisms.spa.client.js
// import { createStore } from '/assets/js/client/store.js';
// import { createRouterFSM, connectFSMtoDOM } from '/assets/js/client/fsm.js';

// // 🎯 Import PRE-COMPILED templates (works in both dev and prod!)
// import * as templates from '/assets/js/spa-templates.js';

// /**
//  * SPA Client Behavior
//  * Uses FSM routing with pre-compiled templates
//  */
// export const client = async (root) => {
//     console.log('[SPA] Initializing...');
    
//     // Global store for app state
//     window.store = createStore({
//         state: { 
//             user: 'Grok', 
//             todos: [
//                 { id: 1, text: 'Learn b0nes', done: true },
//                 { id: 2, text: 'Build SPA', done: false },
//                 { id: 3, text: 'Win conference', done: false }
//             ],
//             currentTodo: null
//         },
//         actions: {
//             toggleTodo: (state, id) => ({
//                 todos: state.todos.map(t => 
//                     t.id === id ? { ...t, done: !t.done } : t
//                 )
//             }),
//             setCurrentTodo: (state, id) => ({ 
//                 currentTodo: state.todos.find(t => t.id === id) 
//             })
//         }
//     });

//     const getTodosTemplate = (todos) => {
        
//         // If template is a function, call it with data
//         let template
//         if (typeof templates.todos === 'function') {
//             console.log('Generating todos template with', todos.length, 'items');
//          template = templates.todos(todos)
//         } else {
//             console.log('Using static todos template');
//            template =  templates.todos;
//         }
//         console.log('Generated todos template with', todos.length, 'items', template);
//         return template;
//     };
//     // Define routes using PRE-COMPILED templates
//     const routes = [
//         {
//             name: 'home',
//             url: '/',
//             // Static template - already compiled to HTML string
//             template: templates.home,
//             onEnter: (context) => {
//                 console.log('[SPA] Home page loaded');
//             }
//         },
//         {
//             name: 'todos',
//             url: '/#todos',
//             // Dynamic template - function that returns HTML
//             template: `${getTodosTemplate(window.store.getState().todos)}`,
//             onEnter: (context) => {
//                 console.log('[SPA] Todos page loaded');
//             }
//         },
//         {
//             name: 'todo',
//             url: '/todos/:id',
//             // Dynamic template with params
//             template: (params) => {
//                 const todo = window.store.getState().todos.find(
//                     t => t.id == params.id
//                 );
                
//                 if (!todo) {
//                     return '<h1>Todo not found</h1><button data-fsm-event="GOTO_TODOS">← Back</button>';
//                 }
                
//                 // Template function expects todo object
//                 return typeof templates.todo === 'function'
//                     ? templates.todo(todo)
//                     : templates.todo;
//             },
//             onEnter: (context, data) => {
//                 const id = parseInt(data?.id);
//                 window.store.dispatch('setCurrentTodo', id);
//                 console.log('[SPA] Todo detail loaded:', id);
//             }
//         },
//         {
//             name: 'about',
//             url: '/#about',
//             // Static template
//             template: templates.about,
//             onEnter: (context) => {
//                 console.log('[SPA] About page loaded');
//             }
//         }
//     ];

//     // Create FSM router
//     const { fsm } = createRouterFSM(routes);
    
//     // Connect to DOM
//     const cleanup = connectFSMtoDOM(fsm, root, routes);

//     // Subscribe to store changes and re-render current page
//     const storeUnsubscribe = window.store.subscribe(() => {
//         const currentState = fsm.getState();
//         // Force re-render by transitioning to same state
//         fsm.send(`GOTO_${currentState.toUpperCase()}`);
//     });

//     // Event delegation for todos
//     root.addEventListener('click', handleClick);
    
//     function handleClick(e) {
//         // Toggle todo
//         if (e.target.matches('[data-action="toggle"]')) {
//             e.preventDefault();
//             const id = parseInt(e.target.dataset.id);
//             window.store.dispatch('toggleTodo', id);
//         }
//     }
    
//     console.log('[SPA] ✅ Initialized with', routes.length, 'routes');

//     // Cleanup function
//     return () => {
//         console.log('[SPA] Cleaning up...');
//         cleanup();
//         storeUnsubscribe();
//         root.removeEventListener('click', handleClick);
//     };
// };