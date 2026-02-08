/**
 * b0nes Core Compose - Server-side component composition
 */

/** Component type identifiers */
export type ComponentType = 'atom' | 'molecule' | 'organism';

/** A single component descriptor used for composition */
export interface ComponentDescriptor {
  /** Component category */
  type: ComponentType;
  /** Component name (must exist in the library) */
  name: string;
  /** Props to pass to the component render function */
  props?: ComponentProps;
}

/** Props that can be passed to any component */
export interface ComponentProps {
  /** Slot content: a string, or nested component descriptors */
  slot?: string | Array<string | ComponentDescriptor>;
  /** CSS class names */
  className?: string;
  /** Additional HTML attributes (string for legacy, object recommended) */
  attrs?: string | Record<string, string | boolean | number>;
  /** Any other prop the component accepts */
  [key: string]: unknown;
}

/** Context passed through the composition tree */
export interface ComposeContext {
  /** Set of component dependencies tracked during composition */
  dependencies?: Set<string>;
  /** Route information for asset path rewriting */
  route?: {
    pattern?: {
      pathname?: string;
    };
  };
}

/**
 * Composes an array of component descriptors into an HTML string.
 *
 * Features:
 * - Caches rendered components for performance
 * - Handles nested slot composition recursively
 * - Provides graceful error handling with visual fallback
 *
 * @param components - Array of component objects to compose
 * @param context - Optional context for path rewriting and dependency tracking
 * @returns Rendered HTML string
 */
export function compose(
  components?: ComponentDescriptor[],
  context?: ComposeContext
): string;

/** Clears the internal composition cache. */
export function clearCompositionCache(): void;

/** Returns the number of entries in the composition cache. */
export function getCompositionCacheSize(): number;

/** Sets a custom error fallback renderer. */
export function setErrorFallback(
  renderer: (error: Error, component: ComponentDescriptor) => string
): void;

/** Returns error statistics from the error tracker. */
export function getErrorStats(): {
  totalErrors: number;
  errorsByComponent: Record<string, number>;
};

/** Returns all tracked errors. */
export function getErrors(): Array<{
  error: Error;
  component: string;
  timestamp: number;
}>;

/** Returns errors for a specific component. */
export function getComponentErrors(
  componentName: string
): Array<{ error: Error; timestamp: number }>;

/** Clears all tracked errors. */
export function clearErrors(): void;

/** Clears the render cache. */
export function clearCache(): void;

/** Returns cache hit/miss statistics. */
export function getCacheStats(): {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
};

/** Convenience: compose a single component. */
export function composeOne(
  component: ComponentDescriptor,
  options?: Record<string, unknown>
): string;

/** Pre-warm the cache with common components. */
export function warmCache(components: ComponentDescriptor[]): void;

/** Compose multiple component arrays in batch. */
export function composeBatch(
  batches: ComponentDescriptor[][],
  options?: Record<string, unknown>
): string[];
