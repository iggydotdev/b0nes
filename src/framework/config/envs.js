// src/framework/config/env.js
/**
 * Environment configuration for b0nes
 * Detects if we're in dev, production, or library mode
 */

export const ENV = {
    // Are we in Node.js?
    isNode: typeof process !== 'undefined' && process.versions?.node,
    
    // Are we in the browser?
    isBrowser: typeof window !== 'undefined',
    
    // Development mode (running from src/)
    isDev: process.env.NODE_ENV === 'development' || 
           process.env.npm_lifecycle_event === 'dev' ||
           process.env.npm_lifecycle_event === 'dev:watch',
    
    // Production mode (built to public/)
    isProd: process.env.NODE_ENV === 'production',
    
    // Library mode (installed via npm)
    isLibrary: process.env.npm_package_name !== 'b0nes',
    
    // Get base path for imports
    getBasePath() {
        if (this.isBrowser) {
            return '/'; // Browser always uses root-relative
        }
        if (this.isDev) {
            return '/src/framework/'; // Dev mode: source files
        }
        if (this.isProd) {
            return '/public/'; // Production: built files
        }
        return '/'; // Fallback
    }
};

// Helper to resolve paths
export const resolvePath = (path) => {
    if (ENV.isBrowser) {
        // Browser: always root-relative
        return path.startsWith('/') ? path : `/${path}`;
    }
    
    if (ENV.isDev) {
        // Dev: resolve from src/framework/
        return path.replace(/^\//, '/src/framework/');
    }
    
    // Production/Library: use as-is
    return path;
};