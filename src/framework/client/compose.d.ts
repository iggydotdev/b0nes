/**
 * b0nes Client Compose - Dynamic client-side component composition
 *
 * NOTE: This is for DYNAMIC templates only. Static templates should be pre-compiled.
 */

import type { ComponentDescriptor } from '../core/compose';

/**
 * Composes component descriptors into HTML on the client (async).
 * If given a string, returns it directly (already-compiled HTML).
 *
 * @param components - Component descriptors or a pre-compiled HTML string
 * @returns Rendered HTML string
 */
export function compose(
  components?: ComponentDescriptor[] | string
): Promise<string>;

/** Clears the client-side component module cache (useful for hot-reload in dev). */
export function clearComposeCache(): void;

export default compose;
