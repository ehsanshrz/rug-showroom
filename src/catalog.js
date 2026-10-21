import { dimensions, priceFor } from './rugs.js';

export const colorPalette = [
  { name: 'Terracotta', hex: '#a3563e', tones: ['Terracotta', 'Blush'] },
  { name: 'Indigo', hex: '#454f65', tones: ['Indigo'] },
  { name: 'Olive', hex: '#74795b', tones: ['Olive'] },
  { name: 'Cream', hex: '#e9dfc8', tones: ['Ivory', 'Sand'] },
  { name: 'Charcoal', hex: '#343330', tones: ['Charcoal'] },
];

export function filterRugs(rugs, filters) {
  const search = (filters.search || '').trim().toLocaleLowerCase();
  return rugs.filter(rug =>
    (!filters.style || rug.style === filters.style || rug.category === filters.style) &&
    (!filters.material || rug.material === filters.material) &&
    (!filters.size || rug.sizes.includes(filters.size)) &&
    (!filters.origin || rug.city === filters.origin) &&
    (!filters.color || rug.dominantColor === filters.color || colorPalette.find(color => color.name === filters.color)?.tones.some(tone => rug.dominantColor === tone)) &&
    (!filters.edit || (filters.edit === 'knotted' && !rug.flatweave) || (filters.edit === 'vintage' && /inspired/.test(rug.condition)) || (filters.edit === 'new' && rug.arrivalOrder >= 8)) &&
    (!search || [rug.name, rug.origin, rug.collection, rug.style, rug.category, rug.material, rug.dominantColor, rug.sku, rug.searchText || ''].join(' ').toLocaleLowerCase().includes(search))
  );
}

export function sortRugs(rugs, sort, size = '8x10') {
  return [...rugs].sort((a, b) => {
    if (sort === 'low') return priceFor(a, size) - priceFor(b, size);
    if (sort === 'high') return priceFor(b, size) - priceFor(a, size);
    if (sort === 'density') return (b.flatweave ? 0 : b.kpsi) - (a.flatweave ? 0 : a.kpsi);
    if (sort === 'newest') return b.arrivalOrder - a.arrivalOrder;
    const area = rug => Math.max(...rug.sizes.map(value => dimensions[value][0] * dimensions[value][1]));
    if (sort === 'size') return area(b) - area(a);
    return 0;
  });
}
