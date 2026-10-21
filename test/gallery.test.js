import test from 'node:test';
import assert from 'node:assert/strict';
import { rugs, sizes, dimensions, priceFor, sizeLabel } from '../src/rugs.js';
import { filterRugs, sortRugs } from '../src/catalog.js';
import { galleryViews, galleryArtwork, dimensionsLabel, roomPreview, artworkSource } from '../src/gallery.js';
import { whatsappInquiry } from '../src/inquiry.js';
import { setupMagnifier } from '../src/magnifier.js';

test('combinable gallery filters cover city, color, category, metric size and multilingual search', () => {
  const filters = { origin: 'Tabriz', color: 'Terracotta', style: 'Classic', size: '2x3m', search: 'AV-004' };
  assert.deepEqual(filterRugs(rugs, filters).map(rug => rug.id), ['tabriz']);
  assert.equal(filterRugs(rugs, { ...filters, color: 'Ivory' }).length, 0);
  assert.equal(filterRugs(rugs, { style: 'Tribal / Nomadic' }).length, 3);
  assert.deepEqual(filterRugs([{ ...rugs[3], searchText: 'باغ تبریز' }], { search: 'تبریز' }).map(rug => rug.id), ['tabriz']);
  assert.equal(filterRugs(rugs, {}).length, 10);
});

test('dimensions and illustrative provenance are complete without claiming flatweaves have knots', () => {
  for (const rug of rugs) {
    for (const field of ['city', 'category', 'dominantColor', 'foundation', 'pile', 'dye', 'condition']) assert.ok(rug[field]);
    assert.equal(rug.illustrative, true);
    for (const size of sizes) {
      assert.ok(dimensions[size].every(value => value > 0));
      assert.ok(priceFor(rug, size) > 0);
      assert.ok(sizeLabel(size));
    }
  }
  assert.equal(rugs.find(rug => rug.id === 'kars').flatweave, true);
  assert.equal(priceFor(rugs[0], '2x3m'), Math.round(4200 * 6 / (2.4384 * 3.048)));
});

test('curated edits combine with size and color without inventing antique inventory', () => {
  const vintage = filterRugs(rugs, { edit: 'vintage', size: '5x8', color: 'Terracotta' });
  assert.deepEqual(vintage.map(rug => rug.id), ['oushak', 'kars', 'agra']);
  assert.ok(vintage.every(rug => /inspired/.test(rug.condition)));
  assert.ok(filterRugs(rugs, { edit: 'knotted' }).every(rug => !rug.flatweave));
  assert.deepEqual(filterRugs(rugs, { edit: 'new' }).map(rug => rug.id), ['rif', 'agra', 'linen']);
  assert.deepEqual(filterRugs(rugs, { color: 'Cream' }).map(rug => rug.id), ['atlas', 'jaipur', 'sahara', 'dune', 'linen']);
  assert.equal(filterRugs(rugs, { color: 'Indigo' }).length, 0);
  assert.equal(filterRugs(rugs, { edit: 'unknown' }).length, 0);
});

test('all sorting modes are stable, non-mutating and use meaningful inventory values', () => {
  const ids = rugs.map(rug => rug.id);
  assert.equal(sortRugs(rugs, 'low', '5x8')[0].id, 'sahara');
  assert.equal(sortRugs(rugs, 'high', 'runner')[0].id, 'tabriz');
  assert.equal(sortRugs(rugs, 'newest')[0].id, 'linen');
  assert.equal(sortRugs(rugs, 'density')[0].id, 'tabriz');
  assert.ok(sortRugs(rugs, 'density').slice(-3).every(rug => rug.flatweave));
  assert.deepEqual(sortRugs(rugs, 'featured').map(rug => rug.id), ids);
  assert.deepEqual(rugs.map(rug => rug.id), ids);
  const inventory = [{ ...rugs[0], sizes: ['runner'] }, { ...rugs[1], sizes: ['9x12'] }];
  assert.equal(sortRugs(inventory, 'size')[0].id, 'atlas');
});

test('gallery views are distinct, locally rendered and scale with selected dimensions', () => {
  assert.deepEqual(galleryViews, ['layout', 'room', 'reverse', 'fringe']);
  const artwork = galleryViews.map(view => galleryArtwork(rugs[0], view, `test-${view}`, '8x10'));
  assert.equal(new Set(artwork).size, 4);
  assert.match(artwork[3], /viewBox="0 360 120 80"/);
  assert.match(artwork[2], /id="test-reverse-weft"/);
  assert.ok(artwork.every(svg => svg.startsWith('<svg')));
  assert.equal(decodeURIComponent(artworkSource(artwork[0]).split(',')[1]), artwork[0]);
  assert.notEqual(roomPreview(rugs[0], 'room', 'runner'), roomPreview(rugs[0], 'room', '9x12'));
  assert.equal(dimensionsLabel('5x8'), '152 × 244 cm / 5.0 × 8.0 ft');
  assert.equal(dimensionsLabel('8x10'), '244 × 305 cm / 8.0 × 10.0 ft');
});

test('WhatsApp links encode selected piece, dimensions, currency price and refuse invalid recipients', () => {
  const details = { rug: { ...rugs[3], name: 'Silk & <Garden>' }, size: '2 × 3 m', price: '۱۲٬۵۰۰٬۰۰۰ تومان (IRT)' };
  const url = new URL(whatsappInquiry('+44 (7700) 900-123', details));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/447700900123');
  for (const text of [details.rug.name, details.rug.sku, details.rug.id, details.size, details.price]) assert.ok(url.searchParams.get('text').includes(text));
  for (const phone of ['', 'javascript:alert(1)', '123', '01234567890', '1'.repeat(16)]) assert.equal(whatsappInquiry(phone, details), null);
});

test('magnifier supports keyboard navigation, pointer position and accessible toggle state', () => {
  const events = {};
  const attributes = {};
  const image = { setAttribute: (key, value) => { attributes[key] = value; } };
  const lens = { style: {}, querySelector: () => image };
  const button = { setAttribute: (key, value) => { attributes[key] = value; }, addEventListener: (name, handler) => { events[`button-${name}`] = handler; } };
  const surface = {
    querySelector: selector => selector === '.inspection-lens' ? lens : { getBoundingClientRect: () => ({ left: 0, top: 0, width: 340, height: 440 }) },
    classList: { toggle() {} },
    addEventListener: (name, handler) => { events[name] = handler; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 340, height: 440 }),
  };
  setupMagnifier(surface, button);
  assert.equal(lens.hidden, true);
  let prevented = false;
  events.keydown({ key: 'ArrowRight', preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(lens.hidden, false);
  assert.equal(attributes['aria-pressed'], 'true');
  assert.match(attributes.viewBox, /142/);
  events.pointermove({ clientX: 0, clientY: 0 });
  assert.equal(attributes.viewBox, '-45 -45 90 90');
  events['button-click']();
  assert.equal(lens.hidden, true);
});

test('fringe magnifier samples the cropped corner rather than the center of the rug', () => {
  const events = {};
  let viewBox;
  const image = { setAttribute: (_, value) => { viewBox = value; } };
  const lens = { style: {}, querySelector: () => image };
  const surface = {
    querySelector: () => lens,
    classList: { toggle() {} },
    addEventListener: (name, handler) => { events[name] = handler; },
  };
  const button = { setAttribute() {}, addEventListener() {} };
  setupMagnifier(surface, button, { top: 360, width: 120, height: 80, sample: 25 });
  assert.equal(viewBox, '47.5 387.5 25 25');
  events.keydown({ key: 'ArrowDown', preventDefault() {} });
  assert.equal(viewBox, '47.5 391.5 25 25');
});
