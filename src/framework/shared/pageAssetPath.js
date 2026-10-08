import path from 'node:path';
import { PAGES_BASE } from '../server/handlers/getServerConfig.js';

/** Co-located assets are shared at their source directory, including dynamic pages. */
export const pageAssetBasePath = (filePath, currentPath = '/', pagesDir = PAGES_BASE) => {
    if (!filePath) return currentPath;
    const relative = path.relative(path.resolve(pagesDir), path.dirname(path.resolve(filePath)));
    if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) return currentPath;
    const segments = relative.split(path.sep).filter(Boolean).map(encodeURIComponent);
    return '/' + (segments.length ? segments.join('/') + '/' : '');
};
