import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import { once } from 'node:events';
import { createRouter } from './index.js';

async function startServer(t, router) {
    const server = http.createServer(router.handle);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(async () => {
        server.closeAllConnections();
        await new Promise((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
    });
    return server.address().port;
}

function rawRequest(port, target, host) {
    return new Promise((resolve, reject) => {
        const socket = net.createConnection({ host: '127.0.0.1', port });
        let response = '';
        socket.setEncoding('utf8');
        socket.setTimeout(5000, () => socket.destroy(new Error('Request timed out')));
        socket.on('connect', () => {
            socket.end(`GET ${target} HTTP/1.1\r\nHost: ${host}\r\nConnection: close\r\n\r\n`);
        });
        socket.on('data', chunk => { response += chunk; });
        socket.on('error', reject);
        socket.on('close', hadError => { if (!hadError) resolve(response); });
    });
}

test('router returns 400 for malformed URLs without running middleware or stopping the server', async t => {
    const router = createRouter();
    let middlewareCalls = 0;
    router.use(() => { middlewareCalls++; });
    router.addExact('/healthy', (req, res, url) => {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.end(`${url.pathname}:${req.query.name}`);
    });
    const port = await startServer(t, router);

    for (const [target, host] of [
        ['/healthy', '['],
        ['/healthy', 'localhost:99999'],
        ['/healthy', 'localhost/private'],
        ['/healthy', 'user@localhost'],
        ['http://[', 'localhost']
    ]) {
        const invalid = await rawRequest(port, target, host);
        assert.match(invalid, /^HTTP\/1\.1 400 /);
        assert.match(invalid, /\r\nBad Request\r\n/);
        assert.equal(middlewareCalls, 0);
    }

    const healthy = await rawRequest(port, '/healthy?name=b0nes', `[::1]:${port}`);
    assert.match(healthy, /^HTTP\/1\.1 200 /);
    assert.match(healthy, /\r\n\/healthy:b0nes\r\n/);
    assert.equal(middlewareCalls, 1);
});

test('router still reports handler failures as 500 and can serve the next request', async t => {
    t.mock.method(console, 'error', () => {});
    const router = createRouter();
    router.addExact('/broken', () => { throw new Error('Handler failed'); });
    router.addExact('/healthy', (req, res) => { res.end('healthy'); });
    const port = await startServer(t, router);

    const broken = await rawRequest(port, '/broken', 'localhost');
    assert.match(broken, /^HTTP\/1\.1 500 /);
    assert.match(broken, /\r\nInternal Server Error\r\n/);
    const healthy = await rawRequest(port, '/healthy', 'localhost');
    assert.match(healthy, /^HTTP\/1\.1 200 /);
    assert.match(healthy, /healthy$/);
});
