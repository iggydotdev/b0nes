/**
 * URLPattern Import Helper
 * Provides URLPattern with automatic polyfill fallback
 * Works with both Node 20+ and Node 24+
 */

let URLPatternConstructor;

try {
  // Try to import native URLPattern (Node 24+)
  const nodeUrl = await import('node:url');
  URLPatternConstructor = nodeUrl.URLPattern;
  console.log('[b0nes] Using native URLPattern from node:url');
} catch (error) {
  // Native not available, use polyfill
  console.log('[b0nes] Native URLPattern not available, loading polyfill...');
  const polyfill = await import('./urlpattern-polyfill.js');
  URLPatternConstructor = polyfill.URLPattern;
  console.log('[b0nes] URLPattern polyfill loaded successfully');
}

export const URLPattern = URLPatternConstructor;
export default URLPattern;