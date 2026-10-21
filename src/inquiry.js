export function validInquiryContact(contact) {
  const value = String(contact || '').trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
  return /^\+?[\d\s().-]+$/.test(value) && /^\d{7,15}$/.test(value.replace(/\D/g, ''));
}

export function whatsappInquiry(phone, { rug, size, price, name, contact, homeTrial }) {
  const number = String(phone || '').replace(/[\s()+-]/g, '');
  if (!/^[1-9]\d{7,14}$/.test(number)) return null;
  const text = `Hello, I would like a private consultation about ${rug.name} (${rug.sku} / ${rug.id}).\nSize: ${size}\nIndicative price: ${price}\nPlease confirm availability, provenance, and your best offer.${name ? `\nName: ${name}` : ''}${contact ? `\nContact: ${contact}` : ''}${homeTrial ? '\nI would like to request a home trial, subject to approval.' : ''}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
