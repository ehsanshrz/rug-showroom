export function filterRugs(rugs, filters) {
  const search = (filters.search || '').trim().toLocaleLowerCase();
  return rugs.filter(rug =>
    (!filters.style || rug.style === filters.style || rug.category === filters.style) &&
    (!filters.material || rug.material === filters.material) &&
    (!filters.size || rug.sizes.includes(filters.size)) &&
    (!filters.origin || rug.city === filters.origin) &&
    (!filters.color || rug.dominantColor === filters.color) &&
    (!search || [rug.name, rug.origin, rug.collection, rug.style, rug.category, rug.material, rug.dominantColor, rug.sku, rug.searchText || ''].join(' ').toLocaleLowerCase().includes(search))
  );
}
