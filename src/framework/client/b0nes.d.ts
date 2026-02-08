/**
 * b0nes Client Runtime
 * Progressive enhancement: discovers `data-b0nes` elements, lazy-loads behaviors,
 * and tracks cleanup functions.
 */

/** Behavior function: receives the DOM element, optionally returns a cleanup function. */
export type BehaviorFunction = (el: HTMLElement) => void | (() => void);

/** Memory statistics */
export interface MemoryStats {
  /** Number of currently active component instances */
  activeInstances: number;
  /** Total number of tracked event listeners */
  trackedListeners: number;
  /** Number of registered behavior modules */
  registeredBehaviors: number;
}

/** Safe addEventListener wrapper return type */
export type RemoveListenerFunction = () => void;

/** The global b0nes runtime object (available as `window.b0nes`). */
export interface B0nesRuntime {
  /** Set of currently active component DOM elements. */
  activeInstances: Set<HTMLElement>;

  /** WeakMap of element -> cleanup function. */
  instanceCleanup: WeakMap<HTMLElement, () => void>;

  /** Registered behavior functions keyed by component name. */
  behaviors: Record<string, BehaviorFunction>;

  /** Utility functions for component developers. */
  utils: {
    /**
     * Safe addEventListener wrapper that tracks listeners for automatic cleanup.
     * @returns A function to remove this specific listener.
     */
    addEventListener(
      element: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): RemoveListenerFunction;
  };

  /** Register a behavior function by name. */
  register(name: string, behavior: BehaviorFunction): void;

  /**
   * Initialize all `[data-b0nes]` components within a root element.
   * @returns The number of components initialized synchronously.
   */
  init(root?: Document | HTMLElement): number;

  /**
   * Destroy a single component instance and run its cleanup.
   * @returns `true` if resources were cleaned up.
   */
  destroy(el: HTMLElement): boolean;

  /**
   * Destroy all active component instances.
   * @returns The number of components destroyed.
   */
  destroyAll(): number;

  /** Get memory/resource statistics (useful for debugging). */
  getMemoryStats(): MemoryStats;
}

declare global {
  interface Window {
    b0nes: B0nesRuntime;
  }
}
