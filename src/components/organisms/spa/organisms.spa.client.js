// src/components/organisms/spa/organisms.spa.client.js
import { createStore } from '/assets/js/client/store.js';
import { createRouterFSM, connectFSMtoDOM } from '/assets/js/client/fsm.js';

// 🎯 Import PRE-COMPILED templates (works in both dev and prod!)
import * as templates from '/assets/js/spa-templates.js';

/**
 * SPA Client Behavior
 * Uses FSM routing with pre-compiled templates
 */
export const client = async (root) => {
    console.log('[SPA] Initializing...');
    
    // Global store for app state
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
                todos: state.todos.map(t => 
                    t.id === id ? { ...t, done: !t.done } : t
                )
            }),
            setCurrentTodo: (state, id) => ({ 
                currentTodo: state.todos.find(t => t.id === id) 
            })
        }
    });

    const getTodosTemplate = () => {
        const todos = window.store.getState().todos;
        // If template is a function, call it with data
        const template = typeof templates.todos === 'function' 
            ? templates.todos(todos)
            : templates.todos;
        console.log('Generated todos template with', todos.length, 'items', template);
        return template;
    };
    // Define routes using PRE-COMPILED templates
    const routes = [
        {
            name: 'home',
            url: '/',
            // Static template - already compiled to HTML string
            template: templates.home,
            onEnter: (context) => {
                console.log('[SPA] Home page loaded');
            }
        },
        {
            name: 'todos',
            url: '/todos',
            // Dynamic template - function that returns HTML
            template: `${getTodosTemplate()}`,
            onEnter: (context) => {
                console.log('[SPA] Todos page loaded');
            }
        },
        {
            name: 'todo',
            url: '/todos/:id',
            // Dynamic template with params
            template: (params) => {
                const todo = window.store.getState().todos.find(
                    t => t.id == params.id
                );
                
                if (!todo) {
                    return '<h1>Todo not found</h1><button data-fsm-event="GOTO_TODOS">← Back</button>';
                }
                
                // Template function expects todo object
                return typeof templates.todo === 'function'
                    ? templates.todo(todo)
                    : templates.todo;
            },
            onEnter: (context, data) => {
                const id = parseInt(data?.id);
                window.store.dispatch('setCurrentTodo', id);
                console.log('[SPA] Todo detail loaded:', id);
            }
        },
        {
            name: 'about',
            url: '/about',
            // Static template
            template: templates.about,
            onEnter: (context) => {
                console.log('[SPA] About page loaded');
            }
        }
    ];

    // Create FSM router
    const { fsm } = createRouterFSM(routes);
    
    // Connect to DOM
    const cleanup = connectFSMtoDOM(fsm, root, routes);

    // Subscribe to store changes and re-render current page
    const storeUnsubscribe = window.store.subscribe(() => {
        const currentState = fsm.getState();
        // Force re-render by transitioning to same state
        fsm.send(`GOTO_${currentState.toUpperCase()}`);
    });

    // Event delegation for todos
    root.addEventListener('click', handleClick);
    
    function handleClick(e) {
        // Toggle todo
        if (e.target.matches('[data-action="toggle"]')) {
            e.preventDefault();
            const id = parseInt(e.target.dataset.id);
            window.store.dispatch('toggleTodo', id);
        }
    }
    
    console.log('[SPA] ✅ Initialized with', routes.length, 'routes');

    // Cleanup function
    return () => {
        console.log('[SPA] Cleaning up...');
        cleanup();
        storeUnsubscribe();
        root.removeEventListener('click', handleClick);
    };
};