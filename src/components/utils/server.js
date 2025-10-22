import http from 'node:http';
import { fileURLToPath } from 'node:url';

// Create a local server to receive data from
const server = http.createServer((req, res) => {
  if (req.url !== '/') {
    const [root,type,component] = req.url.split('/');
      const test = import(fileURLToPath(new URL(`../components/${type}s/${component}/${component}.show.js`, import.meta.url))).then((module) => {
      const show = module.show();
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(show);
    }).catch((error) => {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Component not found', details: error.message }));
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        data: 'Server is running. Append /type/componentName to the URL to run a specific component test (e.g., atom/text, /box, /video, etc.).',
    }));
  }
});

server.listen(8000);