import { componentIdentifier } from './componentIdentifier.js';

/** Append a registration without rewriting the category's existing exports. */
export const updateCategoryIndex = (source, type, name) => {
    if (!['atom', 'molecule', 'organism'].includes(type) || typeof source !== 'string') {
        throw new TypeError('Invalid component registry');
    }
    const symbol = componentIdentifier(name);
    const entry = `./${name}/index.js`;
    if (source.includes(`'${entry}'`) || source.includes(`"${entry}"`)) return source;
    const category = type + 's';
    if (!new RegExp(`\\b(?:const|let|var)\\s+${category}\\s*=`).test(source)) {
        throw new Error(`Component registry must define ${category}`);
    }
    if (new RegExp(`\\b(?:import|const|let|var|function|class)\\s+${symbol}\\b|\\bas\\s+${symbol}\\b`).test(source)) {
        throw new Error(`Component export ${symbol} already exists; choose another name`);
    }
    const local = '__b0nes_' + name.replace(/-/g, '_');
    if (new RegExp(`\\b${local}\\b`).test(source)) throw new Error(`Component import ${local} already exists; choose another name`);
    return source.trimEnd() + `\n\n// Installed/generated ${type}:${name}\nimport ${local} from '${entry}';\nexport { ${local} as ${symbol} };\n${category}[${JSON.stringify(name)}] = ${local};\n`;
};
