/**
 * Copies essential framework runtime files to the build output directory.
 * Organizes them into an assets/ directory structure for cleaner builds.
 */
async function copyFrameworkRuntime(outputDir, options = {}) {
    const { verbose } = options;
    
    try {
        // Path from ssg.js to framework root: ../../
        const FRAMEWORK_DIR = path.resolve(__dirname, '../../');
        
        const filesToCopy = [
            {
                src: path.join(FRAMEWORK_DIR, 'runtime', 'b0nes.js'),
                dest: path.join(outputDir, 'assets', 'js', 'b0nes.js')
            },
            {
                src: path.join(FRAMEWORK_DIR, 'client'),
                dest: path.join(outputDir, 'assets', 'js', 'client')
            }
        ];
        
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
                } else {
                    // Copy single file
                    fs.copyFileSync(item.src, item.dest);
                }
                
                if (verbose) {
                    console.log(`   📋 Copied ${path.relative(outputDir, item.dest)}`);
                }
            }
        }
        
        if (verbose) {
            console.log('');
        }
    } catch (error) {
        console.error('❌ Failed to copy framework runtime files:', error.message);
        throw error;
    }
}