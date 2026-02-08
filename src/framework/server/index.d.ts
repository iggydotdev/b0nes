/**
 * b0nes Development Server
 * HTTP server with structured routing, static file serving, and auto-discovered pages.
 */

import { Server } from 'node:http';

/**
 * Starts the b0nes development server.
 *
 * @param port - Port to listen on (default: 3000)
 * @param host - Host to bind to (default: '0.0.0.0')
 * @returns The Node.js HTTP Server instance
 */
export function startServer(port?: number, host?: string): Server;

export default startServer;
