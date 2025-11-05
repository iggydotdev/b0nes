import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { router } from './router.js';
import { routes } from './routes.js';
import { compose } from './compose.js';
import { renderPage } from './renderPage.js';

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Serve b0nes.js client-side runtime
    if (url.pathname === '/b0nes.js') {
        try {
            const filePath = fileURLToPath(new URL('./client/b0nes.js', import.meta.url));
            const content = await readFile(filePath, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(content);
            return;
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error loading b0nes.js');
            return;
        }
    }
    // Serve components/index.js
    const segments = req.url.includes('client.js')?req.url.split('client.js')[0]:req.url.split('/').filter(Boolean);
    
    console.log(segments);
    if (url.pathname.includes('client.js')) {
        const x = segments.split('/').filter(Boolean);
        console.log(x)
        const [type, name] = x[x.length-1].split('.');
        console.log(type, name);
        try {
            const filePath = fileURLToPath(new URL(`../components/${type}/${name}/${type}.${name}.client.js`, import.meta.url));
            const content = await readFile(filePath, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(content);
            return;
        } catch (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Components index not found');
            return;
        }
    }
    const route = router(url, routes);
    if (route) {
        const content = compose(route.components);
        const html = renderPage(content, route.meta);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
    }
    // Handle 404
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(renderPage(
        '<h1>404 - Page Not Found</h1>',
        { title: '404' }
    ));
    // if (req.url !== '/') {
    //     const [root,type,component] = req.url.split('/');
    //     const test = import(fileURLToPath(new URL(`../components/${type}s/${component}/${component}.show.js`, import.meta.url))).then((module) => {
    //     const show = module.show();
    //     res.writeHead(200, { 'Content-Type': 'text/html' });
    //     res.end(show);
    //     }).catch((error) => {
    //     res.writeHead(404, { 'Content-Type': 'application/json' });
    //     res.end(JSON.stringify({ error: 'Component not found', details: error.message }));
    //     });
    // } else {
    //     res.writeHead(200, { 'Content-Type': 'application/json' });
    //     res.end(JSON.stringify({
    //         data: 'Flesh Server is running. Append /type/componentName to the URL to run a specific component test (e.g., atom/text, /box, /video, etc.).',
    //     }));
    // }
});

export default function startServer(port = 5000, host = '0.0.0.0') {
    server.listen(port, host, () => {
        console.log(`Server running at http://${host}:${port}/`);
    });
    return server;
};