// src/components/organisms/spa/organisms.spa.client.js
import { createRouterFSM, connectFSMtoDOM } from '/client/fsm.js';
import { compose } from '/client/compose.js'; // Client-side compose for dynamic templates

export const client = async (root) => {

    console.log(root);
    // Helper to wait for config if it's not there yet (scripts might be loading)
    const getSpaConfig = async (retries = 5, delay = 50) => {
        for (let i = 0; i < retries; i++) {
            if (window.spaConfig) return window.spaConfig;
            await import('../../../pages/examples/spa/spa-config.js');
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
        
        // Custom render function (override default to use compose)
        const renderRoute = async (stateName, data = {}) => {
            const route = routes.find(r => r.name === stateName);
            if (!route) return;
            
            // Get template (call if function)
            let template = route.template;
            if (typeof template === 'function') {
                template = template(data);
            }
            
            // Compose and render
            const html = await compose(template);
            root.innerHTML = html;
        };
        

        // Set up FSM router
        const { fsm } = createRouterFSM(routes);

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
                            el.checked = Boolean(value);
                        } else {
                            // For other properties (value, disabled, etc)
                            const newVal = value !== undefined ? String(value) : '';
                            if (el[targetProp] !== newVal) el[targetProp] = newVal;
                        }
                    } else {
                        // Default smart binding
                        if (el.type === 'checkbox' || el.type === 'radio') {
                            el.checked = Boolean(value);
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

        const cleanup = await connectFSMtoDOM(fsm, root, routes, {
            onRender: () => {
                console.log('[SPA] Render complete, syncing bindings');
                updateBindings();
            }
        });

        // Wire up store if provided
        let storeUnsubscribe;
        if (store) {
            let lastTodosLength = store.get('todos')?.length;
            
            storeUnsubscribe = store.subscribe(() => {
                console.log('[SPA] Store updated, sync bindings');
                updateBindings();
                
                const newTodosLength = store.get('todos')?.length;
                if (newTodosLength !== lastTodosLength) {
                    console.log('[SPA] Structure changed, full re-render');
                    renderRoute(fsm.getState(), fsm.getContext());
                    lastTodosLength = newTodosLength;
                }
            });
        }
        
        // Generic event delegation for store actions
        const handleStoreClick = (e) => {
            console.log('[SPA] Click detected on:', e.target);
            
            // Store actions (if store exists)
            // We check for data-action or data-action-name
            const target = e.target.closest('[data-action], [data-action-name]');
            
            if (target && store) {
                // Determine if we should prevent default
                const isCheckable = target.type === 'checkbox' || target.type === 'radio';
                if (!isCheckable) e.preventDefault();
                
                const id = target.dataset.id ? Number(target.dataset.id) : undefined;
                const action = target.dataset.action || target.dataset.actionName;
                
                if (action) {
                    console.log('[SPA] Dispatching action:', action, 'with payload:', id);
                    store.dispatch(action, id);
                } else {
                    console.warn('[SPA] Element matched action selector but no action name found in dataset:', target.dataset);
                }
            }
        };
        
        root.addEventListener('click', handleStoreClick);
        
        // Call user's onInit if provided
        if (onInit && typeof onInit === 'function') {
            onInit({ fsm, store, root });
        }
        
        // Cleanup function
        return () => {
            cleanup();
            if (storeUnsubscribe) storeUnsubscribe();
            root.removeEventListener('click', handleStoreClick);
        };
    } catch (error) {
        console.error('[SPA] Initialization failed:', error);
        root.innerHTML = `<p style="color:red;">SPA Initialization Error: ${error.message}</p>`;
    }
};
