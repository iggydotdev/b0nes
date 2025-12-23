
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
        
        // Ensure destination exists
        if (!fs.existsSync(behaviorsDest)) {
            fs.mkdirSync(behaviorsDest, { recursive: true });
        }
        
        // Find all .client.js files in components directory
        function findClientFiles(dir, fileList = []) {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                if (file.isDirectory()) {
                    findClientFiles(fullPath, fileList);
                } else if (file.name.endsWith('.js')) {
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
            const destDir = path.dirname(destFile);
            
            // Ensure subdirectory exists
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }
            
            fs.copyFileSync(srcFile, destFile);
            
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