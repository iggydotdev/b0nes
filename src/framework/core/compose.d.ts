/**
 * b0nes Core Compose - Server-side component composition
 */

/** Component type identifiers */
export type ComponentType = 'atom' | 'molecule' | 'organism';
import type { TrustedHTML, SerializedHTML } from '../../components/utils/index.js';

export type CompositionContent = string | number | boolean | TrustedHTML | SerializedHTML
  | ComponentDescriptor | null | undefined | readonly CompositionContent[];

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
  slot?: CompositionContent;
  /** CSS class names */
  className?: string;
  /** Additional HTML attributes (string for legacy, object recommended) */
  attrs?: string | Record<string, string | boolean | number | null | undefined>;
  /** Any other prop the component accepts */
  [key: string]: unknown;
}

/** Context passed through the composition tree */
export interface ComposeContext {
  /** Set of component dependencies tracked during composition */
  dependencies?: Set<string>;
  /** Shared directory URL for co-located assets (takes precedence over route URL). */
  assetBasePath?: string;
  /** Fail instead of rendering error placeholders. */
  strict?: boolean;
  /** Cache toggle retained for compatibility; composition uses the render cache. */
  cache?: boolean;
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
  components?: Array<ComponentDescriptor | TrustedHTML | SerializedHTML>,
  context?: ComposeContext
): string;

/** Clears the internal composition cache. */
export function clearCompositionCache(): void;

/** Returns the number of entries in the composition cache. */
export function getCompositionCacheSize(): number;

/** Sets a custom error fallback renderer. */
export function setErrorFallback(
  renderer: (error: { message: string; details?: string; stack?: string }, component: ComponentDescriptor) => string
): void;
export function resetErrorFallback(): void;

/** Returns error statistics from the error tracker. */
export function getErrorStats(): {
  total: number;
  byType: Record<string, number>;
};

/** Returns all tracked errors. */
export interface CompositionError {
  type: string;
  component: string;
  message: string;
  stack?: string;
  timestamp: number;
}
export function getErrors(): CompositionError[];

/** Returns errors for a specific component. */
export function getComponentErrors(
  componentName: string
): CompositionError[];

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
  hitRate: string;
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
