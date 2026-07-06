/** Format a whole-taka amount as BDT, e.g. 2899 -> "৳2,899". */
export function bdt(n: number): string {
  return "৳" + n.toLocaleString("en-IN");
}

/** Strip non-digits and drop leading 00 from WhatsApp numbers. */
export function sanitizeWhatsAppNumber(num: string): string {
  let digits = num.replace(/\D/g, "");
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }
  return digits;
}

/** Build a wa.me deep link from a raw WhatsApp number and optional pre-filled text. */
export function getWhatsAppLink(num: string, text?: string): string {
  const digits = sanitizeWhatsAppNumber(num);
  if (!digits) return "#";
  if (text) {
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/${digits}`;
}
