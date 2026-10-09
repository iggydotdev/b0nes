import path from 'node:path';
import { readFile, realpath, stat, lstat } from 'node:fs/promises';
import { ENV } from '../config/envs.js';
import { validateAndSanitizePath } from './sanitizePaths.js';
import { PUBLIC_BASE, PAGES_BASE, COMPONENTS_BASE, CLIENT_BASE, UTILS_BASE } from '../server/handlers/getServerConfig.js';

const missing = () => ({ content: null, found: false });
const isPageModule = file => /^(index|page)\.js$/.test(file) || /^[\[:].*\.js$/.test(file);

// Check the real target too: a public symlink must not expose another directory
// or bypass the forbidden-name checks (for example, an alias to .env.js).
async function readWithinBase(filename, baseDir) {
    const validation = validateAndSanitizePath(path.relative(baseDir, filename), baseDir);
    if (!validation.safe) return missing();
    try {
        const [base, target] = await Promise.all([realpath(baseDir), realpath(validation.sanitized)]);
        const relative = path.relative(base, target);
        const targetValidation = validateAndSanitizePath(relative, base);
        if (!targetValidation.safe || (baseDir === PAGES_BASE && isPageModule(path.basename(target)))) return missing();
        if (!(await stat(target)).isFile()) return missing();
        return { content: await readFile(target), found: true, path: target };
    } catch {
        return missing();
    }
}

function publicPaths(pathname) {
    // Keep legacy runtime URLs, but resolve every alias inside the build output.
    const aliases = [
        ['client/', 'assets/js/client/'],
        ['utils/', 'assets/js/utils/'],
        ['shared/', 'assets/js/shared/'],
        ['components/', 'assets/js/behaviors/'],
        ['assets/js/components/', 'assets/js/behaviors/'],
        ['templates/', 'assets/js/behaviors/organisms/templates/']
    ];
    for (const [prefix, destination] of aliases) {
        if (pathname.startsWith(prefix)) return [destination + pathname.slice(prefix.length)];
    }
    if (/^(atoms|molecules|organisms)\//.test(pathname)) return ['assets/js/behaviors/' + pathname];
    if (pathname === 'assets/js/b0nes.js') return ['assets/js/client/b0nes.js'];
    return [pathname];
}

async function resolvePublicFile(pathname) {
    for (const candidate of publicPaths(pathname)) {
        const validation = validateAndSanitizePath(candidate, PUBLIC_BASE);
        if (!validation.safe) continue;
        const result = await readWithinBase(validation.sanitized, PUBLIC_BASE);
        if (result.found) return result;
    }
    return missing();
}

/** Generated route folders contain URL-encoded segments, never decoded slugs. */
export async function resolvePublicPage(pathname) {
    if (typeof pathname !== 'string' || !pathname.startsWith('/') ||
        /[\\\x00-\x1f\x7f]/.test(pathname) || pathname.split('/').some(part => part === '.' || part === '..')) {
        return missing();
    }
    try {
        if ((await lstat(PUBLIC_BASE)).isSymbolicLink()) return missing();
        const relative = pathname.replace(/^\/+/, '').replace(/\/$/, '');
        const filename = relative.endsWith('.html') ? relative : path.join(relative, 'index.html');
        return readWithinBase(path.join(PUBLIC_BASE, filename), PUBLIC_BASE);
    } catch {
        return missing();
    }
}

/** Resolve HTTP assets without falling back to server-side pages in production. */
export async function tryResolveFile(pathname) {
    if (typeof pathname !== 'string') return missing();
    try { pathname = decodeURIComponent(pathname).replace(/^\/+/, ''); }
    catch { return missing(); }
    if (!ENV.isDev) return resolvePublicFile(pathname);

    // Development serves co-located browser assets and framework modules from
    // source, but page entry modules stay server-only.
    const suffixes = path.extname(pathname) ? [''] : ['', '.js', '.html', '/index.html'];
    const mounts = [
        ['assets/js/client/', CLIENT_BASE], ['client/', CLIENT_BASE],
        ['assets/js/shared/', UTILS_BASE], ['assets/js/utils/', UTILS_BASE],
        ['shared/', UTILS_BASE], ['utils/', UTILS_BASE],
        ['assets/js/behaviors/', COMPONENTS_BASE], ['assets/js/components/', COMPONENTS_BASE],
        ['assets/components/', COMPONENTS_BASE], ['components/', COMPONENTS_BASE]
    ];
    const mount = mounts.find(([prefix]) => pathname.startsWith(prefix));
    const isLegacyRuntime = pathname === 'assets/js/b0nes.js';
    const isComponent = /^(atoms|molecules|organisms)\//.test(pathname);
    const bases = mount ? [mount[1]] : isLegacyRuntime ? [CLIENT_BASE] : isComponent ? [COMPONENTS_BASE]
        : [PAGES_BASE, COMPONENTS_BASE, CLIENT_BASE, UTILS_BASE];
    for (const baseDir of bases) {
        let lookup = pathname;
        let previous;
        do {
            previous = lookup;
            lookup = lookup.replace(/^(assets|js|styles|images)\//, '');
        } while (lookup !== previous);
        if (baseDir === COMPONENTS_BASE) lookup = lookup.replace(/^(behaviors|components)\//, '');
        else if (baseDir === CLIENT_BASE) lookup = lookup.replace(/^client\//, '');
        else if (baseDir === PAGES_BASE) lookup = lookup.replace(/^pages\//, '');
        else if (baseDir === UTILS_BASE) lookup = lookup.replace(/^(shared|utils)\//, '');

        if (mount) lookup = pathname.slice(mount[0].length);
        if (isLegacyRuntime) lookup = 'b0nes.js';
        const lookups = [lookup];
        if (baseDir === PAGES_BASE && !pathname.startsWith('examples/')) lookups.push('examples/' + pathname);
        for (const requestPath of lookups) {
            const validation = validateAndSanitizePath(requestPath, baseDir);
            if (!validation.safe) continue;
            for (const suffix of suffixes) {
                const result = await readWithinBase(validation.sanitized + suffix, baseDir);
                if (result.found) return result;
            }
        }
    }
    return resolvePublicFile(pathname);
}
