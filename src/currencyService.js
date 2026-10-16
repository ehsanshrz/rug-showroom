export const currencies = Object.freeze([
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺' },
  { code: 'AED', symbol: 'AED', flag: '🇦🇪' },
  { code: 'TRY', symbol: 'TRY', flag: '🇹🇷' },
  { code: 'CAD', symbol: 'CA$', flag: '🇨🇦' },
  { code: 'IRT', symbol: 'تومان', flag: '🇮🇷' },
].map(Object.freeze));

export const CACHE_KEY = 'atelier-vera-currency-rates';
export const CACHE_TTL = 4 * 60 * 60 * 1000;
const VERSION = 1;
const FALLBACK_ENDPOINT = 'https://open.er-api.com/v6/latest/USD';
const codes = currencies.map(({ code }) => code);
const fiatCodes = codes.filter(code => code !== 'IRT');
const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;

function snapshot(value) {
  return Object.freeze({ ...value, rates: Object.freeze({ ...value.rates }) });
}

export const baselineSnapshot = snapshot({
  version: VERSION,
  base: 'USD',
  rates: { USD: 1, EUR: 0.92, AED: 3.6725, TRY: 38, CAD: 1.39, IRT: 100000 },
  source: 'illustrative-baseline',
  fetchedAt: null,
  tomanSource: 'illustrative-baseline',
  status: 'illustrative',
});

export function defaultStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function read(storage, key) {
  try {
    return storage?.getItem(key);
  } catch {
    return null;
  }
}

function validRates(rates) {
  return rates && typeof rates === 'object' && !Array.isArray(rates)
    && Object.values(rates).every(positive);
}

function validCache(value, time) {
  return value && value.version === VERSION && value.base === 'USD'
    && Number.isFinite(value.fetchedAt) && value.fetchedAt >= 0 && value.fetchedAt <= time
    && validRates(value.rates) && codes.every(code => positive(value.rates[code]))
    && value.rates.USD === 1
    && ((value.source === 'alanchand' && value.tomanSource === 'alanchand' && value.status === 'live')
      || (value.source === 'open-er-api' && value.tomanSource === 'illustrative-baseline'
        && value.status === 'mixed' && value.rates.IRT === baselineSnapshot.rates.IRT));
}

function normalizePrimary(data) {
  if (!data || !['USD', 'IRT', 'IRR'].includes(data.base) || !validRates(data.rates)) {
    throw new Error('Invalid primary currency response');
  }
  const { base, rates } = data;
  if (rates[base] !== undefined && rates[base] !== 1) throw new Error('Invalid base rate');
  const dollarsPerBase = base === 'USD' ? 1 : rates.USD;
  if (!positive(dollarsPerBase)) throw new Error('Missing USD rate');
  const normalized = {};
  for (const code of fiatCodes) {
    normalized[code] = code === 'USD' ? 1 : rates[code] / dollarsPerBase;
  }
  normalized.IRT = base === 'IRT' ? 1 / dollarsPerBase
    : base === 'IRR' ? 1 / dollarsPerBase / 10
      : rates.IRT ?? rates.IRR / 10;
  if (!codes.every(code => positive(normalized[code]))) throw new Error('Missing currency rate');
  return normalized;
}

function normalizeFallback(data) {
  if (data?.result !== 'success' || data.base_code !== 'USD' || !validRates(data.rates)
    || data.rates.USD !== 1 || !fiatCodes.every(code => positive(data.rates[code]))) {
    throw new Error('Invalid fallback currency response');
  }
  return Object.fromEntries(codes.map(code => [
    code, code === 'IRT' ? baselineSnapshot.rates.IRT : data.rates[code],
  ]));
}

export function formatPrice(usd, code, rates, locale = 'en-US') {
  if (!codes.includes(code)) throw new RangeError('Unsupported currency');
  if (typeof usd !== 'number' || !Number.isFinite(usd) || !positive(rates?.[code])) {
    throw new TypeError('Price and exchange rate must be finite numbers');
  }
  const amount = usd * rates[code];
  if (!Number.isFinite(amount)) throw new RangeError('Converted price is not finite');
  const options = { minimumFractionDigits: 0, maximumFractionDigits: 0 };
  if (code === 'IRT') return `${new Intl.NumberFormat(locale, options).format(amount)} تومان`;
  return new Intl.NumberFormat(locale, {
    ...options,
    style: 'currency',
    currency: code,
    currencyDisplay: ['AED', 'TRY', 'CAD'].includes(code) ? 'code' : 'symbol',
  }).format(amount);
}

export function createCurrencyService({
  storage = defaultStorage(),
  fetcher = globalThis.fetch,
  now = Date.now,
  alanEndpoint,
  timeoutMs = 5000,
} = {}) {
  let inFlight;
  let memo;
  let memoAt = 0;
  let memoUntil = 0;
  const timeout = positive(timeoutMs) ? timeoutMs : 5000;

  async function request(url) {
    const controller = new AbortController();
    let timer;
    try {
      return await Promise.race([
        Promise.resolve().then(async () => {
          const response = await fetcher(url, { signal: controller.signal });
          if (!response?.ok) throw new Error('Currency request failed');
          return response.json();
        }),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            controller.abort();
            reject(new Error('Currency request timed out'));
          }, timeout);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }

  async function load() {
    const time = now();
    let cached = memo?.fetchedAt !== null && memo?.fetchedAt <= time ? memo : undefined;
    try {
      const candidate = JSON.parse(read(storage, CACHE_KEY));
      if (validCache(candidate, time)) cached = snapshot(candidate);
    } catch {
      // Storage may be unavailable, corrupted, or written by an older version.
    }
    if (cached && time - cached.fetchedAt < CACHE_TTL) {
      memoUntil = cached.fetchedAt + CACHE_TTL;
      return cached;
    }
    let result;
    if (typeof alanEndpoint === 'string' && alanEndpoint.trim()) {
      try {
        const rates = normalizePrimary(await request(alanEndpoint));
        result = snapshot({
          version: VERSION, base: 'USD', rates, source: 'alanchand',
          fetchedAt: now(), tomanSource: 'alanchand', status: 'live',
        });
      } catch {
        // The primary is optional; an unavailable or undocumented response is not trusted.
      }
    }
    if (!result) {
      try {
        const rates = normalizeFallback(await request(FALLBACK_ENDPOINT));
        result = snapshot({
          version: VERSION, base: 'USD', rates, source: 'open-er-api',
          fetchedAt: now(), tomanSource: 'illustrative-baseline', status: 'mixed',
        });
      } catch {
        result = cached ? snapshot({ ...cached, status: 'stale' }) : baselineSnapshot;
      }
    }
    if (result.status === 'live' || result.status === 'mixed') {
      try {
        storage?.setItem(CACHE_KEY, JSON.stringify(result));
      } catch {
        // Quota errors and privacy settings must not block pricing.
      }
    }
    memoUntil = now() + CACHE_TTL;
    return result;
  }

  function loadRates() {
    if (inFlight) return inFlight;
    if (memo && now() >= memoAt && now() < memoUntil) return Promise.resolve(memo);
    inFlight = load().then(result => {
      memo = result;
      memoAt = now();
      return result;
    }).finally(() => { inFlight = undefined; });
    return inFlight;
  }

  return { loadRates };
}
