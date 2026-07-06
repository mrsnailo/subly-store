/** Format a whole-taka amount as BDT, e.g. 2899 -> "৳2,899". */
export function bdt(n: number): string {
  return "৳" + n.toLocaleString("en-IN");
}

/**
 * Sanitizes a phone number for use in a WhatsApp wa.me link by:
 * 1. Stripping all non-digit characters.
 * 2. Dropping leading "00" if present.
 */
export function sanitizeWhatsAppNumber(num: string): string {
  let sanitized = num.replace(/\D/g, "");
  if (sanitized.startsWith("00")) {
    sanitized = sanitized.slice(2);
  }
  return sanitized;
}

/**
 * Builds a WhatsApp wa.me deep link for the given number and optional text message.
 */
export function getWhatsAppLink(num: string, text?: string): string {
  const cleanNum = sanitizeWhatsAppNumber(num);
  const base = `https://wa.me/${cleanNum}`;
  if (text) {
    return `${base}?text=${encodeURIComponent(text)}`;
  }
  return base;
}

