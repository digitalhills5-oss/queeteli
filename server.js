// Минимальный статический сервер без зависимостей: npm run dev -- --port 7100
const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function argValue(names, fallback) {
  for (let i = 0; i < args.length; i++) {
    if (names.includes(args[i]) && args[i + 1]) return args[i + 1];
    const eq = names.map(n => n + '=').find(p => args[i].startsWith(p));
    if (eq) return args[i].slice(eq.length);
  }
  return fallback;
}
const port = Number(argValue(['--port', '-p'], process.env.PORT || 7100));
const host = argValue(['--host', '-H'], process.env.HOST || '127.0.0.1');
const root = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
};

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    res.writeHead(400); res.end('Bad request'); return;
  }
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const file = path.normalize(path.join(root, urlPath));
  if (!file.startsWith(root)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': st.size,
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
  });
}).listen(port, host, () => console.log(`QUEETELI dev server: http://${host}:${port}/`));
