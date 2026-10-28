// Optional zero-dependency local development server, Node 22+.
// Usage: npm start  →  http://localhost:8080
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server = http.createServer(async (req,res)=>{
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const full = resolve(root, '.' + (path === '/' ? '/index.html' : path));
    if (full !== root && !full.startsWith(root+sep)) {res.writeHead(403);res.end('Forbidden');return;}
    const info = await stat(full);
    if (!info.isFile()) throw new Error('Not a file');
    res.writeHead(200,{'Content-Type':types[extname(full)]??'application/octet-stream','Cache-Control':'no-store'});
    res.end(await readFile(full));
  } catch {res.writeHead(404);res.end('Not found');}
});
server.listen(8080,'127.0.0.1',()=>console.log('PATHLAB: http://localhost:8080'));
