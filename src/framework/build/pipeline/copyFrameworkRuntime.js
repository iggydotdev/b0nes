import path from 'path';
import fs from 'fs';
/**
 * Copies essential framework runtime files to the build output directory.
 * Organizes them into an assets/ directory structure for cleaner builds.
 */
export async function copyFrameworkRuntime(outputDir, options = {}) {
    const { verbose } = options;
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    try {
        // Path from ssg.js to framework root: ../../
        const FRAMEWORK_DIR = path.resolve(__dirname, '../../');
        console.log(`[Build] 📦 Copying framework runtime to: ${outputDir}/assets/js/`);
        const filesToCopy = [
            {
                src: path.join(FRAMEWORK_DIR, 'client'),
                dest: path.join(outputDir, 'assets', 'js', 'client')
            },
            {
                src: path.join(FRAMEWORK_DIR, 'shared'), // NEW: shared replaces most of utils
                dest: path.join(outputDir, 'assets', 'js', 'utils')
            }
        ];
        
        let copiedCount = 0;
        
        for (const item of filesToCopy) {
            if (fs.existsSync(item.src)) {
                // Ensure destination directory exists
                const destDir = path.dirname(item.dest);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                
                const stats = fs.statSync(item.src);
                if (stats.isDirectory()) {
                    // Copy directory recursively
                    fs.cpSync(item.src, item.dest, { recursive: true, force: true });
                    
                    // Count files copied
                    const files = fs.readdirSync(item.dest, { recursive: true });
                    copiedCount += files.filter(f => {
                        const fullPath = path.join(item.dest, f);
                        return fs.statSync(fullPath).isFile();
                    }).length;

                } else {
                    // Copy single file
                    fs.copyFileSync(item.src, item.dest);
                    copiedCount++
                }
                
                if (verbose) {
                     const relativePath = path.relative(outputDir, item.dest);
                    console.log(`   ✅ Copied → ${relativePath}`);
                }
            } else {
                console.warn(`   ⚠️  Source not found: ${item.src}`);
            }
        }
        
        console.log(`   📋 Total runtime files copied: ${copiedCount}\n`);
       
    } catch (error) {
        console.error('❌ Failed to copy framework runtime files:', error.message);
        console.log(error);
        throw error;
    }
}