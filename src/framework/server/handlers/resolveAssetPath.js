/**
 * Resolve an asset path based on current page context
 * Works for stylesheets, scripts, images, whatever you throw at it
 * 
 * @param {string} assetPath - The asset path (can be relative or absolute)
 * @param {string} currentPath - Current page path (e.g., '/examples/talk')
 * @returns {string} Resolved path
 * 
 * @example
 * resolveAssetPath('./custom.css', '/examples/talk') 
 * // Returns: '/examples/talk/custom.css'
 * 
 * resolveAssetPath('https://cdn.com/lib.js', '/blog/post')
 * // Returns: 'https://cdn.com/lib.js' (unchanged)
 */
export const resolveAssetPath = (assetPath, currentPath = '/') => {
    // Already absolute or external URL? Don't touch it
    if (assetPath.startsWith('http://') || 
        assetPath.startsWith('https://') || 
        assetPath.startsWith('/')) {
        return assetPath;
    }
    
    // Relative path like './custom.css' or 'custom.css'
    // Remove leading './' if present
    const cleanPath = assetPath.replace(/^\.\//, '');
    
    // Get the directory of the current page
    const pageDir = currentPath === '/' ? '/' : currentPath;
    
    // Build the absolute path
    const resolved = pageDir.endsWith('/') 
        ? `${pageDir}${cleanPath}` 
        : `${pageDir}/${cleanPath}`;
    
    return resolved;
};