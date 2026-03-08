import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

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
    
    const componentDir = path.join(__dirname, 'templates');
    const targetDir = path.join(__dirname, `../../${componentType}s`, componentName);
    console.log(`Creating component ${componentName} of type ${componentType} at ${targetDir}`);
    if (!fs.existsSync(targetDir)){
        fs.mkdirSync(targetDir, {recursive: true});
    }

    const files = ['index.js', 'componentName.js', 'componentName.test.js'];

    files.forEach(file => {
        const content = fs.readFileSync(path.join(componentDir, file + '.txt'), 'utf8');
        const updatedContent = content.replace(/componentName/g, componentName).replace(/componentType/g,componentType);
        fs.writeFileSync(path.join(targetDir, file.replace('componentName', componentName)), updatedContent);
    });

    return { type: componentType, name: componentName, path: targetDir };
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
