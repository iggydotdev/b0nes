import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPONENTS_DIR = path.resolve(process.cwd(), 'src/components');

/**
 * Creates a production bundle for a specific page
 * @param {string} pageName - Name of the page (e.g., 'home')
 * @param {Set<string>} dependencies - Set of component dependencies (e.g., 'atom:button')
 * @param {string} outputDir - Build output directory
 * @param {Object} options - Bundling options
 * @returns {string|null} - Path to the generated bundle relative to outputDir
 */
export async function createPageBundle(pageName, dependencies, outputDir, options = {}) {
    if (!dependencies || dependencies.size === 0) return null;
    
    const { verbose = false } = options;
    const bundleFileName = `${pageName}.bundle.js`.replace(/\//g, '-');
    const bundleRelPath = path.join('assets', 'js', 'bundles', bundleFileName);
    const bundleFullPath = path.join(outputDir, bundleRelPath);
    
    const bundleDir = path.dirname(bundleFullPath);
    if (!fs.existsSync(bundleDir)) {
        fs.mkdirSync(bundleDir, { recursive: true });
    }
    
    let bundleContent = `/**
 * 🦴 b0nes Page Bundle: ${pageName}
 * Generated: ${new Date().toISOString()}
 * Components: ${Array.from(dependencies).join(', ')}
 */

(function() {
    'use strict';
`;

    let bundledCount = 0;
    
    for (const dep of dependencies) {
        const [type, name] = dep.split(':');
        // Pluralize type for directory name
        const typeDir = `${type}s`; 
        const clientPath = path.join(COMPONENTS_DIR, typeDir, name, 'client.js');
        
        if (fs.existsSync(clientPath)) {
            try {
                const source = fs.readFileSync(clientPath, 'utf8');
                
                // Wrap in scope and register
                bundleContent += `\n/* --- Component: ${type}/${name} --- */\n`;
                bundleContent += `(function() {\n`;
                // Transform 'export const client =' to a local variable we can register
                const transformedSource = source
                    .replace(/export\s+const\s+client\s*=/, 'const client =')
                    .replace(/export\s+default\s+client/, 'const clientDefault = client');
                
                bundleContent += transformedSource;
                bundleContent += `\n    if (typeof client !== 'undefined') {\n`;
                bundleContent += `        window.b0nes.register('${name}', client);\n`;
                bundleContent += `    }\n`;
                bundleContent += `})();\n`;
                
                bundledCount++;
            } catch (error) {
                console.error(`   ❌ Failed to bundle component ${dep}:`, error.message);
            }
        }
    }
    
    bundleContent += `\n})();\n`;
    
    if (bundledCount > 0) {
        fs.writeFileSync(bundleFullPath, bundleContent, 'utf8');
        if (verbose) {
            console.log(`   📦 Created bundle: ${bundleRelPath} (${bundledCount} behaviors)`);
        }
        return `/${bundleRelPath.replace(/\\/g, '/')}`;
    }
    
    return null;
}
