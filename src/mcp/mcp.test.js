/**
 * b0nes MCP Server Tests
 * 
 * Spawns the MCP server as a subprocess and validates
 * JSON-RPC 2.0 protocol compliance and tool execution.
 */

import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_PATH = path.join(__dirname, 'server.js');

/**
 * Helper: spawn MCP server, send messages, collect responses
 * @param {Object[]} messages - JSON-RPC messages to send
 * @param {number} [timeout=10000] - Timeout in ms
 * @returns {Promise<Object[]>} Array of parsed JSON-RPC responses
 */
function mcpSession(messages, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const responses = [];
        const proc = spawn('node', [SERVER_PATH], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: path.resolve(__dirname, '../..')
        });

        let buffer = '';
        
        proc.stdout.on('data', (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop(); // keep incomplete line in buffer
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed) {
                    try {
                        responses.push(JSON.parse(trimmed));
                    } catch {
                        // skip non-JSON lines
                    }
                }
            }
        });

        const timer = setTimeout(() => {
            proc.kill();
            resolve(responses);
        }, timeout);

        proc.on('close', () => {
            clearTimeout(timer);
            // Process remaining buffer
            if (buffer.trim()) {
                try {
                    responses.push(JSON.parse(buffer.trim()));
                } catch { /* ignore */ }
            }
            resolve(responses);
        });

        proc.on('error', reject);

        // Send messages sequentially with small delays
        let i = 0;
        function sendNext() {
            if (i >= messages.length) {
                // Give server time to process last message, then close
                setTimeout(() => proc.stdin.end(), 500);
                return;
            }
            const msg = messages[i++];
            proc.stdin.write(JSON.stringify(msg) + '\n');
            setTimeout(sendNext, 100);
        }
        sendNext();
    });
}

// ============================================
// TESTS
// ============================================

test('MCP: initialize handshake returns server info and capabilities', async () => {
    const responses = await mcpSession([
        {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2025-06-18',
                capabilities: {},
                clientInfo: { name: 'test-client', version: '1.0.0' }
            }
        },
        { jsonrpc: '2.0', method: 'notifications/initialized' }
    ]);

    assert.ok(responses.length >= 1, 'Should receive at least 1 response');
    
    const initResponse = responses.find(r => r.id === 1);
    assert.ok(initResponse, 'Should have response with id 1');
    assert.strictEqual(initResponse.result.protocolVersion, '2025-06-18');
    assert.ok(initResponse.result.capabilities.tools, 'Should have tools capability');
    assert.strictEqual(initResponse.result.serverInfo.name, 'b0nes-mcp');
});

test('MCP: tools/list returns all 4 tools', async () => {
    const responses = await mcpSession([
        {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2025-06-18',
                capabilities: {},
                clientInfo: { name: 'test', version: '1.0.0' }
            }
        },
        { jsonrpc: '2.0', method: 'notifications/initialized' },
        { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }
    ]);

    const listResponse = responses.find(r => r.id === 2);
    assert.ok(listResponse, 'Should have tools/list response');
    assert.ok(Array.isArray(listResponse.result.tools), 'Should return tools array');
    assert.strictEqual(listResponse.result.tools.length, 4, 'Should have 4 tools');
    
    const toolNames = listResponse.result.tools.map(t => t.name).sort();
    assert.deepStrictEqual(toolNames, [
        'compose_page',
        'generate_component',
        'install_component',
        'list_components'
    ]);
});

test('MCP: compose_page renders HTML from component config', async () => {
    const responses = await mcpSession([
        {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2025-06-18',
                capabilities: {},
                clientInfo: { name: 'test', version: '1.0.0' }
            }
        },
        { jsonrpc: '2.0', method: 'notifications/initialized' },
        {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
                name: 'compose_page',
                arguments: {
                    components: [
                        {
                            type: 'atom',
                            name: 'text',
                            props: { is: 'p', slot: 'Hello MCP' }
                        }
                    ]
                }
            }
        }
    ]);

    const composeResponse = responses.find(r => r.id === 2);
    assert.ok(composeResponse, 'Should have compose response');
    assert.ok(composeResponse.result.content, 'Should have content array');
    assert.strictEqual(composeResponse.result.isError, false, 'Should not be an error');
    
    const html = composeResponse.result.content[0].text;
    assert.ok(html.includes('Hello MCP'), 'HTML should contain the composed text');
});

test('MCP: list_components returns component registry', async () => {
    const responses = await mcpSession([
        {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2025-06-18',
                capabilities: {},
                clientInfo: { name: 'test', version: '1.0.0' }
            }
        },
        { jsonrpc: '2.0', method: 'notifications/initialized' },
        {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: { name: 'list_components', arguments: {} }
        }
    ]);

    const listResponse = responses.find(r => r.id === 2);
    assert.ok(listResponse, 'Should have list_components response');
    assert.strictEqual(listResponse.result.isError, false);
    
    const data = JSON.parse(listResponse.result.content[0].text);
    assert.ok(data.total > 0, 'Should have components');
    assert.ok(data.atoms >= 0, 'Should have atoms count');
    assert.ok(data.molecules >= 0, 'Should have molecules count');
    assert.ok(data.organisms >= 0, 'Should have organisms count');
});

test('MCP: unknown tool returns error', async () => {
    const responses = await mcpSession([
        {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2025-06-18',
                capabilities: {},
                clientInfo: { name: 'test', version: '1.0.0' }
            }
        },
        { jsonrpc: '2.0', method: 'notifications/initialized' },
        {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: { name: 'nonexistent_tool', arguments: {} }
        }
    ]);

    const errorResponse = responses.find(r => r.id === 2);
    assert.ok(errorResponse, 'Should have error response');
    assert.ok(errorResponse.error, 'Should be an error response');
    assert.ok(errorResponse.error.message.includes('nonexistent_tool'));
});

test('MCP: unknown method returns method not found', async () => {
    const responses = await mcpSession([
        {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2025-06-18',
                capabilities: {},
                clientInfo: { name: 'test', version: '1.0.0' }
            }
        },
        { jsonrpc: '2.0', method: 'notifications/initialized' },
        { jsonrpc: '2.0', id: 99, method: 'resources/list', params: {} }
    ]);

    const errorResponse = responses.find(r => r.id === 99);
    assert.ok(errorResponse, 'Should have error response');
    assert.ok(errorResponse.error, 'Should be an error');
    assert.strictEqual(errorResponse.error.code, -32601, 'Should be METHOD_NOT_FOUND');
});

test('MCP: ping returns empty result', async () => {
    const responses = await mcpSession([
        {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2025-06-18',
                capabilities: {},
                clientInfo: { name: 'test', version: '1.0.0' }
            }
        },
        { jsonrpc: '2.0', method: 'notifications/initialized' },
        { jsonrpc: '2.0', id: 42, method: 'ping' }
    ]);

    const pingResponse = responses.find(r => r.id === 42);
    assert.ok(pingResponse, 'Should have ping response');
    assert.deepStrictEqual(pingResponse.result, {});
});
