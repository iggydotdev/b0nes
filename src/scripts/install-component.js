/** Install a community component from an HTTP(S) manifest or directory. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { assertSafeSourcePath } from '../framework/build/pipeline/outputPath.js';
import { componentIdentifier } from '../components/utils/componentIdentifier.js';
import { updateCategoryIndex } from '../components/utils/componentRegistry.js';

const defaultRoot = fileURLToPath(new URL('../../', import.meta.url));
const httpURL = (value, base) => {
    const url = new URL(value, base);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Component files must use HTTP(S) URLs');
    return url;
};
const fetchContent = async url => {
    const response = await fetch(httpURL(url), { signal: AbortSignal.timeout(30000) });
    if (!response.ok) {
        const error = new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return { content: await response.text(), url: httpURL(response.url).href };
};
const parseManifest = async input => {
    const url = httpURL(input);
    let source;
    if (!/\.(json|js)$/.test(url.pathname)) {
        const directory = new URL(url.href);
        directory.pathname = directory.pathname.replace(/\/?$/, '/');
        try { source = await fetchContent(new URL('b0nes.manifest.json', directory)); }
        catch (error) {
            if (error.status !== 404) throw error;
            source = await fetchContent(new URL('index.js', directory));
        }
    } else source = await fetchContent(url);
    if (new URL(source.url).pathname.endsWith('.js')) {
        const match = source.content.match(/\/\*\*\s*@b0nes-manifest\s*([\s\S]*?)\*\//);
        if (!match) throw new Error('No b0nes manifest found in component file');
        source.content = match[1].split('\n').map(line => line.replace(/^\s*\*\s?/, '')).join('\n').trim();
    }
    return { manifest: JSON.parse(source.content), manifestURL: source.url };
};
const validateManifest = manifest => {
    if (!manifest || typeof manifest !== 'object' || !['atom', 'molecule', 'organism'].includes(manifest.type) ||
        typeof manifest.version !== 'string' || !manifest.version || !manifest.files ||
        typeof manifest.files.component !== 'string') throw new Error('Invalid component manifest: name, version, type and files.component are required');
    componentIdentifier(manifest.name);
    for (const field of ['component', 'test', 'client']) {
        if (manifest.files[field] !== undefined && (typeof manifest.files[field] !== 'string' || !manifest.files[field])) {
            throw new Error(`Invalid component file URL: ${field}`);
        }
    }
    if (manifest.dependencies !== undefined && (!Array.isArray(manifest.dependencies) ||
        manifest.dependencies.some(dependency => typeof dependency !== 'string'))) throw new Error('Invalid component dependencies');
};
const dependencyExists = (root, dependency) => {
    const qualified = /^(atoms?|molecules?|organisms?)[/:]([a-z0-9-]+)$/.exec(dependency);
    const categories = qualified ? [qualified[1].replace(/s$/, '') + 's'] : ['atoms', 'molecules', 'organisms'];
    const name = qualified ? qualified[2] : dependency;
    componentIdentifier(name);
    return categories.some(category => {
        const directory = assertSafeSourcePath(root, path.join(root, 'src/components', category, name));
        return fs.existsSync(directory) && fs.statSync(directory).isDirectory();
    });
};
const validateTree = (root, directory) => {
    assertSafeSourcePath(root, directory);
    if (!fs.existsSync(directory)) return;
    if (!fs.lstatSync(directory).isDirectory()) throw new Error('Component target must be a directory');
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const filename = assertSafeSourcePath(root, path.join(directory, entry.name));
        if (entry.isDirectory()) validateTree(root, filename);
        else if (!entry.isFile()) throw new Error(`Component contains a non-regular file: ${filename}`);
    }
};
const checkJavaScript = filename => {
    const result = spawnSync(process.execPath, ['--check', filename], { encoding: 'utf8', timeout: 30000 });
    if (result.status !== 0) throw new Error(`Invalid component JavaScript: ${result.stderr || result.error?.message}`);
};
const generateIndexFile = (manifest, nonce) => {
    const symbol = componentIdentifier(manifest.name);
    // A fresh renderer URL also refreshes a forced install in an already-running
    // process. Client behavior stays in client.js for the framework's loader.
    return `import * as component from './${manifest.name}.js?install=${nonce}';
const renderer = component.default || component[${JSON.stringify(symbol)}] || component[${JSON.stringify(manifest.name)}] || component.render;
if (typeof renderer !== 'function' && typeof renderer?.render !== 'function') throw new TypeError('Installed component must export a renderer');
export const ${symbol} = renderer;
export default renderer;
`;
};

/** Stage downloads and validate modules before replacing any installed files. */
export const installComponent = async (input, { force = false, dryRun = false, projectRoot = defaultRoot } = {}) => {
    let stage, registryStage, registryBackup, previous, lock, locked = false;
    let installed = false, registryChanged = false, libraryModule, oldRenderer, root, category, target, indexPath;
    const dispose = () => {
        for (const filename of [stage, registryStage, registryBackup, previous]) {
            if (filename && fs.existsSync(filename)) fs.rmSync(filename, { recursive: true, force: true });
        }
        if (locked) { fs.unlinkSync(lock); locked = false; }
    };
    let manifest;
    try {
        console.log(`Installing component from ${input}`);
        const parsed = await parseManifest(input);
        manifest = parsed.manifest;
        validateManifest(manifest);
        root = fs.realpathSync(projectRoot);
        category = manifest.type + 's';
        const categoryDirectory = assertSafeSourcePath(root, path.join(root, 'src/components', category));
        target = assertSafeSourcePath(root, path.join(categoryDirectory, manifest.name));
        indexPath = assertSafeSourcePath(root, path.join(categoryDirectory, 'index.js'));
        validateTree(root, target);
        if (fs.existsSync(target) && !force) throw new Error(`Component ${manifest.name} already exists; use --force to overwrite`);
        for (const dependency of manifest.dependencies || []) {
            if (!dependencyExists(root, dependency)) throw new Error(`Missing component dependency: ${dependency}`);
        }
        if (dryRun) {
            updateCategoryIndex(fs.readFileSync(indexPath, 'utf8'), manifest.type, manifest.name);
            return { success: true, manifest, dryRun: true };
        }

        // Fetch everything before creating the transaction or touching installed files.
        const contents = {};
        for (const field of ['component', 'test', 'client']) {
            if (manifest.files[field]) contents[field] = (await fetchContent(httpURL(manifest.files[field], parsed.manifestURL))).content;
        }
        // All components in a category share the same registry. Read it only
        // after acquiring its lock, including when downloads overlap installs.
        lock = path.join(categoryDirectory, '.b0nes-component-registry.lock');
        const lockFD = fs.openSync(lock, 'wx');
        fs.closeSync(lockFD); locked = true;
        assertSafeSourcePath(root, indexPath);
        validateTree(root, target);
        if (fs.existsSync(target) && !force) throw new Error(`Component ${manifest.name} already exists; use --force to overwrite`);
        for (const dependency of manifest.dependencies || []) {
            if (!dependencyExists(root, dependency)) throw new Error(`Missing component dependency: ${dependency}`);
        }
        const updatedIndex = updateCategoryIndex(fs.readFileSync(indexPath, 'utf8'), manifest.type, manifest.name);
        stage = fs.mkdtempSync(path.join(categoryDirectory, `.b0nes-install-${manifest.name}-`));
        const nonce = randomUUID();
        const files = { [`${manifest.name}.js`]: contents.component, 'index.js': generateIndexFile(manifest, nonce),
            'b0nes.manifest.json': JSON.stringify(manifest, null, 2) + '\n',
            ...(contents.test !== undefined ? { [`${manifest.name}.test.js`]: contents.test } : {}),
            ...(contents.client !== undefined ? { 'client.js': contents.client } : {}) };
        for (const [filename, content] of Object.entries(files)) {
            fs.writeFileSync(path.join(stage, filename), content, 'utf8');
            if (filename.endsWith('.js')) checkJavaScript(path.join(stage, filename));
        }
        const validation = spawnSync(process.execPath, ['--input-type=module', '--eval',
            'const component = await import(process.argv[1]); if (typeof component.default !== "function" && typeof component.default?.render !== "function") throw new Error("Missing renderer");',
            pathToFileURL(path.join(stage, 'index.js')).href], { cwd: root, encoding: 'utf8', timeout: 30000 });
        if (validation.status !== 0) throw new Error(`Component cannot be loaded: ${validation.stderr || validation.error?.message}`);
        validateTree(root, stage);
        // Capture the previous live renderer before promotion. A cold library
        // import after promotion would auto-register the replacement instead.
        libraryModule = await import(pathToFileURL(path.join(root, 'src/components/library.js')).href);
        oldRenderer = libraryModule.default[category][manifest.name];
        if (typeof libraryModule.registerComponent !== 'function') throw new Error('Component library must support registerComponent; upgrade the library before installing');
        registryStage = path.join(categoryDirectory, `.b0nes-registry-${nonce}.mjs`);
        fs.writeFileSync(registryStage, updatedIndex);
        checkJavaScript(registryStage);
        fs.chmodSync(registryStage, fs.statSync(indexPath).mode & 0o777);
        registryBackup = path.join(categoryDirectory, `.b0nes-registry-backup-${nonce}.mjs`);
        fs.copyFileSync(indexPath, registryBackup);
        assertSafeSourcePath(root, indexPath);
        validateTree(root, target);
        if (fs.existsSync(target)) {
            previous = fs.mkdtempSync(path.join(categoryDirectory, `.b0nes-previous-${manifest.name}-`));
            fs.rmdirSync(previous);
            fs.renameSync(target, previous);
        }
        fs.renameSync(stage, target); installed = true;
        fs.renameSync(registryStage, indexPath); registryChanged = true;
        await libraryModule.registerComponent(category, manifest.name);
        const composer = await import(pathToFileURL(path.join(root, 'src/framework/core/compose.js')).href);
        composer.clearCompositionCache();
        console.log(`Installed ${manifest.name} (${manifest.type})`);
        // Cleanup failure after promotion must not turn a complete install into
        // an error. Any remaining transaction files can be removed later.
        try { dispose(); }
        catch (error) { console.warn(`Component installed; transaction cleanup failed: ${error.message}`); }
        return { success: true, manifest, path: target };
    } catch (error) {
        let rollbackError;
        try {
            if (registryChanged) {
                assertSafeSourcePath(root, indexPath);
                fs.renameSync(registryBackup, indexPath);
            }
            if (installed) {
                validateTree(root, target);
                fs.rmSync(target, { recursive: true, force: true });
            }
            if (previous && fs.existsSync(previous)) fs.renameSync(previous, target);
            if (libraryModule && manifest) {
                if (oldRenderer) libraryModule.default[category][manifest.name] = oldRenderer;
                else delete libraryModule.default[category][manifest.name];
            }
        } catch (recovery) { rollbackError = recovery; }
        if (!rollbackError) {
            try { dispose(); } catch (cleanup) { console.warn(`Install rollback cleanup failed: ${cleanup.message}`); }
        }
        const message = rollbackError
            ? `${error.message}; recovery failed (${rollbackError.message}). Original files retained at ${previous || registryBackup || stage}`
            : error.message;
        console.error(`Installation failed: ${message}`);
        return { success: false, error: message };
    }
};

const main = async () => {
    const args = process.argv.slice(2);
    if (!args.length || args.includes('--help') || args.includes('-h')) {
        console.log('b0nes Component Installer\nUsage: npm run install-component -- <HTTP(S) manifest or directory URL> [--force] [--dry-run]');
        return;
    }
    const unknown = args.slice(1).find(argument => !['--force', '--dry-run'].includes(argument));
    if (unknown) throw new Error(`Unsupported installer option: ${unknown}`);
    const result = await installComponent(args[0], { force: args.includes('--force'), dryRun: args.includes('--dry-run') });
    process.exitCode = result.success ? 0 : 1;
};
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
export default { installComponent };
