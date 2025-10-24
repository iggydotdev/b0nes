import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { router } from './router.js';
import { routes } from './routes.js';
import { compose } from './compose.js';
import { renderPage } from './renderPage.js';

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
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
})

server.listen(5000, '0.0.0.0', ()=>{
    console.log('Server running at http://0.0.0.0:5000/');
})