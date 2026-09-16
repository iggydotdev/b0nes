import { parentPort, workerData } from 'node:worker_threads';
import { pathToFileURL } from 'node:url';
import { safeBuildRoute } from './ssg.js';

const { route, outputDir, options } = workerData;
// A fresh module graph also reloads transitive imports on subsequent builds.
const result = await safeBuildRoute({
    ...route,
    load: () => import(pathToFileURL(route.filePath).href)
}, outputDir, options);
// Functions cannot cross the worker boundary.
parentPort.postMessage({ ...result, route: result.success ? route : result.route });
