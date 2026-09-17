import fs from 'node:fs';
import path from 'node:path';

/** Resolve a route output beneath its root; reject traversal and existing symlink targets. */
export const routeOutputPath = (outputDir, pathname) => {
    if (typeof pathname !== 'string' || !pathname.startsWith('/') ||
        /[\\\x00-\x1f\x7f]/.test(pathname) || pathname.split('/').some(part => part === '.' || part === '..')) {
        throw new Error(`Unsafe output pathname: ${pathname}`);
    }
    const relative = pathname.replace(/^\/+/, '').replace(/\/$/, '');
    const filename = relative.endsWith('.html') ? relative : path.join(relative, 'index.html');
    const root = path.resolve(outputDir);
    const target = path.resolve(root, filename);
    if (!target.startsWith(root + path.sep)) throw new Error('Route output escapes the output directory');
    let current = root;
    for (const part of path.relative(root, target).split(path.sep)) {
        current = path.join(current, part);
        try {
            if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Symlink in route output: ${current}`);
        } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    return target;
};
