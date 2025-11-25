import path from 'path';
/**
 * Validate and sanitize file paths to prevent path traversal attacks
 * @param {string} requestPath - The requested path from URL
 * @param {string} baseDir - The base directory to restrict access to
 * @returns {{ safe: boolean, sanitized: string, error?: string }}
 */
export function validateAndSanitizePath(requestPath, baseDir) {
    // Remove query strings and fragments
    const cleanPath = requestPath.split('?')[0].split('#')[0];
    
    // Normalize the path (removes .., ., redundant slashes)
    const normalized = path.normalize(cleanPath);
    
    // Check for path traversal attempts
    if (normalized.includes('..')) {
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
    const fullPath = path.resolve(baseDir, relativePath);
    
    // CRITICAL: Ensure the resolved path is still within baseDir
    // This prevents symlink attacks and other sneaky bypasses
    if (!fullPath.startsWith(path.resolve(baseDir))) {
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



