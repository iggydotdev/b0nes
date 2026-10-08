import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { copyOutputFile, copyOutputTree } from './outputPath.js';

/** Copy the native browser runtime without following source or output links. */
export async function copyFrameworkRuntime(outputDir, options = {}) {
    const { verbose } = options;
    const frameworkDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    const sourceRoot = path.dirname(frameworkDir);
    const filesToCopy = [
        { src: path.join(frameworkDir, 'client'), dest: path.join(outputDir, 'assets/js/client') },
        { src: path.join(frameworkDir, 'shared'), dest: path.join(outputDir, 'assets/js/shared') },
        // Retain the legacy URL for existing applications.
        { src: path.join(frameworkDir, 'shared'), dest: path.join(outputDir, 'assets/js/utils') }
    ];
    console.log(`[Build] 📦 Copying framework runtime to: ${outputDir}/assets/js/`);
    try {
        let copiedCount = 0;
        for (const file of ['html.js', 'escapeHtml.js']) {
            copyOutputFile(sourceRoot, path.join(sourceRoot, 'components/utils', file),
                outputDir, path.join(outputDir, 'assets/components/utils', file));
            copiedCount++;
        }
        for (const item of filesToCopy) {
            if (!fs.existsSync(item.src)) throw new Error(`Runtime source not found: ${item.src}`);
            copiedCount += copyOutputTree(sourceRoot, item.src, outputDir, item.dest, {
                filter: (file, entry) => !/\.(test|spec)\.js$/.test(file) &&
                    !(entry.isDirectory() && ['__tests__', 'tests'].includes(entry.name))
            });
            if (verbose) console.log(`   ✅ Copied → ${path.relative(outputDir, item.dest)}`);
        }
        console.log(`   📋 Total runtime files copied: ${copiedCount}\n`);
    } catch (error) {
        console.error('❌ Failed to copy framework runtime files:', error.message);
        throw error;
    }
}
