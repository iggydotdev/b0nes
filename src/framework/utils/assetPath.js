// src/framework/utils/assetPath.js

import { ENV } from '../config/envs.js';

/**
 * Get the base path for assets based on environment
 * Dev: serve from source
 * Prod: serve from assets/
 */
export const getAssetBasePath = () => {
  return ENV.isDev ? '' : '/assets';
};

/**
 * Resolve an asset path for the current environment
 * 
 * @param {string} assetPath - The asset path (e.g., 'js/b0nes.js')
 * @returns {string} Full asset URL
 * 
 * @example
 * // In dev: resolveAsset('js/b0nes.js') → '/client/b0nes.js'
 * // In prod: resolveAsset('js/b0nes.js') → '/assets/js/b0nes.js'
 */
export const resolveAsset = (assetPath) => {
  const basePath = getAssetBasePath();
  
  // In dev, we serve directly from source directories
  if (ENV.isDev) {
    // Map logical paths to actual source locations
    if (assetPath.startsWith('js/b0nes.js')) {
      return '/client/b0nes.js';
    }
    if (assetPath.startsWith('js/client/')) {
      return assetPath.replace('js/client/', '/client/');
    }
    if (assetPath.startsWith('js/utils/')) {
      return assetPath.replace('js/utils/', '/utils/');
    }
    if (assetPath.startsWith('behaviors/')) {
      return `/components/${assetPath.replace('behaviors/', '')}`;
    }
    // Default: just return the path as-is for dev
    return `/${assetPath}`;
  }
  
  // In prod, everything is under /assets/
  return `${basePath}/${assetPath}`;
};

/**
 * Get versioned asset path (for cache busting)
 */
export const resolveVersionedAsset = (assetPath, version = '0.1.11') => {
  const resolved = resolveAsset(assetPath);
  return `${resolved}?v=${version}`;
};

// Convenience exports for common assets
export const ASSETS = {
  b0nes: () => resolveAsset('js/b0nes.js'),
  client: (file) => resolveAsset(`js/client/${file}`),
  utils: (file) => resolveAsset(`js/utils/${file}`),
   behavior: (componentPath) => resolveAsset(`js/behaviors/${componentPath}`),
};

export default { resolveAsset, resolveVersionedAsset, getAssetBasePath, ASSETS };