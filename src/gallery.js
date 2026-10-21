import { dimensions } from './rugs.js';

export const galleryViews = ['layout', 'room', 'reverse', 'fringe'];

export function dimensionsLabel(size) {
  const [width, length] = dimensions[size];
  return `${Math.round(width * 100)} × ${Math.round(length * 100)} cm / ${(width / 0.3048).toFixed(1)} × ${(length / 0.3048).toFixed(1)} ft`;
}

export function roomPreview(rug, prefix, size = '8x10', room = 'living') {
  const [width, length] = dimensions[size];
  const rugWidth = width * 65;
  const rugLength = length * 65;
  const rugArtwork = rug.svgPattern(`${prefix}-rug`, '').replace(/^<svg[^>]*>/, '<g>').replace('</svg>', '</g>');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 580" aria-hidden="true">
    <defs><linearGradient id="${prefix}-wall" x2="1" y2="1"><stop stop-color="#f0e9df"/><stop offset="1" stop-color="#cec3b4"/></linearGradient></defs>
    <path fill="url(#${prefix}-wall)" d="M0 0h560v340H0z"/>
    <path fill="#cbb89b" d="M0 340h560v240H0z"/>
    <path d="M0 400h560M0 480h560M100 340 40 580M300 340l20 240M480 340l80 240" stroke="#b5a084" opacity=".5"/>
    <path d="M45 0v338M53 0v338" stroke="#c7bcac"/>
    <rect x="365" y="70" width="100" height="140" fill="#9c8a74"/>
    <rect x="373" y="78" width="84" height="124" fill="#e8dfcf"/>
    <path d="M390 180q-5-100 50-65v65" fill="#92947d"/>
    <g transform="translate(280 420) scale(1 .57) rotate(-12)">
      <g transform="scale(${rugWidth / 340} ${rugLength / 440}) translate(-170 -220)">${rugArtwork}</g>
    </g>
    ${room === 'bedroom' ? `<g aria-label="Bedroom furniture"><rect x="135" y="222" width="280" height="145" rx="9" fill="#a89780"/><path d="M148 245h254l32 180H118z" fill="#ede5d8"/><path d="M130 350h291l13 75H118z" fill="#b2b09b"/><rect x="160" y="256" width="100" height="49" rx="9" fill="#faf6ee"/><rect x="284" y="256" width="100" height="49" rx="9" fill="#faf6ee"/><rect x="62" y="300" width="55" height="62" fill="#8f775f"/><ellipse cx="90" cy="287" rx="22" ry="12" fill="#e8dcc6"/></g>` : room === 'dining' ? `<g aria-label="Dining room furniture"><path d="M145 340v117m257-117v117" stroke="#7a6249" stroke-width="10"/><g fill="#b8aa92" stroke="#8e7b61" stroke-width="3"><rect x="105" y="280" width="60" height="90" rx="15"/><rect x="375" y="280" width="60" height="90" rx="15"/><rect x="130" y="390" width="65" height="85" rx="15"/><rect x="350" y="390" width="65" height="85" rx="15"/></g><ellipse cx="275" cy="355" rx="161" ry="59" fill="#a48b6c"/><ellipse cx="275" cy="348" rx="161" ry="59" fill="#c2ae8f"/><ellipse cx="275" cy="342" rx="28" ry="10" fill="#eee5d6"/><path d="M265 332h20l-4-37h-12z" fill="#6f7864"/></g>` : `<path d="M90 250h305v105H90z" fill="#b7a58d"/>
    <rect x="103" y="243" width="280" height="80" rx="13" fill="#e4d9c7"/>
    <path d="M196 249v70m95-70v70" stroke="#c8b99f"/>
    <rect x="86" y="281" width="26" height="85" rx="6" fill="#cebea5"/>
    <rect x="375" y="281" width="26" height="85" rx="6" fill="#cebea5"/>
    <rect x="130" y="264" width="48" height="43" rx="5" fill="#8a8d73" transform="rotate(-10 154 285)"/>
    <ellipse cx="293" cy="425" rx="68" ry="27" fill="#8a7056"/>
    <path d="M246 428v44m94-44v44" stroke="#715a44" stroke-width="6"/>
    <ellipse cx="293" cy="421" rx="23" ry="9" fill="#d8cbb8"/>`}
    <path d="M475 354v-96m0 37q-55-65-29-67m29 50q25-63 43-43" fill="none" stroke="#6e775e" stroke-width="5"/>
    <path d="M452 336h46l-8 47h-30z" fill="#aa8467"/>
    <path d="M0 0h135l230 580H185z" fill="#fff8e5" opacity=".12"/>
  </svg>`;
}

export function galleryArtwork(rug, view, prefix, size) {
  if (view === 'room') return roomPreview(rug, prefix, size);
  if (view === 'reverse') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 440" aria-hidden="true">
      <defs><pattern id="${prefix}-weft" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#c8b69b"/><path d="M0 1h6M1 0v6" stroke="#88775f" stroke-width="1"/><path d="M0 4h6" stroke="#e5dac8"/></pattern></defs>
      <path d="M12 4h316v432H12z" fill="#e1d4bd"/><path d="M12 15h316v410H12z" fill="url(#${prefix}-weft)"/>
    </svg>`;
  }
  const artwork = rug.svgPattern(prefix, '');
  return view === 'fringe' ? artwork.replace('viewBox="0 0 340 440"', 'viewBox="0 360 120 80"') : artwork;
}

export const artworkSource = artwork => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(artwork)}`;
