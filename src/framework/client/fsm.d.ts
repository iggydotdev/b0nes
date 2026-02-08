/**
 * b0nes FSM (Finite State Machine)
 * Functional approach using closures for state management.
 */

/** Transition result returned by `send()` */
export interface Transition {
  /** Whether the transition was successful */
  success: boolean;
  /** State before the transition */
  from: string;
  /** State after the transition */
  to: string;
  /** The event that triggered the transition */
  event: string;
  /** Optional data passed with the event */
  data?: unknown;
  /** Unix timestamp of the transition */
  timestamp?: number;
}

/** State actions (lifecycle hooks) */
export interface StateActions<C = Record<string, unknown>> {
  /** Called when entering this state. May return context updates. */
  onEntry?: (context: C, data?: unknown) => Partial<C> | void;
  /** Called when exiting this state. May return context updates. */
  onExit?: (context: C, data?: unknown) => Partial<C> | void;
}

/**
 * A transition target: either a state name string, or a guard function
 * that returns the target state name based on context and data.
 */
export type TransitionTarget<C = Record<string, unknown>> =
  | string
  | ((context: C, data?: unknown) => string);

/** State definition */
export interface StateDefinition<C = Record<string, unknown>> {
  /** Map of event names to transition targets */
  on?: Record<string, TransitionTarget<C>>;
  /** Lifecycle actions for this state */
  actions?: StateActions<C>;
}

/** FSM configuration */
export interface FSMConfig<C = Record<string, unknown>> {
  /** Name of the initial state */
  initial: string;
  /** State definitions keyed by state name */
  states: Record<string, StateDefinition<C>>;
  /** Initial context data */
  context?: C;
}

/** FSM instance */
export interface FSM<C = Record<string, unknown>> {
  /** Get the current state name. */
  getState(): string;

  /** Get a copy of the current context. */
  getContext(): C;

  /** Get the transition history. */
  getHistory(): Transition[];

  /** Check if the FSM is in a specific state. */
  is(stateName: string): boolean;

  /** Check if a transition is possible for the given event. */
  can(event: string): boolean;

  /** Get all events available from the current state. */
  getAvailableEvents(): string[];

  /**
   * Send an event to transition the FSM.
   * @returns The transition result.
   */
  send(event: string, data?: unknown): Transition;

  /** Reset to the initial state, optionally with new context. */
  reset(newContext?: C): void;

  /** Update context without changing state. */
  updateContext(updater: Partial<C> | ((context: C) => Partial<C>)): void;

  /**
   * Subscribe to state transitions.
   * @returns An unsubscribe function.
   */
  subscribe(listener: (transition: Transition) => void): () => void;

  /** Generate a Mermaid state diagram of the FSM. */
  toMermaid(): string;
}

/**
 * Creates a finite state machine.
 *
 * @param config - FSM configuration (initial state, states, context)
 * @returns FSM instance
 */
export function createFSM<C extends Record<string, unknown> = Record<string, unknown>>(
  config: FSMConfig<C>
): FSM<C>;

/** Composed FSM instance (multiple machines) */
export interface ComposedFSM {
  /** Get all machine states. */
  getAllStates(): Record<string, string>;

  /** Get all machine contexts. */
  getAllContexts(): Record<string, Record<string, unknown>>;

  /**
   * Subscribe to transitions across all machines.
   * @returns An unsubscribe function.
   */
  subscribe(
    listener: (transition: Transition & { machine: string }) => void
  ): () => void;

  /** Send an event to a specific machine. */
  send(machineName: string, event: string, data?: unknown): Transition;

  /** Broadcast an event to all machines that can handle it. */
  broadcast(
    event: string,
    data?: unknown
  ): Record<string, Transition>;

  /** Direct access to individual machines. */
  machines: Record<string, FSM>;
}

/**
 * Compose multiple FSMs into a single coordinated instance.
 *
 * @param machines - Named FSM instances
 * @returns Composed FSM
 */
export function composeFSM(
  machines: Record<string, FSM>
): ComposedFSM;

/** Route definition for the router FSM */
export interface RouterFSMRoute {
  /** Unique name for this route / FSM state */
  name: string;
  /** URL path for this route */
  url: string;
  /**
   * Template to render: an HTML string, a component descriptor array,
   * or a function returning either (may be async).
   */
  template:
    | string
    | Record<string, unknown>[]
    | ((context: Record<string, unknown>) => string | Record<string, unknown>[] | Promise<string | Record<string, unknown>[]>);
  /** Callback when entering this route */
  onEnter?: (context: Record<string, unknown>, data?: unknown) => Record<string, unknown> | void;
  /** Callback when exiting this route */
  onExit?: (context: Record<string, unknown>, data?: unknown) => Record<string, unknown> | void;
}

/** Result of createRouterFSM */
export interface RouterFSMResult {
  /** The underlying FSM instance */
  fsm: FSM;
  /** Route definitions with compiled URLPattern objects */
  routes: Array<RouterFSMRoute & { pattern: InstanceType<typeof URLPattern> }>;
}

/**
 * Creates a router FSM for SPA navigation.
 *
 * @param routes - Route definitions
 * @returns Object containing the FSM and compiled route patterns
 */
export function createRouterFSM(routes: RouterFSMRoute[]): RouterFSMResult;

/** Options for connectFSMtoDOM */
export interface ConnectFSMtoDOMOptions {
  /** Callback after each render */
  onRender?: (info: { stateName: string; data?: unknown }) => void;
}

/**
 * Connects an FSM to a DOM element for rendering and URL updates.
 *
 * @param fsm - The FSM instance
 * @param rootEl - The DOM element to render into
 * @param routes - Route definitions with URLPattern
 * @param options - Optional configuration
 * @returns A cleanup function to disconnect
 */
export function connectFSMtoDOM(
  fsm: FSM,
  rootEl: HTMLElement,
  routes: Array<RouterFSMRoute & { pattern: InstanceType<typeof URLPattern> }>,
  options?: ConnectFSMtoDOMOptions
): () => void;
