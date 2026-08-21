/**
 * Local dev server. Serves /public with Vercel-like clean URLs, and runs the
 * real /api/lead handler in-process so the form can be tested end to end.
 *
 *   npm run dev   →   http://localhost:3000
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(root, 'public');
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
};

function resolveFile(urlPath) {
  const p = decodeURIComponent(urlPath.split('?')[0]);
  const candidates = [
    path.join(PUB, p),
    path.join(PUB, p, 'index.html'),
    path.join(PUB, p + '.html'),
    path.join(PUB, p + '/index.html'),
  ];
  for (const c of candidates) {
    if (!c.startsWith(PUB)) continue;
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

export function startServer(port = PORT) {
  const server = createServer(async (req, res) => {
    if (req.url.split('?')[0] === '/api/lead') {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      let body = {};
      try { body = JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { /* ignore */ }
      const { default: handler } = await import('../api/lead.js');
      const shim = {
        status(code) { this._code = code; return this; },
        json(obj) { res.writeHead(this._code || 200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); return this; },
        setHeader(k, v) { res.setHeader(k, v); },
        end() { res.writeHead(this._code || 200); res.end(); },
      };
      return handler({ method: req.method, body }, shim);
    }

    const file = resolveFile(req.url);
    if (!file) {
      const notFound = path.join(PUB, '404.html');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(existsSync(notFound) ? await readFile(notFound) : 'Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().then(() => console.log(`\n  dragonflylab dev server → http://localhost:${PORT}\n`));
}
