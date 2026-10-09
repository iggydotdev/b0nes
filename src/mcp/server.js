#!/usr/bin/env node

/**
 * b0nes MCP Server
 * 
 * Zero-dependency Model Context Protocol server using stdio transport.
 * Implements JSON-RPC 2.0 over stdin/stdout (newline-delimited).
 * 
 * Conforms to MCP protocol revision 2025-06-18.
 * 
 * Usage:
 *   node src/mcp/server.js
 * 
 * Or via package.json:
 *   npm run mcp
 * 
 * MCP client config (e.g. Claude Desktop, Cursor):
 *   {
 *     "mcpServers": {
 *       "b0nes": {
 *         "command": "node",
 *         "args": ["src/mcp/server.js"],
 *         "cwd": "/path/to/your/b0nes/project"
 *       }
 *     }
 *   }
 */

import { createInterface } from 'node:readline';
import { Console } from 'node:console';
import { readFileSync } from 'node:fs';

// stdout belongs exclusively to the transport, including logs from component code.
globalThis.console = new Console({ stdout: process.stderr, stderr: process.stderr });
const { tools, handleToolCall } = await import('./tools.js');
const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
let version = typeof pkg.version === 'string' && pkg.version ? pkg.version : 'unknown';
try {
    const manifest = JSON.parse(readFileSync(new URL('../../.b0nes/manifest.json', import.meta.url), 'utf8'));
    if (typeof manifest.frameworkVersion === 'string' && manifest.frameworkVersion && manifest.frameworkVersion !== 'unknown') {
        version = manifest.frameworkVersion;
    }
} catch (error) {
    if (error.code !== 'ENOENT') console.warn(`Could not read framework version: ${error.message}`);
}

const PROTOCOL_VERSION = '2025-06-18';
const SERVER_INFO = {
    name: 'b0nes-mcp',
    version
};

// ============================================
// JSON-RPC 2.0 HELPERS
// ============================================

/**
 * Send a JSON-RPC response to stdout
 * @param {Object} message - JSON-RPC message
 */
function send(message) {
    const line = JSON.stringify(message);
    process.stdout.write(line + '\n');
}

/**
 * Send a JSON-RPC success response
 * @param {number|string} id - Request ID
 * @param {Object} result - Result payload
 */
function sendResult(id, result) {
    send({ jsonrpc: '2.0', id, result });
}

/**
 * Send a JSON-RPC error response
 * @param {number|string|null} id - Request ID (null for parse errors)
 * @param {number} code - Error code
 * @param {string} message - Error message
 * @param {*} [data] - Additional error data
 */
function sendError(id, code, message, data) {
    const error = { code, message };
    if (data !== undefined) error.data = data;
    send({ jsonrpc: '2.0', id, error });
}

// Standard JSON-RPC error codes
const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const INTERNAL_ERROR = -32603;

// ============================================
// MCP REQUEST HANDLERS  
// ============================================

let initialized = false;

/**
 * Handle the MCP initialize request
 * @param {number|string} id - Request ID
 * @param {Object} params - Initialize params from client
 */
function handleInitialize(id, params) {
    const clientVersion = params?.protocolVersion;
    
    // Log to stderr (allowed by MCP spec, not sent to client)
    process.stderr.write(`[b0nes-mcp] Client connected: ${params?.clientInfo?.name || 'unknown'} v${params?.clientInfo?.version || '?'}\n`);
    process.stderr.write(`[b0nes-mcp] Client protocol version: ${clientVersion}\n`);
    
    sendResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {
            tools: {
                listChanged: false
            }
        },
        serverInfo: SERVER_INFO,
        instructions: 'b0nes component framework MCP server. Use tools to scaffold components, compose HTML from JSON configs, list available components, and install community components.'
    });
}

/**
 * Handle notifications/initialized from client
 */
function handleInitialized() {
    initialized = true;
    process.stderr.write('[b0nes-mcp] Initialized — ready for tool calls\n');
}

/**
 * Handle tools/list request
 * @param {number|string} id - Request ID
 */
function handleToolsList(id) {
    sendResult(id, { tools });
}

/**
 * Handle tools/call request
 * @param {number|string} id - Request ID
 * @param {Object} params - { name, arguments }
 */
async function handleToolsCall(id, params) {
    const { name, arguments: args } = params || {};
    
    if (typeof name !== 'string' || !name) {
        return sendError(id, INVALID_PARAMS, 'Missing tool name');
    }
    if (args !== undefined && (!args || typeof args !== 'object' || Array.isArray(args))) {
        return sendError(id, INVALID_PARAMS, 'Tool arguments must be an object');
    }
    
    // Validate tool exists
    const toolDef = tools.find(t => t.name === name);
    if (!toolDef) {
        return sendError(id, INVALID_PARAMS, `Unknown tool: "${name}"`);
    }
    
    try {
        const result = await handleToolCall(name, args || {});
        sendResult(id, result);
    } catch (error) {
        sendResult(id, {
            content: [{ type: 'text', text: `Internal error: ${error.message}` }],
            isError: true
        });
    }
}

/**
 * Handle ping request
 * @param {number|string} id - Request ID
 */
function handlePing(id) {
    sendResult(id, {});
}

// ============================================
// MESSAGE DISPATCHER
// ============================================

/**
 * Route an incoming JSON-RPC message to the appropriate handler
 * @param {Object} message - Parsed JSON-RPC message
 */
async function dispatch(message) {
    const { id, method, params } = message;
    
    // Notifications (no id) 
    if (id === undefined) {
        switch (method) {
            case 'notifications/initialized':
                return handleInitialized();
            case 'notifications/cancelled':
                // Acknowledge cancellations silently
                return;
            default:
                process.stderr.write(`[b0nes-mcp] Unknown notification: ${method}\n`);
                return;
        }
    }
    
    // Requests (have id, expect response)
    switch (method) {
        case 'initialize':
            return handleInitialize(id, params);
        case 'ping':
            return handlePing(id);
        case 'tools/list':
            return handleToolsList(id, params);
        case 'tools/call':
            return await handleToolsCall(id, params);
        default:
            return sendError(id, METHOD_NOT_FOUND, `Method not found: ${method}`);
    }
}

// ============================================
// STDIO TRANSPORT
// ============================================

const rl = createInterface({
    input: process.stdin,
    terminal: false
});

async function handleMessage(line) {
    // Skip empty lines
    const trimmed = line.trim();
    if (!trimmed) return;
    
    let message;
    try {
        message = JSON.parse(trimmed);
    } catch {
        sendError(null, PARSE_ERROR, 'Parse error: invalid JSON');
        return;
    }
    
    const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    const validId = id => typeof id === 'string' || (typeof id === 'number' && Number.isSafeInteger(id));
    // MCP requests have string/integer IDs; notifications omit the ID entirely.
    if (!isObject(message) || message.jsonrpc !== '2.0' ||
        typeof message.method !== 'string' || !message.method ||
        (Object.hasOwn(message, 'id') && !validId(message.id))) {
        sendError(isObject(message) && validId(message.id) ? message.id : null,
            INVALID_REQUEST, 'Invalid JSON-RPC request');
        return;
    }
    if (message.params !== undefined && !isObject(message.params)) {
        if (message.id !== undefined) sendError(message.id, INVALID_PARAMS, 'Parameters must be an object');
        return;
    }
    
    try {
        await dispatch(message);
    } catch (error) {
        process.stderr.write(`[b0nes-mcp] Dispatch error: ${error.message}\n${error.stack}\n`);
        if (message.id !== undefined) {
            sendError(message.id, INTERNAL_ERROR, `Internal error: ${error.message}`);
        }
    }
}

// Preserve request order: a subsequent discovery/compose request sees a completed
// generation or installation. Finish pending requests before closing the stream.
let pending = Promise.resolve();
rl.on('line', line => { pending = pending.then(() => handleMessage(line)); });

rl.on('close', async () => {
    await pending;
    process.stderr.write('[b0nes-mcp] stdin closed, shutting down\n');
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

process.stderr.write(`[b0nes-mcp] Server started (protocol: ${PROTOCOL_VERSION})\n`);
process.stderr.write('[b0nes-mcp] Waiting for initialize request...\n');
