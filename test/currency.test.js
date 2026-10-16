import test from 'node:test';
import assert from 'node:assert/strict';
import {
  baselineSnapshot, CACHE_KEY, CACHE_TTL, createCurrencyService, currencies, formatPrice,
} from '../src/currencyService.js';
import { createCurrencyStore, SELECTION_KEY } from '../src/currencyStore.js';

const time = 1800000000000;
const endpoint = 'https://rates.example.test/normalized';
const fiat = { USD: 1, EUR: 0.9, AED: 3.67, TRY: 40, CAD: 1.4 };
const primary = { base: 'USD', rates: { ...fiat, IRT: 120000 } };
const publicData = { result: 'success', base_code: 'USD', rates: { ...fiat, IRR: 42000 } };
const response = data => ({ ok: true, json: async () => data });
const offline = async () => { throw new TypeError('Failed to fetch (CORS)'); };
function storage(initial = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    entries,
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  };
}
const live = (overrides = {}) => ({
  version: 1, base: 'USD', rates: primary.rates, source: 'alanchand',
  fetchedAt: time, tomanSource: 'alanchand', status: 'live', ...overrides,
});

test('currency metadata and baseline are immutable, explicit, and never live', () => {
  assert.deepEqual(currencies.map(item => item.code), ['USD', 'EUR', 'AED', 'TRY', 'CAD', 'IRT']);
  for (const item of currencies) {
    assert.deepEqual(Object.keys(item), ['code', 'symbol', 'flag']);
    assert.ok(item.symbol && item.flag);
  }
  assert.equal(baselineSnapshot.status, 'illustrative');
  assert.equal(baselineSnapshot.source, 'illustrative-baseline');
  assert.equal(baselineSnapshot.tomanSource, 'illustrative-baseline');
  assert.equal(baselineSnapshot.fetchedAt, null);
  assert.equal(baselineSnapshot.base, 'USD');
  assert.throws(() => { baselineSnapshot.rates.IRT = 1; }, TypeError);
  assert.throws(() => { currencies[0].code = 'IRR'; }, TypeError);
});

for (const base of ['USD', 'IRT', 'IRR']) {
  test(`primary ${base} quote-per-base conversion normalizes to USD and toman`, async () => {
    const dollarsPerBase = base === 'USD' ? 1 : base === 'IRT' ? 1 / 120000 : 1 / 1200000;
    const rates = Object.fromEntries(Object.entries(fiat).map(([code, rate]) => [code, rate * dollarsPerBase]));
    if (base === 'USD') rates.IRT = 120000;
    else rates[base] = 1;
    const calls = [];
    const saved = storage();
    const service = createCurrencyService({
      storage: saved, now: () => time, alanEndpoint: endpoint,
      fetcher: async (url, options) => {
        calls.push(url);
        assert.ok(options.signal instanceof AbortSignal);
        return response({ base, rates });
      },
    });
    const result = await service.loadRates();
    for (const [code, rate] of Object.entries(primary.rates)) {
      assert.ok(Math.abs(result.rates[code] - rate) < 1e-8, code);
    }
    assert.equal(result.base, 'USD');
    assert.equal(result.status, 'live');
    assert.equal(result.source, 'alanchand');
    assert.equal(result.tomanSource, 'alanchand');
    assert.equal(result.fetchedAt, time);
    assert.deepEqual(calls, [endpoint]);
    assert.deepEqual(JSON.parse(saved.getItem(CACHE_KEY)), result);
  });
}

test('primary USD with IRR is divided by ten, not confused with toman', async () => {
  const service = createCurrencyService({
    storage: storage(), now: () => time, alanEndpoint: endpoint,
    fetcher: async () => response({ base: 'USD', rates: { ...fiat, IRR: 1200000 } }),
  });
  assert.equal((await service.loadRates()).rates.IRT, 120000);
});

test('no guessed primary: public live fiat is mixed with clearly illustrative toman', async () => {
  const calls = [];
  const service = createCurrencyService({
    storage: storage(), now: () => time,
    fetcher: async url => { calls.push(url); return response(publicData); },
  });
  const result = await service.loadRates();
  assert.deepEqual(calls, ['https://open.er-api.com/v6/latest/USD']);
  assert.equal(result.status, 'mixed');
  assert.equal(result.source, 'open-er-api');
  assert.equal(result.tomanSource, 'illustrative-baseline');
  assert.equal(result.rates.IRT, baselineSnapshot.rates.IRT);
  assert.notEqual(result.rates.IRT, publicData.rates.IRR / 10);
  assert.equal(result.fetchedAt, time);
  assert.equal(result.rates.EUR, 0.9);
});

test('primary CORS failure uses valid public fallback', async () => {
  const calls = [];
  const result = await createCurrencyService({
    storage: storage(), now: () => time, alanEndpoint: endpoint,
    fetcher: async url => {
      calls.push(url);
      if (url === endpoint) return offline();
      return response(publicData);
    },
  }).loadRates();
  assert.equal(calls.length, 2);
  assert.equal(result.status, 'mixed');
});

test('malformed primary rates and unsupported contracts are never trusted', async () => {
  const invalid = [
    null, [], { base: 'EUR', rates: primary.rates }, { rates: primary.rates },
    { base: 'USD', rates: { ...primary.rates, USD: 2 } },
    ...[0, -1, NaN, Infinity, '0.9', null, undefined].map(EUR => ({
      base: 'USD', rates: { ...primary.rates, EUR },
    })),
    { base: 'USD', rates: { ...fiat } },
    { base: 'IRT', rates: { ...fiat, USD: 0 } },
    { base: 'IRR', rates: { ...fiat, USD: Number.MIN_VALUE } },
  ];
  for (const payload of invalid) {
    const result = await createCurrencyService({
      storage: storage(), now: () => time, alanEndpoint: endpoint,
      fetcher: async url => response(url === endpoint ? payload : publicData),
    }).loadRates();
    assert.equal(result.status, 'mixed');
    assert.equal(result.source, 'open-er-api');
  }
});

test('fallback rejects failure results, wrong base, incomplete and invalid rates', async () => {
  for (const payload of [
    null, {}, { ...publicData, result: 'error' }, { ...publicData, base_code: 'EUR' },
    { ...publicData, rates: { USD: 1 } },
    ...[0, -1, Infinity, NaN, '1'].map(CAD => ({ ...publicData, rates: { ...fiat, CAD } })),
    { ...publicData, rates: { ...fiat, USD: 2 } },
  ]) {
    const result = await createCurrencyService({
      storage: storage(), now: () => time, fetcher: async () => response(payload),
    }).loadRates();
    assert.equal(result, baselineSnapshot);
  }
});

test('HTTP and JSON failures return illustrative baseline without caching it', async () => {
  for (const fetcher of [
    offline,
    async () => ({ ok: false, json: async () => publicData }),
    async () => ({ ok: true, json: async () => { throw new SyntaxError('JSON'); } }),
  ]) {
    const saved = storage();
    const result = await createCurrencyService({ storage: saved, now: () => time, fetcher }).loadRates();
    assert.equal(result, baselineSnapshot);
    assert.equal(saved.getItem(CACHE_KEY), null);
  }
});

test('timeout aborts a hanging primary and proceeds to public fallback', async () => {
  let signal;
  const result = await createCurrencyService({
    storage: storage(), now: () => time, alanEndpoint: endpoint, timeoutMs: 5,
    fetcher: async (url, options) => {
      if (url !== endpoint) return response(publicData);
      signal = options.signal;
      return new Promise(() => {});
    },
  }).loadRates();
  assert.equal(signal.aborted, true);
  assert.equal(result.status, 'mixed');
});

test('timeout includes body parsing, even when fetch ignores abort', async () => {
  const result = await createCurrencyService({
    storage: storage(), now: () => time, timeoutMs: 5,
    fetcher: async () => ({ ok: true, json: () => new Promise(() => {}) }),
  }).loadRates();
  assert.equal(result, baselineSnapshot);
});

test('cache is fresh only before four hours, and stale data retains honest provenance', async () => {
  const saved = storage({ [CACHE_KEY]: JSON.stringify(live()) });
  let clock = time + CACHE_TTL - 1;
  let calls = 0;
  const service = createCurrencyService({
    storage: saved, now: () => clock, fetcher: async () => { calls++; return offline(); },
  });
  assert.equal((await service.loadRates()).status, 'live');
  assert.equal(calls, 0);
  clock++;
  const stale = await service.loadRates();
  assert.equal(calls, 1);
  assert.equal(stale.status, 'stale');
  assert.equal(stale.fetchedAt, time);
  assert.equal(stale.tomanSource, 'alanchand');
  assert.equal(JSON.parse(saved.getItem(CACHE_KEY)).status, 'live');
});

test('poisoned, future, unversioned, and malformed caches cannot supply prices', async () => {
  const invalid = [
    'not JSON', 'null', '[]', '{}',
    ...[
      { version: 2 }, { version: undefined }, { base: 'IRT' },
      { fetchedAt: time + 1 }, { fetchedAt: -1 }, { fetchedAt: '1800000000000' },
      { fetchedAt: null }, { source: 'unknown' }, { status: 'illustrative' },
      { tomanSource: 'official-IRR' }, { rates: { ...primary.rates, USD: 2 } },
      { rates: { ...primary.rates, IRT: 0 } },
      { rates: { ...primary.rates, TRY: '40' } }, { rates: { USD: 1 } },
      { source: 'open-er-api', status: 'mixed', tomanSource: 'illustrative-baseline' },
    ].map(overrides => JSON.stringify(live(overrides))),
  ];
  for (const value of invalid) {
    const result = await createCurrencyService({
      storage: storage({ [CACHE_KEY]: value }), now: () => time, fetcher: offline,
    }).loadRates();
    assert.equal(result, baselineSnapshot, value);
  }
});

test('mixed cache is valid and retains illustrative toman identity offline', async () => {
  const cached = live({
    source: 'open-er-api', tomanSource: 'illustrative-baseline', status: 'mixed',
    rates: { ...fiat, IRT: baselineSnapshot.rates.IRT },
  });
  const saved = storage({ [CACHE_KEY]: JSON.stringify(cached) });
  const fresh = await createCurrencyService({ storage: saved, now: () => time, fetcher: offline }).loadRates();
  assert.equal(fresh.status, 'mixed');
  const stale = await createCurrencyService({
    storage: saved, now: () => time + CACHE_TTL, fetcher: offline,
  }).loadRates();
  assert.equal(stale.status, 'stale');
  assert.equal(stale.tomanSource, 'illustrative-baseline');
});

test('concurrent and repeated loads dedupe; expiry requests fresh data', async () => {
  let clock = time;
  let calls = 0;
  let release;
  const service = createCurrencyService({
    storage: storage(), now: () => clock,
    fetcher: () => {
      calls++;
      return new Promise(resolve => { release = () => resolve(response(publicData)); });
    },
  });
  const first = service.loadRates();
  assert.equal(first, service.loadRates());
  await Promise.resolve();
  assert.equal(calls, 1);
  release();
  const result = await first;
  assert.equal(await service.loadRates(), result);
  assert.equal(calls, 1);
  clock += CACHE_TTL;
  const next = service.loadRates();
  await Promise.resolve();
  assert.equal(calls, 2);
  release();
  assert.equal((await next).fetchedAt, clock);
});

test('offline repeated calls dedupe too; unavailable storage retains stale memory', async () => {
  let clock = time;
  let calls = 0;
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
  const service = createCurrencyService({
    storage: blocked, now: () => clock,
    fetcher: async () => { calls++; return calls === 1 ? response(publicData) : offline(); },
  });
  const first = await service.loadRates();
  assert.equal(first.status, 'mixed');
  assert.equal(await service.loadRates(), first);
  clock += CACHE_TTL;
  assert.equal((await service.loadRates()).status, 'stale');
  assert.equal(calls, 2);
  const unavailable = createCurrencyService({ storage: blocked, now: () => time, fetcher: offline });
  assert.equal(await unavailable.loadRates(), baselineSnapshot);
  assert.equal(await unavailable.loadRates(), baselineSnapshot);
});

test('formatting uses USD archive value, zero decimals, explicit codes, and no HTML', () => {
  assert.equal(formatPrice(10, 'USD', primary.rates), '$10');
  assert.equal(formatPrice(10, 'EUR', primary.rates), '€9');
  assert.equal(formatPrice(1.25, 'IRT', primary.rates), '150,000 تومان');
  for (const code of ['AED', 'TRY', 'CAD']) {
    const formatted = formatPrice(10, code, primary.rates);
    assert.match(formatted, new RegExp(code));
    assert.doesNotMatch(formatted, /[<>]|\.\d/);
  }
  assert.equal(formatPrice(0, 'IRT', primary.rates), '0 تومان');
  assert.match(formatPrice(1, 'IRT', primary.rates, 'fa-IR'), /۱۲۰٬۰۰۰ تومان/);
  assert.equal(formatPrice(1.9, 'USD', primary.rates), '$2');
  assert.throws(() => formatPrice(1, 'IRR', primary.rates), RangeError);
  for (const amount of [NaN, Infinity, '10']) {
    assert.throws(() => formatPrice(amount, 'USD', primary.rates), TypeError);
  }
  assert.throws(() => formatPrice(1, 'IRT', {}), TypeError);
  assert.throws(() => formatPrice(Number.MAX_VALUE, 'IRT', primary.rates), RangeError);
});

test('store restores and persists only supported choices, without changing archive data', () => {
  const saved = storage({ [SELECTION_KEY]: 'IRT' });
  const store = createCurrencyStore({ storage: saved });
  assert.deepEqual(store.getState(), { currency: 'IRT', snapshot: baselineSnapshot, loading: false });
  const changes = [];
  const unsubscribe = store.subscribe(state => changes.push(state));
  store.setCurrency('IRR');
  store.setCurrency('<script>');
  assert.equal(changes.length, 0);
  store.setCurrency('CAD');
  assert.equal(changes.length, 1);
  assert.equal(store.getState().currency, 'CAD');
  assert.equal(store.getState().snapshot, baselineSnapshot);
  assert.equal(saved.getItem(SELECTION_KEY), 'CAD');
  store.setCurrency('CAD');
  assert.equal(changes.length, 1);
  unsubscribe();
  store.setCurrency('TRY');
  assert.equal(changes.length, 1);
  assert.equal(createCurrencyStore({ storage: storage({ [SELECTION_KEY]: 'IRR' }) }).getState().currency, 'USD');
});

test('store emits loading/status, dedupes refresh, and preserves a selection changed in flight', async () => {
  let release;
  let calls = 0;
  const result = live();
  const store = createCurrencyStore({
    storage: storage(), service: { loadRates() { calls++; return new Promise(resolve => { release = resolve; }); } },
  });
  const changes = [];
  store.subscribe(() => { throw new Error('bad subscriber'); });
  store.subscribe(state => changes.push(state));
  const pending = store.refresh();
  assert.equal(store.getState().loading, true);
  assert.equal(store.refresh(), pending);
  await Promise.resolve();
  assert.equal(calls, 1);
  store.setCurrency('AED');
  release(result);
  await pending;
  assert.equal(store.getState().snapshot, result);
  assert.equal(store.getState().loading, false);
  assert.equal(store.getState().currency, 'AED');
  assert.ok(changes.some(state => state.loading && state.snapshot.status === 'live'));
  assert.equal(changes.at(-1).loading, false);
});

test('store safely handles throwing storage, SSR defaults, and rejected refreshes', async () => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  const store = createCurrencyStore({ storage: blocked, service: { loadRates: offline } });
  store.setCurrency('IRT');
  await store.refresh();
  assert.equal(store.getState().currency, 'IRT');
  assert.equal(store.getState().loading, false);
  assert.equal(store.getState().snapshot, baselineSnapshot);
  assert.equal(createCurrencyStore().getState().currency, 'USD');
  assert.throws(() => store.subscribe(null), TypeError);
  let calls = 0;
  const staleStore = createCurrencyStore({
    storage: storage(), service: { loadRates: async () => { if (calls++) throw new Error('offline'); return live(); } },
  });
  await staleStore.refresh();
  await staleStore.refresh();
  assert.equal(staleStore.getState().snapshot.status, 'stale');
  assert.equal(staleStore.getState().snapshot.fetchedAt, time);
});
