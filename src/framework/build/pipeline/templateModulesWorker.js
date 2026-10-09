import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SourceTextModule } from 'node:vm';
import { parentPort, workerData } from 'node:worker_threads';
import { assertSafeSourcePath } from './outputPath.js';
import { dynamicImportSpecifiers } from './dynamicImports.js';

try {
    const { entries, sourceRoot } = workerData;
    const files = new Map();
    const visit = filename => {
        const sourcePath = assertSafeSourcePath(sourceRoot, filename);
        if (files.has(sourcePath)) return;
        if (!fs.lstatSync(sourcePath).isFile()) throw new Error(`Template module is not a regular file: ${sourcePath}`);
        const relative = path.relative(sourceRoot, sourcePath).split(path.sep).join('/');
        if (relative.split('/').some(part => part.startsWith('.') || ['node_modules', 'tests', '__tests__', 'generator'].includes(part)) ||
            /\.(test|spec)\.[cm]?js$/.test(relative) || /^(framework\/(server|build|dev)|mcp|scripts)\//.test(relative) ||
            (/^pages\//.test(relative) && !relative.includes('/templates/') && /^(index|page|\[.*|:.*)\.js$/.test(path.basename(relative)))) {
            throw new Error(`Server-only or private module cannot be published as a template dependency: ${relative}`);
        }
        const source = fs.readFileSync(sourcePath, 'utf8');
        files.set(sourcePath, { filename: sourcePath, relative, source });
        if (path.extname(sourcePath) === '.json') { JSON.parse(source); return; }
        if (!['.js', '.mjs'].includes(path.extname(sourcePath))) throw new Error(`Unsupported browser template module: ${relative}`);
        const module = new SourceTextModule(source, { identifier: pathToFileURL(sourcePath).href });
        for (const specifier of [...module.dependencySpecifiers, ...dynamicImportSpecifiers(source)]) {
            if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
                throw new Error(`Unsupported template import ${JSON.stringify(specifier)} in ${relative}; use relative browser-compatible modules`);
            }
            visit(fileURLToPath(new URL(specifier, pathToFileURL(sourcePath))));
        }
    };
    entries.forEach(visit);
    parentPort.postMessage({ files: [...files.values()] });
} catch (error) {
    parentPort.postMessage({ error: error.message });
}
