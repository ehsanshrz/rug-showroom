import { baselineSnapshot, createCurrencyService, currencies, defaultStorage } from './currencyService.js';

export const SELECTION_KEY = 'atelier-vera-currency';
const supported = code => currencies.some(currency => currency.code === code);

export function createCurrencyStore({ service, storage = defaultStorage() } = {}) {
  const rateService = service ?? createCurrencyService({ storage });
  let currency = 'USD';
  try {
    const saved = storage?.getItem(SELECTION_KEY);
    if (supported(saved)) currency = saved;
  } catch {
    // Currency selection remains usable when storage is blocked.
  }
  let state = Object.freeze({ currency, snapshot: baselineSnapshot, loading: false });
  let pending;
  const listeners = new Set();
  const notify = patch => {
    state = Object.freeze({ ...state, ...patch });
    for (const listener of listeners) {
      try {
        listener(state);
      } catch {
        // One subscriber must not interrupt other subscribers or a rate refresh.
      }
    }
  };

  function setCurrency(code) {
    if (!supported(code) || state.currency === code) return;
    try {
      storage?.setItem(SELECTION_KEY, code);
    } catch {
      // Persisting a preference is best-effort.
    }
    notify({ currency: code });
  }

  function refresh() {
    if (pending) return pending;
    pending = Promise.resolve().then(() => rateService.loadRates())
      .then(value => { notify({ snapshot: value }); })
      .catch(() => {
        if (state.snapshot.fetchedAt !== null) {
          notify({ snapshot: Object.freeze({ ...state.snapshot, status: 'stale' }) });
        }
      })
      .finally(() => {
        pending = undefined;
        notify({ loading: false });
      });
    notify({ loading: true });
    return pending;
  }

  return {
    getState: () => state,
    subscribe(fn) {
      if (typeof fn !== 'function') throw new TypeError('Subscriber must be a function');
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    setCurrency,
    refresh,
  };
}
