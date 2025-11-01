

/**
 * URLPattern compatibility layer for b0nes
 * Automatically uses native URLPattern (Node 24+) or polyfill (Node 20+)
 * 
 * Zero dependencies, modern functional implementation
 */

/**
 * Check if native URLPattern is available
 */
const hasNative = () => {
  try {
    // Try to access native URLPattern
    return typeof globalThis.URLPattern !== 'undefined';
  } catch {
    return false;
  }
};

/**
 * Polyfill implementation
 * Only loaded if native URLPattern is not available
 */
const createPolyfill = () => {
  /**
   * Escapes regex special characters
   */
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  /**
   * Converts URL pattern to regex with named groups
   */
  const patternToRegex = (pattern) => {
    if (!pattern) return null;

    const regexStr = pattern
      .split('/')
      .map(segment => {
        if (!segment) return '';
        
        // Named parameter: :param -> (?<param>[^/]+)
        if (segment.startsWith(':')) {
          const paramName = segment.slice(1);
          return `(?<${paramName}>[^/]+)`;
        }
        
        // Wildcard: * -> .*
        if (segment === '*') return '.*';
        
        // Literal: escape special chars
        return escapeRegex(segment);
      })
      .join('/');

    return new RegExp(`^${regexStr}$`);
  };

  /**
   * Extracts pathname from various input formats
   */
  const getPathname = (input) => {
    if (typeof input === 'string') {
      // Relative path
      if (input.startsWith('/')) return input;
      
      // Try parsing as URL
      try {
        return new URL(input).pathname;
      } catch {
        return input;
      }
    }
    
    // URL object
    if (input?.pathname) return input.pathname;
    
    return '/';
  };

  /**
   * URLPattern polyfill class
   */
  return class URLPattern {
    #pathnameRegex = null;
    #originalPattern = null;

    constructor(pattern, baseURL) {
      // Normalize pattern input
      if (typeof pattern === 'string') {
        pattern = { pathname: pattern };
      }

      if (!pattern || typeof pattern !== 'object') {
        throw new TypeError('URLPattern requires a pattern object');
      }

      this.#originalPattern = pattern;
      this.#pathnameRegex = patternToRegex(pattern.pathname || '/');
      
      // Store pattern properties
      this.pathname = pattern.pathname || '';
      this.search = pattern.search || '';
      this.hash = pattern.hash || '';
      this.protocol = pattern.protocol || '';
      this.hostname = pattern.hostname || '';
      this.port = pattern.port || '';
    }

    /**
     * Test if input matches pattern
     */
    test(input, baseURL) {
      return this.exec(input, baseURL) !== null;
    }

    /**
     * Execute pattern match and return result
     */
    exec(input, baseURL) {
      try {
        const pathname = getPathname(input);
        
        if (!this.#pathnameRegex) return null;
        
        const match = this.#pathnameRegex.exec(pathname);
        
        if (!match) return null;

        // Build result matching native URLPattern API
        return {
          inputs: [input, baseURL].filter(Boolean),
          
          pathname: {
            input: pathname,
            groups: match.groups || {}
          },
          
          search: {
            input: '',
            groups: {}
          },
          
          hash: {
            input: '',
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
      } catch (error) {
        console.error('[URLPattern] Match error:', error);
        return null;
      }
    }
  };
};

/**
 * Get URLPattern constructor (native or polyfill)
 */
const getURLPattern = () => {
  if (hasNative()) {
    return globalThis.URLPattern;
  }
  
  // Install polyfill
  const PolyfillClass = createPolyfill();
  globalThis.URLPattern = PolyfillClass;
  console.log('[b0nes] URLPattern polyfill installed');
  
  return PolyfillClass;
};

// Export the URLPattern (native or polyfill)
export const URLPattern = getURLPattern();

// Export utility functions
export const hasNativeURLPattern = hasNative;

export default URLPattern;