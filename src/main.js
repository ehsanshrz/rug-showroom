import './style.css';
import { rugs, sizes, sizeLabel, priceFor, money } from './rugs.js';

const icons = {
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  bag: '<path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  room: '<path d="M3 21V3h18v18H3Zm0-6h18M8 15v6M16 15v6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  weave: '<path d="M6 2v20M12 2v20M18 2v20M2 6h20M2 12h20M2 18h20"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  leaf: '<path d="M20 3C7 2 2 8 5 16c8 5 16-1 15-13ZM4 21 16 8"/>',
  rotate: '<path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.arrow}</svg>`;
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const $ = selector => document.querySelector(selector);
const state = { style: '', material: '', size: '', search: '', sort: 'featured', expanded: false, rug: rugs[0].id, room: 'living', floor: 'oak', studioSize: '8x10', rotated: false, light: 'day', inspect: null, inspectSize: '8x10', folio: [] };
try {
  const saved = JSON.parse(localStorage.getItem('atelier-vera-folio') || '[]');
  if (Array.isArray(saved)) state.folio = saved.filter(item => item && rugs.some(rug => rug.id === item.id) && sizes.includes(item.size)).map(({ id, size }) => ({ id, size })).slice(0, 50);
} catch { state.folio = []; }
let toastTimer;
function notify(message) {
  $('#toast').textContent = message;
  const dialog = $('dialog[open]');
  if (dialog) {
    let feedback = dialog.querySelector('.dialog-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'toast dialog-feedback';
      feedback.setAttribute('role', 'status');
      dialog.append(feedback);
    }
    feedback.textContent = message;
  }
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    $('#toast').textContent = '';
    document.querySelectorAll('.dialog-feedback').forEach(element => element.remove());
  }, 4000);
}

function heroRoom() {
  return `<svg viewBox="0 0 560 580" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="wall" x2="1" y2="1"><stop stop-color="#e9e1d5"/><stop offset="1" stop-color="#c9bdad"/></linearGradient><linearGradient id="sofa" x2="0" y2="1"><stop stop-color="#e8ddc8"/><stop offset="1" stop-color="#b8a891"/></linearGradient><pattern id="planks" width="80" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)"><rect width="80" height="100" fill="#cbbb9f"/><path d="M0 0V100M3 0V100M10 20Q45 10 78 25M8 65Q45 80 78 67" stroke="#a79577" stroke-opacity=".25" fill="none"/></pattern><filter id="shadow"><feDropShadow dx="3" dy="12" stdDeviation="8" flood-color="#514333" flood-opacity=".25"/></filter></defs>
    <path fill="url(#wall)" d="M0 0h560v295L0 350Z"/><path fill="url(#planks)" d="M0 350 560 295V580H0Z"/>
    <path d="M0 350 560 295" stroke="#b5a895" stroke-width="3"/><path d="M35 0v345M43 0v343" stroke="#bdb09e" opacity=".55"/>
    <path d="M380 50h95v151h-95Z" fill="#c2b49f"/><path d="M388 58h79v135h-79Z" fill="#e7dfd2"/><path d="M406 166Q417 82 454 90V177Z" fill="#a89e89"/><path d="M399 166h60" stroke="#847e6a"/>
    <g filter="url(#shadow)"><path d="M110 236 379 210 425 304 138 345Z" fill="#a79780"/><path d="m113 211 258-24 15 87-261 33Z" fill="url(#sofa)"/><path d="m120 224 74-7 9 61-77 9Zm83-8 79-7 11 58-81 11Zm88-8 73-7 11 56-73 11Z" fill="#e2d5bf" stroke="#c4b59d"/><path d="m121 287 271-32 19 42-271 39Z" fill="#d2c2a8"/><path d="m99 243 24-2 15 96-25 4Zm284-29 25-3 25 91-23 3Z" fill="#c5b598"/><path d="m160 207 36-4 8 51-39 4Z" fill="#887f66"/><path d="m309 197 39-2 8 44-40 5Z" fill="#af8467"/></g>
    <g filter="url(#shadow)"><ellipse cx="480" cy="309" rx="39" ry="17" fill="#8e7760"/><path d="M460 315v48m39-48v44" stroke="#6a5847" stroke-width="4"/><path d="M473 285h15l-3-26h-9Z" fill="#95836c"/><path d="M480 260v-45m0 25q-35-22-23-40m23 26q25-35 31-15m-31 15q-11-44-24-35" stroke="#66735a" stroke-width="3" fill="none"/><ellipse cx="456" cy="192" rx="9" ry="18" fill="#7c8567" transform="rotate(-30 456 192)"/><ellipse cx="505" cy="205" rx="9" ry="20" fill="#7c8567" transform="rotate(30 505 205)"/></g>
    <path d="m0 40 140-20 165 405L65 455Z" fill="#fff6da" opacity=".13"/>
  </svg>`;
}

$('#app').innerHTML = `
  <header><div class="wrap header-inner">
    <a class="brand" href="#" aria-label="Atelier Véra home">ATELIER VÉRA<span>THE ART OF THE WOVEN</span></a>
    <nav class="nav" id="main-nav" aria-label="Main navigation"><a href="#archive">The Archive</a><a href="#studio">Room Studio</a><a href="#craft">Craft & Provenance</a><a href="#showroom">Private Showroom</a></nav>
    <button class="icon-btn mobile-menu" aria-label="Toggle navigation" aria-controls="main-nav" aria-expanded="false">${icon('menu')}</button>
    <button class="folio-trigger" data-action="open-folio">${icon('bag')} Inquiry Folio <span class="badge" id="folio-count">0</span></button>
  </div></header>
  <main>
    <section class="wrap hero" aria-labelledby="hero-title">
      <div class="hero-copy"><div class="eyebrow">Considered pieces. Collected stories.</div><h1 id="hero-title">Woven to<br>be lived in.<br><em>Made to endure.</em></h1><p>Extraordinary rugs, patiently handwoven.<br>A curated archive of texture, tradition, and quiet beauty for the spaces we call home.</p>
        <div class="hero-actions"><a class="btn" href="#archive">Explore the Archive ${icon('arrow')}</a><a class="text-link" href="#studio">Find your perspective ${icon('arrow')}</a></div>
        <div class="provenance-metrics"><div><strong>100%</strong>Hand-spun natural fibers</div><div><strong>Made for you</strong>Bespoke sizing available</div><div><strong>Archival grade</strong>Craft beyond generations</div></div>
      </div>
      <div class="hero-art">${heroRoom()}<div class="hero-rug">${rugs[0].svgPattern('hero')}</div><div class="art-top"><span>The considered home — No. 01</span><span>Handwoven, always</span></div><div class="vertical-note">A quieter kind of luxury</div><div class="art-card"><div class="mini-art">${rugs[0].svgPattern('hero-thumb')}</div><div><h3>The Oushak Heirloom</h3><p>Oushak, Türkiye &nbsp; / &nbsp; Hand-spun wool</p></div><button data-action="inspect" data-id="oushak" aria-label="Inspect The Oushak Heirloom">${icon('arrow')}</button></div></div>
    </section>
    <div class="trust-bar wrap"><span>${icon('weave')} Handwoven. Never mass-produced.</span><span>${icon('globe')} From the world's finest weaving regions</span><span>${icon('leaf')} Natural fibers. Enduring character.</span><span>${icon('bag')} A personal approach to every piece</span></div>
    <section class="wrap section archive-heading" id="archive" aria-labelledby="archive-title"><div class="section-top"><div><div class="eyebrow">The woven archive</div><h2 id="archive-title">A world beneath your feet.</h2></div><p>Ten exceptional pieces. Centuries of artistry.<br>Find the weave that speaks to your space.</p></div>
      <div class="catalog-tools"><div class="filter-group">
        <label><span class="sr-only">Weaving style</span><select id="style-filter" aria-label="Weaving style"><option value="">Weaving style</option>${['Persian', 'Modern', 'Moroccan', 'Kilim', 'Minimalist'].map(value => `<option>${value}</option>`).join('')}</select></label>
        <label><span class="sr-only">Fiber material</span><select id="material-filter" aria-label="Fiber material"><option value="">Fiber material</option>${['Wool', 'Silk', 'Jute'].map(value => `<option>${value}</option>`).join('')}</select></label>
        <label><span class="sr-only">Dimensions</span><select id="size-filter" aria-label="Dimensions"><option value="">Dimensions</option>${sizes.map(size => `<option value="${size}">${sizeLabel(size)}</option>`).join('')}</select></label>
      </div><label class="search-box">${icon('search')}<input id="search" type="search" placeholder="Search the archive" aria-label="Search the archive" maxlength="100"></label></div>
      <div class="catalog-status"><div><span id="result-count" aria-live="polite"></span><div class="filter-pills" id="filter-pills"></div></div><label>Sort by: <select class="sort-select" id="sort" aria-label="Sort rugs"><option value="featured">Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="density">Knot Density</option></select></label></div>
      <div class="catalog" id="catalog"></div><div class="archive-footer"><button class="btn outline" id="view-archive">View the complete archive <span class="mono">10</span> ${icon('arrow')}</button></div>
    </section>
    <section class="wrap section studio" id="studio" aria-labelledby="studio-title"><div class="section-top"><div><div class="eyebrow">The room studio</div><h2 id="studio-title">See it in your world.</h2></div><p>A new perspective, before the first thread arrives.<br>Explore proportion, material, and light.</p></div>
      <div class="studio-layout"><div id="room-stage" class="room-stage"></div><div class="studio-controls">
        <div><label class="control-title" for="studio-rug">01 / Your selected weave</label><select class="control-select" id="studio-rug">${rugs.map(rug => `<option value="${rug.id}">${rug.name}</option>`).join('')}</select></div>
        <div><span class="control-title">02 / The setting</span><div class="segmented" id="room-options">${[['living', 'Living'], ['dining', 'Dining'], ['bedroom', 'Bedroom']].map(([value, label]) => `<button data-room="${value}" aria-pressed="${value === 'living'}" class="${value === 'living' ? 'active' : ''}">${label}</button>`).join('')}</div></div>
        <div><span class="control-title">03 / Underfoot</span><div class="floor-options">${[['oak', 'Nordic oak'], ['walnut', 'Walnut'], ['concrete', 'Concrete']].map(([value, label]) => `<button class="floor-option ${value === 'oak' ? 'active' : ''}" data-floor="${value}" aria-label="${{ oak: 'Light Nordic Oak', walnut: 'Dark American Walnut', concrete: 'Polished Concrete' }[value]}" aria-pressed="${value === 'oak'}"><span class="swatch ${value}"></span>${label}</button>`).join('')}</div></div>
        <div><span class="control-title">04 / Proportion</span><div class="segmented" id="studio-sizes">${sizes.map(size => `<button data-studio-size="${size}" aria-pressed="${size === '8x10'}" class="${size === '8x10' ? 'active' : ''}">${sizeLabel(size)}</button>`).join('')}</div><button class="rotate-btn" id="rotate" aria-pressed="false">${icon('rotate')} &nbsp; Rotate orientation 90°</button></div>
        <div><span class="control-title">05 / A different light</span><div class="segmented" id="light-options"><button data-light="day" class="active" aria-pressed="true">Natural daylight</button><button data-light="evening" aria-pressed="false">Warm evening</button></div></div>
        <button class="btn" id="studio-inspect">Discover this piece ${icon('arrow')}</button>
      </div></div><p class="studio-note">${icon('room')} An architectural impression. Colors and proportions are illustrative; our concierge can help you find the perfect fit.</p>
    </section>
    <section class="wrap section" id="craft"><div class="craft-layout"><div class="craft-art">${rugs[3].svgPattern('craft')}<span class="craft-label">THE HUMAN HAND IN EVERY THREAD</span></div><div class="craft-copy"><div class="eyebrow">Craft & provenance</div><h2>Not simply made.<br><em>Quietly mastered.</em></h2><p>From the foothills of the Atlas to the centuries-old looms of Anatolia, every weave carries the language of its place. We work with independent weaving ateliers who believe, as we do, that some things cannot be hurried.</p><div class="craft-points"><div><h3>A living tradition</h3><p>Hand-knotted and flatwoven techniques, passed from one generation to the next.</p></div><div><h3>Material, honestly</h3><p>Natural wool, luminous silk, and earthy jute. Nothing more than what belongs.</p></div></div><a class="text-link" href="#showroom">Meet your next heirloom ${icon('arrow')}</a></div></div></section>
    <section class="wrap section booking" id="showroom"><div class="booking-copy"><div class="eyebrow">By appointment. By your side.</div><h2>A personal invitation<br>to <em>find your piece.</em></h2><p>Feel the fibers. Discover the stories. Join us for a private archival pull, or let our concierge bring the atelier to you through a live studio walkthrough.</p><div class="locations">NEW YORK &nbsp; · &nbsp; COPENHAGEN &nbsp; · &nbsp; MILAN</div></div><div id="booking-content"><form id="booking-form" class="booking-form">
      <div class="full"><span class="control-title">Your consultation</span><div class="segmented"><button type="button" data-consultation="private" class="active" aria-pressed="true">Private showroom visit</button><button type="button" data-consultation="virtual" aria-pressed="false">Virtual studio walkthrough</button></div></div>
      <label class="field">Your name<input name="name" autocomplete="name" placeholder="Full name" required maxlength="100"></label><label class="field">Email address<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required maxlength="254"></label>
      <label class="field" id="location-field">Your atelier<select name="location"><option>New York</option><option>Copenhagen</option><option>Milan</option></select></label><label class="field">Preferred date<input name="date" type="date" required min="${localDate()}" aria-label="Preferred date"></label>
      <label class="field full">A note for our concierge (optional)<textarea name="note" rows="2" maxlength="1500" placeholder="Tell us a little about your space…"></textarea></label><div class="full"><button class="btn" type="submit">Request an appointment ${icon('arrow')}</button></div><p class="form-note full">An appointment request, not an instant reservation. Our concierge will review your preferred date.</p>
    </form></div></section>
  </main>
  <footer class="wrap"><div class="footer-top"><a class="brand" href="#">ATELIER VÉRA<span>THE ART OF THE WOVEN</span></a><p>Beautiful things take time.</p><div class="footer-links"><a href="#archive">The Archive</a><a href="#craft">Our Philosophy</a><a href="#showroom">Get in Touch ${icon('arrow')}</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ATELIER VÉRA. All rights reserved.</span><span>CONSIDERED DESIGN. &nbsp; ENDURING CRAFT. &nbsp; A MORE BEAUTIFUL EVERYDAY.</span></div></footer>
  <dialog class="inspect-dialog" id="inspect-dialog" aria-labelledby="inspect-title"></dialog>
  <dialog class="folio-dialog" id="folio-dialog" aria-labelledby="folio-title"></dialog>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function renderCatalog() {
  const filtered = rugs.filter(rug => (!state.style || rug.style === state.style) && (!state.material || rug.material === state.material) && (!state.size || rug.sizes.includes(state.size)) && `${rug.name} ${rug.origin} ${rug.collection} ${rug.style} ${rug.material} ${rug.sku}`.toLowerCase().includes(state.search.toLowerCase().trim()));
  if (state.sort === 'low') filtered.sort((a, b) => priceFor(a, state.size || '8x10') - priceFor(b, state.size || '8x10'));
  if (state.sort === 'high') filtered.sort((a, b) => priceFor(b, state.size || '8x10') - priceFor(a, state.size || '8x10'));
  if (state.sort === 'density') filtered.sort((a, b) => b.kpsi - a.kpsi);
  const active = state.style || state.material || state.size || state.search;
  const visible = state.expanded || active || state.sort !== 'featured' ? filtered : filtered.slice(0, 4);
  $('#result-count').textContent = `Showing ${visible.length} of ${filtered.length} considered pieces`;
  $('#filter-pills').innerHTML = ['style', 'material', 'size', 'search'].filter(key => state[key]).map(key => `<button class="pill" data-clear="${key}" aria-label="Remove ${escape(state[key])} filter">${escape(key === 'size' ? sizeLabel(state[key]) : state[key])} &nbsp; ×</button>`).join('') + (active ? '<button class="reset" id="reset-filters">Reset Archive</button>' : '');
  $('#catalog').innerHTML = visible.length ? visible.map((rug, index) => `<article class="rug-card"><div class="rug-picture"><div class="rug-art">${rug.svgPattern(`card-${rug.id}`)}</div>${index === 0 ? '<span class="card-tag">Atelier selection</span>' : ''}<button class="card-save" data-action="add" data-id="${rug.id}" aria-label="Add ${rug.name} to folio">${icon('bag')}</button><div class="quick-actions"><button data-action="inspect" data-id="${rug.id}">${icon('eye')} Inspect weave</button><button data-action="studio" data-id="${rug.id}">${icon('room')} Room studio</button></div></div><div class="card-meta"><span>${rug.style} / ${rug.material}</span><span class="mono">${rug.kpsi} KPSI</span></div><div class="card-bottom"><h3><a href="#inspect" data-action="inspect" data-id="${rug.id}">${rug.name}</a></h3><span>${money(priceFor(rug, state.size || '8x10'))}</span></div><p class="card-origin">${rug.origin} &nbsp; · &nbsp; ${sizeLabel(state.size || '8x10')}</p></article>`).join('') : '<div class="empty">No pieces match this combination.<br><button class="text-link" id="empty-reset">Reset the archive →</button></div>';
  $('#view-archive').hidden = !!active || state.sort !== 'featured';
  $('#view-archive').innerHTML = `${state.expanded ? 'Show atelier selections' : 'View the complete archive'} <span class="mono">${state.expanded ? '04' : '10'}</span> ${icon('arrow')}`;
}

function furniture() {
  if (state.room === 'dining') return `<g filter="url(#room-shadow)"><g fill="#a18a6e" stroke="#74604d" stroke-width="2">${[230, 310, 390].map(y => `<rect x="211" y="${y}" width="43" height="48" rx="9"/><rect x="466" y="${y}" width="43" height="48" rx="9"/>`).join('')}<rect x="336" y="164" width="48" height="45" rx="8"/><rect x="336" y="447" width="48" height="45" rx="8"/></g><rect x="250" y="205" width="220" height="245" rx="55" fill="#c4ad88" stroke="#998262" stroke-width="3"/><path d="M270 230v192m20-206v219m28-223v227m28-232v235m30-233v231m30-223v217m29-192v171" stroke="#ab9370" opacity=".5"/><ellipse cx="360" cy="325" rx="30" ry="25" fill="#ddd4bd"/><ellipse cx="360" cy="325" rx="18" ry="15" fill="#79816a"/></g>`;
  if (state.room === 'bedroom') return `<g filter="url(#room-shadow)"><rect x="240" y="82" width="240" height="346" rx="8" fill="#9a8064"/><rect x="231" y="75" width="258" height="26" rx="6" fill="#a38c70"/><rect x="251" y="103" width="218" height="305" rx="6" fill="#eae2d4"/><rect x="265" y="113" width="86" height="56" rx="9" fill="#f7f1e7" stroke="#d1c7b9"/><rect x="369" y="113" width="86" height="56" rx="9" fill="#f7f1e7" stroke="#d1c7b9"/><path d="M251 202h218v176H251Z" fill="#b4b19a"/><path d="M255 208h210M255 218h210M260 205v170M450 205v170" stroke="#93967d" opacity=".5"/><path d="M251 358h218v36H251Z" fill="#c8b99f"/><rect x="159" y="100" width="61" height="64" rx="4" fill="#9d8468"/><rect x="500" y="100" width="61" height="64" rx="4" fill="#9d8468"/><circle cx="190" cy="132" r="16" fill="#e7ddc9"/><circle cx="530" cy="132" r="16" fill="#e7ddc9"/></g>`;
  return `<g filter="url(#room-shadow)"><rect x="205" y="96" width="310" height="100" rx="14" fill="#c3b59c"/><rect x="219" y="100" width="282" height="70" rx="10" fill="#e1d7c4"/><path d="M312 106v60m94-60v60" stroke="#c3b79f" stroke-width="2"/><rect x="208" y="96" width="24" height="102" rx="7" fill="#cabb9f"/><rect x="489" y="96" width="24" height="102" rx="7" fill="#cabb9f"/><rect x="238" y="109" width="45" height="43" rx="5" fill="#94977b" transform="rotate(-8 260 130)"/><rect x="424" y="108" width="42" height="43" rx="5" fill="#b7987c" transform="rotate(10 445 130)"/><rect x="281" y="269" width="160" height="105" rx="44" fill="#a28b6d"/><rect x="288" y="275" width="146" height="91" rx="40" fill="#bbab8f"/><rect x="319" y="293" width="36" height="48" fill="#eee5d4" transform="rotate(-12 337 317)"/><circle cx="389" cy="323" r="16" fill="#87785e"/><circle cx="389" cy="323" r="11" fill="#bfb39a"/><g transform="rotate(20 180 375)"><rect x="138" y="329" width="87" height="98" rx="20" fill="#9d876d"/><rect x="147" y="344" width="68" height="67" rx="12" fill="#ded2bc"/></g><g transform="rotate(-20 542 375)"><rect x="499" y="329" width="87" height="98" rx="20" fill="#9d876d"/><rect x="508" y="344" width="68" height="67" rx="12" fill="#ded2bc"/></g><circle cx="568" cy="164" r="25" fill="#89775f"/><circle cx="568" cy="164" r="13" fill="#d2c7af"/><path d="m568 160-14-25m14 25 13-24" stroke="#6a7756" stroke-width="6"/></g>`;
}

function renderStudio() {
  const rug = rugs.find(item => item.id === state.rug);
  const [feetWidth, feetHeight] = state.studioSize.split('x').map(Number);
  const width = feetWidth * 32;
  const height = feetHeight * 32;
  const floor = { oak: ['#d8c7a9', '#b6a080'], walnut: ['#715840', '#4f3929'], concrete: ['#bab9b1', '#9c9b94'] }[state.floor];
  $('#room-stage').classList.toggle('evening', state.light === 'evening');
  $('#room-stage').innerHTML = `<span class="stage-caption">${state.room === 'living' ? 'The living room' : state.room === 'dining' ? 'The dining room' : 'The bedroom'} / A study in proportion</span>
    <svg class="room" viewBox="0 0 720 560" role="img" aria-label="${rug.name} in a ${state.room} room on ${state.floor} flooring, ${sizeLabel(state.studioSize)}, ${state.rotated ? 'rotated 90 degrees, ' : ''}${state.light === 'day' ? 'daylight' : 'evening lighting'}">
      <defs><pattern id="floor-grain" width="60" height="560" patternUnits="userSpaceOnUse"><rect width="60" height="560" fill="${floor[0]}"/><path d="M0 0v560M5 0v560M14 0Q35 150 15 280T18 560M40 0Q60 150 45 280T42 560" stroke="${floor[1]}" stroke-opacity=".3" fill="none"/></pattern><filter id="room-shadow"><feDropShadow dx="4" dy="8" stdDeviation="6" flood-color="#302719" flood-opacity=".2"/></filter><linearGradient id="room-light" x2="1" y2=".6"><stop stop-color="${state.light === 'day' ? '#fffbea' : '#ffd38b'}" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <rect width="720" height="560" fill="${state.floor === 'concrete' ? floor[0] : 'url(#floor-grain)'}"/><path d="M42 37h636v486H42Z" fill="none" stroke="${floor[1]}" stroke-opacity=".45" stroke-width="2"/><path d="M45 40h630M45 40v480" stroke="#f7f4ef" stroke-opacity=".45" stroke-width="7"/>
      <g transform="translate(360 325) rotate(${state.rotated ? 90 : 0})" filter="url(#room-shadow)">${rug.svgPattern('studio-art').replace('<svg ', `<svg x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" preserveAspectRatio="none" `)}</g>
      ${furniture()}<path d="M42 40H190L430 520H215Z" fill="url(#room-light)" pointer-events="none"/>
    </svg><div class="stage-scale"><span>0 &nbsp; ── &nbsp; 5 FT</span><span class="mono">${sizeLabel(state.studioSize)} &nbsp; / &nbsp; ${rug.sku}</span></div>`;
}

function inspect(id, size = state.size || '8x10') {
  state.inspect = id;
  state.inspectSize = size;
  const rug = rugs.find(item => item.id === id);
  $('#inspect-dialog').innerHTML = `<button class="icon-btn modal-close" data-close="inspect-dialog" aria-label="Close inspection">${icon('close')}</button><div class="inspect-layout"><div class="inspect-art"><div class="zoom-window"><div class="zoom-art">${rug.svgPattern('inspect-art')}</div></div><button class="zoom-controls" id="zoom" aria-pressed="false">${icon('search')} &nbsp; Explore the weave · Zoom in</button></div><div class="inspect-copy"><div class="eyebrow">${rug.collection}</div><h2 id="inspect-title">${rug.name}</h2><p>${rug.description}</p><dl class="spec-grid"><div><dt>Origin</dt><dd>${rug.origin}</dd></div><div><dt>Knot density</dt><dd class="mono">${rug.kpsi} KPSI</dd></div><div><dt>Pile height</dt><dd class="mono">${rug.pileHeight}</dd></div><div><dt>Time on the loom</dt><dd class="mono">${rug.loomTime}</dd></div><div><dt>Natural fiber</dt><dd>${rug.material}</dd></div><div><dt>Archive reference</dt><dd class="mono">${rug.sku}</dd></div></dl><label class="control-title" for="inspect-size">Choose your dimensions</label><select class="control-select" id="inspect-size">${rug.sizes.map(value => `<option value="${value}" ${value === size ? 'selected' : ''}>${sizeLabel(value)}</option>`).join('')}</select><div class="modal-price"><strong id="inspect-price">${money(priceFor(rug, size))}</strong><span>Estimated archival value · USD</span></div><button class="btn" data-action="add-inspect">${icon('bag')} Add to Inquiry Folio ${icon('arrow')}</button><button class="text-link" data-action="studio" data-id="${id}">See it in the Room Studio ${icon('arrow')}</button></div></div>`;
  if (!$('#inspect-dialog').open) $('#inspect-dialog').showModal();
}

function persistFolio() {
  try { localStorage.setItem('atelier-vera-folio', JSON.stringify(state.folio)); } catch { notify('Your folio is available for this visit. Browser storage is unavailable.'); }
  $('#folio-count').textContent = state.folio.length;
  $('.folio-trigger').setAttribute('aria-label', `Inquiry Folio, ${state.folio.length} pieces`);
}

function addFolio(id, size) {
  if (state.folio.some(item => item.id === id && item.size === size)) { notify('This piece and size are already in your folio.'); return; }
  if (state.folio.length >= 50) { notify('Your folio is full. Remove a piece to add another.'); return; }
  state.folio.push({ id, size });
  persistFolio();
  notify(`${rugs.find(rug => rug.id === id).name} added to your folio.`);
}

function renderFolio() {
  const total = state.folio.reduce((sum, item) => sum + priceFor(rugs.find(rug => rug.id === item.id), item.size), 0);
  $('#folio-dialog').innerHTML = `<button class="icon-btn modal-close" data-close="folio-dialog" aria-label="Close inquiry folio">${icon('close')}</button><div class="eyebrow">A considered collection</div><h2 id="folio-title">Your Inquiry Folio</h2><p>A few pieces worth getting to know.<br>Let us help you bring your selection home.</p><div class="folio-items">${state.folio.length ? state.folio.map((item, index) => {
    const rug = rugs.find(piece => piece.id === item.id);
    return `<div class="folio-item"><div class="mini-art">${rug.svgPattern(`folio-${index}`)}</div><div><h3>${rug.name}</h3><p class="mono">${sizeLabel(item.size)} · ${rug.sku}</p><strong>${money(priceFor(rug, item.size))}</strong></div><button data-remove="${index}" aria-label="Remove ${rug.name}">${icon('close')}</button></div>`;
  }).join('') : '<div class="empty-folio">Your folio is waiting for its first story.<br><button class="text-link" data-close="folio-dialog">Explore the archive →</button></div>'}</div>${state.folio.length ? `<div class="folio-total"><span>Estimated archival value</span><strong>${money(total)}</strong></div><form class="folio-form" id="folio-form"><label class="field">Your name<input name="name" autocomplete="name" required maxlength="100" placeholder="Full name"></label><label class="field">Email address<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label><label class="field">Acquisition type<select name="type"><option>Private acquisition</option><option>Trade / Interior design</option></select></label><button class="btn" type="submit">Request a private acquisition ${icon('arrow')}</button><p class="form-note">An inquiry, not a purchase. No payment is collected. Your details are used to respond to your request.</p></form>` : ''}`;
}

function selectStudio(id) {
  state.rug = id;
  state.studioSize = state.inspect === id && $('#inspect-dialog').open ? state.inspectSize : state.size || state.studioSize;
  $('#studio-rug').value = id;
  $('#inspect-dialog').close();
  updatePressed('[data-studio-size]', 'studioSize', 'studioSize');
  renderStudio();
  $('#studio').scrollIntoView({ behavior: 'smooth' });
}

function updatePressed(selector, key, datasetKey) {
  document.querySelectorAll(selector).forEach(button => {
    const selected = button.dataset[datasetKey] === state[key];
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function resetFilters() {
  for (const key of ['style', 'material', 'size', 'search']) state[key] = '';
  for (const id of ['style-filter', 'material-filter', 'size-filter', 'search']) $(`#${id}`).value = '';
  state.sort = 'featured';
  $('#sort').value = 'featured';
  renderCatalog();
}

document.addEventListener('click', event => {
  const button = event.target.closest('button, a[data-action]');
  if (!button) return;
  const { action, id, close, clear, room, floor, studioSize, light, consultation, remove } = button.dataset;
  if (action) event.preventDefault();
  if (action === 'inspect') inspect(id);
  if (action === 'studio') selectStudio(id);
  if (action === 'add') addFolio(id, state.size || '8x10');
  if (action === 'add-inspect') addFolio(state.inspect, state.inspectSize);
  if (action === 'open-folio') { renderFolio(); $('#folio-dialog').showModal(); }
  if (close) $(`#${close}`).close();
  if (clear) {
    state[clear] = '';
    $(`#${clear === 'search' ? 'search' : `${clear}-filter`}`).value = '';
    renderCatalog();
  }
  if (button.id === 'reset-filters' || button.id === 'empty-reset') resetFilters();
  if (button.id === 'view-archive') { state.expanded = !state.expanded; renderCatalog(); }
  if (button.id === 'studio-inspect') inspect(state.rug, state.studioSize);
  if (button.id === 'rotate') { state.rotated = !state.rotated; button.setAttribute('aria-pressed', String(state.rotated)); renderStudio(); }
  if (button.id === 'zoom') {
    const zoomed = $('.zoom-art').classList.toggle('zoomed');
    button.setAttribute('aria-pressed', String(zoomed));
    button.innerHTML = `${icon('search')} &nbsp; ${zoomed ? 'Return to full view · Zoom out' : 'Explore the weave · Zoom in'}`;
  }
  if (room || floor || studioSize || light) {
    const key = room ? 'room' : floor ? 'floor' : studioSize ? 'studioSize' : 'light';
    state[key] = room || floor || studioSize || light;
    updatePressed(`[data-${key === 'studioSize' ? 'studio-size' : key}]`, key, key);
    renderStudio();
  }
  if (remove !== undefined) { state.folio.splice(Number(remove), 1); persistFolio(); renderFolio(); }
  if (consultation) {
    $('#booking-form').dataset.consultation = consultation;
    document.querySelectorAll('[data-consultation]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    $('#location-field').hidden = consultation === 'virtual';
    $('#location-field select').disabled = consultation === 'virtual';
  }
});

for (const key of ['style', 'material', 'size']) $(`#${key}-filter`).addEventListener('change', event => { state[key] = event.target.value; renderCatalog(); });
$('#search').addEventListener('input', event => { state.search = event.target.value; renderCatalog(); });
$('#sort').addEventListener('change', event => { state.sort = event.target.value; renderCatalog(); });
$('#studio-rug').addEventListener('change', event => { state.rug = event.target.value; renderStudio(); });
$('#inspect-dialog').addEventListener('change', event => {
  if (event.target.id === 'inspect-size') {
    state.inspectSize = event.target.value;
    $('#inspect-price').textContent = money(priceFor(rugs.find(rug => rug.id === state.inspect), state.inspectSize));
  }
});
$('.mobile-menu').addEventListener('click', event => {
  const open = $('.nav').classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', String(open));
});
$('.nav').addEventListener('click', event => {
  if (event.target.closest('a')) { $('.nav').classList.remove('open'); $('.mobile-menu').setAttribute('aria-expanded', 'false'); }
});
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

document.addEventListener('submit', async event => {
  if (!['booking-form', 'folio-form'].includes(event.target.id)) return;
  event.preventDefault();
  const form = event.target;
  if (!form.reportValidity() || form.dataset.pending) return;
  const data = Object.fromEntries(new FormData(form));
  const booking = form.id === 'booking-form';
  if (booking && data.date < localDate()) { notify('Please select today or a future date.'); return; }
  if (booking) data.consultation = form.dataset.consultation || 'private';
  else data.selection = state.folio.map(({ id, size }) => ({ id, size }));
  const submit = form.querySelector('[type="submit"]');
  form.dataset.pending = 'true';
  submit.disabled = true;
  const originalLabel = submit.innerHTML;
  submit.textContent = 'Sending your request…';
  try {
    const response = await fetch(booking ? '/api/appointments' : '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout(15000) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Your request could not be sent. Please try again.');
    const panel = `<span class="success-icon">${icon('check')}</span><h3>${booking ? 'A date with beautiful things.' : 'Your inquiry is received.'}</h3><p>Thank you, ${escape(data.name)}. ${booking ? `Your ${data.consultation === 'virtual' ? 'virtual studio walkthrough' : `private visit in ${escape(data.location)}`} request for <strong>${escape(data.date)}</strong> has been received.` : `Your ${escape(data.type.toLowerCase())} request includes ${data.selection.length} ${data.selection.length === 1 ? 'piece' : 'pieces'}.`}</p><p class="form-note">Reference: <span class="mono">${escape(result.reference)}</span>. ${booking ? 'Your preferred date is subject to concierge confirmation.' : 'No payment has been taken.'}</p>`;
    if (booking) $('#booking-content').innerHTML = `<div class="success-panel" role="status">${panel}</div>`;
    else $('#folio-dialog').innerHTML = `<button class="icon-btn modal-close" data-close="folio-dialog" aria-label="Close inquiry folio">${icon('close')}</button><div class="eyebrow">Your next chapter</div><h2 id="folio-title">A beautiful beginning.</h2><div class="success-panel" role="status">${panel}</div>`;
  } catch (error) {
    notify(error.name === 'TimeoutError' ? 'The request timed out. Please try again.' : error instanceof TypeError ? 'Connection unavailable. Please try again when online.' : error.message);
  } finally {
    delete form.dataset.pending;
    submit.disabled = false;
    submit.innerHTML = originalLabel;
  }
});

renderCatalog();
renderStudio();
persistFolio();
