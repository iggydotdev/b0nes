import fs, { cp } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const library = {
    atoms: {},
    molecules: {},
    organisms: {}
};

async function register(category) {
    const categoryDir = path.join(__dirname, category);
    // 
    for (const entry of fs.readdirSync(categoryDir, {withFileTypes: true})) {
        // Avoid files alone
        if (!entry.isDirectory()) {
            continue;
        }

        const componentDir = path.join(categoryDir, entry.name);
        const componentName = entry.name;

        let componentFn = null

        try {
            componentFn = await import(path.join(componentDir,'index.js'));
        } catch {
            componentFn = await import(path.join(componentDir,`${componentName}.js`));
        }
        

        if (componentFn) {
            library[category][componentName] = componentFn.default || componentFn[componentName] || componentFn.render;
            // console.log('?????',library)
        } else {
            console.warn(`No component found in ${category}/${componentName}`);
        }

    }
}

await register('atoms');
await register('molecules');
await register('organisms');

console.log(`Auto-registered ${Object.keys(library.atoms).length} atoms, \
${Object.keys(library.molecules).length} molecules, \
${Object.keys(library.organisms).length} organisms`);

export default library;