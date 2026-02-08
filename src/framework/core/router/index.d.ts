/**
 * b0nes Router - Structured, priority-based routing
 */

import { IncomingMessage, ServerResponse } from 'node:http';

/** Route type identifiers (in priority order) */
export type RouteType = 'exact' | 'ext' | 'prefix' | 'pattern' | 'catchall';

/** Result of a route match */
export interface RouteMatch {
  /** The matched handler function */
  handler: RouteHandler;
  /** Extracted URL parameters */
  params: Record<string, string>;
  /** The type of match that succeeded */
  type: RouteType;
  /** The pattern that matched */
  pattern: string;
}

/** Route handler function signature */
export type RouteHandler = (
  req: B0nesRequest,
  res: ServerResponse,
  url: URL
) => void | Promise<void>;

/** Middleware function signature */
export type MiddlewareFunction = (
  req: B0nesRequest,
  res: ServerResponse,
  url: URL
) => boolean | void | Promise<boolean | void>;

/** Constraint validator for pattern parameters */
export type ParamConstraint = (value: string) => boolean;

/** Extended request with b0nes properties */
export interface B0nesRequest extends IncomingMessage {
  /** Extracted URL parameters from pattern matching */
  params: Record<string, string>;
  /** Parsed query string parameters */
  query: Record<string, string>;
  /** Information about the matched route */
  routeInfo: {
    type: RouteType;
    pattern: string;
  };
}

/** Cache statistics */
export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: string;
}

/** Router instance */
export interface Router {
  // -- Registration --

  /** Add middleware to the request pipeline. */
  use(fn: MiddlewareFunction): Router;

  /** Register an exact-match route (highest priority). */
  addExact(path: string, handler: RouteHandler): Router;

  /** Register an extension-based route (e.g. `.css`, `.js`). */
  addExtension(ext: string | string[], handler: RouteHandler): Router;

  /** Register a prefix-based route (e.g. `/assets/`). */
  addPrefix(prefix: string, handler: RouteHandler): Router;

  /** Register a dynamic pattern route (URLPattern string or RegExp). */
  addPattern(pattern: string | RegExp, handler: RouteHandler): Router;

  /** Register a pattern route with per-parameter constraints. */
  addPatternWithConstraints(
    pattern: string,
    handler: RouteHandler,
    constraints: Record<string, ParamConstraint>
  ): void;

  /** Register a catch-all fallback route (lowest priority). */
  addCatchAll(handler: RouteHandler): Router;

  // -- Request handling --

  /** Match a pathname to a registered handler. */
  match(method: string, pathname: string): RouteMatch | null;

  /** Handle an incoming HTTP request through the full middleware + route pipeline. */
  handle(req: IncomingMessage, res: ServerResponse): Promise<void>;

  // -- Utilities --

  /** Print the routing table to the console (for debugging). */
  printRoutes(): void;

  /** Get the total number of registered routes. */
  getTotalRoutes(): number;

  /** Clear the route-match cache. */
  clearCache(): void;

  /** Get cache statistics. */
  getCacheStats(): CacheStats;
}

/** Creates a new router instance. */
export function createRouter(): Router;

/** Creates a router with default logging middleware. */
export function createRouterWithDefaults(): Router;
