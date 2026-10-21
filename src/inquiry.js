export function whatsappInquiry(phone, { rug, size, price }) {
  const number = String(phone || '').replace(/[\s()+-]/g, '');
  if (!/^[1-9]\d{7,14}$/.test(number)) return null;
  const text = `Hello, I would like a private consultation about ${rug.name} (${rug.sku} / ${rug.id}).\nSize: ${size}\nIndicative price: ${price}\nPlease confirm availability, provenance, and your best offer.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
