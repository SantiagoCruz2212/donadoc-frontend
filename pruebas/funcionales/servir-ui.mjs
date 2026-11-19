// Sirve dist y reenvía /api al backend indicado (para las pruebas funcionales). Uso: node servir-ui.mjs PUERTO_UI PUERTO_API
import { createServer, request } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const [puertoUi, puertoApi] = process.argv.slice(2).map(Number);
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '../../dist');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
createServer(async (req, res) => {
  if (req.url.startsWith('/api')) {
    const p = request({ host: '127.0.0.1', port: puertoApi, path: req.url, method: req.method, headers: req.headers }, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
    p.on('error', () => { res.writeHead(502); res.end(); });
    req.pipe(p);
    return;
  }
  const ruta = join(RAIZ, req.url.split('?')[0] === '/' ? 'index.html' : req.url.split('?')[0]);
  try { const b = await readFile(ruta); res.writeHead(200, { 'content-type': TIPOS[extname(ruta)] ?? 'application/octet-stream' }); res.end(b); }
  catch { const b = await readFile(join(RAIZ, 'index.html')); res.writeHead(200, { 'content-type': TIPOS['.html'] }); res.end(b); }
}).listen(puertoUi, '127.0.0.1');
