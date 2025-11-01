/**
 * URLPattern Loader
 * Automatically detects and loads polyfill if needed
 * Compatible with Node v20+ and modern browsers
 */

/**
 * Detects if URLPattern is natively available
 */
const hasNativeSupport = () => {
  try {
    // Check if URLPattern exists and is functional
    if (typeof URLPattern !== 'undefined') {
      // Quick functionality test
      const pattern = new URLPattern({ pathname: '/test' });
      const result = pattern.test('/test');
      return result === true;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Loads the polyfill dynamically
 */
const loadPolyfill = async () => {
  try {
    const { URLPattern: PolyfillURLPattern } = await import('./urlpattern-polyfill.js');
    
    // Install globally
    globalThis.URLPattern = PolyfillURLPattern;
    
    return PolyfillURLPattern;
  } catch (error) {
    console.error('[b0nes] Failed to load URLPattern polyfill:', error);
    throw error;
  }
};

/**
 * Ensures URLPattern is available
 * Returns a promise that resolves to URLPattern constructor
 */
export const ensureURLPattern = async () => {
  if (hasNativeSupport()) {
    return globalThis.URLPattern;
  }
  
  return await loadPolyfill();
};

/**
 * Synchronous version - imports polyfill at module load time
 */
export const getURLPattern = () => {
  if (hasNativeSupport()) {
    return globalThis.URLPattern;
  }
  
  // For synchronous usage, import the polyfill
  // This works because the polyfill auto-installs
  const { URLPattern } = require('./urlpattern-polyfill.js');
  return URLPattern;
};

// Auto-load polyfill if needed (for ESM imports)
if (!hasNativeSupport()) {
  import('./urlpattern-polyfill.js').catch(err => {
    console.error('[b0nes] Failed to auto-load URLPattern polyfill:', err);
  });
}

export default { ensureURLPattern, getURLPattern, hasNativeSupport };