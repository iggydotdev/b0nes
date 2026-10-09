import fs from 'node:fs';
import path from 'node:path';
import { assertSafeOutputPath, copyOutputFile, ensureSafeOutputDirectory, writeOutputFile } from './outputPath.js';

const manifestName = '.b0nes-build-manifest.json';
const contains = (root, target) => {
    const relative = path.relative(root, target);
    return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
};
const exists = filename => {
    try { return fs.lstatSync(filename); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
};
const relativePath = value => {
    if (typeof value !== 'string' || !value || /[\\\x00-\x1f\x7f]/.test(value) || /^[a-z]:/i.test(value) ||
        value.split('/').some(part => !part || part === '.' || part === '..')) {
        throw new Error('Invalid generated path in build manifest');
    }
    return value;
};

// Never follow an existing output link, including one above the output root.
const inventory = root => {
    const files = [];
    const directories = [];
    assertSafeOutputPath(path.parse(root).root, root);
    const stat = exists(root);
    if (!stat) return { files, directories };
    if (!stat.isDirectory()) throw new Error(`Build output is not a directory: ${root}`);
    const visit = directory => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const filename = assertSafeOutputPath(root, path.join(directory, entry.name));
            const relative = path.relative(root, filename).split(path.sep).join('/');
            if (entry.isDirectory()) {
                directories.push(relative);
                visit(filename);
            } else if (entry.isFile()) files.push(relative);
            else throw new Error(`Build output is not a regular file or directory: ${filename}`);
        }
    };
    visit(root);
    return { files, directories };
};

const readManifest = root => {
    const filename = path.join(root, manifestName);
    if (!exists(filename)) return { files: new Set(), directories: new Set() };
    assertSafeOutputPath(root, filename);
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    if (data?.version !== 1 || !Array.isArray(data.files) || !Array.isArray(data.directories)) {
        throw new Error('Invalid b0nes build manifest');
    }
    const files = new Set(data.files.map(relativePath));
    const directories = new Set(data.directories.map(relativePath));
    if (files.has(manifestName) || directories.has(manifestName)) throw new Error('Invalid b0nes build manifest');
    return { files, directories };
};

/** Refuse source trees, project metadata, and project/ancestor roots as output. */
export const assertSafeBuildOutput = (requestedOutput, sources = [path.resolve('src')]) => {
    const output = path.resolve(requestedOutput);
    const protectedDirectories = ['.git', '.b0nes', '.agents', '.codex', '.aws', 'node_modules']
        .map(directory => path.resolve(directory));
    if (contains(output, process.cwd()) ||
        output.split(path.sep).some(part => ['.git', '.b0nes', '.agents', '.codex', '.aws'].includes(part.toLowerCase())) ||
        [...sources.map(source => path.resolve(source)), ...protectedDirectories]
            .some(source => contains(source, output) || contains(output, source))) {
        throw new Error(`Build output overlaps the project, source, or protected metadata directory: ${output}`);
    }
    assertSafeOutputPath(path.parse(output).root, output);
    return output;
};

/** Render privately, retain unmanaged assets, and promote only a successful build. */
export const createBuildTransaction = (requestedOutput, { clean = false, sources = [path.resolve('src')] } = {}) => {
    const output = assertSafeBuildOutput(requestedOutput, sources);
    inventory(output);
    readManifest(output);
    const parent = path.dirname(output);
    assertSafeOutputPath(path.parse(parent).root, parent);
    fs.mkdirSync(parent, { recursive: true });
    const prefix = path.join(parent, `.${path.basename(output)}.b0nes-build-`);
    const lock = `${prefix}lock`;
    let lockFd;
    let stage;
    let backup;
    let promoted = false;
    try {
        try { lockFd = fs.openSync(lock, 'wx', 0o600); }
        catch (error) {
            if (error.code === 'EEXIST') throw new Error(`Another build owns ${lock}; check for an interrupted build before removing this lock`);
            throw error;
        }
        fs.writeFileSync(lockFd, String(process.pid));
        stage = fs.mkdtempSync(prefix);
    } catch (error) {
        if (lockFd !== undefined) { fs.closeSync(lockFd); fs.unlinkSync(lock); }
        throw error;
    }

    const dispose = () => {
        try {
            // A failed rollback retains the only recovery copy, named in the error.
            if (!promoted && exists(stage)) {
                assertSafeOutputPath(parent, stage);
                fs.rmSync(stage, { recursive: true, force: true });
            }
        } finally {
            if (lockFd !== undefined) {
                fs.closeSync(lockFd);
                lockFd = undefined;
                fs.unlinkSync(lock);
            }
        }
    };

    const commit = () => {
        if (promoted || lockFd === undefined) throw new Error('Build transaction is already finished');
        const generated = inventory(stage);
        // Use the same rules when writing and reading the manifest, so a new
        // asset cannot poison later builds after replacing healthy output.
        generated.files.forEach(relativePath);
        generated.directories.forEach(relativePath);
        if ([...generated.files, ...generated.directories].some(filename => filename.toLowerCase() === manifestName)) {
            throw new Error(`Generated output conflicts with reserved ${manifestName}`);
        }
        const current = inventory(output);
        const managed = readManifest(output);
        const generatedFiles = new Set(generated.files);
        if (!clean) {
            // Preserve empty user directories, but do not resurrect obsolete generated ones.
            for (const relative of current.directories) {
                if (managed.directories.has(relative)) continue;
                ensureSafeOutputDirectory(stage, path.join(stage, relative));
            }
            for (const relative of current.files) {
                if (relative === manifestName || managed.files.has(relative) || generatedFiles.has(relative)) continue;
                copyOutputFile(output, path.join(output, relative), stage, path.join(stage, relative));
            }
        }
        writeOutputFile(stage, path.join(stage, manifestName), JSON.stringify({
            version: 1,
            files: generated.files.sort(),
            directories: generated.directories.sort()
        }, null, 2) + '\n');
        const previous = exists(output);
        fs.chmodSync(stage, previous ? previous.mode & 0o777 : 0o777 & ~process.umask());
        assertSafeOutputPath(path.parse(output).root, output);
        if (previous) {
            // Reserve a unique same-filesystem backup name without replacing another tree.
            backup = fs.mkdtempSync(`${prefix}backup-`);
            fs.rmdirSync(backup);
            fs.renameSync(output, backup);
        }
        try {
            fs.renameSync(stage, output);
            promoted = true;
        } catch (error) {
            if (backup) {
                try { fs.renameSync(backup, output); backup = undefined; }
                catch (rollbackError) {
                    throw new Error(`Build promotion failed; previous output retained at ${backup}: ${rollbackError.message}`, { cause: error });
                }
            }
            throw error;
        }
        if (backup) {
            assertSafeOutputPath(parent, backup);
            // A cleanup error must not report a failed build after promotion.
            try { fs.rmSync(backup, { recursive: true, force: true }); }
            catch (error) { console.warn(`Build succeeded; could not remove backup ${backup}: ${error.message}`); }
        }
    };
    return { outputDir: stage, commit, dispose };
};
