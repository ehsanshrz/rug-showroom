import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { DatabaseSync } from 'node:sqlite';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../server.js';
import { rugs, sizes, priceFor } from '../src/rugs.js';
import { bookingToday } from '../src/booking.js';
import { translate } from '../src/translations.js';

test('showroom copy can be displayed in English or Farsi', () => {
  assert.equal(translate('گزیده‌هایی با داستان‌های ماندگار', 'en'), 'Considered pieces, enduring stories');
  assert.equal(translate('گزیده‌هایی با داستان‌های ماندگار', 'fa'), 'گزیده‌هایی با داستان‌های ماندگار');
});

test('booking calendar uses consistent showroom dates around UTC midnight', () => {
  const now = new Date('2026-10-14T01:00:00Z');
  assert.equal(bookingToday('New York', now), '2026-10-13');
  assert.equal(bookingToday('Copenhagen', now), '2026-10-14');
  assert.equal(bookingToday('Milan', now), '2026-10-14');
  assert.equal(bookingToday('Virtual Studio', now), '2026-10-14');
});

test('archive contains ten complete, distinct weaves and size prices', () => {
  assert.equal(rugs.length, 10);
  assert.equal(new Set(rugs.map(rug => rug.id)).size, 10);
  assert.equal(new Set(rugs.map(rug => rug.svgPattern('test'))).size, 10);
  for (const rug of rugs) {
    for (const key of ['sku', 'name', 'collection', 'origin', 'style', 'material', 'pileHeight', 'loomTime', 'description']) assert.ok(rug[key]);
    assert.deepEqual(rug.sizes, sizes);
    assert.ok(rug.price > 0 && rug.kpsi > 0);
    assert.equal(priceFor(rug, '9x12'), Math.round(rug.price * 1.35));
    assert.equal(priceFor(rug, '10x14'), Math.round(rug.price * 1.75));
    assert.match(rug.svgPattern('unique'), /id="unique-motif"/);
    assert.match(rug.svgPattern('unique'), /url\(#unique-motif\)/);
  }
});

test('API validates requests, stores receipts, and calculates trusted values', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'atelier-vera-test-'));
  const databasePath = join(directory, 'requests.sqlite');
  const server = createApp({ databasePath, publicOrigin: 'https://atelier.example', rateLimit: 100 });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await rm(directory, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body, headers = {}) => fetch(`${base}/api/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://atelier.example', ...headers }, body: JSON.stringify(body) });
  const contact = { name: 'A Test Visitor', email: 'visitor@example.com' };
  const inquiry = { ...contact, type: 'Trade / Interior design', selection: [{ id: 'oushak', size: '9x12', price: 1 }] };
  const response = await post('inquiries', inquiry);
  assert.equal(response.status, 201);
  const receipt = await response.json();
  assert.match(receipt.reference, /^AV-/);
  const database = new DatabaseSync(databasePath);
  const stored = JSON.parse(database.prepare('SELECT payload FROM requests WHERE reference = ?').get(receipt.reference).payload);
  assert.equal(stored.selection[0].price, 5670);
  assert.equal(stored.total, 5670);
  database.close();
  assert.equal((await post('inquiries', { ...inquiry, selection: [] })).status, 400);
  assert.equal((await post('inquiries', { ...inquiry, selection: [{ id: 'unknown', size: '8x10' }] })).status, 400);
  assert.equal((await post('inquiries', { ...inquiry, selection: [{ id: 'oushak', size: '1x1' }] })).status, 400);
  assert.equal((await post('inquiries', { ...inquiry, selection: [...inquiry.selection, ...inquiry.selection] })).status, 400);
  assert.equal((await post('inquiries', { ...inquiry, email: 'invalid' })).status, 400);
  assert.equal((await post('inquiries', null)).status, 400);
  assert.equal((await post('inquiries', inquiry, { Origin: 'https://other.example' })).status, 403);
  assert.equal((await post('inquiries', inquiry, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  assert.equal((await post('inquiries', { ...inquiry, name: 'x'.repeat(17000) })).status, 413);
  const appointment = { ...contact, consultation: 'private', location: 'Milan', date: '2099-10-14', note: 'A quiet space.' };
  assert.equal((await post('appointments', appointment)).status, 201);
  assert.equal((await post('appointments', { ...appointment, consultation: 'virtual', location: undefined })).status, 201);
  assert.equal((await post('appointments', { ...appointment, date: '2020-01-01' })).status, 400);
  assert.equal((await post('appointments', { ...appointment, date: '2099-02-31' })).status, 400);
  assert.equal((await post('appointments', { ...appointment, location: 'Paris' })).status, 400);
  assert.equal((await fetch(`${base}/api/inquiries`)).status, 405);
  assert.equal((await fetch(`${base}/data/requests.sqlite`)).status, 404);
  assert.equal((await fetch(`${base}/..%2fserver.js`)).status, 403);
});

test('API rate limits repeat submissions', async t => {
  const server = createApp({ databasePath: ':memory:', rateLimit: 1 });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/inquiries`;
  const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' };
  assert.equal((await fetch(url, options)).status, 400);
  const limited = await fetch(url, options);
  assert.equal(limited.status, 429);
  assert.ok(limited.headers.get('Retry-After'));
});

test('proxy deployments can disable the shared application rate limiter', async t => {
  const server = createApp({ databasePath: ':memory:', rateLimit: 0 });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/inquiries`;
  for (let index = 0; index < 12; index++) {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(response.status, 400);
  }
  assert.throws(() => createApp({ databasePath: ':memory:', rateLimit: -1 }), /non-negative integer/);
});
