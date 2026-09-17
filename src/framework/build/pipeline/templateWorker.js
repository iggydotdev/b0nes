import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { generateCompiledTemplates } from './compileTemplates.js';

// Fresh module graph for each compilation, including transitive data imports.
export const compileTemplatesFresh = (source, output, options) => new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), { workerData: { source, output, options } });
    let reported = false;
    worker.once('message', async result => {
        reported = true;
        await worker.terminate();
        if (result.error) reject(new Error(result.error)); else resolve();
    });
    worker.once('error', error => { reported = true; reject(error); });
    worker.once('exit', code => { if (!reported) reject(new Error(`Template worker exited without a result (${code})`)); });
});
if (!isMainThread && workerData?.source) {
    try {
        await generateCompiledTemplates(workerData.source, workerData.output, workerData.options);
        parentPort.postMessage({ success: true });
    } catch (error) { parentPort.postMessage({ error: error.message }); }
}
