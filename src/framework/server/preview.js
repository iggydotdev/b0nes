// Static preview server using only Node built-ins.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = fs.realpathSync(path.resolve(process.argv[2] || 'public'));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
http.createServer((req, res) => {
    try {
        if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
        let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
        if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
        file = fs.realpathSync(file);
        if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile()) throw Error('Not found');
        res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        if (req.method === 'HEAD') res.end(); else fs.createReadStream(file).pipe(res);
    } catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.PORT || 3000), '127.0.0.1', function () {
    console.log(`Preview: http://localhost:${this.address().port}`);
});
