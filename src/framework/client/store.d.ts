/**
 * b0nes Store - Reactive State Management
 * Functional, zero-dependency state store with computed values and middleware.
 */

/** State change record */
export interface StateChange<S = Record<string, unknown>> {
  /** Name of the action that caused the change */
  action: string;
  /** Payload passed to the action */
  payload?: unknown;
  /** State before the change */
  previousState: S;
  /** State after the change */
  state: S;
  /** Unix timestamp of the change */
  timestamp: number;
}

/** Subscription options */
export interface SubscribeOptions {
  /** Only notify when this dot-notation path changes */
  path?: string;
}

/** Middleware context passed to middleware functions */
export interface MiddlewareContext<S = Record<string, unknown>> {
  /** Get the current store state */
  getState: () => S;
  /** Dispatch an action */
  dispatch: (actionName: string, payload?: unknown) => S;
  /** The action name being dispatched */
  action: string;
  /** The payload being dispatched */
  payload?: unknown;
}

/** Middleware function signature */
export type StoreMiddleware<S = Record<string, unknown>> = (
  context: MiddlewareContext<S>,
  next: () => Partial<S>
) => Partial<S>;

/** Action function signature */
export type ActionFunction<S = Record<string, unknown>> = (
  state: S,
  payload?: unknown
) => Partial<S>;

/** Getter (computed value) function signature */
export type GetterFunction<S = Record<string, unknown>, R = unknown> = (
  state: S
) => R;

/** Store configuration */
export interface StoreConfig<S = Record<string, unknown>> {
  /** Initial state object */
  state: S;
  /** Named action functions */
  actions?: Record<string, ActionFunction<S>>;
  /** Named computed getter functions */
  getters?: Record<string, GetterFunction<S>>;
  /** Middleware stack */
  middleware?: StoreMiddleware<S>[];
}

/** Store instance */
export interface Store<S = Record<string, unknown>> {
  /** Get the full immutable state. */
  getState(): S;

  /** Get a value at a dot-notation path (e.g. `'user.profile.name'`). */
  get(path?: string): unknown;

  /** Dispatch a named action with an optional payload. Returns the updated state. */
  dispatch(actionName: string, payload?: unknown): S;

  /** Get a computed value by getter name. */
  computed(getterName: string): unknown;

  /**
   * Subscribe to state changes.
   * @returns An unsubscribe function.
   */
  subscribe(
    listener: (change: StateChange<S>) => void,
    options?: SubscribeOptions
  ): () => void;

  /** Reset the store to its initial state. */
  reset(): void;

  /** Get the state change history. */
  getHistory(): StateChange<S>[];

  /** Time-travel to a previous state by history index. */
  timeTravel(index: number): void;
}

/**
 * Creates a reactive state store.
 *
 * @param config - Store configuration (state, actions, getters, middleware)
 * @returns Store instance
 */
export function createStore<S extends Record<string, unknown> = Record<string, unknown>>(
  config: StoreConfig<S>
): Store<S>;

/** Module definition for store composition */
export interface StoreModule<S = Record<string, unknown>> {
  state: S;
  actions?: Record<string, ActionFunction<S>>;
  getters?: Record<string, GetterFunction<S>>;
}

/** Creates a store module. */
export function createModule<S extends Record<string, unknown>>(
  module: StoreModule<S>
): StoreModule<S>;

/** Combines multiple named modules into a single store config. */
export function combineModules(
  modules: Record<string, StoreModule>
): StoreConfig;

/** Creates a middleware function (identity helper). */
export function createMiddleware<S = Record<string, unknown>>(
  fn: StoreMiddleware<S>
): StoreMiddleware<S>;

/** Built-in logger middleware that logs all state changes. */
export const loggerMiddleware: StoreMiddleware;

/** Creates a persistence middleware that saves state to localStorage. */
export function persistenceMiddleware(key: string): StoreMiddleware;

/** Loads persisted state from localStorage. */
export function loadPersistedState<S = Record<string, unknown>>(
  key: string
): S | null;

/** Built-in middleware for Redux DevTools integration. */
export const devToolsMiddleware: StoreMiddleware;

/** Creates an async action helper. */
export function createAsyncAction<S = Record<string, unknown>>(
  asyncFn: (state: S, payload?: unknown) => Promise<Partial<S>>
): ActionFunction<S>;

/** Connects a store to an FSM for coordinated state management. Returns a disconnect function. */
export function connectStoreToFSM(
  store: Store,
  fsm: import('./fsm').FSM
): () => void;
