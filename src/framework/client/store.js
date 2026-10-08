/**
 * b0nes Store - Reactive State Management
 * Functional, zero-dependency state store with computed values and middleware
 * 
 * @example
 * const store = createStore({
 *   state: { count: 0 },
 *   actions: {
 *     increment: (state) => ({ count: state.count + 1 }),
 *     decrement: (state) => ({ count: state.count - 1 })
 *   }
 * });
 */

const isThenable = value => value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof value.then === 'function';

// Keep synchronous actions synchronous while supporting promises and thenables.
const resolveResult = (result, onResolved) => isThenable(result)
    ? Promise.resolve(result).then(onResolved)
    : onResolved(result);

/**
 * Creates a reactive state store
 * @param {Object} config - Store configuration
 * @param {Object} config.state - Initial state
 * @param {Object} [config.actions={}] - Functions receiving (state, payload, { getState, dispatch })
 * @param {Object} [config.getters={}] - Computed getters
 * @param {Array} [config.middleware=[]] - Middleware functions
 * @returns {Object} Store instance
 */
export const createStore = ({ state: initialState, actions = {}, getters = {}, middleware = [] }) => {
    // Validate initial state
    if (!initialState || typeof initialState !== 'object') {
        throw new Error('[Store] Initial state must be an object');
    }

    // Private state (closure)
    let state = deepFreeze({ ...initialState });
    const subscribers = new Set();
    const history = [];
    const maxHistory = 50;
    
    // Cache for computed getters
    const getterCache = new Map();

    /**
     * Deep freeze objects to prevent mutations
     * @param {*} obj - Object to freeze
     * @returns {*} Frozen object
     */
    function deepFreeze(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        
        Object.freeze(obj);
        Object.getOwnPropertyNames(obj).forEach(prop => {
            if (obj[prop] !== null && typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) {
                deepFreeze(obj[prop]);
            }
        });
        
        return obj;
    }

    /**
     * Get current state (immutable)
     * @returns {Object} Current state
     */
    const getState = () => state;

    /**
     * Get state at a specific path
     * @param {string} path - Dot-notation path (e.g., 'user.profile.name')
     * @returns {*} Value at path
     */
    const get = (path) => {
        if (!path) return state;
        
        const keys = path.split('.');
        let value = state;


        
        // 🚀 Priority: Check if the first key is a computed getter
        if (getters[keys[0]]) {
            const result = computed(keys[0]);
            // Continue path lookup on the computed value
            let val = result;
            for (let i = 1; i < keys.length; i++) {
                if (val === null || val === undefined) break;
                val = val[keys[i]];
            }
            return val;
        }
        
        // Standard state path lookup
        for (const key of keys) {
            if (value === null || value === undefined) return undefined;
            value = value[key];
        }
        
        return value;
    };

    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function
     * @param {Object} [options] - Subscription options
     * @param {string} [options.path] - Only notify on changes to this path
     * @returns {Function} Unsubscribe function
     */
    const subscribe = (listener, options = {}) => {
        if (typeof listener !== 'function') {
            throw new Error('[Store] Listener must be a function');
        }

        const subscription = { listener, options };
        subscribers.add(subscription);

        return () => subscribers.delete(subscription);
    };

    /**
     * Notify subscribers of state change
     * @param {Object} change - Change details
     */
    const readSnapshot = (snapshot, path) => {
        const [first, ...rest] = path.split('.');
        let value = getters[first] ? getters[first](snapshot) : snapshot?.[first];
        for (const key of rest) value = value?.[key];
        return value;
    };

    const notify = (change) => {
        subscribers.forEach(({ listener, options }) => {
            try {
                // Filter by path if specified
                if (options.path) {
                    const oldValue = readSnapshot(change.previousState, options.path);
                    const newValue = readSnapshot(change.state, options.path);
                    
                    if (oldValue === newValue) return; // No change to this path
                }

                listener(change);
            } catch (error) {
                console.error('[Store] Listener error:', error);
            }
        });
    };

    /**
     * Dispatch an action to update state. Actions return partial state updates;
     * middleware's next() returns the committed state, or a promise for it.
     * Middleware must return or await next() when continuing an async action.
     * @param {string} actionName - Name of action to dispatch
     * @param {*} [payload] - Payload data for action
     * @returns {Object|Promise<Object>} This action's committed state
     */
    const dispatch = (actionName, payload) => {
        const action = actions[actionName];
        if (!action) {
            console.error(`[Store] Action "${actionName}" not found`);
            return state;
        }

        if (typeof action !== 'function') {
            console.error(`[Store] Action "${actionName}" must be a function`);
            return state;
        }

        const middlewareChain = [...middleware];
        let committedState;

        const commit = updates => {
            if (!updates || typeof updates !== 'object') {
                console.warn(`[Store] Action "${actionName}" must return an object`);
                return state;
            }

            const previousState = state;
            const newState = deepFreeze({ ...state, ...updates });
            const change = {
                action: actionName,
                payload,
                previousState,
                state: newState,
                timestamp: Date.now()
            };

            state = newState;
            committedState = newState;
            getterCache.clear();
            history.push(change);
            if (history.length > maxHistory) history.shift();
            notify(change);

            // A subscriber may dispatch again. Keep this action's own snapshot.
            return newState;
        };

        const executeMiddleware = index => {
            if (index >= middlewareChain.length) {
                return resolveResult(action(state, payload, { getState, dispatch }), commit);
            }

            return middlewareChain[index]({
                getState,
                dispatch,
                action: actionName,
                payload
            }, () => executeMiddleware(index + 1));
        };

        const handleError = error => {
            console.error(`[Store] Error in action "${actionName}":`, error);
            return committedState ?? state;
        };

        try {
            const result = executeMiddleware(0);
            return isThenable(result)
                ? Promise.resolve(result).then(() => committedState ?? state, handleError)
                : committedState ?? state;
        } catch (error) {
            return handleError(error);
        }
    };

    /**
     * Get a computed value
     * @param {string} getterName - Name of getter
     * @returns {*} Computed value
     */
    const computed = (getterName) => {
        const getter = getters[getterName];
        
        if (!getter) {
            console.error(`[Store] Getter "${getterName}" not found`);
            return undefined;
        }

        // Check cache
        if (getterCache.has(getterName)) {
            return getterCache.get(getterName);
        }

        try {
            const value = getter(state);
            getterCache.set(getterName, value);
            return value;
        } catch (error) {
            console.error(`[Store] Error in getter "${getterName}":`, error);
            return undefined;
        }
    };

    /**
     * Reset store to initial state
     */
    const reset = () => {
        const previousState = state;
        state = deepFreeze({ ...initialState });
        getterCache.clear();
        history.length = 0;

        notify({
            action: 'RESET',
            previousState,
            state,
            timestamp: Date.now()
        });
    };

    /**
     * Get change history
     * @returns {Array} State change history
     */
    const getHistory = () => [...history];

    /**
     * Time travel to a previous state
     * @param {number} index - History index (0 = oldest)
     */
    const timeTravel = (index) => {
        if (index < 0 || index >= history.length) {
            console.error(`[Store] Invalid history index: ${index}`);
            return;
        }

        const change = history[index];
        const previousState = state;
        state = deepFreeze({ ...change.state });
        getterCache.clear();

        notify({
            action: 'TIME_TRAVEL',
            previousState,
            state,
            timestamp: Date.now()
        });
    };

    return {
        // State access
        getState,
        get,
        
        // Actions
        dispatch,
        
        // Computed values
        computed,
        
        // Subscriptions
        subscribe,
        
        // Utilities
        reset,
        getHistory,
        timeTravel
    };
};

/**
 * Create a store module (for organizing large stores)
 * @param {Object} module - Module configuration
 * @returns {Object} Module definition
 */
export const createModule = ({ state, actions, getters }) => {
    return { state, actions, getters };
};

/**
 * Combine multiple store modules
 * @param {Object} modules - Named modules
 * @returns {Object} Combined store configuration
 */
export const combineModules = (modules) => {
    const state = {};
    const actions = {};
    const getters = {};

    Object.entries(modules).forEach(([name, module]) => {
        // Namespace state
        state[name] = module.state;

        // Namespace actions
        Object.entries(module.actions || {}).forEach(([actionName, actionFn]) => {
            actions[`${name}/${actionName}`] = (globalState, payload, context) => {
                const moduleState = globalState[name];
                return resolveResult(actionFn(moduleState, payload, context), updates => {
                    if (!updates || typeof updates !== 'object') return updates;
                    const currentModuleState = context ? context.getState()[name] : moduleState;
                    return { [name]: { ...currentModuleState, ...updates } };
                });
            };
        });

        // Namespace getters
        Object.entries(module.getters || {}).forEach(([getterName, getterFn]) => {
            getters[`${name}/${getterName}`] = (globalState) => {
                return getterFn(globalState[name]);
            };
        });
    });

    return { state, actions, getters };
};

/**
 * Create middleware function
 * @param {Function} fn - Middleware function
 * @returns {Function} Middleware
 */
export const createMiddleware = (fn) => fn;

/**
 * Logger middleware - logs all state changes
 */
export const loggerMiddleware = ({ getState, action, payload }, next) => {
    console.group(`[Store] ${action}`);
    console.log('Payload:', payload);
    console.log('State before:', getState());

    const logAfter = result => {
        console.log('State after:', getState());
        console.groupEnd();
        return result;
    };
    const closeOnError = error => {
        console.groupEnd();
        throw error;
    };

    let result;
    try {
        result = next();
    } catch (error) {
        return closeOnError(error);
    }
    return isThenable(result)
        ? Promise.resolve(result).then(logAfter, closeOnError)
        : logAfter(result);
};

/**
 * Persistence middleware - saves state to localStorage
 * @param {string} key - localStorage key
 * @returns {Function} Middleware
 */
export const persistenceMiddleware = (key) => {
    return ({ getState }, next) => {
        return resolveResult(next(), result => {
            try {
                localStorage.setItem(key, JSON.stringify(getState()));
            } catch (error) {
                console.error('[Store] Persistence error:', error);
            }
            return result;
        });
    };
};

/**
 * Load persisted state from localStorage
 * @param {string} key - localStorage key
 * @returns {Object|null} Persisted state
 */
export const loadPersistedState = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('[Store] Load persisted state error:', error);
        return null;
    }
};

/**
 * DevTools middleware - integrates with Redux DevTools
 */
export const devToolsMiddleware = ({ getState, action, payload }, next) => {
    return resolveResult(next(), result => {
        // This middleware can also run outside a browser.
        const extension = globalThis.window?.__REDUX_DEVTOOLS_EXTENSION__;
        if (extension) {
            extension.send({ type: action, payload }, getState());
        }
        return result;
    });
};

/**
 * Async action helper
 * @param {Function} asyncFn - Async function
 * @returns {Function} Async action that returns updates or an error update
 */
export const createAsyncAction = (asyncFn) => {
    return async (state, payload) => {
        try {
            const result = await asyncFn(state, payload);
            return result;
        } catch (error) {
            console.error('[Store] Async action error:', error);
            return { error: error.message };
        }
    };
};

/**
 * Connect store to FSM for coordinated state management
 * @param {Object} store - Store instance
 * @param {Object} fsm - FSM instance
 * @returns {Function} Disconnect function
 */
export const connectStoreToFSM = (store, fsm) => {
    // Subscribe to FSM state changes and update store
    const unsubFSM = fsm.subscribe((transition) => {
        store.dispatch('fsm/setState', {
            currentState: transition.to,
            previousState: transition.from,
            event: transition.event
        });
    });

    // Subscribe to store changes that might trigger FSM events
    const unsubStore = store.subscribe((change) => {
        // Check if there's an FSM event to trigger
        const fsmEvent = change.state?.fsmEvent;
        if (fsmEvent && fsm.can(fsmEvent)) {
            fsm.send(fsmEvent);
        }
    });

    // Return disconnect function
    return () => {
        unsubFSM();
        unsubStore();
    };
};
