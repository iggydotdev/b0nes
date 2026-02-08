/**
 * b0nes Component Introspection Engine
 * 
 * Scans component source files to extract prop schemas, manifests,
 * and showcase availability -- all without external dependencies.
 * 
 * Parsing strategy:
 * 1. JSDoc @param annotations for types, defaults, and descriptions
 * 2. Destructuring patterns in function signatures for prop names/defaults
 * 3. b0nes.manifest.json for component metadata
 * 4. .show.js files for showcase detection
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPONENTS_ROOT = path.resolve(__dirname, '../../components');

/**
 * Category plural-to-singular mapping for the compose() type field
 */
const CATEGORY_TYPE_MAP = {
    atoms: 'atom',
    molecules: 'molecule',
    organisms: 'organism'
};

/**
 * Parse JSDoc @param tags from source code
 * 
 * Handles patterns like:
 *   @param {string} props.slot - Description
 *   @param {('a'|'b')} [props.type='a'] - Description
 *   @param {string | Array<string>} [props.className=''] - Description
 * 
 * @param {string} source - Component source code
 * @returns {Map<string, {type: string, default: string|null, description: string, required: boolean}>}
 */
function parseJSDocParams(source) {
    const params = new Map();

    // Match @param lines that reference props.xxx or [props.xxx]
    const paramRegex = /@param\s+\{([^}]+)\}\s+(?:\[props\.(\w+)(?:=([^\]]*))?\]|props\.(\w+))\s*(?:-\s*(.*))?/g;

    let match;
    while ((match = paramRegex.exec(source)) !== null) {
        const [, rawType, optionalName, defaultVal, requiredName, description] = match;

        const propName = optionalName || requiredName;
        if (!propName || propName === 'props') continue; // Skip the root @param {Object} props

        const type = rawType.trim();
        const isRequired = !!requiredName; // No brackets = required
        const cleanDefault = defaultVal !== undefined ? defaultVal.replace(/^['"]|['"]$/g, '') : null;

        params.set(propName, {
            type,
            default: cleanDefault,
            description: (description || '').trim(),
            required: isRequired
        });
    }

    return params;
}

/**
 * Parse destructuring pattern from an exported function
 * 
 * Extracts prop names and their default values from patterns like:
 *   export const button = ({ type = 'button', attrs = '', className = '', slot }) => {
 * 
 * @param {string} source - Component source code
 * @param {string} componentName - Expected export name
 * @returns {Map<string, {default: string|null}>}
 */
function parseDestructuring(source, componentName) {
    const props = new Map();

    // Match the exported function's destructuring: export const name = ({ ... }) =>
    // Also handles: export const name = function({ ... }) and export default function({ ... })
    const patterns = [
        // Arrow function: export const name = ({ ... }) =>
        new RegExp(`export\\s+const\\s+${componentName}\\s*=\\s*\\(\\{([^}]*)\\}\\)\\s*=>`, 's'),
        // Regular function: export const name = function({ ... })
        new RegExp(`export\\s+const\\s+${componentName}\\s*=\\s*function\\s*\\(\\{([^}]*)\\}\\)`, 's'),
        // Default export: export default function({ ... })
        /export\s+default\s+function\s*\(\{([^}]*)\}\)/s,
        // Fallback: any exported arrow with destructuring
        /export\s+const\s+\w+\s*=\s*\(\{([^}]*)\}\)\s*=>/s
    ];

    let destructuredBody = null;
    for (const pattern of patterns) {
        const match = source.match(pattern);
        if (match) {
            destructuredBody = match[1];
            break;
        }
    }

    if (!destructuredBody) return props;

    // Parse individual props from the destructured body
    // Handle: name, name = 'default', name = "default", name = value
    const propRegex = /(\w+)\s*(?:=\s*('[^']*'|"[^"]*"|`[^`]*`|[^,}\n]+))?\s*[,}]?/g;

    let propMatch;
    while ((propMatch = propRegex.exec(destructuredBody)) !== null) {
        const [, name, rawDefault] = propMatch;

        // Skip common JS keywords that might appear
        if (['const', 'let', 'var', 'function', 'return'].includes(name)) continue;

        let defaultValue = null;
        if (rawDefault !== undefined) {
            defaultValue = rawDefault.trim().replace(/^['"`]|['"`]$/g, '');
        }

        props.set(name, { default: defaultValue });
    }

    return props;
}

/**
 * Extract enum values from JSDoc type annotations
 * 
 * Handles: ('button'|'submit'|'reset') -> ['button', 'submit', 'reset']
 * 
 * @param {string} typeStr - JSDoc type string
 * @returns {string[]|null}
 */
function extractEnumValues(typeStr) {
    // Match ('value1'|'value2'|...) pattern
    const enumMatch = typeStr.match(/^\(([^)]+)\)$/);
    if (!enumMatch) return null;

    const values = enumMatch[1]
        .split('|')
        .map(v => v.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);

    return values.length > 0 ? values : null;
}

/**
 * Determine the input control type for a prop based on its type annotation
 * 
 * @param {string} typeStr - JSDoc type string
 * @param {string} propName - Prop name (for heuristics)
 * @returns {string} Control type: 'text' | 'select' | 'textarea' | 'boolean' | 'number'
 */
function inferControlType(typeStr, propName) {
    if (!typeStr) return 'text';

    const lower = typeStr.toLowerCase();

    // Enum types -> select
    if (typeStr.startsWith('(') && typeStr.includes('|')) return 'select';

    // Boolean
    if (lower === 'boolean' || lower === 'bool') return 'boolean';

    // Number
    if (lower === 'number' || lower === 'int' || lower === 'integer' || lower === 'float') return 'number';

    // Array or slot-like props -> textarea
    if (lower.includes('array') || propName === 'slot' || propName.endsWith('Slot')) return 'textarea';

    // Long text heuristics
    if (propName === 'attrs' || propName === 'content') return 'textarea';

    return 'text';
}

/**
 * Introspect a single component directory
 * 
 * @param {string} category - 'atoms', 'molecules', or 'organisms'
 * @param {string} componentDir - Absolute path to the component directory
 * @param {string} componentName - Component name (directory name)
 * @returns {Object|null} Component schema or null if not parseable
 */
function introspectComponent(category, componentDir, componentName) {
    // Find the main component file
    const candidates = [
        path.join(componentDir, `${componentName}.js`),
        path.join(componentDir, 'index.js')
    ];

    let sourceFile = null;
    let source = '';

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            sourceFile = candidate;
            source = fs.readFileSync(candidate, 'utf-8');
            break;
        }
    }

    if (!sourceFile) return null;

    // Parse JSDoc params
    const jsdocParams = parseJSDocParams(source);

    // Parse destructuring
    const destructuredParams = parseDestructuring(source, componentName);

    // Merge both sources: JSDoc takes priority for type info, destructuring for defaults
    const props = [];
    const allPropNames = new Set([...jsdocParams.keys(), ...destructuredParams.keys()]);

    for (const propName of allPropNames) {
        const jsdoc = jsdocParams.get(propName) || {};
        const destructured = destructuredParams.get(propName) || {};

        const typeStr = jsdoc.type || 'string';
        const controlType = inferControlType(typeStr, propName);
        const enumValues = extractEnumValues(typeStr);

        props.push({
            name: propName,
            type: typeStr,
            controlType,
            enumValues,
            default: jsdoc.default ?? destructured.default ?? null,
            description: jsdoc.description || '',
            required: jsdoc.required ?? !destructured.hasOwnProperty('default')
        });
    }

    // Sort: required first, then alphabetical
    props.sort((a, b) => {
        if (a.required !== b.required) return a.required ? -1 : 1;
        return a.name.localeCompare(b.name);
    });

    // Check for manifest
    let manifest = null;
    const manifestPath = path.join(componentDir, 'b0nes.manifest.json');
    if (fs.existsSync(manifestPath)) {
        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        } catch (e) {
            console.warn(`[introspect] Failed to parse manifest for ${componentName}:`, e.message);
        }
    }

    // Check for showcase file
    const showPath = path.join(componentDir, `${componentName}.show.js`);
    const hasShowcase = fs.existsSync(showPath);

    // Check for client behavior file
    const clientPath = path.join(componentDir, 'client.js');
    const hasClientBehavior = fs.existsSync(clientPath);

    return {
        name: componentName,
        category,
        type: CATEGORY_TYPE_MAP[category],
        props,
        manifest,
        hasShowcase,
        hasClientBehavior,
        sourceFile: path.relative(COMPONENTS_ROOT, sourceFile),
        description: manifest?.description || extractFirstJSDocLine(source) || ''
    };
}

/**
 * Extract the first line of the main JSDoc block (component description)
 * 
 * @param {string} source - Component source code
 * @returns {string|null}
 */
function extractFirstJSDocLine(source) {
    // Find the main exported function's JSDoc block
    const jsdocMatch = source.match(/\/\*\*\s*\n\s*\*\s*(.+?)(?:\n|\s*\*\/)/);
    if (!jsdocMatch) return null;
    return jsdocMatch[1].trim().replace(/^\*\s*/, '');
}

/**
 * Scan all components and build the full introspection registry
 * 
 * @returns {Object} Registry keyed by category, containing component schemas
 */
export function buildRegistry() {
    const registry = {
        atoms: {},
        molecules: {},
        organisms: {}
    };

    for (const category of ['atoms', 'molecules', 'organisms']) {
        const categoryDir = path.join(COMPONENTS_ROOT, category);

        if (!fs.existsSync(categoryDir)) {
            console.warn(`[introspect] Category directory not found: ${categoryDir}`);
            continue;
        }

        const entries = fs.readdirSync(categoryDir, { withFileTypes: true });

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            const componentDir = path.join(categoryDir, entry.name);
            const schema = introspectComponent(category, componentDir, entry.name);

            if (schema) {
                registry[category][entry.name] = schema;
            }
        }
    }

    return registry;
}

/**
 * Get a flat list of all components for search/filter
 * 
 * @param {Object} registry - Full registry from buildRegistry()
 * @returns {Array<Object>} Flat array of component schemas
 */
export function flattenRegistry(registry) {
    const components = [];
    for (const category of ['atoms', 'molecules', 'organisms']) {
        for (const [name, schema] of Object.entries(registry[category] || {})) {
            components.push(schema);
        }
    }
    return components;
}

// Cache for performance (rebuilt on file changes)
let _registryCache = null;
let _cacheTimestamp = 0;

/**
 * Get the component registry (cached)
 * 
 * @param {boolean} [force=false] - Force rebuild
 * @returns {Object} Component registry
 */
export function getRegistry(force = false) {
    if (!_registryCache || force) {
        _registryCache = buildRegistry();
        _cacheTimestamp = Date.now();
        const flat = flattenRegistry(_registryCache);
        console.log(`[introspect] Built registry: ${flat.length} components indexed`);
    }
    return _registryCache;
}

/**
 * Invalidate the registry cache (called by watcher on file changes)
 */
export function invalidateRegistry() {
    _registryCache = null;
    _cacheTimestamp = 0;
    _pageTreeCache = null;
}

/**
 * Get cache timestamp
 * @returns {number}
 */
export function getCacheTimestamp() {
    return _cacheTimestamp;
}

// ============================================
// PAGE COMPOSITION TREE BUILDER
// ============================================

/**
 * Recursively walk a component config to build a tree node.
 * Children are extracted from props.slot when slot is an array
 * containing objects with { type, name, props }.
 *
 * @param {Object} config - { type, name, props }
 * @param {number} depth - current nesting depth
 * @returns {Object} tree node
 */
function walkComponentConfig(config, depth = 0) {
    if (!config || typeof config !== 'object' || !config.type || !config.name) {
        return null;
    }

    const children = [];
    const propsDisplay = {};

    if (config.props && typeof config.props === 'object') {
        for (const [key, value] of Object.entries(config.props)) {
            if (key === 'slot' && Array.isArray(value)) {
                // Walk slot children that are component configs
                for (const item of value) {
                    if (item && typeof item === 'object' && item.type && item.name) {
                        const child = walkComponentConfig(item, depth + 1);
                        if (child) children.push(child);
                    } else {
                        // Primitive slot content (string)
                        propsDisplay.slot = typeof item === 'string'
                            ? (item.length > 60 ? item.slice(0, 60) + '...' : item)
                            : String(item);
                    }
                }
                if (children.length > 0) {
                    propsDisplay.slot = `[${children.length} children]`;
                }
            } else if (key === 'slot' && typeof value === 'string') {
                propsDisplay.slot = value.length > 60 ? value.slice(0, 60) + '...' : value;
            } else if (typeof value === 'string') {
                propsDisplay[key] = value.length > 80 ? value.slice(0, 80) + '...' : value;
            } else if (Array.isArray(value)) {
                propsDisplay[key] = `[${value.length} items]`;
            } else {
                propsDisplay[key] = String(value);
            }
        }
    }

    return {
        type: config.type,
        name: config.name,
        props: propsDisplay,
        propCount: config.props ? Object.keys(config.props).length : 0,
        children,
        depth
    };
}

let _pageTreeCache = null;

/**
 * Build full page composition trees for all discovered routes.
 *
 * Uses autoRoutes to discover pages, loads each page module, and
 * recursively walks the exported `components` array to build trees.
 *
 * @returns {Promise<Array<Object>>} Array of page tree objects
 */
export async function buildPageTrees() {
    if (_pageTreeCache) return _pageTreeCache;

    // Lazy-import autoRoutes to avoid circular dependency at module load
    const { getRoutes } = await import('../server/handlers/autoRoutes.js');
    const routes = getRoutes();
    const pages = [];

    for (const route of routes) {
        try {
            const mod = await route.load();
            const components = mod.components || mod.default?.components || [];
            const meta = mod.meta || mod.default?.meta || {};

            const tree = [];
            if (Array.isArray(components)) {
                for (const config of components) {
                    const node = walkComponentConfig(config, 0);
                    if (node) tree.push(node);
                }
            }

            pages.push({
                route: route.pattern.pathname,
                title: meta.title || route.pattern.pathname,
                description: meta.description || '',
                filePath: route.filePath
                    ? path.relative(path.resolve(__dirname, '../..'), route.filePath)
                    : '',
                tree,
                componentCount: countNodes(tree)
            });
        } catch (err) {
            console.warn(`[introspect] Failed to load page ${route.pattern.pathname}:`, err.message);
            pages.push({
                route: route.pattern.pathname,
                title: route.pattern.pathname,
                description: '',
                filePath: '',
                tree: [],
                componentCount: 0,
                error: err.message
            });
        }
    }

    _pageTreeCache = pages;
    return pages;
}

/**
 * Count total nodes in a tree (recursive)
 * @param {Array} nodes
 * @returns {number}
 */
function countNodes(nodes) {
    let count = 0;
    for (const node of nodes) {
        count += 1;
        if (node.children) count += countNodes(node.children);
    }
    return count;
}
