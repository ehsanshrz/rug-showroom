import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { rugs, sizes, priceFor } from './src/rugs.js';
import { bookingToday } from './src/booking.js';

const root = dirname(fileURLToPath(import.meta.url));
const contentTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8' };
const locations = ['New York', 'Copenhagen', 'Milan'];

function validateRequest(body, booking) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('A valid request is required.');
  const text = (key, max, required = true) => {
    if (typeof body[key] !== 'string' || body[key].length > max || (required && !body[key].trim())) {
      if (!required && body[key] === undefined) return '';
      throw new Error(`Please provide a valid ${key}.`);
    }
    return body[key].trim();
  };
  const name = text('name', 100);
  const email = text('email', 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please provide a valid email address.');
  if (booking) {
    const date = text('date', 10);
    const consultation = text('consultation', 20);
    if (!['private', 'virtual'].includes(consultation)) throw new Error('Please choose a consultation type.');
    const location = consultation === 'virtual' ? 'Virtual Studio' : text('location', 30);
    if (consultation === 'private' && !locations.includes(location)) throw new Error('Please choose a showroom.');
    const today = bookingToday(location);
    const parsed = new Date(`${date}T12:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date < today) throw new Error('Please choose a valid date today or in the future.');
    return { name, email, date, consultation, location, note: text('note', 1500, false) };
  }
  const type = text('type', 30);
  if (!['Private acquisition', 'Trade / Interior design'].includes(type)) throw new Error('Please choose an acquisition type.');
  if (!Array.isArray(body.selection) || !body.selection.length || body.selection.length > 50) throw new Error('Please select between 1 and 50 pieces.');
  const seen = new Set();
  const selection = body.selection.map(item => {
    const rug = rugs.find(piece => piece.id === item?.id);
    if (!rug || !sizes.includes(item?.size)) throw new Error('A selected piece or dimension is not available.');
    const key = `${rug.id}-${item.size}`;
    if (seen.has(key)) throw new Error('Please remove duplicate selections.');
    seen.add(key);
    return { id: rug.id, sku: rug.sku, name: rug.name, size: item.size, price: priceFor(rug, item.size) };
  });
  return { name, email, type, selection, total: selection.reduce((sum, item) => sum + item.price, 0) };
}

export function createApp({ databasePath = resolve(root, 'data/requests.sqlite'), publicOrigin = process.env.PUBLIC_ORIGIN, distPath = resolve(root, 'dist'), rateLimit = Number(process.env.REQUEST_RATE_LIMIT ?? 10) } = {}) {
  if (!Number.isSafeInteger(rateLimit) || rateLimit < 0) throw new Error('REQUEST_RATE_LIMIT must be a non-negative integer.');
  const allowedOrigin = publicOrigin ? new URL(publicOrigin).origin : null;
  if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
  const database = new DatabaseSync(databasePath);
  if (databasePath !== ':memory:') chmodSync(databasePath, 0o600);
  database.exec('PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS requests (reference TEXT PRIMARY KEY, kind TEXT NOT NULL, created_at TEXT NOT NULL, payload TEXT NOT NULL)');
  const insert = database.prepare('INSERT INTO requests (reference, kind, created_at, payload) VALUES (?, ?, ?, ?)');
  const attempts = new Map();
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of attempts) if (entry.until < now) attempts.delete(ip);
  }, 60_000);
  cleanup.unref();

  function json(response, status, data) {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify(data));
  }

  const server = createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    let path;
    try { path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); } catch { json(response, 400, { error: 'Invalid URL.' }); return; }
    if (path.startsWith('/api/')) {
      if (!['/api/appointments', '/api/inquiries'].includes(path)) { json(response, 404, { error: 'Not found.' }); return; }
      if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); json(response, 405, { error: 'Only POST requests are accepted.' }); return; }
      if (request.headers['sec-fetch-site'] === 'cross-site' || (allowedOrigin && request.headers.origin && request.headers.origin !== allowedOrigin)) { json(response, 403, { error: 'Requests must originate from this showroom.' }); return; }
      if (!(request.headers['content-type'] || '').startsWith('application/json')) { json(response, 415, { error: 'Please send JSON.' }); return; }
      if (rateLimit > 0) {
        const ip = request.socket.remoteAddress;
        const now = Date.now();
        let entry = attempts.get(ip);
        if (!entry || entry.until < now) {
          if (attempts.size >= 10000 && !attempts.has(ip)) { json(response, 503, { error: 'The showroom is busy. Please try again shortly.' }); return; }
          entry = { count: 0, until: now + 15 * 60_000 };
          attempts.set(ip, entry);
        }
        if (++entry.count > rateLimit) { response.setHeader('Retry-After', String(Math.ceil((entry.until - now) / 1000))); json(response, 429, { error: 'Too many requests. Please try again in 15 minutes.' }); return; }
      }
      try {
        let bytes = 0;
        const chunks = [];
        for await (const chunk of request) {
          bytes += chunk.length;
          if (bytes > 16384) { json(response, 413, { error: 'Your request is too large.' }); return; }
          chunks.push(chunk);
        }
        let payload;
        try { payload = validateRequest(JSON.parse(Buffer.concat(chunks).toString('utf8')), path === '/api/appointments'); }
        catch (error) { json(response, 400, { error: error instanceof SyntaxError ? 'Invalid JSON.' : error.message }); return; }
        const reference = `AV-${randomUUID()}`;
        insert.run(reference, path === '/api/appointments' ? 'appointment' : 'inquiry', new Date().toISOString(), JSON.stringify(payload));
        json(response, 201, { reference, status: 'received' });
      } catch {
        if (!response.headersSent) json(response, 500, { error: 'Your request could not be saved. Please try again.' });
      }
      return;
    }
    if (!['GET', 'HEAD'].includes(request.method)) { response.setHeader('Allow', 'GET, HEAD'); json(response, 405, { error: 'Method not allowed.' }); return; }
    const file = resolve(distPath, `.${path === '/' ? '/index.html' : path}`);
    if (!file.startsWith(`${resolve(distPath)}${sep}`)) { json(response, 403, { error: 'Not allowed.' }); return; }
    try {
      const data = await readFile(file);
      response.writeHead(200, { 'Content-Type': contentTypes[extname(file)] || 'application/octet-stream', 'Cache-Control': path.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache' });
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch { json(response, 404, { error: 'Page not found. Build the showroom with npm run build before starting.' }); }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.on('close', () => { clearInterval(cleanup); database.close(); });
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createApp({ databasePath: process.env.DATABASE_PATH || resolve(root, 'data/requests.sqlite') });
  const port = Number(process.env.PORT || 3000);
  server.listen(port, process.env.HOST || '0.0.0.0', () => console.log(`ATELIER VÉRA is listening on port ${port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
}
