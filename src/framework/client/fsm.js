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
 * @param {Array} routes - Route definitions
 * @returns {Object} Router FSM
 */
export const createRouterFSM = (routes) => {
    // Build states from routes
    const states = {};
    
    routes.forEach(route => {
        states[route.name] = {
            on: {},
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
    });

    // Connect all routes bidirectionally
    routes.forEach(route => {
        routes.forEach(otherRoute => {
            if (route.name !== otherRoute.name) {
                states[route.name].on[`GOTO_${otherRoute.name.toUpperCase()}`] = otherRoute.name;
            }
        });
    });

    return createFSM({
        initial: routes[0]?.name || 'home',
        states,
        context: { routes }
    });
};
