
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
import compose from './compose.js';
import { URLPattern } from '../shared/urlPattern.js';
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
        if (typeof listener !== 'function') throw new TypeError('[ComposedFSM] Listener must be a function');
        // Each listener owns its subscriptions; disconnecting it must not detach
        // other listeners or later subscriptions on this composed machine.
        const subscriptions = [];
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

/** Compile and validate route definitions once for rendering and history matching. */
const normalizeRoutes = (routes) => {
    if (!Array.isArray(routes) || !routes.length) throw new TypeError('[Router FSM] At least one route is required');
    const names = new Set();
    return routes.map(route => {
        if (!route || typeof route.name !== 'string' || !route.name || names.has(route.name.toUpperCase()) ||
            typeof route.url !== 'string' || !route.url.startsWith('/') || route.url.startsWith('//')) {
            throw new TypeError('[Router FSM] Routes need unique names and local URL paths');
        }
        names.add(route.name.toUpperCase());
        return { ...route, pattern: route.pattern || new URLPattern({ pathname: route.url }) };
    });
};

const matchRoute = (routes, pathname) => {
    for (const route of routes) {
        const match = route.pattern.exec({ pathname });
        if (!match) continue;
        const params = Object.fromEntries(Object.entries(match.pathname.groups || {}).map(([key, value]) => {
            try { return [key, decodeURIComponent(value)]; }
            catch { return [key, value]; }
        }));
        return { route, params };
    }
    return null;
};

/** Create a router FSM and return the same normalized routes used for URL matching. */
export const createRouterFSM = (routes) => {
    const routePatterns = normalizeRoutes(routes);
    const initialMatch = matchRoute(routePatterns, window.location.pathname);
    const states = Object.fromEntries(routePatterns.map(route => [route.name, {
        on: Object.fromEntries(routePatterns.map(other => [`GOTO_${other.name.toUpperCase()}`, other.name])),
        actions: {
            onEntry: (context, data) => ({ ...(data || {}), ...(route.onEnter?.(context, data) || {}) }),
            onExit: (context, data) => route.onExit?.(context, data)
        }
    }]));
    return {
        fsm: createFSM({
            initial: initialMatch?.route.name || routePatterns[0].name,
            states,
            context: { ...(initialMatch?.params || {}), routes: routePatterns }
        }),
        routes: routePatterns
    };
};

/**
 * Render compiled HTML strings or component descriptors, and synchronize navigation.
 * The returned cleanup function also exposes render() for store-driven view refreshes.
 * Whole HTML template strings follow compose's compiled-template contract; component
 * props and slots retain their escape-by-default behavior.
 */
export const connectFSMtoDOM = (fsm, rootEl, routes, options = {}) => {
    if (!rootEl) throw new TypeError('[FSM Connector] Root element not found');
    const routePatterns = normalizeRoutes(routes);
    const routeMap = new Map(routePatterns.map(route => [route.name, route]));
    let renderVersion = 0;
    let disposed = false;
    let handlingHistory = false;

    const render = async (stateName = fsm.getState(), data = fsm.getContext()) => {
        const route = routeMap.get(stateName);
        if (!route || disposed) return;
        const version = ++renderVersion;
        const context = { ...(data || {}), ...fsm.getContext() };
        try {
            const content = typeof route.template === 'function' ? await route.template(context) : route.template;
            // Passing a compiled string directly preserves it. Strings nested in a
            // descriptor array are not component descriptors and must not be promoted.
            const input = typeof content === 'string' || Array.isArray(content) ? content : [content];
            const output = await compose(input);
            if (disposed || version !== renderVersion) return;
            options.onBeforeRender?.({ stateName, data: context });
            rootEl.innerHTML = output;
            options.onRender?.({ stateName, data: context });
        } catch (error) {
            if (!disposed && version === renderVersion) console.error(`[FSM Connector] Render failed for ${stateName}:`, error);
        }
    };

    const updateURL = (stateName, data = {}) => {
        const route = routeMap.get(stateName);
        if (!route) return;
        let missingParam = false;
        const targetPath = route.url.replace(/:([A-Za-z_][\w]*)/g, (_, name) => {
            if (data[name] == null) { missingParam = true; return `:${name}`; }
            return encodeURIComponent(String(data[name]));
        });
        if (missingParam || targetPath.includes('*')) return;
        const targetURL = new URL(targetPath, window.location.href);
        if (targetURL.origin !== window.location.origin || window.location.href === targetURL.href) return;
        // Route functions in context are not structured-cloneable. History matching
        // uses the URL, so only retain cloneable transition data as supplementary state.
        let stateData;
        try { stateData = structuredClone(Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'routes'))); }
        catch { stateData = {}; }
        window.history.pushState({ fsmState: stateName, data: stateData }, '', targetURL.href);
    };

    const collectFsmData = (element) => {
        const data = {};
        if (element.dataset.fsmData) {
            try {
                const parsed = JSON.parse(element.dataset.fsmData);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) Object.assign(data, parsed);
            } catch { console.warn('[FSM Connector] Invalid data-fsm-data JSON'); }
        }
        for (const [key, value] of Object.entries(element.dataset)) {
            if (key.startsWith('param') && key.length > 5) {
                const name = key.slice(5);
                data[name.charAt(0).toLowerCase() + name.slice(1)] = value;
            } else if (key === 'param') data.param = value;
        }
        return data;
    };

    const clickHandler = (event) => {
        const target = event.target.closest?.('[data-fsm-event]');
        if (!target || !rootEl.contains(target) || event.defaultPrevented || event.button !== 0 ||
            event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
            target.hasAttribute('download') || (target.target && target.target !== '_self')) return;
        const name = target.dataset.fsmEvent;
        if (!fsm.can(name)) return;
        event.preventDefault();
        fsm.send(name, collectFsmData(target));
    };
    rootEl.addEventListener('click', clickHandler);

    const unsubscribe = fsm.subscribe(transition => {
        // Entry hooks may normalize or supply parameters. The resulting context
        // drives both the view and URL, rather than the original event payload.
        const context = { ...(transition.data || {}), ...fsm.getContext() };
        if (!handlingHistory) updateURL(transition.to, context);
        void render(transition.to, context);
    });

    const initialRoute = routeMap.get(fsm.getState());
    const initialContext = fsm.getContext();
    try {
        const contextUpdate = initialRoute?.onEnter?.(initialContext, initialContext);
        if (contextUpdate) fsm.updateContext(contextUpdate);
    } catch (error) { console.error('[FSM Connector] Initial onEnter failed:', error); }
    // Attaching to a page must not rewrite its existing URL or add a history entry.
    void render();

    const handlePopState = () => {
        const match = matchRoute(routePatterns, window.location.pathname);
        if (!match) return;
        handlingHistory = true;
        try {
            const name = `GOTO_${match.route.name.toUpperCase()}`;
            if (fsm.can(name)) fsm.send(name, match.params);
            else void render(match.route.name, match.params);
        } finally { handlingHistory = false; }
    };
    window.addEventListener('popstate', handlePopState);

    const cleanup = () => {
        disposed = true;
        renderVersion++;
        unsubscribe();
        rootEl.removeEventListener('click', clickHandler);
        window.removeEventListener('popstate', handlePopState);
    };
    cleanup.render = () => render();
    return cleanup;
};
