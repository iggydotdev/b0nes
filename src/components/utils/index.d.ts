/**
 * b0nes Component Utilities
 */

// -- processSlot --

export interface ProcessSlotOptions {
  /** Whether to escape HTML in string content (default: true) */
  escape?: boolean;
  /** Whether to trim whitespace (default: false) */
  trim?: boolean;
}

/** Processes slot content safely (escapes user strings by default). */
export function processSlot(
  slot: string | Array<string | Record<string, unknown>> | number | boolean | null | undefined,
  options?: ProcessSlotOptions
): string;

/** Processes slot content as trusted HTML (no escaping). */
export function processSlotTrusted(
  slot: string | string[] | null | undefined
): string;

/** Processes user-provided content (always escaped). */
export function processSlotUser(
  slot: string | string[] | null | undefined
): string;

// -- normalizeClasses --

/**
 * Normalizes CSS class names by removing extra whitespace and duplicates.
 * Accepts a string, array, or object with boolean values.
 */
export function normalizeClasses(
  classes: string | string[] | Record<string, boolean> | null | undefined
): string;

/** Merges multiple class inputs into a single normalized string. */
export function mergeClasses(
  ...classInputs: Array<string | string[] | Record<string, boolean> | null | undefined>
): string;

/** Creates a class string with a base class and optional BEM-like modifiers. */
export function createClassString(
  base: string,
  modifiers?: string | string[]
): string;

// -- escapeHtml --

/** Escapes HTML special characters to prevent XSS. */
export function escapeHtml(unsafe: string): string;

// -- escapeAttr --

/** Escapes HTML attribute values (stricter than escapeHtml). */
export function escapeAttr(value: string): string;

// -- attrsToString --

/**
 * Converts an `attrs` prop (object or string) into a safe HTML attribute string.
 *
 * - Object form: keys are attribute names, values are escaped.
 *   `true` produces valueless attributes; `false`/`null`/`undefined` are omitted.
 * - String form: passed through with a leading space (backwards compatible).
 */
export function attrsToString(
  attrs:
    | string
    | Record<string, string | boolean | number | null | undefined>
    | null
    | undefined
): string;

// -- validateProps / componentError --

export interface ComponentContext {
  componentName: string;
  componentType: string;
  props?: Record<string, unknown>;
}

/** Creates a formatted Error for component failures. */
export function createComponentError(
  message: string,
  context?: ComponentContext
): Error;

/** Validates that required props are present (throws on missing). */
export function validateProps(
  props: Record<string, unknown>,
  required: string[],
  context: ComponentContext
): void;

/** Validates prop types against a schema (throws on mismatch). */
export function validatePropTypes(
  props: Record<string, unknown>,
  schema: Record<string, string>,
  context: ComponentContext
): void;
