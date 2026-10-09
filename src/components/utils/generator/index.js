import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { componentIdentifier } from '../componentIdentifier.js';
import { updateCategoryIndex } from '../componentRegistry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const validTypes = ['atom', 'molecule', 'organism'];
export const createComponent = (componentType, componentName) => {
    if (!validTypes.includes(componentType)) {
        throw new Error(`Invalid component type: "${componentType}". Use: ${validTypes.join(', ')}`);
    }
    
    if (!componentName || /[^a-z0-9-]/.test(componentName)) {
        throw new Error('Component name must use lowercase letters, numbers and hyphens');
    }
    
    // String helpers
    const kebabCase = componentName;
    const camelCase = componentIdentifier(componentName);

    const componentDir = path.join(__dirname, 'templates');
    const targetDir = path.join(__dirname, `../../${componentType}s`, kebabCase);
    console.log(`Creating component ${kebabCase} of type ${componentType} at ${targetDir}`);
    const lockPath = path.resolve(targetDir, '../.b0nes-component-registry.lock');
    const lockFD = fs.openSync(lockPath, 'wx');
    fs.closeSync(lockFD);
    try {
        if (fs.existsSync(targetDir)) throw new Error(`Component already exists: ${kebabCase}`);
        const categoryIndex = path.resolve(targetDir, '../index.js');
        const originalIndex = fs.readFileSync(categoryIndex, 'utf8');
        const updatedIndex = updateCategoryIndex(originalIndex, componentType, componentName);

        const files = ['index.js.txt', 'componentName.js.txt', 'componentName.test.js.txt'];

        const generated = files.map(file => {
            const content = fs.readFileSync(path.join(componentDir, file), 'utf8');
            const updatedContent = content
                .replace(/componentFileName/g, kebabCase)
                .replace(/componentName/g, camelCase) // Function names and references
                .replace(/componentType/g, componentType);

            // We use kebabCase for filenames
            const outFileName = file.replace('componentName', kebabCase).replace('.txt', '');
            return [outFileName, updatedContent];
        });
        fs.mkdirSync(targetDir, { recursive: true });
        try {
            for (const [file, content] of generated) fs.writeFileSync(path.join(targetDir, file), content);
            fs.writeFileSync(categoryIndex, updatedIndex);
        } catch (error) {
            fs.rmSync(targetDir, { recursive: true, force: true });
            fs.writeFileSync(categoryIndex, originalIndex);
            throw error;
        }

        return { type: componentType, name: kebabCase, path: targetDir };
    } finally {
        fs.unlinkSync(lockPath);
    }
}

// CLI entrypoint — only runs when file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.log(`
Component Generator

Usage: 
  node generator.js <type> <name>

Types:
  atom        Create atomic component
  molecule    Create molecular component  
  organism    Create organism component

Example:
  node generator.js atom button
  node generator.js molecule card
    `);
        process.exit(0);
    }

    const componentType = args[0];
    const componentName = args[1];

    try {
        createComponent(componentType, componentName);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}
