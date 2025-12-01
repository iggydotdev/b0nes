import fs from 'node:fs';
import path from 'node:path';

/**
 * Finds co-located assets (e.g., ./image.png, ./custom.css) referenced in
 * generated HTML, copies them to the output directory, and rewrites the
 * paths in the HTML to be root-relative for deployment.
 * 
 * @param {string} html The generated HTML content of a page.
 * @param {object} route The route object being processed, containing its file and URL path.
 * @param {string} outputDir The build output directory (e.g., 'public').
 * @param {object} options Optional settings.
 * @param {boolean} options.verbose Enable verbose logging.
 * @returns {Promise<string>} The modified HTML with rewritten asset paths.
 */
export async function processColocatedAssets(html, route, outputDir, options = {verbose: false}) {
    const { verbose } = options;
    let modifiedHtml = html;
    
    // Regex to find href or src attributes with relative paths starting with "./"
    const assetRegex = /(?:href|src)=["'](\.\/[^"']+)["']/g;

    const pageSourceDir = path.dirname(route.filePath);
    const routeBasePath = path.dirname(route.pattern.pathname);

    const matches = Array.from(html.matchAll(assetRegex));

    if (matches.length > 0 && verbose) {
        console.log(`  Processing ${matches.length} co-located asset(s) for ${route.pattern.pathname}...`);
    }

    for (const match of matches) {
        const originalPathAttr = match[0]; // e.g., href="./custom.css"
        const relativePath = match[1];     // e.g., ./custom.css

        const sourceAssetPath = path.resolve(pageSourceDir, relativePath);
        
        if (fs.existsSync(sourceAssetPath)) {
            // New root-relative URL path (e.g., /examples/talk/custom.css)
            const newUrlPath = path.join(routeBasePath, relativePath.substring(2)).replace(/\\/g, '/');
            
            // Destination for the asset in the build output (e.g., public/examples/talk/custom.css)
            const destAssetPath = path.join(outputDir, newUrlPath);
            
            // Ensure the destination directory exists
            fs.mkdirSync(path.dirname(destAssetPath), { recursive: true });

            // Copy the asset
            fs.copyFileSync(sourceAssetPath, destAssetPath);

            // Rewrite the path in the HTML
            const newPathAttr = originalPathAttr.replace(relativePath, newUrlPath);
            modifiedHtml = modifiedHtml.replace(originalPathAttr, newPathAttr);

            if (verbose) {
                console.log(`    - Copied & Rewrote: ${relativePath} -> ${newUrlPath}`);
            }
        } else if (verbose) {
            console.warn(`    - ⚠️ Asset not found, skipping: ${sourceAssetPath}`);
        }
    }

    return modifiedHtml;
}