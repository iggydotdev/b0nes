
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertSafeSourcePath, copyOutputFile, ensureSafeOutputDirectory } from './outputPath.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Copies component client behaviors to the build output directory.
 * Organizes them into assets/js/behaviors for cleaner builds.
 */
export async function copyComponentBehaviors(outputDir, options = {}) {
    const { verbose } = options;
    
    try {
        const COMPONENTS_DIR = path.resolve(__dirname, '../../../components');
        const behaviorsDest = path.join(outputDir, 'assets', 'js', 'behaviors');
        
        const sourceRoot = path.dirname(COMPONENTS_DIR);
        ensureSafeOutputDirectory(outputDir, behaviorsDest);
        
        // Copy browser-importable component modules and their utility dependencies.
        function findClientFiles(dir, fileList = []) {
            assertSafeSourcePath(sourceRoot, dir);
            const files = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                if (['__tests__', 'tests', 'generator'].includes(file.name) || /\.(test|spec)\.js$/.test(file.name)) continue;
                assertSafeSourcePath(sourceRoot, fullPath);
                if (file.isDirectory()) {
                    findClientFiles(fullPath, fileList);
                } else if (file.isFile() && file.name.endsWith('.js')) {
                    fileList.push(fullPath);
                }
            }
            
            return fileList;
        }
        
        const clientFiles = findClientFiles(COMPONENTS_DIR);
        
        for (const srcFile of clientFiles) {
            // Preserve relative path structure
            const relativePath = path.relative(COMPONENTS_DIR, srcFile);
            const destFile = path.join(behaviorsDest, relativePath);
            copyOutputFile(sourceRoot, srcFile, outputDir, destFile);
            
            if (verbose) {
                console.log(`   📋 Copied ${path.relative(COMPONENTS_DIR, srcFile)}`);
            }
        }
        
        if (verbose) {
            console.log(`   ✅ Copied ${clientFiles.length} component behavior file(s)\n`);
        }
    } catch (error) {
        console.error('❌ Failed to copy component behaviors:', error.message);
        throw error;
    }
}