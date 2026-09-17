import fs from 'node:fs';
import path from 'node:path';

/** Generate a native ESM registration entry without rewriting component source. */
export async function createPageBundle(pageName, dependencies, outputDir, { verbose = false } = {}) {
    const imports = [];
    const registrations = [];
    for (const dep of [...(dependencies || [])].sort()) {
        const [type, name] = dep.split(':');
        const typeDir = `${type}s`;
        const source = path.resolve('src/components', typeDir, name, 'client.js');
        if (!fs.existsSync(source)) continue;
        const symbol = `behavior${imports.length}`;
        const url = `../behaviors/${typeDir}/${name}/client.js`;
        imports.push(`import { client as ${symbol} } from ${JSON.stringify(url)};`);
        registrations.push(`window.b0nes.register(${JSON.stringify(`${typeDir}:${name}`)}, ${symbol});`);
    }
    if (!imports.length) return null;
    const filename = `${pageName.replaceAll('/', '-')}.bundle.js`;
    const relative = path.join('assets', 'js', 'bundles', filename);
    fs.mkdirSync(path.dirname(path.join(outputDir, relative)), { recursive: true });
    // Explicit dependency guarantees the runtime exists before registration.
    const source = [
        'import "../client/b0nes.js";', ...imports, '', ...registrations, ''
    ].join('\n');
    fs.writeFileSync(path.join(outputDir, relative), source);
    if (verbose) console.log(`   Created ESM entry: ${relative} (${imports.length} behaviors)`);
    return '/' + relative.replaceAll('\\', '/');
}
