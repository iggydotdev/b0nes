/**
 * URLPattern Polyfill for Node.js v20+
 * Modern functional implementation with zero dependencies
 * Compatible with the URLPattern Web API standard
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URLPattern
 */

/**
 * Escapes special regex characters in a string
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Converts a URL pattern string to a regex pattern
 * Supports :param syntax for named groups
 */
const patternToRegex = (pattern) => {
  if (!pattern) return null;

  // Convert :param to named capture groups
  // :param -> (?<param>[^/]+)
  const regexStr = pattern
    .split('/')
    .map(segment => {
      if (!segment) return '';
      
      // Handle :param syntax
      if (segment.startsWith(':')) {
        const paramName = segment.slice(1);
        return `(?<${paramName}>[^/]+)`;
      }
      
      // Handle wildcards (*)
      if (segment === '*') {
        return '.*';
      }
      
      // Escape literal segments
      return escapeRegex(segment);
    })
    .join('/');

  return new RegExp(`^${regexStr}$`);
};

/**
 * Extracts pathname from various input types
 */
const extractPathname = (input) => {
  if (typeof input === 'string') {
    // Handle relative paths
    if (input.startsWith('/')) return input;
    
    // Handle full URLs
    try {
      const url = new URL(input);
      return url.pathname;
    } catch {
      return input;
    }
  }
  
  if (input && typeof input === 'object') {
    return input.pathname || '/';
  }
  
  return '/';
};

/**
 * Extracts search params from URL
 */
const extractSearch = (input) => {
  if (typeof input === 'string') {
    try {
      const url = new URL(input);
      return url.search;
    } catch {
      return '';
    }
  }
  
  if (input && typeof input === 'object') {
    return input.search || '';
  }
  
  return '';
};

/**
 * Extracts hash from URL
 */
const extractHash = (input) => {
  if (typeof input === 'string') {
    try {
      const url = new URL(input);
      return url.hash;
    } catch {
      return '';
    }
  }
  
  if (input && typeof input === 'object') {
    return input.hash || '';
  }
  
  return '';
};

/**
 * URLPattern Polyfill
 * Functional implementation using closures
 */
export class URLPattern {
  #pathnameRegex = null;
  #searchRegex = null;
  #hashRegex = null;
  #baseURL = null;

  constructor(pattern, baseURL) {
    // Handle different constructor signatures
    if (typeof pattern === 'string') {
      pattern = { pathname: pattern };
    }

    if (!pattern || typeof pattern !== 'object') {
      throw new TypeError('URLPattern constructor requires a pattern object');
    }

    // Store base URL if provided
    if (baseURL) {
      this.#baseURL = typeof baseURL === 'string' ? baseURL : baseURL.href;
    }

    // Compile patterns to regex
    this.#pathnameRegex = patternToRegex(pattern.pathname);
    this.#searchRegex = pattern.search ? patternToRegex(pattern.search) : null;
    this.#hashRegex = pattern.hash ? patternToRegex(pattern.hash) : null;

    // Store original pattern
    this.pathname = pattern.pathname || '';
    this.search = pattern.search || '';
    this.hash = pattern.hash || '';
    this.protocol = pattern.protocol || '';
    this.username = pattern.username || '';
    this.password = pattern.password || '';
    this.hostname = pattern.hostname || '';
    this.port = pattern.port || '';
  }

  /**
   * Tests if a URL matches the pattern
   */
  test(input, baseURL) {
    const result = this.exec(input, baseURL);
    return result !== null;
  }

  /**
   * Executes the pattern against a URL and returns match result
   */
  exec(input, baseURL) {
    try {
      // Resolve input to full URL if needed
      let urlString = input;
      if (typeof input === 'object' && input.href) {
        urlString = input.href;
      }

      // Apply base URL if provided
      const resolvedBase = baseURL || this.#baseURL;
      if (resolvedBase && typeof urlString === 'string' && !urlString.startsWith('http')) {
        urlString = new URL(urlString, resolvedBase).href;
      }

      // Extract components
      const pathname = extractPathname(urlString);
      const search = extractSearch(urlString);
      const hash = extractHash(urlString);

      // Match pathname
      if (this.#pathnameRegex) {
        const pathnameMatch = this.#pathnameRegex.exec(pathname);
        if (!pathnameMatch) return null;

        // Match search if pattern specified
        if (this.#searchRegex) {
          const searchMatch = this.#searchRegex.exec(search);
          if (!searchMatch) return null;
        }

        // Match hash if pattern specified
        if (this.#hashRegex) {
          const hashMatch = this.#hashRegex.exec(hash);
          if (!hashMatch) return null;
        }

        // Build result object
        return {
          inputs: [urlString, resolvedBase].filter(Boolean),
          
          pathname: {
            input: pathname,
            groups: pathnameMatch.groups || {}
          },
          
          search: {
            input: search,
            groups: {}
          },
          
          hash: {
            input: hash,
            groups: {}
          },
          
          protocol: {
            input: '',
            groups: {}
          },
          
          username: {
            input: '',
            groups: {}
          },
          
          password: {
            input: '',
            groups: {}
          },
          
          hostname: {
            input: '',
            groups: {}
          },
          
          port: {
            input: '',
            groups: {}
          }
        };
      }

      return null;
    } catch (error) {
      console.error('[URLPattern] Match error:', error);
      return null;
    }
  }
}

/**
 * Install polyfill if URLPattern is not available
 */
export const installPolyfill = () => {
  if (typeof globalThis.URLPattern === 'undefined') {
    globalThis.URLPattern = URLPattern;
    console.log('[b0nes] URLPattern polyfill installed');
    return true;
  }
  return false;
};

/**
 * Check if native URLPattern is available
 */
export const hasNativeURLPattern = () => {
  return typeof globalThis.URLPattern !== 'undefined';
};

// Auto-install if not available
if (!hasNativeURLPattern()) {
  installPolyfill();
}

export default URLPattern;