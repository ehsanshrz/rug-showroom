import test from 'node:test';
import assert from 'node:assert/strict';
import { rugs, sizes, dimensions, priceFor, sizeLabel } from '../src/rugs.js';
import { filterRugs } from '../src/catalog.js';
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
