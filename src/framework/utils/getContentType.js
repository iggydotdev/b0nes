/**
 * Get content type from file extension
 */
export function getContentType(pathname) {
    const ext = pathname.split('.').pop()?.toLowerCase();
    const contentTypes = {
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'webp': 'image/webp',
        'ico': 'image/x-icon',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'ttf': 'font/ttf'
    };
    return contentTypes[ext] || 'application/octet-stream';
}