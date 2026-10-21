import { rugs, sizes, dimensions, sizeLabel as formatSize, priceFor } from './rugs.js';
import { bookingToday } from './booking.js';
import { translate } from './translations.js';
import { currencies, formatPrice, createCurrencyService } from './currencyService.js';
import { createCurrencyStore } from './currencyStore.js';
import { filterRugs } from './catalog.js';
import { whatsappInquiry } from './inquiry.js';
import { setupMagnifier } from './magnifier.js';

const env = import.meta.env ?? {};
const currencyStore = createCurrencyStore({ service: createCurrencyService({ alanEndpoint: env.VITE_ALANCHAND_ENDPOINT }) });

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
const icon = name => `<svg class="icon-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.arrow}</svg>`;
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
let savedLanguage = 'fa';
try { savedLanguage = localStorage.getItem('atelier-vera-language') === 'en' ? 'en' : 'fa'; } catch {}
const persianDigits = value => state.language === 'fa' ? String(value).replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[digit]) : String(value);
const sizeLabel = value => escape(persianDigits(formatSize(value)));
const priceText = value => formatPrice(value, currencyStore.getState().currency, currencyStore.getState().snapshot.rates, state.language === 'fa' ? 'fa-IR' : 'en-US');
const money = value => `<span data-price-usd="${value}">${escape(priceText(value))}</span>`;
const $ = selector => document.querySelector(selector);
const state = { language: savedLanguage, style: '', material: '', size: '', origin: '', color: '', search: '', sort: 'featured', expanded: false, rug: rugs[0].id, room: 'living', floor: 'oak', studioSize: '8x10', rotated: false, light: 'day', inspect: null, inspectSize: '8x10', folio: [] };
const pendingRequests = { inquiry: false, appointment: false };
const rugTranslations = {
  oushak: ['یادگار اوشاک', 'آرشیو آناتولی', 'اوشاک، ترکیه', 'قالی ایرانی', 'پشم', 'یادگاری آفتاب‌خورده با رنگ‌های سفالی و جو دوسری. پشم دست‌ریس و نقش‌مایه‌های گیاهی سخاوتمندانه، شعر آرام بافندگی آناتولی را در خود دارند.'],
  atlas: ['عاجی اطلس', 'مجموعه اطلس', 'کوه‌های اطلس، مراکش', 'مراکشی', 'پشم', 'پشم کوهستانی نرم، با شبکه‌ای نامنظم از زغالی. بیانی لمسی از سنت بافندگی بنی‌اورین.'],
  jaipur: ['شن‌های جیپور', 'دار معاصر', 'جیپور، هند', 'مدرن', 'پشم', 'قوس‌های پیکرتراش و سطوح خاکی در ترکیبی متعادل و لطیف کنار هم می‌آیند؛ بافته‌ای معاصر که آهسته و با دست ساخته شده است.'],
  tabriz: ['باغ تبریز', 'آرشیو ایرانی', 'تبریز، ایران', 'ایرانی', 'ابریشم', 'باغی ظریف از ترنج‌ها و پیچک‌های روان، بافته‌شده با ابریشم درخشان؛ ترکیبی ریزبافت با عمق و وضوحی چشمگیر.'],
  sahara: ['خطوط صحرا', 'ضروریات آرام', 'مراکش', 'مینیمال', 'جوت', 'جوت طبیعی و ریتمی خطی و خلوت؛ بافتی صادقانه، تنوعی طبیعی و حضوری آرام و متین.'],
  kars: ['گلیم قارص', 'آرشیو آناتولی', 'قارص، ترکیه', 'گلیم', 'پشم', 'لوزی‌های پلکانی به رنگ آجری، نیلی و کتانِ رنگ‌باخته؛ برداشتی تخت‌باف از زبان هندسی ماندگار آناتولی.'],
  dune: ['مطالعه تپه‌های شنی', 'دار معاصر', 'بهادوهی، هند', 'مدرن', 'ابریشم', 'لایه‌های رنگیِ هم‌تن، خطوط متغیر تپه‌های شنی را تداعی می‌کنند. ابریشم با هر تغییر زاویه، نور را به شکلی تازه می‌گیرد.'],
  rif: ['زیتونی ریف', 'مجموعه اطلس', 'کوه‌های ریف، مراکش', 'مراکشی', 'پشم', 'زمینه‌ای زیتونی با نقش‌های عاجی و زنده. پشم محلیِ پرزدار، به فضا حال‌وهوایی آسوده و زیبا می‌بخشد.'],
  agra: ['پالمت آگرا', 'آرشیو ایرانی', 'آگرا، هند', 'ایرانی', 'پشم', 'پالمت‌های بزرگ بر زمینه‌ای با رنگ صورتیِ کهنه گسترده شده‌اند. رنگ‌های الهام‌گرفته از گیاهان و پشم متراکم، بافته‌ای پُرلایه و ماندگار می‌سازند.'],
  linen: ['زمینه کتان', 'ضروریات آرام', 'جیپور، هند', 'مینیمال', 'جوت', 'چهارخانه‌ای آرام از الیاف طبیعی. تضاد رنگی ظریف، زیبایی خام مواد و دست‌ساخته‌بودن آن را ارج می‌نهد.'],
};
const rugText = (rug, field) => state.language === 'en' ? rug[field] : rugTranslations[rug.id][{ name: 0, collection: 1, origin: 2, style: 3, material: 4, description: 5 }[field]];
const stylesFa = { Persian: 'ایرانی', Modern: 'مدرن', Moroccan: 'مراکشی', Kilim: 'گلیم', Minimalist: 'مینیمال', Classic: 'کلاسیک', 'Tribal / Nomadic': 'عشایری / کوچ‌نشین', 'Modern / Vintage': 'مدرن / وینتیج' };
const materialsFa = { Wool: 'پشم', Silk: 'ابریشم', Jute: 'جوت' };
const localizedStyle = value => state.language === 'en' ? value : stylesFa[value];
const localizedMaterial = value => state.language === 'en' ? value : materialsFa[value];
const specFa = { Cotton: 'پنبه', Wool: 'پشم', Silk: 'ابریشم', Jute: 'جوت', 'Hand-spun wool': 'پشم دست‌ریس', 'Mountain wool': 'پشم کوهستانی', '100% pure silk': '۱۰۰٪ ابریشم خالص', 'Wool flatweave': 'تخت‌باف پشمی', 'Kork wool': 'پشم کرک', 'Vegetable dyes': 'رنگ‌های گیاهی', 'Undyed / natural tones': 'رنگ طبیعی الیاف', 'Contemporary dyes': 'رنگ‌های معاصر', 'Natural dyes': 'رنگ‌های طبیعی', Undyed: 'بدون رنگرزی', 'Vintage-inspired new': 'نو با الهام از وینتیج', New: 'نو', 'Masterpiece new': 'شاهکار نو', 'Antique-inspired new': 'نو با الهام از عتیقه', Terracotta: 'سفالی', Ivory: 'عاجی', Sand: 'شنی', Olive: 'زیتونی', Blush: 'صورتی کهنه' };
const specText = value => state.language === 'fa' ? specFa[value] || value : value;
try {
  const saved = JSON.parse(localStorage.getItem('atelier-vera-folio') || '[]');
  if (Array.isArray(saved)) state.folio = saved.filter(item => item && rugs.some(rug => rug.id === item.id) && sizes.includes(item.size)).map(({ id, size }) => ({ id, size })).slice(0, 50);
} catch { state.folio = []; }
let toastTimer;
function notify(message) {
  message = translate(message, state.language);
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
    <a class="brand" href="#" aria-label="صفحه اصلی آتلیه ورا">ATELIER VÉRA<span>هنر بافت</span></a>
    <nav class="nav" id="main-nav" aria-label="پیمایش اصلی"><a href="#archive">آرشیو</a><a href="#studio">استودیوی فضا</a><a href="#craft">هنر و خاستگاه</a><a href="#showroom">نمایشگاه خصوصی</a></nav>
    <button class="icon-btn mobile-menu" aria-label="باز و بسته کردن پیمایش" aria-controls="main-nav" aria-expanded="false">${icon('menu')}</button>
    <button class="language-toggle" id="language-toggle" type="button" aria-label="Switch language">English</button>
    <label class="currency-control"><span class="sr-only">ارز نمایش قیمت</span><select id="currency-select" aria-label="ارز نمایش قیمت" dir="ltr">${currencies.map(({ code, symbol, flag }) => `<option value="${code}">${flag} ${code} · ${symbol}</option>`).join('')}</select></label>
    <button class="folio-trigger" data-action="open-folio">${icon('bag')} فهرست انتخاب <span class="badge" id="folio-count">۰</span></button>
  </div></header>
  <main>
    <section class="wrap hero" aria-labelledby="hero-title">
      <div class="hero-copy"><div class="eyebrow">گزیده‌هایی با داستان‌های ماندگار</div><h1 id="hero-title">برای زندگی<br>بافته شده؛<br><em>برای ماندن.</em></h1><p>قالی‌هایی استثنایی، باحوصله و به‌دست انسان بافته‌شده.<br>آرشیوی گزیده از بافت، سنت و زیبایی آرام برای خانه‌های ما.</p>
        <div class="hero-actions"><a class="btn" href="#archive">گشت‌وگذار در آرشیو ${icon('arrow')}</a><a class="text-link" href="#studio">زاویه دید خود را بیابید ${icon('arrow')}</a></div>
        <div class="provenance-metrics"><div><strong>۱۰۰٪</strong>الیاف طبیعی دست‌ریس</div><div><strong>برای شما</strong>امکان سفارش اندازه دلخواه</div><div><strong>ماندگار</strong>هنری برای نسل‌ها</div></div>
      </div>
      <div class="hero-art">${heroRoom()}<div class="hero-rug">${rugs[0].svgPattern('hero', rugText(rugs[0], 'name'))}</div><div class="art-top"><span>خانه‌ای سنجیده — شماره ۰۱</span><span>همیشه دست‌بافت</span></div><div class="vertical-note">تجملی آرام‌تر</div><div class="art-card"><div class="mini-art">${rugs[0].svgPattern('hero-thumb', rugText(rugs[0], 'name'))}</div><div><h3>یادگار اوشاک</h3><p>اوشاک، ترکیه &nbsp; / &nbsp; پشم دست‌ریس</p></div><button data-action="inspect" data-id="oushak" aria-label="مشاهده یادگار اوشاک">${icon('arrow')}</button></div></div>
    </section>
    <div class="trust-bar wrap"><span>${icon('weave')} دست‌بافت، نه تولید انبوه</span><span>${icon('globe')} از بهترین سرزمین‌های بافندگی جهان</span><span>${icon('leaf')} الیاف طبیعی، جلوه‌ای ماندگار</span><span>${icon('bag')} نگاهی شخصی به هر بافته</span></div>
    <section class="wrap section archive-heading" id="archive" aria-labelledby="archive-title"><div class="section-top"><div><div class="eyebrow">آرشیو بافته‌ها</div><h2 id="archive-title">جهانی زیر پای شما.</h2></div><p>ده بافته استثنایی، هنر چندین سده.<br>بافته‌ای را بیابید که با فضای شما سخن می‌گوید.</p></div>
      <div class="catalog-tools"><div class="filter-group">
        <label><span class="sr-only">سبک بافت</span><select id="style-filter" aria-label="سبک بافت"><option value="">سبک بافت</option>${['Classic', 'Tribal / Nomadic', 'Modern / Vintage', 'Persian', 'Modern', 'Moroccan', 'Kilim', 'Minimalist'].map(value => `<option value="${value}">${localizedStyle(value)}</option>`).join('')}</select></label>
        <label><span class="sr-only">جنس الیاف</span><select id="material-filter" aria-label="جنس الیاف"><option value="">جنس الیاف</option>${['Wool', 'Silk', 'Jute'].map(value => `<option value="${value}">${localizedMaterial(value)}</option>`).join('')}</select></label>
        <label><span class="sr-only">ابعاد</span><select id="size-filter" aria-label="ابعاد"><option value="">ابعاد</option>${sizes.map(size => `<option value="${size}">${sizeLabel(size)}</option>`).join('')}</select></label>
        <label><span class="sr-only">خاستگاه</span><select id="origin-filter" aria-label="خاستگاه"><option value="">خاستگاه</option>${[...new Set(rugs.map(rug => rug.city))].map(city => `<option value="${escape(city)}">${escape(city)}</option>`).join('')}</select></label>
        <label><span class="sr-only">رنگ غالب</span><select id="color-filter" aria-label="رنگ غالب"><option value="">رنگ غالب</option>${[...new Set(rugs.map(rug => rug.dominantColor))].map(color => `<option value="${color}">${specText(color)}</option>`).join('')}</select></label>
      </div><label class="search-box">${icon('search')}<input id="search" type="search" placeholder="جست‌وجو در آرشیو" aria-label="جست‌وجو در آرشیو" maxlength="100"></label></div>
      <div class="catalog-status"><div><span id="result-count" aria-live="polite"></span><div class="filter-pills" id="filter-pills"></div></div><label>مرتب‌سازی: <select class="sort-select" id="sort" aria-label="مرتب‌سازی قالی‌ها"><option value="featured">منتخب</option><option value="low">قیمت: از کم به زیاد</option><option value="high">قیمت: از زیاد به کم</option><option value="density">تراکم گره</option></select></label></div>
      <div class="catalog" id="catalog"></div><div class="archive-footer"><button class="btn outline" id="view-archive">مشاهده همه بافته‌ها <span class="mono">۱۰</span> ${icon('arrow')}</button></div>
      <p class="rate-status" id="rate-status" role="status" aria-live="polite"></p>
    </section>
    <section class="wrap section studio" id="studio" aria-labelledby="studio-title"><div class="section-top"><div><div class="eyebrow">استودیوی فضا</div><h2 id="studio-title">قالی را در دنیای خود ببینید.</h2></div><p>پیش از رسیدن نخستین تار، منظره‌ای تازه.<br>تناسب، جنس و نور را بیازمایید.</p></div>
      <div class="studio-layout"><div id="room-stage" class="room-stage"></div><div class="studio-controls">
        <div><label class="control-title" for="studio-rug">۰۱ / بافته منتخب شما</label><select class="control-select" id="studio-rug">${rugs.map(rug => `<option value="${rug.id}">${rugText(rug, 'name')}</option>`).join('')}</select></div>
        <div><span class="control-title">۰۲ / فضای اتاق</span><div class="segmented" id="room-options">${[['living', 'نشیمن'], ['dining', 'ناهارخوری'], ['bedroom', 'اتاق‌خواب']].map(([value, label]) => `<button data-room="${value}" aria-pressed="${value === 'living'}" class="${value === 'living' ? 'active' : ''}">${label}</button>`).join('')}</div></div>
        <div><span class="control-title">۰۳ / کف‌پوش</span><div class="floor-options">${[['oak', 'بلوط نوردیک'], ['walnut', 'گردو'], ['concrete', 'بتن']].map(([value, label]) => `<button class="floor-option ${value === 'oak' ? 'active' : ''}" data-floor="${value}" aria-label="${{ oak: 'بلوط روشن نوردیک', walnut: 'گردوی تیره آمریکایی', concrete: 'بتن صیقلی' }[value]}" aria-pressed="${value === 'oak'}"><span class="swatch ${value}"></span>${label}</button>`).join('')}</div></div>
        <div><span class="control-title">۰۴ / تناسب</span><div class="segmented" id="studio-sizes">${sizes.map(size => `<button data-studio-size="${size}" aria-pressed="${size === '8x10'}" class="${size === '8x10' ? 'active' : ''}">${sizeLabel(size)}</button>`).join('')}</div><button class="rotate-btn" id="rotate" aria-pressed="false">${icon('rotate')} &nbsp; چرخش ۹۰ درجه</button></div>
        <div><span class="control-title">۰۵ / نوری دیگر</span><div class="segmented" id="light-options"><button data-light="day" class="active" aria-pressed="true">نور طبیعی روز</button><button data-light="evening" aria-pressed="false">گرمای عصر</button></div></div>
        <button class="btn" id="studio-inspect">آشنایی با این بافته ${icon('arrow')}</button>
      </div></div><p class="studio-note">${icon('room')} تصویری از فضا؛ رنگ‌ها و تناسب‌ها تقریبی‌اند. همراه آتلیه برای یافتن اندازه مناسب در کنار شماست.</p>
    </section>
    <section class="wrap section" id="craft"><div class="craft-layout"><div class="craft-art">${rugs[3].svgPattern('craft', rugText(rugs[3], 'name'))}<span class="craft-label">دست انسان در تار و پود</span></div><div class="craft-copy"><div class="eyebrow">هنر و خاستگاه</div><h2>تنها ساخته نشده؛<br><em>با ظرافت پرورده شده.</em></h2><p>از دامنه‌های اطلس تا دارهای چندصدساله آناتولی، هر بافته زبان زادگاه خود را روایت می‌کند. با کارگاه‌های مستقل بافندگی همراهیم که همچون ما باور دارند بعضی چیزها را نمی‌توان شتاب‌زده ساخت.</p><div class="craft-points"><div><h3>سنتی زنده</h3><p>گره‌بافی و تخت‌بافی، هنری که نسل‌به‌نسل منتقل شده است.</p></div><div><h3>صداقت در جنس</h3><p>پشم طبیعی، ابریشم درخشان و جوت خاکی‌رنگ؛ به‌اندازه آنچه باید باشد.</p></div></div><a class="text-link" href="#showroom">یادگار بعدی خود را بیابید ${icon('arrow')}</a></div></div></section>
    <section class="wrap section booking" id="showroom"><div class="booking-copy"><div class="eyebrow">قرار ملاقات؛ همراه شما</div><h2>دعوتی صمیمانه<br>برای <em>یافتن قالی شما.</em></h2><p>الیاف را لمس کنید و داستان‌ها را بشنوید. برای دیداری خصوصی از آرشیو به ما بپیوندید یا در گشت زنده استودیو، همراه آتلیه را به خانه بیاورید.</p><div class="locations">نیویورک &nbsp; · &nbsp; کپنهاگ &nbsp; · &nbsp; میلان</div></div><div id="booking-content"><form id="booking-form" class="booking-form">
      <div class="full"><span class="control-title">نوع مشاوره</span><div class="segmented"><button type="button" data-consultation="private" class="active" aria-pressed="true">بازدید خصوصی از نمایشگاه</button><button type="button" data-consultation="virtual" aria-pressed="false">گشت مجازی در استودیو</button></div></div>
      <label class="field">نام شما<input name="name" autocomplete="name" placeholder="نام و نام خانوادگی" required maxlength="100"></label><label class="field">نشانی ایمیل<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required maxlength="254"></label>
      <label class="field" id="location-field">آتلیه<select name="location"><option value="New York">نیویورک</option><option value="Copenhagen">کپنهاگ</option><option value="Milan">میلان</option></select></label><label class="field">تاریخ پیشنهادی<input name="date" type="date" required min="${bookingToday('New York')}" aria-label="تاریخ پیشنهادی"><span class="form-note">تاریخ محلی نمایشگاه؛ بازدید مجازی بر اساس UTC.</span></label>
      <label class="field full">یادداشتی برای همراه آتلیه (اختیاری)<textarea name="note" rows="2" maxlength="1500" placeholder="کمی از فضای خود برایمان بگویید…"></textarea></label><div class="full"><button class="btn" type="submit">درخواست ملاقات ${icon('arrow')}</button></div><p class="form-note full">این درخواست ملاقات است، نه رزرو قطعی. همراه آتلیه تاریخ پیشنهادی شما را بررسی می‌کند.</p>
    </form></div></section>
  </main>
  <footer class="wrap"><div class="footer-top"><a class="brand" href="#">ATELIER VÉRA<span>هنر بافت</span></a><p>زیبایی، شکیبایی می‌طلبد.</p><div class="footer-links"><a href="#archive">آرشیو</a><a href="#craft">نگاه ما</a><a href="#showroom">با ما در تماس باشید ${icon('arrow')}</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ATELIER VÉRA. تمامی حقوق محفوظ است.</span><span>طراحی سنجیده. &nbsp; هنر ماندگار. &nbsp; زندگی زیباتر.</span></div></footer>
  <dialog class="inspect-dialog" id="inspect-dialog" aria-labelledby="inspect-title"></dialog>
  <dialog class="folio-dialog" id="folio-dialog" aria-labelledby="folio-title"></dialog>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

const originalText = new WeakMap();
const originalAttributes = new WeakMap();
function translatePage() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    node.nodeValue = state.language === 'en' ? translate(originalText.get(node), 'en') : originalText.get(node);
  }
  document.querySelectorAll('[aria-label], [placeholder], [title]').forEach(element => {
    for (const attribute of ['aria-label', 'placeholder', 'title']) {
      if (!element.hasAttribute(attribute)) continue;
      let values = originalAttributes.get(element);
      if (!values) { values = {}; originalAttributes.set(element, values); }
      const current = element.getAttribute(attribute);
      if (!(attribute in values) || current !== values[attribute].last) values[attribute] = { original: current, last: current };
      const translated = state.language === 'en' ? translate(values[attribute].original, 'en') : values[attribute].original;
      element.setAttribute(attribute, translated);
      values[attribute].last = translated;
    }
  });
}

function setLanguage(language) {
  if (!['fa', 'en'].includes(language) || setLanguage.isUpdating) return;
  setLanguage.isUpdating = true;
  try {
    state.language = language;
    try { localStorage.setItem('atelier-vera-language', language); } catch {}
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.title = language === 'fa' ? 'آتلیه ورا | نمایشگاه قالی' : 'Atelier Véra | Rug Showroom';
    document.querySelector('meta[name="description"]').content = language === 'fa'
      ? 'آتلیه ورا؛ آرشیوی گزیده از قالی‌های دست‌بافت. بافته‌هایی استثنایی را در فضای خود بیازمایید و برای مشاوره خصوصی وقت بگیرید.'
      : 'Atelier Véra: a considered archive of handwoven rugs. Preview exceptional weaves in your space and request a private consultation.';
    $('#language-toggle').textContent = language === 'fa' ? 'English' : 'فارسی';
    $('#language-toggle').setAttribute('aria-label', language === 'fa' ? 'Switch language to English' : 'تغییر زبان به فارسی');
    $('#studio-rug').innerHTML = rugs.map(rug => `<option value="${rug.id}">${rugText(rug, 'name')}</option>`).join('');
    $('#studio-rug').value = state.rug;
    $('#color-filter').innerHTML = `<option value="">${language === 'fa' ? 'رنگ غالب' : 'Dominant color'}</option>${[...new Set(rugs.map(rug => rug.dominantColor))].map(color => `<option value="${color}">${specText(color)}</option>`).join('')}`;
    $('#color-filter').value = state.color;
    renderCatalog();
    renderStudio();
    persistFolio();
    if ($('#inspect-dialog').open) inspect(state.inspect, state.inspectSize);
    if ($('#folio-dialog').open) renderFolio();
    updateCurrencyUI();
  } finally {
    setLanguage.isUpdating = false;
  }
}

function updateBookingDate() {
  const form = $('#booking-form');
  const location = form.dataset.consultation === 'virtual' ? 'Virtual Studio' : form.elements.location.value;
  form.elements.date.min = bookingToday(location);
}

function renderCatalog() {
  const filtered = filterRugs(rugs.map(rug => ({ ...rug, searchText: Object.values(rugTranslations[rug.id]).join(' ') })), state);
  if (state.sort === 'low') filtered.sort((a, b) => priceFor(a, state.size || '8x10') - priceFor(b, state.size || '8x10'));
  if (state.sort === 'high') filtered.sort((a, b) => priceFor(b, state.size || '8x10') - priceFor(a, state.size || '8x10'));
  if (state.sort === 'density') filtered.sort((a, b) => b.kpsi - a.kpsi);
  const active = state.style || state.material || state.size || state.origin || state.color || state.search;
  const visible = state.expanded || active || state.sort !== 'featured' ? filtered : filtered.slice(0, 4);
  $('#result-count').textContent = state.language === 'fa'
    ? `${persianDigits(visible.length)} بافته از ${persianDigits(filtered.length)} انتخاب`
    : `${visible.length} of ${filtered.length} rugs`;
  $('#filter-pills').innerHTML = ['style', 'material', 'size', 'origin', 'color', 'search'].filter(key => state[key]).map(key => `<button class="pill" data-clear="${key}" aria-label="${state.language === 'fa' ? 'حذف فیلتر' : 'Remove filter'} ${escape(state[key])}">${escape(key === 'size' ? persianDigits(formatSize(state[key])) : key === 'style' ? localizedStyle(state[key]) : key === 'material' ? localizedMaterial(state[key]) : state[key])} &nbsp; ×</button>`).join('') + (active ? `<button class="reset" id="reset-filters">${state.language === 'fa' ? 'پاک‌کردن فیلترها' : 'Clear filters'}</button>` : '');
  $('#catalog').innerHTML = visible.length ? visible.map((rug, index) => `
    <article class="rug-card"><div class="rug-picture">
      <div class="rug-art">${rug.svgPattern(`card-${rug.id}`, rugText(rug, 'name'))}</div>
      ${index === 0 ? `<span class="card-tag">${state.language === 'fa' ? 'گزیده آتلیه' : 'Atelier selection'}</span>` : ''}
      <button class="card-save" data-action="add" data-id="${rug.id}" aria-label="${state.language === 'fa' ? 'افزودن' : 'Add'} ${rugText(rug, 'name')} ${state.language === 'fa' ? 'به فهرست' : 'to selection'}">${icon('bag')}</button>
      <div class="quick-actions"><button data-action="inspect" data-id="${rug.id}">${icon('eye')} ${state.language === 'fa' ? 'مشاهده بافت' : 'View rug'}</button><button data-action="studio" data-id="${rug.id}">${icon('room')} ${state.language === 'fa' ? 'استودیوی فضا' : 'Room studio'}</button></div>
    </div>
    <div class="card-meta"><span>${rugText(rug, 'style')} / ${rugText(rug, 'material')}</span><span class="mono">${rug.flatweave ? (state.language === 'fa' ? 'تخت‌باف' : 'Flatweave') : `${persianDigits(rug.kpsi)} KPSI`}</span></div>
    <div class="card-bottom"><h3><a href="#inspect" data-action="inspect" data-id="${rug.id}">${rugText(rug, 'name')}</a></h3><span>${money(priceFor(rug, state.size || '8x10'))}</span></div>
    <p class="card-origin">${rugText(rug, 'origin')} &nbsp; · &nbsp; ${sizeLabel(state.size || '8x10')}</p></article>
  `).join('') : `<div class="empty">${state.language === 'fa' ? 'بافته‌ای با این مشخصات پیدا نشد.' : 'No rugs match these filters.'}<br><button class="text-link" id="empty-reset">${state.language === 'fa' ? 'پاک‌کردن فیلترها' : 'Clear filters'} ←</button></div>`;
  $('#view-archive').hidden = !!active || state.sort !== 'featured';
  $('#view-archive').innerHTML = `${state.language === 'fa' ? state.expanded ? 'نمایش گزیده‌های آتلیه' : 'مشاهده همه بافته‌ها' : state.expanded ? 'Show Atelier selections' : 'View all rugs'} <span class="mono">${persianDigits(state.expanded ? 4 : 10)}</span> ${icon('arrow')}`;
  translatePage();
}

function furniture() {
  if (state.room === 'dining') return `<g filter="url(#room-shadow)"><g fill="#a18a6e" stroke="#74604d" stroke-width="2">${[230, 310, 390].map(y => `<rect x="211" y="${y}" width="43" height="48" rx="9"/><rect x="466" y="${y}" width="43" height="48" rx="9"/>`).join('')}<rect x="336" y="164" width="48" height="45" rx="8"/><rect x="336" y="447" width="48" height="45" rx="8"/></g><rect x="250" y="205" width="220" height="245" rx="55" fill="#c4ad88" stroke="#998262" stroke-width="3"/><path d="M270 230v192m20-206v219m28-223v227m28-232v235m30-233v231m30-223v217m29-192v171" stroke="#ab9370" opacity=".5"/><ellipse cx="360" cy="325" rx="30" ry="25" fill="#ddd4bd"/><ellipse cx="360" cy="325" rx="18" ry="15" fill="#79816a"/></g>`;
  if (state.room === 'bedroom') return `<g filter="url(#room-shadow)"><rect x="240" y="82" width="240" height="346" rx="8" fill="#9a8064"/><rect x="231" y="75" width="258" height="26" rx="6" fill="#a38c70"/><rect x="251" y="103" width="218" height="305" rx="6" fill="#eae2d4"/><rect x="265" y="113" width="86" height="56" rx="9" fill="#f7f1e7" stroke="#d1c7b9"/><rect x="369" y="113" width="86" height="56" rx="9" fill="#f7f1e7" stroke="#d1c7b9"/><path d="M251 202h218v176H251Z" fill="#b4b19a"/><path d="M255 208h210M255 218h210M260 205v170M450 205v170" stroke="#93967d" opacity=".5"/><path d="M251 358h218v36H251Z" fill="#c8b99f"/><rect x="159" y="100" width="61" height="64" rx="4" fill="#9d8468"/><rect x="500" y="100" width="61" height="64" rx="4" fill="#9d8468"/><circle cx="190" cy="132" r="16" fill="#e7ddc9"/><circle cx="530" cy="132" r="16" fill="#e7ddc9"/></g>`;
  return `<g filter="url(#room-shadow)"><rect x="205" y="96" width="310" height="100" rx="14" fill="#c3b59c"/><rect x="219" y="100" width="282" height="70" rx="10" fill="#e1d7c4"/><path d="M312 106v60m94-60v60" stroke="#c3b79f" stroke-width="2"/><rect x="208" y="96" width="24" height="102" rx="7" fill="#cabb9f"/><rect x="489" y="96" width="24" height="102" rx="7" fill="#cabb9f"/><rect x="238" y="109" width="45" height="43" rx="5" fill="#94977b" transform="rotate(-8 260 130)"/><rect x="424" y="108" width="42" height="43" rx="5" fill="#b7987c" transform="rotate(10 445 130)"/><rect x="281" y="269" width="160" height="105" rx="44" fill="#a28b6d"/><rect x="288" y="275" width="146" height="91" rx="40" fill="#bbab8f"/><rect x="319" y="293" width="36" height="48" fill="#eee5d4" transform="rotate(-12 337 317)"/><circle cx="389" cy="323" r="16" fill="#87785e"/><circle cx="389" cy="323" r="11" fill="#bfb39a"/><g transform="rotate(20 180 375)"><rect x="138" y="329" width="87" height="98" rx="20" fill="#9d876d"/><rect x="147" y="344" width="68" height="67" rx="12" fill="#ded2bc"/></g><g transform="rotate(-20 542 375)"><rect x="499" y="329" width="87" height="98" rx="20" fill="#9d876d"/><rect x="508" y="344" width="68" height="67" rx="12" fill="#ded2bc"/></g><circle cx="568" cy="164" r="25" fill="#89775f"/><circle cx="568" cy="164" r="13" fill="#d2c7af"/><path d="m568 160-14-25m14 25 13-24" stroke="#6a7756" stroke-width="6"/></g>`;
}

function renderStudio() {
  const rug = rugs.find(item => item.id === state.rug);
  const [metresWidth, metresHeight] = dimensions[state.studioSize];
  const width = metresWidth / 0.3048 * 32;
  const height = metresHeight / 0.3048 * 32;
  const floor = { oak: ['#d8c7a9', '#b6a080'], walnut: ['#715840', '#4f3929'], concrete: ['#bab9b1', '#9c9b94'] }[state.floor];
  $('#room-stage').classList.toggle('evening', state.light === 'evening');
  const roomName = state.room === 'living' ? (state.language === 'fa' ? 'اتاق نشیمن' : 'Living room') : state.room === 'dining' ? (state.language === 'fa' ? 'اتاق ناهارخوری' : 'Dining room') : (state.language === 'fa' ? 'اتاق‌خواب' : 'Bedroom');
  $('#room-stage').innerHTML = `<span class="stage-caption">${roomName} / ${state.language === 'fa' ? 'تناسبی سنجیده' : 'Considered proportions'}</span>
    <svg class="room" viewBox="0 0 720 560" role="img" aria-label="${rugText(rug, 'name')} در ${state.room === 'living' ? 'اتاق نشیمن' : state.room === 'dining' ? 'اتاق ناهارخوری' : 'اتاق‌خواب'} با کف ${state.floor === 'oak' ? 'بلوط' : state.floor === 'walnut' ? 'گردو' : 'بتن'}، اندازه ${sizeLabel(state.studioSize)}، ${state.rotated ? 'چرخش ۹۰ درجه، ' : ''}${state.light === 'day' ? 'نور روز' : 'نور عصر'}">
      <defs><pattern id="floor-grain" width="60" height="560" patternUnits="userSpaceOnUse"><rect width="60" height="560" fill="${floor[0]}"/><path d="M0 0v560M5 0v560M14 0Q35 150 15 280T18 560M40 0Q60 150 45 280T42 560" stroke="${floor[1]}" stroke-opacity=".3" fill="none"/></pattern><filter id="room-shadow"><feDropShadow dx="4" dy="8" stdDeviation="6" flood-color="#302719" flood-opacity=".2"/></filter><linearGradient id="room-light" x2="1" y2=".6"><stop stop-color="${state.light === 'day' ? '#fffbea' : '#ffd38b'}" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <rect width="720" height="560" fill="${state.floor === 'concrete' ? floor[0] : 'url(#floor-grain)'}"/><path d="M42 37h636v486H42Z" fill="none" stroke="${floor[1]}" stroke-opacity=".45" stroke-width="2"/><path d="M45 40h630M45 40v480" stroke="#f7f4ef" stroke-opacity=".45" stroke-width="7"/>
      <g transform="translate(360 325) rotate(${state.rotated ? 90 : 0})" filter="url(#room-shadow)">${rug.svgPattern('studio-art', rugText(rug, 'name')).replace('<svg ', `<svg x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" preserveAspectRatio="none" `)}</g>
      ${furniture()}<path d="M42 40H190L430 520H215Z" fill="url(#room-light)" pointer-events="none"/>
      <path d="M55 477v10m0-5h160m0-5v10" stroke="#514737" stroke-width="2" fill="none"/>
      <text x="55" y="502" font-size="11" fill="#514737" direction="ltr">5 ft / 1.52 m</text>
    </svg><div class="stage-scale"><span>${state.language === 'fa' ? 'مقیاس تقریبی' : 'Approximate scale'}</span><span class="mono">${sizeLabel(state.studioSize)} &nbsp; / &nbsp; ${rug.sku}</span></div>`;
  translatePage();
}

function inspect(id, size = state.size || '8x10') {
  const rug = rugs.find(item => item.id === id);
  if (!rug || !sizes.includes(size)) return;
  state.inspect = rug.id;
  state.inspectSize = size;
  const specs = [
    ['خاستگاه', rugText(rug, 'origin')],
    ['تراکم گره', rug.flatweave ? translate('تخت‌باف؛ بدون گره', state.language) : `${persianDigits(rug.kpsi)} KPSI`],
    ['تار و پود', specText(rug.foundation)],
    ['جنس پرز', specText(rug.pile)],
    ['رنگرزی', specText(rug.dye)],
    ['قدمت و وضعیت', specText(rug.condition)],
    ['ارتفاع پرز', persianDigits(rug.pileHeight)],
    ['شناسه آرشیو', rug.sku],
  ];
  $('#inspect-dialog').innerHTML = `
    <button class="icon-btn modal-close" data-close="inspect-dialog" aria-label="بستن جزئیات">${icon('close')}</button>
    <div class="inspect-layout"><div class="inspect-art">
      <div class="zoom-window" tabindex="0" role="group" aria-label="بررسی بافت با کلیدهای جهت‌نما" aria-describedby="zoom-help">
        <div class="zoom-art">${rug.svgPattern('inspect-art', rugText(rug, 'name'))}</div>
        <div class="inspection-lens" aria-hidden="true" hidden>${rug.svgPattern('inspect-lens', rugText(rug, 'name'))}</div>
      </div>
      <button class="zoom-controls" id="zoom" aria-pressed="false">${icon('search')} &nbsp; ذره‌بین بافت</button>
      <p class="form-note" id="zoom-help">ذره‌بین را فعال کنید؛ حرکت اشاره‌گر، لمس یا کلیدهای جهت‌نما.</p>
      <p class="demo-note">تصویر برداری نمایشی؛ برای بررسی اصالت، عکس واقعی درخواست کنید.</p>
    </div><div class="inspect-copy"><div class="eyebrow">${rugText(rug, 'collection')}</div>
      <h2 id="inspect-title">${rugText(rug, 'name')}</h2><p>${rugText(rug, 'description')}</p>
      <div class="spec-heading">شناسنامه و مشخصات بافت</div><dl class="spec-grid">${specs.map(([label, value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>
      <p class="demo-note">اطلاعات نمونه؛ شناسنامه معتبر فروشنده پیش از خرید الزامی است.</p>
      <label class="control-title" for="inspect-size">ابعاد دلخواه</label><select class="control-select" id="inspect-size">${rug.sizes.map(value => `<option value="${value}" ${value === size ? 'selected' : ''}>${sizeLabel(value)}</option>`).join('')}</select>
      <div class="modal-price"><strong id="inspect-price">${money(priceFor(rug, size))}</strong><span>قیمت تقریبی؛ تأیید با گالری</span></div>
      <p class="form-note currency-disclaimer"></p>
      <a class="btn vip-inquiry" id="vip-inquiry" target="_blank" rel="noopener noreferrer"></a>
      <p class="form-note vip-unavailable" hidden>برای فعال‌سازی واتس‌اپ، شماره گالری را تنظیم کنید.</p>
      <button class="btn outline" data-action="add-inspect">${icon('bag')} افزودن به فهرست انتخاب ${icon('arrow')}</button>
      <button class="text-link" data-action="studio" data-id="${rug.id}">مشاهده در استودیوی فضا ${icon('arrow')}</button>
    </div></div>`;
  translatePage();
  setupMagnifier($('.zoom-window'), $('#zoom'));
  updateCurrencyUI();
  if (!$('#inspect-dialog').open) $('#inspect-dialog').showModal();
}

function persistFolio() {
  try { localStorage.setItem('atelier-vera-folio', JSON.stringify(state.folio)); } catch { notify('فهرست انتخاب شما فقط برای این بازدید در دسترس است؛ فضای ذخیره‌سازی مرورگر فعال نیست.'); }
  $('#folio-count').textContent = persianDigits(state.folio.length);
  $('.folio-trigger').setAttribute('aria-label', `${state.language === 'fa' ? 'فهرست انتخاب' : 'My selection'}, ${persianDigits(state.folio.length)} ${state.language === 'fa' ? 'بافته' : 'rugs'}`);
  translatePage();
}

function addFolio(id, size) {
  if (!rugs.some(rug => rug.id === id) || !sizes.includes(size)) return;
  if (state.folio.some(item => item.id === id && item.size === size)) { notify('این بافته با این اندازه از پیش در فهرست شماست.'); return; }
  if (state.folio.length >= 50) { notify('فهرست شما پُر است؛ برای افزودن بافته‌ای دیگر، یکی را حذف کنید.'); return; }
  state.folio.push({ id, size });
  persistFolio();
  notify(`${rugText(rugs.find(rug => rug.id === id), 'name')} به فهرست شما افزوده شد.`);
}

function renderFolio() {
  const total = state.folio.reduce((sum, item) => sum + priceFor(rugs.find(rug => rug.id === item.id), item.size), 0);
  $('#folio-dialog').innerHTML = `<button class="icon-btn modal-close" data-close="folio-dialog" aria-label="بستن فهرست انتخاب">${icon('close')}</button><div class="eyebrow">گزیده‌ای سنجیده</div><h2 id="folio-title">فهرست انتخاب شما</h2><p>چند بافته که ارزش شناختن دارند.<br>برای آوردن انتخابتان به خانه همراه شما هستیم.</p><div class="folio-items">${state.folio.length ? state.folio.map((item, index) => {
    const rug = rugs.find(piece => piece.id === item.id);
    return `<div class="folio-item"><div class="mini-art">${rug.svgPattern(`folio-${index}`, rugText(rug, 'name'))}</div><div><h3>${rugText(rug, 'name')}</h3><p class="mono">${sizeLabel(item.size)} · ${rug.sku}</p><strong>${money(priceFor(rug, item.size))}</strong></div><button data-remove="${index}" aria-label="حذف ${rugText(rug, 'name')}">${icon('close')}</button></div>`;
  }).join('') : '<div class="empty-folio">فهرست شما در انتظار نخستین داستان است.<br><button class="text-link" data-close="folio-dialog">گشت‌وگذار در آرشیو ←</button></div>'}</div>${state.folio.length ? `<div class="folio-total"><span>ارزش تخمینی آرشیو</span><strong>${money(total)}</strong></div><form class="folio-form" id="folio-form"><label class="field">نام شما<input name="name" autocomplete="name" required maxlength="100" placeholder="نام و نام خانوادگی"></label><label class="field">نشانی ایمیل<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label><label class="field">نوع درخواست<select name="type"><option value="Private acquisition">خرید خصوصی</option><option value="Trade / Interior design">همکاری تجاری / طراحی داخلی</option></select></label><button class="btn" type="submit">درخواست خرید خصوصی ${icon('arrow')}</button><p class="form-note">این درخواست خرید نیست و پرداختی دریافت نمی‌شود. اطلاعات شما فقط برای پاسخ به درخواستتان استفاده می‌شود.</p></form>` : ''}`;
  translatePage();
}

function selectStudio(id) {
  if (!rugs.some(rug => rug.id === id)) return;
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
  for (const key of ['style', 'material', 'size', 'origin', 'color', 'search']) state[key] = '';
  for (const id of ['style-filter', 'material-filter', 'size-filter', 'origin-filter', 'color-filter', 'search']) $(`#${id}`).value = '';
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
  if (action === 'open-folio') { if (!pendingRequests.inquiry) renderFolio(); $('#folio-dialog').showModal(); }
  if (['inspect-dialog', 'folio-dialog'].includes(close)) $(`#${close}`).close();
  if (['style', 'material', 'size', 'origin', 'color', 'search'].includes(clear)) {
    state[clear] = '';
    $(`#${clear === 'search' ? 'search' : `${clear}-filter`}`).value = '';
    renderCatalog();
  }
  if (button.id === 'reset-filters' || button.id === 'empty-reset') resetFilters();
  if (button.id === 'view-archive') { state.expanded = !state.expanded; renderCatalog(); }
  if (button.id === 'studio-inspect') inspect(state.rug, state.studioSize);
  if (button.id === 'rotate') { state.rotated = !state.rotated; button.setAttribute('aria-pressed', String(state.rotated)); renderStudio(); }
  if (room || floor || studioSize || light) {
    const key = room ? 'room' : floor ? 'floor' : studioSize ? 'studioSize' : 'light';
    const value = room || floor || studioSize || light;
    const allowed = { room: ['living', 'dining', 'bedroom'], floor: ['oak', 'walnut', 'concrete'], studioSize: sizes, light: ['day', 'evening'] };
    if (!allowed[key].includes(value)) return;
    state[key] = value;
    updatePressed(`[data-${key === 'studioSize' ? 'studio-size' : key}]`, key, key);
    renderStudio();
  }
  if (remove !== undefined && !pendingRequests.inquiry && /^\d+$/.test(remove) && Number(remove) < state.folio.length) { state.folio.splice(Number(remove), 1); persistFolio(); renderFolio(); }
  if (['private', 'virtual'].includes(consultation)) {
    $('#booking-form').dataset.consultation = consultation;
    document.querySelectorAll('[data-consultation]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    $('#location-field').hidden = consultation === 'virtual';
    $('#location-field select').disabled = consultation === 'virtual';
    updateBookingDate();
  }
});

for (const key of ['style', 'material', 'size', 'origin', 'color']) $(`#${key}-filter`).addEventListener('change', event => {
  const value = event.target.value;
  const allowed = key === 'size' ? sizes : key === 'origin' ? rugs.map(rug => rug.city) : key === 'color' ? rugs.map(rug => rug.dominantColor) : key === 'style' ? rugs.flatMap(rug => [rug.style, rug.category]) : rugs.map(rug => rug[key]);
  if (value && !allowed.includes(value)) return;
  state[key] = value;
  renderCatalog();
});
$('#search').addEventListener('input', event => { state.search = event.target.value; renderCatalog(); });
$('#sort').addEventListener('change', event => {
  if (!['featured', 'low', 'high', 'density'].includes(event.target.value)) return;
  state.sort = event.target.value;
  renderCatalog();
});
$('#studio-rug').addEventListener('change', event => {
  if (!rugs.some(rug => rug.id === event.target.value)) return;
  state.rug = event.target.value;
  renderStudio();
});
$('#location-field select').addEventListener('change', updateBookingDate);
$('#inspect-dialog').addEventListener('change', event => {
  if (event.target.id === 'inspect-size' && sizes.includes(event.target.value)) {
    state.inspectSize = event.target.value;
    $('#inspect-price').innerHTML = money(priceFor(rugs.find(rug => rug.id === state.inspect), state.inspectSize));
    updateCurrencyUI();
  }
});
$('#language-toggle').addEventListener('click', () => setLanguage(state.language === 'fa' ? 'en' : 'fa'));
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
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  const booking = form.id === 'booking-form';
  const kind = booking ? 'appointment' : 'inquiry';
  if (pendingRequests[kind]) return;
  if (booking) data.consultation = form.dataset.consultation || 'private';
  else data.selection = state.folio.map(({ id, size }) => ({ id, size }));
  if (booking && data.date < bookingToday(data.consultation === 'virtual' ? 'Virtual Studio' : data.location)) { updateBookingDate(); notify('لطفاً تاریخ امروز یا روزی در آینده را انتخاب کنید.'); return; }
  const submit = form.querySelector('[type="submit"]');
  pendingRequests[kind] = true;
  if (!booking) $('#folio-dialog').querySelectorAll('[data-remove]').forEach(button => { button.disabled = true; });
  submit.disabled = true;
  const originalLabel = submit.innerHTML;
  submit.textContent = 'در حال ارسال درخواست…';
  try {
    const response = await fetch(booking ? '/api/appointments' : '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout(15000) });
    const result = await response.json();
    if (!response.ok) throw new Error('در ارسال درخواست مشکلی پیش آمد. لطفاً دوباره تلاش کنید.');
    const panel = `<span class="success-icon">${icon('check')}</span><h3>${booking ? 'قرار ملاقاتی با زیبایی.' : 'درخواست شما دریافت شد.'}</h3><p>سپاس از شما، ${escape(data.name)}. ${booking ? `درخواست ${data.consultation === 'virtual' ? 'گشت مجازی در استودیو' : `بازدید خصوصی در ${escape(data.location)}`} برای تاریخ <strong>${escape(persianDigits(data.date))}</strong> دریافت شد.` : `درخواست «${data.type === 'Private acquisition' ? 'خرید خصوصی' : 'همکاری تجاری / طراحی داخلی'}» شما شامل ${persianDigits(data.selection.length)} بافته است.`}</p><p class="form-note">شناسه پیگیری: <span class="mono">${escape(result.reference)}</span>. ${booking ? 'تاریخ پیشنهادی شما پس از تأیید همراه آتلیه نهایی می‌شود.' : 'پرداختی انجام نشده است.'}</p>`;
    if (booking) $('#booking-content').innerHTML = `<div class="success-panel" role="status">${panel}</div>`;
    else $('#folio-dialog').innerHTML = `<button class="icon-btn modal-close" data-close="folio-dialog" aria-label="بستن فهرست انتخاب">${icon('close')}</button><div class="eyebrow">آغازی تازه</div><h2 id="folio-title">آغازی زیبا.</h2><div class="success-panel" role="status">${panel}</div>`;
    translatePage();
  } catch (error) {
    notify(error.name === 'TimeoutError' ? 'زمان ارسال درخواست به پایان رسید. لطفاً دوباره تلاش کنید.' : error instanceof TypeError ? 'اتصال برقرار نشد. لطفاً پس از اتصال دوباره تلاش کنید.' : error.message);
  } finally {
    pendingRequests[kind] = false;
    if (!booking) $('#folio-dialog').querySelectorAll('[data-remove]').forEach(button => { button.disabled = false; });
    submit.disabled = false;
    submit.innerHTML = originalLabel;
  }
});

function updateCurrencyUI() {
  const { currency, snapshot, loading } = currencyStore.getState();
  $('#currency-select').value = currency;
  const fa = state.language === 'fa';
  const indicative = snapshot.source === 'illustrative-baseline';
  const stale = snapshot.status === 'stale';
  const updated = snapshot.fetchedAt ? new Intl.DateTimeFormat(fa ? 'fa-IR' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(snapshot.fetchedAt)) : '';
  const source = snapshot.source === 'alanchand' ? 'AlanChand adapter' : snapshot.source === 'open-er-api' ? 'open.er-api.com' : snapshot.source;
  const tomanIndicative = snapshot.tomanSource !== 'alanchand';
  const status = loading
    ? (fa ? 'در حال دریافت نرخ ارز…' : 'Refreshing exchange rates…')
    : indicative
      ? (fa ? 'نرخ‌های نمونه و تقریبی؛ نرخ زنده در دسترس نیست.' : 'Illustrative baseline rates; live rates unavailable.')
      : `${stale ? (fa ? 'نرخ ذخیره‌شده منقضی؛ اتصال برقرار نیست. ' : 'Stale cached rates; live refresh unavailable. ') : ''}${fa ? 'منبع نرخ' : 'Rate source'}: ${source}${updated ? ` · ${updated}` : ''}`;
  const disclaimer = fa
    ? `قیمت‌ها تقریبی‌اند؛ مبلغ نهایی با گالری تأیید شود.${tomanIndicative ? ' نرخ تومان نمونه است، نه نرخ بازار. هر تومان = ۱۰ ریال.' : ' هر تومان = ۱۰ ریال.'}`
    : `Indicative prices; confirm the final quote with the gallery.${tomanIndicative ? ' Toman uses an illustrative rate, not a market quote.' : ''} 1 toman = 10 rials.`;
  $('#rate-status').textContent = `${status} ${disclaimer}`;
  $('#rate-status').classList.toggle('loading', loading);
  document.querySelectorAll('.currency-disclaimer').forEach(element => { element.textContent = disclaimer; });
  document.querySelectorAll('[data-price-usd]').forEach(element => { element.textContent = priceText(Number(element.dataset.priceUsd)); });
  const link = $('#vip-inquiry');
  if (link && state.inspect) {
    const rug = rugs.find(item => item.id === state.inspect);
    const href = whatsappInquiry(env.VITE_WHATSAPP_NUMBER, { rug, size: formatSize(state.inspectSize), price: `${priceText(priceFor(rug, state.inspectSize))} (${currency})` });
    link.hidden = !href;
    $('.vip-unavailable').hidden = !!href;
    if (href) link.href = href;
    else link.removeAttribute('href');
    link.textContent = fa ? 'مشاوره و خرید خصوصی در واتس‌اپ ↗' : 'Inquire / buy via WhatsApp ↗';
  }
}

$('#currency-select').addEventListener('change', event => currencyStore.setCurrency(event.target.value));
currencyStore.subscribe(updateCurrencyUI);
setLanguage(state.language);
currencyStore.refresh();
