const records = [
  ['oushak', 'The Oushak Heirloom', 'Anatolian Archive', 'Oushak, Türkiye', 'Persian', 'Wool', 4200, 120, '8 mm', '5 months', 'A sun-washed heirloom in terracotta and oat. Hand-spun wool and generous botanical motifs carry the quiet poetry of Anatolian weaving.', ['#caa57e', '#a3563e', '#dcc6a4', '#777a5a'], 'botanical'],
  ['atlas', 'The Atlas Ivory', 'Atlas Collection', 'Atlas Mountains, Morocco', 'Moroccan', 'Wool', 2800, 65, '22 mm', '3 months', 'Cloud-soft mountain wool, intersected by an irregular charcoal lattice. A tactile expression of the Beni Ourain weaving tradition.', ['#e9dfc8', '#514a3d', '#d0c1a2', '#e5d5b6'], 'diamond'],
  ['jaipur', 'The Jaipur Sand', 'Contemporary Loom', 'Jaipur, India', 'Modern', 'Wool', 3400, 150, '6 mm', '4 months', 'Sculptural arches and earthen planes meet in a softly balanced composition. A contemporary weave made slowly, by hand.', ['#d7c1a2', '#b78b64', '#eee2cd', '#7b8067'], 'arches'],
  ['tabriz', 'The Tabriz Garden', 'Persian Archive', 'Tabriz, Iran', 'Persian', 'Silk', 8900, 420, '4 mm', '12 months', 'An intricate garden of palmettes and trailing vines, woven in luminous silk. A fine-knot composition with extraordinary depth and definition.', ['#8a473b', '#d1ad7c', '#e3cba5', '#464f46'], 'medallion'],
  ['sahara', 'The Sahara Line', 'Quiet Essentials', 'Marrakesh, Morocco', 'Minimalist', 'Jute', 1600, 45, '5 mm', '2 months', 'Unbleached jute and a spare linear rhythm. Honest texture, natural variation, and an understated grounding presence.', ['#cfb68c', '#8e785d', '#e0cda7', '#b29a73'], 'lines'],
  ['kars', 'The Kars Kilim', 'Anatolian Archive', 'Kars, Türkiye', 'Kilim', 'Wool', 2400, 80, '3 mm', '3 months', 'Stepped diamonds in brick, indigo, and faded flax. A flatwoven interpretation of an enduring Anatolian geometric language.', ['#be8f71', '#854a39', '#d9bd8e', '#565e60'], 'kilim'],
  ['dune', 'The Dune Study', 'Contemporary Loom', 'Bhadohi, India', 'Modern', 'Silk', 5600, 280, '5 mm', '7 months', 'Overlapping tonal fields suggest the shifting contours of a dune. Silk catches the light differently with every change of perspective.', ['#c3b49b', '#978a74', '#ded2bb', '#ab9a7b'], 'contours'],
  ['rif', 'The Rif Olive', 'Atlas Collection', 'Rif Mountains, Morocco', 'Moroccan', 'Wool', 3100, 90, '18 mm', '4 months', 'An olive-toned field with expressive ivory marks. Plush local wool brings a relaxed, beautifully imperfect character to the room.', ['#8b8d70', '#e8dfc7', '#6d725b', '#b3b095'], 'diamond'],
  ['agra', 'The Agra Palmette', 'Persian Archive', 'Agra, India', 'Persian', 'Wool', 6400, 240, '7 mm', '8 months', 'Oversized palmettes unfold across an antique blush ground. Vegetable-inspired hues and dense wool create a richly layered, enduring piece.', ['#c39786', '#736f58', '#e3c8aa', '#a15d48'], 'botanical'],
  ['linen', 'The Linen Ground', 'Quiet Essentials', 'Jaipur, India', 'Minimalist', 'Jute', 1900, 55, '4 mm', '2 months', 'A restrained checkerboard of natural fibers. Subtle tonal contrast celebrates the raw beauty of the material and the hand of the maker.', ['#d8c8aa', '#b9a889', '#e5d9c3', '#cabb9e'], 'check'],
];

export const sizes = ['8x10', '9x12', '10x14'];
export const sizeLabel = size => size.replace('x', '′ × ') + '′';
export const priceFor = (rug, size) => Math.round(rug.price * ({ '8x10': 1, '9x12': 1.35, '10x14': 1.75 }[size] || 1));
export const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

function pattern(type, c) {
  if (type === 'diamond' || type === 'kilim') {
    return `<pattern id="motif" width="100" height="120" patternUnits="userSpaceOnUse"><path d="${type === 'kilim' ? 'M50 7 65 25 65 38 82 38 82 60 65 60 65 83 50 108 35 83 35 60 18 60 18 38 35 38 35 25Z' : 'M50 5 95 60 50 115 5 60Z'}" fill="${type === 'kilim' ? c[1] : 'none'}" stroke="${c[1]}" stroke-width="3"/><path d="M50 32 72 60 50 88 28 60Z" fill="${type === 'kilim' ? c[2] : 'none'}" stroke="${c[2]}" stroke-width="2"/></pattern>`;
  }
  if (type === 'botanical' || type === 'medallion') {
    return `<pattern id="motif" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M0 100Q30 15 100 0M0 0Q70 85 100 100" fill="none" stroke="${c[3]}" stroke-width="2"/><g fill="${c[2]}" stroke="${c[1]}" stroke-width="2"><path d="M50 17Q70 35 50 50Q30 35 50 17ZM50 83Q30 65 50 50Q70 65 50 83ZM17 50Q35 30 50 50Q35 70 17 50ZM83 50Q65 70 50 50Q65 30 83 50Z"/><circle cx="50" cy="50" r="8" fill="${c[1]}"/><path d="M7 7Q27 0 22 22Q0 27 7 7Z"/></g></pattern>`;
  }
  if (type === 'arches') return `<pattern id="motif" width="150" height="180" patternUnits="userSpaceOnUse"><path d="M10 180V85a65 65 0 0 1 130 0v95" fill="${c[1]}"/><path d="M35 180V90a40 40 0 0 1 80 0v90" fill="${c[2]}"/><path d="M60 180V95a15 15 0 0 1 30 0v85" fill="${c[3]}"/></pattern>`;
  if (type === 'contours') return `<pattern id="motif" width="300" height="240" patternUnits="userSpaceOnUse"><path d="M-50 200Q50-40 180 90T350 20V240H-50" fill="${c[1]}"/><path d="M-50 240Q80 15 200 140T350 75V240" fill="${c[2]}"/><path d="M0 250Q110 90 240 195T350 145" fill="none" stroke="${c[3]}" stroke-width="18"/></pattern>`;
  if (type === 'check') return `<pattern id="motif" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="${c[1]}"/><rect x="40" y="40" width="40" height="40" fill="${c[1]}"/></pattern>`;
  return `<pattern id="motif" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 7H40M0 12H40M0 30H40" stroke="${c[1]}" stroke-width="1"/><path d="M8 0V40M25 0V40" stroke="${c[2]}" stroke-width="2"/></pattern>`;
}

export const rugs = records.map(([id, name, collection, origin, style, material, price, kpsi, pileHeight, loomTime, description, colors, motif], index) => ({
  id, sku: `AV-${String(index + 1).padStart(3, '0')}`, name, collection, origin, style, material, sizes: [...sizes], price, kpsi, pileHeight, loomTime, description,
  svgPattern(prefix = id) {
    const artwork = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 440" role="img" aria-label="${name} handwoven rug">
      <defs>${pattern(motif, colors)}<pattern id="weft" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 1H4M1 0V4" stroke="#342719" stroke-opacity=".13" stroke-width=".6"/><path d="M0 3H4" stroke="#fff" stroke-opacity=".17" stroke-width=".6"/></pattern><pattern id="fringe" width="5" height="12" patternUnits="userSpaceOnUse"><path d="M2 0 1 12M3 0 4 11" stroke="${colors[2]}" stroke-width="1.5"/></pattern></defs>
      <rect x="12" y="2" width="316" height="436" fill="url(#fringe)"/>
      <rect x="10" y="14" width="320" height="412" fill="${colors[0]}"/>
      <rect x="17" y="21" width="306" height="398" fill="none" stroke="${colors[1]}" stroke-width="3"/>
      <rect x="24" y="28" width="292" height="384" fill="none" stroke="${colors[2]}" stroke-width="7"/>
      <rect x="36" y="40" width="268" height="360" fill="url(#motif)"/>
      ${motif === 'medallion' ? `<path d="M170 105 235 220 170 335 105 220Z" fill="${colors[3]}" stroke="${colors[2]}" stroke-width="6"/><path d="M170 150 209 220 170 290 131 220Z" fill="${colors[1]}" stroke="${colors[2]}" stroke-width="3"/><circle cx="170" cy="220" r="18" fill="${colors[2]}"/>` : ''}
      <rect x="10" y="14" width="320" height="412" fill="url(#weft)"/>
    </svg>`;
    return artwork.replaceAll('id="', `id="${prefix}-`).replaceAll('url(#', `url(#${prefix}-`);
  },
}));
