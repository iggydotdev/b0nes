import path from 'node:path';
import { createHash } from 'node:crypto';
import { Worker } from 'node:worker_threads';
import { writeOutputFile } from './outputPath.js';

const findSourceRoot = source => {
    let directory = path.resolve(source);
    while (path.dirname(directory) !== directory) {
        if (path.basename(directory) === 'src') return directory;
        directory = path.dirname(directory);
    }
    return path.resolve(source);
};

export const relativeModuleURL = (from, to) => {
    const relative = path.relative(path.dirname(from), to).split(path.sep)
        .map(part => part === '..' ? part : encodeURIComponent(part)).join('/');
    return relative.startsWith('.') ? relative : './' + relative;
};

/** Emit a native ESM graph with the source layout intact; never concatenate JS. */
export const emitTemplateModules = async (entries, spaComponentPath, outputDir, options = {}) => {
    const sourceRoot = path.resolve(options.sourceRoot || findSourceRoot(spaComponentPath));
    const files = await new Promise((resolve, reject) => {
        const worker = new Worker(new URL('./templateModulesWorker.js', import.meta.url), {
            workerData: { entries, sourceRoot },
            // The experimental parser stays inside this worker; callers need no flags.
            execArgv: ['--experimental-vm-modules', '--disable-warning=ExperimentalWarning']
        });
        let reported = false;
        worker.once('message', async result => {
            reported = true;
            await worker.terminate();
            if (result.error) reject(new Error(result.error)); else resolve(result.files);
        });
        worker.once('error', error => { reported = true; reject(error); });
        worker.once('exit', code => { if (!reported) reject(new Error(`Template module parser exited without a result (${code})`)); });
    });
    const namespace = createHash('sha256').update(sourceRoot).digest('hex').slice(0, 16);
    const destination = path.resolve(outputDir, 'assets/js/template-modules', namespace);
    const emitted = new Map();
    for (const file of files) {
        const filename = path.join(destination, file.relative);
        writeOutputFile(outputDir, filename, file.source);
        emitted.set(file.filename, filename);
    }
    return emitted;
};
