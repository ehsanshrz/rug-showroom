import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const setLanguageSource = main.slice(main.indexOf('function setLanguage('), main.indexOf('function updateBookingDate('));

for (const open of [false, true]) {
  test(`repeated language switches update views once and preserve selections with dialogs ${open ? 'open' : 'closed'}`, () => {
    const state = { language: 'fa', rug: 'tabriz', style: 'Persian', studioSize: '9x12', inspect: 'oushak', inspectSize: '10x14', folio: [{ id: 'tabriz', size: '9x12' }] };
    const selections = structuredClone(state);
    const elements = new Map();
    const $ = selector => {
      if (!elements.has(selector)) elements.set(selector, { open, setAttribute(name, value) { this[name] = value; } });
      return elements.get(selector);
    };
    const calls = [];
    const storage = new Map();
    const document = { documentElement: {}, querySelector: $ };
    let reenterLanguage;
    const setLanguage = runInNewContext(`${setLanguageSource}; setLanguage`, {
      state, document, $, rugs: [{ id: 'tabriz', name: 'The Tabriz Garden' }],
      rugText: rug => state.language === 'en' ? rug.name : 'باغ تبریز',
      localStorage: { setItem: (key, value) => storage.set(key, value) },
      renderCatalog: () => { calls.push('catalog'); reenterLanguage?.(); },
      renderStudio: () => calls.push('studio'),
      persistFolio: () => calls.push('folio'),
      inspect: (...args) => calls.push(['inspect', ...args]),
      renderFolio: () => calls.push('dialog'),
    });
    reenterLanguage = () => setLanguage(state.language);

    for (const language of ['en', 'fa', 'en', 'fa']) {
      calls.length = 0;
      setLanguage(language);
      assert.deepEqual(calls, open
        ? ['catalog', 'studio', 'folio', ['inspect', 'oushak', '10x14'], 'dialog']
        : ['catalog', 'studio', 'folio']);
      assert.equal(state.language, language);
      assert.equal(document.documentElement.lang, language);
      assert.equal(document.documentElement.dir, language === 'fa' ? 'rtl' : 'ltr');
      assert.equal(storage.get('atelier-vera-language'), language);
      assert.equal($('#language-toggle').textContent, language === 'fa' ? 'English' : 'فارسی');
      assert.equal($('#studio-rug').value, 'tabriz');
      assert.match($('#studio-rug').innerHTML, language === 'fa' ? /باغ تبریز/ : /The Tabriz Garden/);
      assert.deepEqual({ ...state, language: selections.language }, selections);
      assert.equal(setLanguage.isUpdating, false);
    }
    calls.length = 0;
    setLanguage('invalid');
    assert.deepEqual(calls, []);
    assert.equal(state.language, 'fa');
  });
}
