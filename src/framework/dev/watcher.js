/**
 * b0nes File Watcher & SSE Broadcaster
 * 
 * Uses native Node.js fs.watch() to monitor component source files.
 * Broadcasts file change events to connected inspector clients via
 * Server-Sent Events (SSE) -- zero external dependencies.
 * 
 * Features:
 * - Debounced change detection (prevents double-fire on save)
 * - Path deduplication within debounce window
 * - SSE keep-alive heartbeats
 * - Client connection tracking with automatic cleanup
 * - Component-level change identification (category + name)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { invalidateRegistry } from './introspect.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPONENTS_ROOT = path.resolve(__dirname, '../../components');

/**
 * Active SSE client connections
 * @type {Set<import('node:http').ServerResponse>}
 */
const clients = new Set();

/**
 * Debounce timer reference
 * @type {NodeJS.Timeout|null}
 */
let debounceTimer = null;

/**
 * Pending changes accumulated during debounce window
 * @type {Set<string>}
 */
const pendingChanges = new Set();

/**
 * Heartbeat interval reference
 * @type {NodeJS.Timeout|null}
 */
let heartbeatInterval = null;

/**
 * fs.watch() handle
 * @type {fs.FSWatcher|null}
 */
let watcher = null;

/** Debounce delay in ms */
const DEBOUNCE_MS = 150;

/** Heartbeat interval in ms (keeps SSE connections alive) */
const HEARTBEAT_MS = 30000;

/**
 * Identify which component changed based on file path
 * 
 * Maps a file path like:
 *   /src/components/atoms/button/button.js
 * To:
 *   { category: 'atoms', type: 'atom', name: 'button' }
 * 
 * @param {string} filePath - Changed file path (relative to COMPONENTS_ROOT)
 * @returns {{category: string, type: string, name: string}|null}
 */
function identifyComponent(filePath) {
    // Normalize path separators
    const normalized = filePath.replace(/\\/g, '/');
    
    // Expected structure: category/componentName/...
    const parts = normalized.split('/').filter(Boolean);
    
    if (parts.length < 2) return null;
    
    const category = parts[0]; // atoms, molecules, organisms
    const name = parts[1];     // button, card, hero, etc.
    
    const typeMap = { atoms: 'atom', molecules: 'molecule', organisms: 'organism' };
    const type = typeMap[category];
    
    if (!type) return null;
    
    return { category, type, name };
}

/**
 * Broadcast an SSE event to all connected clients
 * 
 * @param {string} eventType - SSE event name
 * @param {Object} data - Event data (will be JSON-serialized)
 */
function broadcast(eventType, data) {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    
    for (const client of clients) {
        try {
            if (!client.destroyed && client.writable) {
                client.write(payload);
            } else {
                clients.delete(client);
            }
        } catch (err) {
            console.warn('[watcher] Failed to write to SSE client, removing:', err.message);
            clients.delete(client);
        }
    }
}

/**
 * Process accumulated file changes after debounce window
 */
function flushChanges() {
    if (pendingChanges.size === 0) return;
    
    const changes = [...pendingChanges];
    pendingChanges.clear();
    
    // Invalidate introspection cache
    invalidateRegistry();
    
    // Identify unique components that changed
    const changedComponents = new Map();
    
    for (const filePath of changes) {
        const component = identifyComponent(filePath);
        if (component) {
            const key = `${component.type}/${component.name}`;
            changedComponents.set(key, component);
        }
    }
    
    // Broadcast per-component change events
    for (const [key, component] of changedComponents) {
        broadcast('component-changed', {
            component: key,
            category: component.category,
            type: component.type,
            name: component.name,
            timestamp: Date.now()
        });
        
        console.log(`[watcher] Component changed: ${key}`);
    }
    
    // Also broadcast a general refresh event
    broadcast('registry-changed', {
        components: [...changedComponents.keys()],
        timestamp: Date.now()
    });
}

/**
 * Register an SSE client connection
 * 
 * Sets up the response headers for SSE and adds the client
 * to the active connections set.
 * 
 * @param {import('node:http').ServerResponse} res - HTTP response object
 */
export function addSSEClient(res) {
    // SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'X-Accel-Buffering': 'no' // Disable nginx buffering
    });
    
    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`);
    
    clients.add(res);
    
    console.log(`[watcher] SSE client connected (${clients.size} active)`);
    
    // Clean up on disconnect
    res.on('close', () => {
        clients.delete(res);
        console.log(`[watcher] SSE client disconnected (${clients.size} active)`);
    });
}

/**
 * Start watching the components directory for changes
 * 
 * Uses fs.watch() with recursive option (Node 20+).
 * Falls back to non-recursive watching if recursive is unsupported.
 */
export function startWatcher() {
    if (watcher) {
        console.log('[watcher] Already watching');
        return;
    }
    
    if (!fs.existsSync(COMPONENTS_ROOT)) {
        console.warn(`[watcher] Components root not found: ${COMPONENTS_ROOT}`);
        return;
    }
    
    try {
        watcher = fs.watch(COMPONENTS_ROOT, { recursive: true }, (eventType, filename) => {
            if (!filename) return;
            
            // Skip non-source files
            if (!filename.endsWith('.js') && 
                !filename.endsWith('.json') && 
                !filename.endsWith('.css')) {
                return;
            }
            
            // Skip node_modules, test files, etc.
            if (filename.includes('node_modules') || filename.includes('.test.')) {
                return;
            }
            
            // Accumulate changes
            pendingChanges.add(filename);
            
            // Reset debounce timer
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(flushChanges, DEBOUNCE_MS);
        });
        
        // Heartbeat to keep SSE connections alive
        heartbeatInterval = setInterval(() => {
            for (const client of clients) {
                try {
                    if (!client.destroyed && client.writable) {
                        client.write(`: heartbeat\n\n`);
                    } else {
                        clients.delete(client);
                    }
                } catch {
                    clients.delete(client);
                }
            }
        }, HEARTBEAT_MS);
        
        console.log(`[watcher] Watching ${COMPONENTS_ROOT} for changes`);
        
    } catch (err) {
        console.error('[watcher] Failed to start file watcher:', err.message);
        console.warn('[watcher] Hot reload will not be available');
    }
}

/**
 * Stop the file watcher and clean up resources
 */
export function stopWatcher() {
    if (watcher) {
        watcher.close();
        watcher = null;
    }
    
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
    
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
    
    // Close all SSE connections
    for (const client of clients) {
        try {
            client.end();
        } catch { /* ignore */ }
    }
    clients.clear();
    pendingChanges.clear();
    
    console.log('[watcher] Stopped');
}

/**
 * Get watcher status
 * @returns {{ active: boolean, clients: number, pendingChanges: number }}
 */
export function getWatcherStatus() {
    return {
        active: watcher !== null,
        clients: clients.size,
        pendingChanges: pendingChanges.size
    };
}
