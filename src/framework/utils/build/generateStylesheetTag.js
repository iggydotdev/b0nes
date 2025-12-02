import { resolveAssetPath } from '../server/resolveAssetPath.js';

/**
 * Generate link tag for stylesheet
 * NOW WITH PATH RESOLUTION! 🎉
 */
export const generateStylesheetTag = (stylesheet, currentPath = '/') => {
    // Resolve the href relative to current page
    const resolvedHref = resolveAssetPath(stylesheet.href, currentPath);
    
    if (resolvedHref.includes(`tailwind`)) {
        return `<script src="${resolvedHref}"></script>`;
    }
    
    let attrs = `rel="stylesheet" href="${resolvedHref}"`;
    
    if (stylesheet.media) {
        attrs += ` media="${stylesheet.media}"`;
    }
    
    if (stylesheet.integrity) {
        attrs += ` integrity="${stylesheet.integrity}"`;
    }
    
    if (stylesheet.crossOrigin) {
        attrs += ` crossorigin="${stylesheet.crossOrigin}"`;
    }
    
    if (stylesheet.attrs && typeof stylesheet.attrs === 'object') {
        Object.entries(stylesheet.attrs).forEach(([key, value]) => {
            attrs += ` ${key}="${value}"`;
        });
    }
    
    return `<link ${attrs}>`;
};