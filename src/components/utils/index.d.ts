/**
 * b0nes Component Utilities
 */

export interface SerializedHTML {
  html: string;
  dependencies?: readonly string[];
  component?: {
    type: 'atom' | 'molecule' | 'organism';
    name: string;
    props: Record<string, unknown>;
  };
}

/** Explicitly trusted markup, returned by built-in component renderers. */
export class TrustedHTML extends String {
  constructor(value: string, dependencies?: Iterable<string>);
  readonly dependencies: readonly string[];
  toJSON(): SerializedHTML;
}

export type SlotContent = string | number | boolean | TrustedHTML | SerializedHTML
  | null | undefined | readonly SlotContent[];

/** Trust assertion, not a sanitizer. Accepts strings or rendered components. */
export function html(value: string | TrustedHTML): TrustedHTML;
export function isHTML(value: unknown): value is TrustedHTML;
export function toHTMLString(value: unknown): string;
/** Marks renderer output; the renderer must escape its own inputs. */
export function defineComponent<P = Record<string, unknown>>(
  render: (props: P) => string | TrustedHTML,
  identifier?: string
): (props?: P) => TrustedHTML;
/** Serialize JSON for a script element; throws for values JSON cannot serialize. */
export function scriptData(value: unknown): string;

// -- processSlot --

export interface ProcessSlotOptions {
  /** Whether to escape HTML in string content (default: true) */
  escape?: boolean;
  /** Whether to trim whitespace (default: false) */
  trim?: boolean;
}

/** Processes slot content safely (escapes user strings by default). */
export function processSlot(
  slot: SlotContent,
  options?: ProcessSlotOptions
): string;

/** Legacy trust assertion: converts the input to a string without escaping. */
export function processSlotTrusted(
  slot: unknown
): string;

/** Converts the input to a string and escapes it, including component results. */
export function processSlotUser(
  slot: unknown
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
