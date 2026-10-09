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
import { readFileSync, writeFileSync, mkdirSync, cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_PATH = path.join(__dirname, 'server.js');

/**
 * Helper: spawn MCP server, send messages, collect responses
 * @param {Object[]} messages - JSON-RPC messages to send
 * @param {number} [timeout=10000] - Timeout in ms
 * @returns {Promise<Object[]>} Array of parsed JSON-RPC responses
 */
function mcpSession(messages, timeout = 10000, serverPath = SERVER_PATH) {
    return new Promise((resolve, reject) => {
        const responses = [];
        const proc = spawn(process.execPath, [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: path.resolve(__dirname, '../..')
        });

        let buffer = '';
        let stderr = '';
        proc.stderr.on('data', chunk => { stderr += chunk; });
        function parseLine(line) {
            if (!line.trim()) return;
            try { responses.push(JSON.parse(line)); }
            catch {
                proc.kill();
                reject(new Error(`Non-JSON data on MCP stdout: ${line}`));
            }
        }
        
        proc.stdout.on('data', (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop(); // keep incomplete line in buffer
            
            for (const line of lines) {
                parseLine(line);
            }
        });

        const timer = setTimeout(() => {
            proc.kill();
            reject(new Error(`MCP session timed out: ${stderr}`));
        }, timeout);

        proc.on('close', code => {
            clearTimeout(timer);
            // Process remaining buffer
            parseLine(buffer);
            if (code !== 0) return reject(new Error(`MCP exited with ${code}: ${stderr}`));
            resolve(responses);
        });

        proc.on('error', reject);

        for (const msg of messages) proc.stdin.write((msg?.rawLine ?? JSON.stringify(msg)) + '\n');
        proc.stdin.end();
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
    const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
    assert.strictEqual(initResponse.result.serverInfo.version, pkg.version);
});

test('MCP: tools/list returns all 5 tools', async () => {
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
    assert.strictEqual(listResponse.result.tools.length, 5, 'Should have 5 tools');
    
    const toolNames = listResponse.result.tools.map(t => t.name).sort();
    assert.deepStrictEqual(toolNames, [
        'compose_page',
        'generate_component',
        'get_component_schema',
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

test('MCP: malformed messages return errors without terminating the transport', async () => {
    const invalid = [null, [], true, 123, 'hello', {},
        { jsonrpc: '2.0', id: null, method: 'ping' },
        { jsonrpc: '2.0', id: {}, method: 'ping' },
        { jsonrpc: '2.0', id: 4, method: 5 }];
    const responses = await mcpSession([
        { rawLine: '{broken' }, ...invalid,
        { jsonrpc: '2.0', id: 10, method: 'ping', params: [] },
        { jsonrpc: '2.0', id: 11, method: 'tools/call', params: { name: 'list_components', arguments: 'bad' } },
        { jsonrpc: '2.0', method: 'notifications/initialized' },
        { jsonrpc: '2.0', id: 12, method: 'ping' }
    ]);
    assert.strictEqual(responses.length, invalid.length + 4);
    assert.strictEqual(responses[0].error.code, -32700);
    for (const response of responses.slice(1, invalid.length + 1)) assert.strictEqual(response.error.code, -32600);
    assert.strictEqual(responses.find(r => r.id === 10).error.code, -32602);
    assert.strictEqual(responses.find(r => r.id === 11).error.code, -32602);
    assert.deepStrictEqual(responses.find(r => r.id === 12).result, {});
});

test('MCP: invalid components are tool errors and wrapped renderers expose their props', async () => {
    const responses = await mcpSession([
        { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'compose_page', arguments: {
            components: [{ type: 'atom', name: 'missing' }]
        } } },
        { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'compose_page', arguments: {
            components: [{ type: 'atom', name: 'text', props: { slot: 'missing is' } }]
        } } },
        { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'get_component_schema', arguments: { componentName: 'spa' } } },
        { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'get_component_schema', arguments: { componentName: 'multi-step-form' } } }
    ]);
    for (const response of responses.slice(0, 2)) assert.strictEqual(response.result.isError, true);
    const schema = JSON.parse(responses[2].result.content[0].text);
    assert.deepStrictEqual(schema.props.map(p => [p.name, p.required]), [['slot', true], ['attrs', false], ['className', false]]);
    const form = JSON.parse(responses[3].result.content[0].text);
    assert.equal(form.props.find(prop => prop.name === 'action').required, false);
});

test('MCP: generation refreshes discovery and composition within the same session', async t => {
    const root = mkdtempSync(path.join(tmpdir(), 'b0nes-mcp-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    cpSync(new URL('../', import.meta.url), path.join(root, 'src'), { recursive: true });
    cpSync(new URL('../../package.json', import.meta.url), path.join(root, 'package.json'));
    const template = path.join(root, 'src/components/utils/generator/templates/componentName.js.txt');
    writeFileSync(template, 'export const debug = ({ helperFlag }) => helperFlag;\n' + readFileSync(template, 'utf8'));
    const responses = await mcpSession([
        { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'list_components', arguments: {} } },
        { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'generate_component', arguments: { componentType: 'atom', componentName: 'mcp-card' } } },
        { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'list_components', arguments: {} } },
        { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'get_component_schema', arguments: { componentName: 'mcp-card' } } },
        { jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'compose_page', arguments: {
            components: [{ type: 'atom', name: 'mcp-card', props: { className: '', slot: 'Created <now>' } }]
        } } }
    ], 10000, path.join(root, 'src/mcp/server.js'));
    for (const response of responses) assert.strictEqual(response.result.isError, false, response.result.content[0].text);
    const before = JSON.parse(responses[0].result.content[0].text);
    const after = JSON.parse(responses[2].result.content[0].text);
    assert.strictEqual(after.total, before.total + 1);
    assert.ok(after.components.some(c => c.name === 'mcp-card'));
    assert.strictEqual(JSON.parse(responses[3].result.content[0].text).name, 'mcp-card');
    const props = JSON.parse(responses[3].result.content[0].text).props;
    assert.ok(props.some(prop => prop.name === 'slot'));
    assert.ok(!props.some(prop => prop.name === 'helperFlag'));
    assert.match(responses[4].result.content[0].text, /Created &lt;now&gt;/);
});

test('MCP: installation refreshes schemas and forced replacements clear rendered output', async t => {
    const root = mkdtempSync(path.join(tmpdir(), 'b0nes-mcp-install-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    cpSync(new URL('../', import.meta.url), path.join(root, 'src'), { recursive: true });
    cpSync(new URL('../../package.json', import.meta.url), path.join(root, 'package.json'));
    let downloads = 0;
    const server = createServer((req, res) => {
        if (req.url === '/card/b0nes.manifest.json') {
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ name: 'mcp-installed', type: 'atom', version: '0.1.0', files: { component: './card.js' } }));
        } else if (req.url === '/card/card.js') {
            const label = ++downloads === 1 ? 'First' : 'Second';
            res.end(`import { defineComponent } from '../../utils/html.js';
                import { processSlot } from '../../utils/processSlot.js';
                console.log('Loaded installed renderer');
                export default defineComponent(({ slot }) => '<p>${label}: ' + processSlot(slot) + '</p>', 'atom:mcp-installed');`);
        } else { res.statusCode = 404; res.end(); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    const url = `http://127.0.0.1:${server.address().port}/card/b0nes.manifest.json`;
    const call = (id, name, args = {}) => ({ jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } });
    const components = [{ type: 'atom', name: 'mcp-installed', props: { slot: '<safe>' } }];
    const responses = await mcpSession([
        call(1, 'list_components'), call(2, 'install_component', { url }),
        call(3, 'get_component_schema', { componentName: 'mcp-installed' }),
        call(4, 'compose_page', { components }),
        call(5, 'install_component', { url, force: true }),
        call(6, 'list_components'), call(7, 'compose_page', { components })
    ], 10000, path.join(root, 'src/mcp/server.js'));
    assert.equal(responses.length, 7);
    for (const response of responses) assert.equal(response.result.isError, false, response.result.content[0].text);
    assert.equal(JSON.parse(responses[2].result.content[0].text).name, 'mcp-installed');
    assert.match(responses[3].result.content[0].text, /First: &lt;safe&gt;/);
    assert.match(responses[6].result.content[0].text, /Second: &lt;safe&gt;/);
    const before = JSON.parse(responses[0].result.content[0].text);
    const after = JSON.parse(responses[5].result.content[0].text);
    assert.equal(after.total, before.total + 1);
});

test('MCP: vendored server identifies the framework version and always includes a version', async t => {
    const root = mkdtempSync(path.join(tmpdir(), 'b0nes-mcp-version-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    cpSync(new URL('../', import.meta.url), path.join(root, 'src'), { recursive: true });
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({ type: 'module', version: '9.8.7' }));
    mkdirSync(path.join(root, '.b0nes'));
    writeFileSync(path.join(root, '.b0nes/manifest.json'), JSON.stringify({ frameworkVersion: '0.3.0' }));
    const messages = [{ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }];
    const [vendored] = await mcpSession(messages, 10000, path.join(root, 'src/mcp/server.js'));
    assert.equal(vendored.result.serverInfo.version, '0.3.0');
    rmSync(path.join(root, '.b0nes/manifest.json'));
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({ type: 'module' }));
    const [versionless] = await mcpSession(messages, 10000, path.join(root, 'src/mcp/server.js'));
    assert.equal(typeof versionless.result.serverInfo.version, 'string');
    assert.ok(versionless.result.serverInfo.version);
});
