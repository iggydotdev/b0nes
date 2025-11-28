// src/framework/server/router.js
/**
 * A proper router that doesn't make you want to cry
 * Zero dependencies, maximum sanity
 * Now powered by URLPattern polyfill—because why reinvent the wheel when you can polyfill it?
 */

import { URLPattern } from './utils/urlPattern.js';  // Our hero polyfill enters stage left

export function createRouter() {
  // Private state: Still closured up like a secret society.
  const routes = new Map();
  const middlewares = [];

  // Public: Add middleware. No changes here—it's already perfect.
  function use(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function. What did you pass, a potato?');
    }
    middlewares.push(middleware);
    return this;
  }

  // Public: Register a route. Now with URLPattern magic—no more regex gymnastics!
  function register(method, pattern, handler) {
    const key = `${method.toUpperCase()}:${pattern}`;  // Stringify pattern for key if it's RegExp? Nah, assume toString works.
    if (routes.has(key)) {
      console.warn(`[Router] Overwriting existing route: ${key}. Drama alert!`);
    }
   // store either a URLPattern instance or the original RegExp
  let patternObj;
  if (pattern instanceof RegExp) {
    patternObj = pattern; // keep RegExp as-is
  } else {
    patternObj = new URLPattern({ pathname: pattern });
  }

  routes.set(key, {
    method: method.toUpperCase(),
    pattern: patternObj,
    handler,
    rawPattern: pattern
  });
    return this;
  }

  // Convenience shortcuts: Still sugary sweet.
  function get(pattern, handler) { return register('GET', pattern, handler); }
  function post(pattern, handler) { return register('POST', pattern, handler); }
  function put(pattern, handler) { return register('PUT', pattern, handler); }
  function del(pattern, handler) { return register('DELETE', pattern, handler); }

  // Public: Match request. Now using .exec({ pathname }) for that clean groups extraction.
  function match(method, pathname) {
    const methodUpper = method.toUpperCase();
    for (const [, route] of routes) {
      if (route.method !== methodUpper) continue;

      // handle URLPattern vs RegExp
      let matchResult = null;
      if (route.pattern instanceof RegExp) {
        matchResult = route.pattern.exec(pathname); // RegExp.exec expects string
        if (matchResult) {
          // no named groups from RegExp; return empty params
          return { handler: route.handler, params: {}, pattern: route.rawPattern };
        }
      } else {
        const urlMatch = route.pattern.exec({ pathname });
        if (urlMatch) {
          return {
            handler: route.handler,
            params: urlMatch.pathname.groups || {},
            pattern: route.rawPattern
          };
        }
      }
    }
    return null;
  }

  // Public: Handle request. Same async goodness, now with less regex regret.
  async function handle(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    try {
      // Middleware conga line: Unchanged and unbreakable.
      for (const middleware of middlewares) {
        const result = await middleware(req, res, url);
        if (result === true || res.headersSent) {
          return;
        }
      }
      // Match or 404: Now polyfill-powered.
      const matched = match(req.method, pathname);
      if (!matched) {
        if (!res.headersSent) {
          res.writeHead(404, { 'content-type': 'text/plain' });
          res.end('Not Found. Lost in the URL wilderness?');
        }
        return;
      }
      // Params and query: Still attached like loyal sidekicks.
      req.params = matched.params;
      req.query = Object.fromEntries(url.searchParams);
      // Handler time!
      await matched.handler(req, res, url);
      // No response? 500 with snark.
      if (!res.headersSent) {
        console.warn(`[Router] Handler for ${pathname} went silent. Ghosting much?`);
        res.writeHead(500, { 'content-type': 'text/plain' });
        res.end('Internal Server Error: Handler forgot to phone home.');
      }
    } catch (error) {
      console.error(`[Router] Boom! Error on ${pathname}:`, error);
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'text/plain' });
        res.end('Internal Server Error. We all make mistakes...');
      }
    }
  }

  // Public: Print routes. Now even prettier with raw patterns.
  function printRoutes() {
    console.log('\n📍 Registered Routes:');
    console.log('─'.repeat(60));
    for (const [key, route] of routes) {
      console.log(` ${route.method.padEnd(6)} ${route.rawPattern}`);
    }
    console.log('─'.repeat(60) + '\n');
  }

  // Expose the API: Clean, functional, and URLPattern-fied.
  return {
    use,
    register,
    get,
    post,
    put,
    del,
    match,
    handle,
    printRoutes
  };
}

/**
 * Factory with defaults: Logs requests because who doesn't love a good audit trail?
 */
export function createRouterWithDefaults() {
  const router = createRouter();
  router.use(async (req, res, url) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${url.pathname}`);
    return false;  // Proceed!
  });
  return router;
}

// Usage tip: In server.js, `const router = createRouterWithDefaults();`—same as before.