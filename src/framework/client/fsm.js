// // FSM = Finite State Machine
// // Lets figure this out with a demo for a multi step form
// (function fsm() {
//     // State
//     const b0nesFSMNode = document.querySelector('[data-bones-fsm]');
//     const states = {
//         "START": {
//             template: "<h1>FSM Demo</h1><button id='actionBtn' onclick='trigger('NEXT')'>Perform Action</button>",
//             url: "/demo/fsm/start",
//             on: {
//                 "RESET": {
//                     state: "START",
//                     url: "/demo/fsm/start"
//                 },
//                 "NEXT": {
//                     state: "STEP2",
//                     url: '/demo/fsm/step2'
//                 },
//             }
//         },
//         "STEP2": {
//             template: "<h1>Step 2</h1>\
//                        <button id='actionBtn1' onclick=`trigger('BACK')`>Perform Action1</button>\
//                        <button id='actionBtn2' onclick=`trigger('SUCCESS')`>Perform Action2</button>",
//             url: "/demo/fsm/step2",
//             on: {
//                 "BACK": {
//                     state: "START",
//                     url: "/demo/fsm/start",
//                 },
//                 "SEND": {
//                     state: "SUCCESS",
//                     url:  '/demo/fsm/success'
//                 }
//             }
//         },
//         "SUCCESS": {
//             template: "<h1>Step 2</h1><button id='actionBtn'>Perform Action</button>",
//             url: "/demo/fsm/success",
//         }
//     }

//     let currentState = null;

//     const setup = () => {
//         b0nesFSMNode.innerHTML = currentState.template;
//         currentState = states["START"]
//     }


//     const trigger = (action) => {
//         const newState = currentState.on[action].state;
//         const transitionTo = newState.url;
//         currentState = states[newState];
//         window.history.pushState(null, "", transitionTo);
//         //render();
//     }
    

// })();

/**
 * b0nes FSM (Finite State Machine)
 * Functional approach using closures for state management
 * Perfect for SPAs, UI flows, and complex state transitions
 * 
 * @example
 * const authFSM = createFSM({
 *   initial: 'logged-out',
 *   states: {
 *     'logged-out': {
 *       on: { LOGIN: 'logging-in' }
 *     },
 *     'logging-in': {
 *       on: { SUCCESS: 'logged-in', FAILURE: 'logged-out' }
 *     },
 *     'logged-in': {
 *       on: { LOGOUT: 'logged-out' }
 *     }
 *   }
 * });
 */
import { compose } from './compose.js';
/**
 * Creates a finite state machine
 * @param {Object} config - FSM configuration
 * @param {string} config.initial - Initial state name
 * @param {Object} config.states - State definitions
 * @param {Object} [config.context={}] - Initial context data
 * @returns {Object} FSM instance with methods
 */
export const createFSM = ({ initial, states, context = {} }) => {
    // Validate configuration
    if (!initial || !states || !states[initial]) {
        throw new Error('[FSM] Invalid configuration: initial state must exist in states');
    }

    // Private state (closure)
    let currentState = initial;
    let currentContext = { ...context };
    const listeners = new Set();
    const history = [];
    const maxHistory = 50; // Prevent memory leaks

    /**
     * Get current state
     * @returns {string} Current state name
     */
    const getState = () => currentState;

    /**
     * Get current context
     * @returns {Object} Current context data
     */
    const getContext = () => ({ ...currentContext });

    /**
     * Get state history
     * @returns {Array} State transition history
     */
    const getHistory = () => [...history];

    /**
     * Check if in a specific state
     * @param {string} stateName - State to check
     * @returns {boolean}
     */
    const is = (stateName) => currentState === stateName;

    /**
     * Check if transition is possible
     * @param {string} event - Event name
     * @returns {boolean}
     */
    const can = (event) => {
        const stateConfig = states[currentState];
        return stateConfig?.on?.[event] !== undefined;
    };

    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function
     * @returns {Function} Unsubscribe function
     */
    const subscribe = (listener) => {
        if (typeof listener !== 'function') {
            throw new Error('[FSM] Listener must be a function');
        }
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    /**
     * Notify all listeners
     * @param {Object} transition - Transition details
     */
    const notify = (transition) => {
        listeners.forEach(listener => {
            try {
                listener(transition);
            } catch (error) {
                console.error('[FSM] Listener error:', error);
            }
        });
    };

    /**
     * Execute state actions
     * @param {Object} actions - Actions to execute
     * @param {Object} eventData - Event data
     */
    const executeActions = (actions, eventData) => {
        if (!actions) return;

        // onEntry action
        if (actions.onEntry && typeof actions.onEntry === 'function') {
            try {
                const result = actions.onEntry(currentContext, eventData);
                if (result !== undefined) {
                    currentContext = { ...currentContext, ...result };
                }
            } catch (error) {
                console.error('[FSM] onEntry error:', error);
            }
        }
    };

    /**
     * Send an event to transition state
     * @param {string} event - Event name
     * @param {*} [data] - Optional event data
     * @returns {Object} Transition result
     */
    const send = (event, data) => {
        const stateConfig = states[currentState];
        const nextState = stateConfig?.on?.[event];

        // Check if transition is valid
        if (!nextState) {
            console.warn(`[FSM] No transition for event "${event}" in state "${currentState}"`);
            return {
                success: false,
                from: currentState,
                to: currentState,
                event,
                data
            };
        }

        // Handle conditional transitions (guards)
        let targetState = nextState;
        if (typeof nextState === 'function') {
            targetState = nextState(currentContext, data);
            if (!states[targetState]) {
                console.error(`[FSM] Invalid target state: "${targetState}"`);
                return { success: false, from: currentState, to: currentState, event, data };
            }
        }

        // Execute onExit action
        if (stateConfig.actions?.onExit) {
            try {
                const result = stateConfig.actions.onExit(currentContext, data);
                if (result !== undefined) {
                    currentContext = { ...currentContext, ...result };
                }
            } catch (error) {
                console.error('[FSM] onExit error:', error);
            }
        }

        // Record transition
        const transition = {
            success: true,
            from: currentState,
            to: targetState,
            event,
            data,
            timestamp: Date.now()
        };

        // Update state
        const previousState = currentState;
        currentState = targetState;

        // Execute onEntry action
        const nextStateConfig = states[targetState];
        executeActions(nextStateConfig.actions, data);

        // Add to history
        history.push(transition);
        if (history.length > maxHistory) {
            history.shift(); // Remove oldest
        }

        // Notify listeners
        notify(transition);

        return transition;
    };

    /**
     * Reset to initial state
     * @param {Object} [newContext] - Optional new context
     */
    const reset = (newContext) => {
        const previousState = currentState;
        currentState = initial;
        currentContext = newContext ? { ...newContext } : { ...context };
        history.length = 0;

        notify({
            success: true,
            from: previousState,
            to: initial,
            event: 'RESET',
            timestamp: Date.now()
        });
    };

    /**
     * Update context without changing state
     * @param {Object|Function} updater - New context or updater function
     */
    const updateContext = (updater) => {
        if (typeof updater === 'function') {
            currentContext = { ...currentContext, ...updater(currentContext) };
        } else {
            currentContext = { ...currentContext, ...updater };
        }
    };

    /**
     * Get all possible transitions from current state
     * @returns {Array<string>} Available events
     */
    const getAvailableEvents = () => {
        const stateConfig = states[currentState];
        return Object.keys(stateConfig?.on || {});
    };

    /**
     * Visualize FSM as mermaid diagram
     * @returns {string} Mermaid diagram syntax
     */
    const toMermaid = () => {
        let diagram = 'stateDiagram-v2\n';
        diagram += `    [*] --> ${initial}\n`;

        Object.entries(states).forEach(([stateName, stateConfig]) => {
            if (stateConfig.on) {
                Object.entries(stateConfig.on).forEach(([event, target]) => {
                    const targetState = typeof target === 'function' ? 'conditional' : target;
                    diagram += `    ${stateName} --> ${targetState}: ${event}\n`;
                });
            }
        });

        return diagram;
    };

    // Return public API
    return {
        // State queries
        getState,
        getContext,
        getHistory,
        is,
        can,
        getAvailableEvents,
        
        // State transitions
        send,
        reset,
        updateContext,
        
        // Subscriptions
        subscribe,
        
        // Utilities
        toMermaid
    };
};

/**
 * Compose multiple FSMs
 * Useful for complex workflows with parallel states
 * @param {Object} machines - Named FSM instances
 * @returns {Object} Composed FSM
 */
export const composeFSM = (machines) => {
    const states = {};
    const subscriptions = [];

    // Get all states
    const getAllStates = () => {
        const result = {};
        Object.entries(machines).forEach(([name, fsm]) => {
            result[name] = fsm.getState();
        });
        return result;
    };

    // Get all contexts
    const getAllContexts = () => {
        const result = {};
        Object.entries(machines).forEach(([name, fsm]) => {
            result[name] = fsm.getContext();
        });
        return result;
    };

    // Subscribe to all machines
    const subscribe = (listener) => {
        Object.entries(machines).forEach(([name, fsm]) => {
            const unsub = fsm.subscribe((transition) => {
                listener({ machine: name, ...transition });
            });
            subscriptions.push(unsub);
        });

        return () => {
            subscriptions.forEach(unsub => unsub());
            subscriptions.length = 0;
        };
    };

    // Send to specific machine
    const send = (machineName, event, data) => {
        const fsm = machines[machineName];
        if (!fsm) {
            console.error(`[ComposedFSM] Machine "${machineName}" not found`);
            return { success: false };
        }
        return fsm.send(event, data);
    };

    // Broadcast to all machines
    const broadcast = (event, data) => {
        const results = {};
        Object.entries(machines).forEach(([name, fsm]) => {
            if (fsm.can(event)) {
                results[name] = fsm.send(event, data);
            }
        });
        return results;
    };

    return {
        getAllStates,
        getAllContexts,
        subscribe,
        send,
        broadcast,
        machines // Direct access if needed
    };
};

/**
 * Create a router FSM for SPA navigation
 * @param {Array<Object>} routes - Route definitions. Each route object should have:
 *   - `name`: (string) Unique name for the route/state.
 *   - `url`: (string) The URL path for this route.
 *   - `template`: (string) The HTML string to render for this route.
 *   - `onEnter`: (Function, optional) Callback when entering this route.
 *   - `onExit`: (Function, optional) Callback when exiting this route.
 * @returns {Object} An object containing the Router FSM instance and the original routes array.
 */
export const createRouterFSM = (routes) => {
    const states = {};
    const routeUrlMap = new Map(routes.map(r => [r.url, r.name])); // Map URL to state name

    let initialRouteName = routes[0]?.name || 'home'; // Default fallback

    // Determine initial state based on current URL
    const currentPath = window.location.pathname;
    for (const route of routes) {
        // Simple exact match for now. Can be extended with urlPattern for dynamic routes.
        if (route.url === currentPath) {
            initialRouteName = route.name;
            break;
        }
    }

    routes.forEach(route => {
        states[route.name] = {
            on: {}, // Transitions will be added below
            actions: {
                onEntry: (context, data) => {
                    if (route.onEnter) {
                        return route.onEnter(context, data);
                    }
                },
                onExit: (context, data) => {
                    if (route.onExit) {
                        return route.onExit(context, data);
                    }
                }
            }
        };
        // Connect all routes bidirectionally with GOTO_ events
        routes.forEach(otherRoute => {
            if (route.name !== otherRoute.name) {
                states[route.name].on[`GOTO_${otherRoute.name.toUpperCase()}`] = otherRoute.name;
            }
        });
    });

    const routerFSM = createFSM({
        initial: initialRouteName,
        states,
        context: { routes } // Store routes in context for potential use in onEntry/onExit
    });

    return {
        fsm: routerFSM,
        routes: routes // Return the original routes array for the connector
    };
};

/**
 * Connects an FSM (typically a router FSM) to a DOM element for rendering and URL updates.
 * This acts as the "view" layer for the state machine.
 * @param {Object} fsm - The FSM instance from createFSM.
 * @param {HTMLElement} rootEl - The DOM element to render templates into.
 * @param {Array<Object>} routes - The original array of route definitions, containing `name`, `url`, and `template`.
 * @returns {Function} A cleanup function to unsubscribe and remove event listeners.
 */
export const connectFSMtoDOM = (fsm, rootEl, routes) => {
    if (!rootEl) {
        console.error('[FSM Connector] Root element not found.');
        return () => {}; // Return a no-op cleanup function
    }

    // Create a quick lookup map for route details
    const routeMap = new Map(routes.map(r => [r.name, r]));
    const routeUrlMap = new Map(routes.map(r => [r.url, r.name]));

    /**
     * Renders the template and updates the URL for a given state.
     * @param {string} stateName - The name of the state to render.
     */
    const render = (stateName) => {
        const route = routeMap.get(stateName);
        if (!route) {
            console.error(`[FSM Connector] No route config found for state: ${stateName}`);
            return;
        }

        // Render template if it exists
        if (route.template) {
            const template = compose(Array.isArray(route.template) ? route.template : [route.template]).then( t => { 
                console.log(`[FSM Connector] Rendering state: ${stateName} t:${t}`);
                rootEl.innerHTML = t 
            });
            
//            rootEl.innerHTML = template;
            
        }

        // Update URL if it exists and is different from current browser URL
        if (route.url && window.location.pathname !== route.url) {
            window.history.pushState({ fsmState: stateName }, '', route.url);
        }
    };

    // Use event delegation to handle UI events that trigger FSM transitions
    const clickHandler = (e) => {
        const target = e.target.closest('[data-fsm-event]');
        if (target) {
            e.preventDefault();
            const event = target.dataset.fsmEvent;
            if (fsm.can(event)) {
                fsm.send(event);
            } else {
                console.warn(`[FSM Connector] FSM cannot transition with event "${event}" from state "${fsm.getState()}"`);
            }
        }
    };
    rootEl.addEventListener('click', clickHandler);

    // Subscribe to FSM state changes to trigger renders
    const unsubscribe = fsm.subscribe((transition) => {
         render(transition.to);
    });

    // Initial render of the starting state
     render(fsm.getState());

    // Handle browser history navigation (back/forward buttons)
    const handlePopState =  (event) => {
        const newPath = window.location.pathname;
        const targetStateName = routeUrlMap.get(newPath);

        if (targetStateName) {
            // If the FSM is already in this state, just re-render (e.g., if context changed)
            if (fsm.is(targetStateName)) {
                render(targetStateName);
            } else {
                // Attempt to transition to the state from history via a GOTO event
                const eventName = `GOTO_${targetStateName.toUpperCase()}`;
                if (fsm.can(eventName)) {
                    fsm.send(eventName);
                } else {
                    console.warn(`[FSM Connector] Cannot transition to ${targetStateName} via popstate. Event ${eventName} not found.`);
                    // Fallback: just render the template if FSM can't transition
                    render(targetStateName);
                }
            }
        } else {
            console.warn(`[FSM Connector] No route found for URL: ${newPath} on popstate.`);
        }
    };
    window.addEventListener('popstate', handlePopState);

    // Return a cleanup function to prevent memory leaks
    return () => {
        unsubscribe();
        rootEl.removeEventListener('click', clickHandler);
        window.removeEventListener('popstate', handlePopState);
    };
};