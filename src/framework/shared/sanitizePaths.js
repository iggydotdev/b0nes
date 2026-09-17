import path from 'path';
/**
 * Validate and sanitize file paths to prevent path traversal attacks
 * @param {string} requestPath - The requested path from URL
 * @param {string} baseDir - The base directory to restrict access to
 * @returns {{ safe: boolean, sanitized: string, error?: string }}
 */
export function validateAndSanitizePath(requestPath, baseDir) {
    if (!requestPath || typeof requestPath !== 'string' || requestPath.includes('\0')) {
        return {
            safe: false,
            sanitized: '',
            error: 'Invalid path'
        };
    }

    // Remove query strings and fragments
    const cleanPath = requestPath.split('?')[0].split('#')[0];
    
    // Normalize the path (removes .., ., redundant slashes)
    const normalized = path.normalize(cleanPath);
    
    // Check for path traversal attempts
    const segments = normalized.split(/[/\\]/);
    if (segments.includes('..') || normalized.includes('..')) {
        return { 
            safe: false, 
            sanitized: '', 
            error: 'Path traversal detected' 
        };
    }
    
    // Ensure the path doesn't start with / to make it relative
    const relativePath = normalized.startsWith('/') 
        ? normalized.slice(1) 
        : normalized;
    
    // Resolve the full path
    const resolvedBase = path.resolve(baseDir);
    const fullPath = path.resolve(resolvedBase, relativePath);
    
    // CRITICAL: Ensure the resolved path is strictly within baseDir
    // Uses path.relative to prevent sibling directory prefix bypasses (e.g. /app/pages-secret)
    const rel = path.relative(resolvedBase, fullPath);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
        return { 
            safe: false, 
            sanitized: '', 
            error: 'Path outside allowed directory' 
        };
    }
    
    // Additional security checks
    const forbidden = [
        '.env',           // Environment variables
        '.git',           // Git repository
        'node_modules',   // Dependencies (shouldn't serve these)
        '.certs',         // SSL certificates
        'package.json',   // Project config
        'package-lock.json'
    ];
    
    const pathLower = relativePath.toLowerCase();
    for (const forbidden_item of forbidden) {
        if (pathLower.includes(forbidden_item)) {
            return { 
                safe: false, 
                sanitized: '', 
                error: `Access to ${forbidden_item} is forbidden` 
            };
        }
    }
    
    return { 
        safe: true, 
        sanitized: fullPath 
    };
}



