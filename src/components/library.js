import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const library = {
    atoms: {},
    molecules: {},
    organisms: {}
};

export async function registerComponent(category, componentName, renderer) {
    if (!Object.hasOwn(library, category) || typeof componentName !== 'string' || !/^[a-z0-9-]+$/.test(componentName)) {
        throw new TypeError('Invalid component category or name');
    }
    if (!renderer) {
        const componentDir = path.join(__dirname, category, componentName);
        const indexPath = path.join(componentDir, 'index.js');
        const entry = fs.existsSync(indexPath) ? indexPath : path.join(componentDir, `${componentName}.js`);
        const mod = await import(`${pathToFileURL(entry).href}?registration=${++registration}`);
        renderer = mod.default || mod[componentName] || mod.render;
    }
    if (typeof renderer !== 'function' && typeof renderer?.render !== 'function') {
        throw new TypeError(`No renderer found in ${category}/${componentName}`);
    }
    library[category][componentName] = renderer;
    return renderer;
}

let registration = 0;
async function register(category) {
    const categoryDir = path.join(__dirname, category);
    // 
    for (const entry of fs.readdirSync(categoryDir, {withFileTypes: true})) {
        // Avoid files alone
        if (!entry.isDirectory() || !/^[a-z0-9-]+$/.test(entry.name)) {
            continue;
        }

        await registerComponent(category, entry.name);

    }
}

await register('atoms');
await register('molecules');
await register('organisms');

if (process.env.DEBUG) {
    console.error(`Auto-registered ${Object.keys(library.atoms).length} atoms, \
${Object.keys(library.molecules).length} molecules, \
${Object.keys(library.organisms).length} organisms`);
}

export default library;
