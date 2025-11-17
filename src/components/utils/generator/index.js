import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const validTypes = ['atom', 'molecule', 'organism'];
export const createComponent = (componentType, componentName) => {
    if (!validTypes.includes(componentType)) {
        console.error(`Invalid component type. Use: ${validTypes.join(', ')}`);
        process.exit(1);
    }
    
    if (!componentName || /[^a-z0-9-]/.test(componentName)) {
        console.error('Component name must use lowercase letters, numbers and hyphens');
        process.exit(1);
    }
    
    const componentDir = path.join(__dirname, 'templates');
    const targetDir = path.join(__dirname, `../../${componentType}s`, componentName);
    console.log(`Creating component ${componentName} of type ${componentType} at ${targetDir}`);
    if (!fs.existsSync(targetDir)){
        fs.mkdirSync(targetDir, {recursive: true});
    }

    const files = ['index.js', 'componentName.js', 'componentName.test.js'];

    files.forEach(file => {
        const content = fs.readFileSync(path.join(componentDir, file), 'utf8');
        const updatedContent = content.replace(/componentName/g, componentName).replace(/componentType/g,componentType);
        fs.writeFileSync(path.join(targetDir, file.replace('componentName', componentName)), updatedContent);
    });
}

const args= process.argv.slice(2);
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

createComponent(componentType, componentName);

