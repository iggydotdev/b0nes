/**
 * b0nes MCP Tool Definitions & Handlers
 * 
 * Defines MCP tools that wrap b0nes' existing functions.
 * Each tool has a definition (name, description, inputSchema)
 * and a handler that returns MCP-formatted results.
 * 
 * Zero external dependencies — wraps existing b0nes APIs.
 */

import { createComponent } from '../components/utils/generator/index.js';
import { compose, clearCompositionCache } from '../framework/core/compose.js';
import { installComponent } from '../scripts/install-component.js';

/**
 * Lazy-loaded introspection (only available when the full framework is loaded)
 * We import dynamically to avoid circular dependency issues.
 */
let _registry = null;
async function getIntrospection() {
    if (!_registry) {
        _registry = await import('../framework/dev/introspect.js');
    }
    return _registry;
}

// ============================================
// TOOL DEFINITIONS
// ============================================

export const tools = [
    {
        name: 'generate_component',
        description: 'Scaffolds a new b0nes component (atom, molecule, or organism) to disk with boilerplate files (index.js, component.js, component.test.js)',
        inputSchema: {
            type: 'object',
            properties: {
                componentType: {
                    type: 'string',
                    enum: ['atom', 'molecule', 'organism'],
                    description: 'The atomic design level of the component'
                },
                componentName: {
                    type: 'string',
                    description: 'Component name using lowercase letters, numbers and hyphens (e.g. "feature-card")'
                }
            },
            required: ['componentType', 'componentName']
        }
    },
    {
        name: 'compose_page',
        description: 'Renders an array of b0nes component configurations into HTML. Components can nest via the slot prop. Returns the composed HTML string.',
        inputSchema: {
            type: 'object',
            properties: {
                components: {
                    type: 'array',
                    description: 'Array of component config objects',
                    items: {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                enum: ['atom', 'molecule', 'organism'],
                                description: 'Component type'
                            },
                            name: {
                                type: 'string',
                                description: 'Component name (must exist in library)'
                            },
                            props: {
                                type: 'object',
                                description: 'Props to pass to the component. Use "slot" for content (string or nested component array).'
                            }
                        },
                        required: ['type', 'name']
                    }
                }
            },
            required: ['components']
        }
    },
    {
        name: 'list_components',
        description: 'Lists all available b0nes components across atoms, molecules, and organisms. Returns component names, types, prop schemas, and descriptions.',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'install_component',
        description: 'Installs a community component from a URL. The URL should point to a b0nes.manifest.json or a directory containing one.',
        inputSchema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'URL to the component or its manifest'
                },
                force: {
                    type: 'boolean',
                    description: 'Overwrite existing component if it already exists'
                }
            },
            required: ['url']
        }
    }
];

// ============================================
// TOOL HANDLERS
// ============================================

/**
 * Create a success result in MCP format
 * @param {string} text - Result text
 * @returns {Object} MCP tool result
 */
function ok(text) {
    return {
        content: [{ type: 'text', text }],
        isError: false
    };
}

/**
 * Create an error result in MCP format
 * @param {string} text - Error message
 * @returns {Object} MCP tool result
 */
function err(text) {
    return {
        content: [{ type: 'text', text }],
        isError: true
    };
}

/**
 * Dispatch a tool call to the appropriate handler
 * @param {string} name - Tool name
 * @param {Object} args - Tool arguments
 * @returns {Promise<Object>} MCP tool result
 */
export async function handleToolCall(name, args = {}) {
    switch (name) {
        case 'generate_component':
            return handleGenerateComponent(args);
        case 'compose_page':
            return handleComposePage(args);
        case 'list_components':
            return handleListComponents(args);
        case 'install_component':
            return handleInstallComponent(args);
        default:
            return err(`Unknown tool: "${name}"`);
    }
}

// --- Individual Handlers ---

async function handleGenerateComponent({ componentType, componentName }) {
    try {
        const result = createComponent(componentType, componentName);
        return ok(`Created ${result.type} component "${result.name}" at ${result.path}`);
    } catch (error) {
        return err(`Failed to generate component: ${error.message}`);
    }
}

async function handleComposePage({ components }) {
    if (!components || !Array.isArray(components)) {
        return err('Missing or invalid "components" array');
    }
    
    try {
        // Clear cache to ensure fresh renders in MCP context
        clearCompositionCache();
        const html = compose(components);
        return ok(html);
    } catch (error) {
        return err(`Composition failed: ${error.message}`);
    }
}

async function handleListComponents() {
    try {
        const introspection = await getIntrospection();
        const registry = introspection.getRegistry();
        const flat = introspection.flattenRegistry(registry);
        
        const summary = {
            total: flat.length,
            atoms: Object.keys(registry.atoms).length,
            molecules: Object.keys(registry.molecules).length,
            organisms: Object.keys(registry.organisms).length,
            components: flat
        };
        
        return ok(JSON.stringify(summary, null, 2));
    } catch (error) {
        return err(`Failed to list components: ${error.message}`);
    }
}

async function handleInstallComponent({ url, force = false }) {
    if (!url) {
        return err('Missing required "url" parameter');
    }
    
    try {
        const result = await installComponent(url, { force });
        if (result.success) {
            return ok(`Installed component "${result.manifest.name}" (${result.manifest.type}) at ${result.path}`);
        } else {
            return err(`Installation failed: ${result.error}`);
        }
    } catch (error) {
        return err(`Installation error: ${error.message}`);
    }
}
