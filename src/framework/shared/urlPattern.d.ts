/**
 * b0nes URLPattern compatibility layer
 * Uses native URLPattern on Node 24+ or a built-in polyfill on older versions.
 */

/** Result of a URLPattern exec() call */
export interface URLPatternResult {
  inputs: unknown[];
  pathname: { input: string; groups: Record<string, string> };
  search: { input: string; groups: Record<string, string> };
  hash: { input: string; groups: Record<string, string> };
  protocol: { input: string; groups: Record<string, string> };
  username: { input: string; groups: Record<string, string> };
  password: { input: string; groups: Record<string, string> };
  hostname: { input: string; groups: Record<string, string> };
  port: { input: string; groups: Record<string, string> };
}

/** URLPattern init object */
export interface URLPatternInit {
  pathname?: string;
  search?: string;
  hash?: string;
  protocol?: string;
  hostname?: string;
  port?: string;
}

/** URLPattern constructor (native or polyfill) */
export declare class URLPattern {
  constructor(pattern: URLPatternInit | string, baseURL?: string);

  readonly pathname: string;
  readonly search: string;
  readonly hash: string;
  readonly protocol: string;
  readonly hostname: string;
  readonly port: string;

  /** Test if the input matches this pattern. */
  test(input: string | { pathname: string }, baseURL?: string): boolean;

  /** Execute the pattern match and return groups, or null if no match. */
  exec(
    input: string | { pathname: string },
    baseURL?: string
  ): URLPatternResult | null;
}

/** Whether the runtime has native URLPattern support. */
export function hasNativeURLPattern(): boolean;

export default URLPattern;
