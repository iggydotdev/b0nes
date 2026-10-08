import fs from 'node:fs';
import path from 'node:path';

const assertContainedPath = (rootDir, targetPath, kind) => {
    const root = path.resolve(rootDir);
    const target = path.resolve(targetPath);
    const relative = path.relative(root, target);
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
        throw new Error(`${kind} path escapes its root: ${target}`);
    }
    // Check the root too: a linked output directory can redirect every write.
    let current = root;
    for (const part of ['', ...relative.split(path.sep).filter(Boolean)]) {
        if (part) current = path.join(current, part);
        try {
            if (fs.lstatSync(current).isSymbolicLink()) {
                throw new Error(`Symlink in ${kind.toLowerCase()} path: ${current}`);
            }
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }
    }
    return target;
};

/** Keep every build writer within the output root without following links. */
export const assertSafeOutputPath = (outputDir, targetPath) => assertContainedPath(outputDir, targetPath, 'Output');
export const assertSafeSourcePath = (sourceDir, sourcePath) => assertContainedPath(sourceDir, sourcePath, 'Source');

export const ensureSafeOutputDirectory = (outputDir, directory) => {
    const target = assertSafeOutputPath(outputDir, directory);
    fs.mkdirSync(target, { recursive: true });
    assertSafeOutputPath(outputDir, target);
    return target;
};

export const writeOutputFile = (outputDir, filename, content, encoding = 'utf8') => {
    const target = assertSafeOutputPath(outputDir, filename);
    ensureSafeOutputDirectory(outputDir, path.dirname(target));
    assertSafeOutputPath(outputDir, target);
    fs.writeFileSync(target, content, encoding);
};

export const copyOutputFile = (sourceDir, sourceFile, outputDir, targetFile) => {
    const source = assertSafeSourcePath(sourceDir, sourceFile);
    if (!fs.lstatSync(source).isFile()) throw new Error(`Asset source is not a regular file: ${source}`);
    const target = assertSafeOutputPath(outputDir, targetFile);
    ensureSafeOutputDirectory(outputDir, path.dirname(target));
    assertSafeOutputPath(outputDir, target);
    fs.copyFileSync(source, target);
};

export const copyOutputTree = (sourceDir, sourcePath, outputDir, targetPath, { filter = () => true } = {}) => {
    const source = assertSafeSourcePath(sourceDir, sourcePath);
    ensureSafeOutputDirectory(outputDir, targetPath);
    let copied = 0;
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
        const sourceFile = path.join(source, entry.name);
        if (!filter(sourceFile, entry)) continue;
        assertSafeSourcePath(sourceDir, sourceFile);
        const targetFile = path.join(targetPath, entry.name);
        if (entry.isDirectory()) copied += copyOutputTree(sourceDir, sourceFile, outputDir, targetFile, { filter });
        else {
            copyOutputFile(sourceDir, sourceFile, outputDir, targetFile);
            copied++;
        }
    }
    return copied;
};

/** Resolve a route output beneath its root; reject traversal and existing symlink targets. */
export const routeOutputPath = (outputDir, pathname) => {
    if (typeof pathname !== 'string' || !pathname.startsWith('/') ||
        /[\\\x00-\x1f\x7f]/.test(pathname) || pathname.split('/').some(part => part === '.' || part === '..')) {
        throw new Error(`Unsafe output pathname: ${pathname}`);
    }
    const relative = pathname.replace(/^\/+/, '').replace(/\/$/, '');
    const filename = relative.endsWith('.html') ? relative : path.join(relative, 'index.html');
    const root = path.resolve(outputDir);
    return assertSafeOutputPath(root, path.resolve(root, filename));
};
