import { describe, it, expect } from "vitest";
import { sanitizeWhatsAppNumber, getWhatsAppLink, buildCartOrderMessage } from "../lib/format";

describe("WhatsApp Sanitizer Helpers", () => {
  it("should sanitize raw numbers correctly", () => {
    expect(sanitizeWhatsAppNumber("+8801700000000")).toBe("8801700000000");
    expect(sanitizeWhatsAppNumber("008801700000000")).toBe("8801700000000");
    expect(sanitizeWhatsAppNumber("+880 1878-507054")).toBe("8801878507054");
    expect(sanitizeWhatsAppNumber("")).toBe("");
  });

  it("should generate deep links correctly", () => {
    expect(getWhatsAppLink("+8801700000000")).toBe("https://wa.me/8801700000000");
    expect(getWhatsAppLink("008801700000000", "Hello Subly")).toBe(
      "https://wa.me/8801700000000?text=Hello%20Subly"
    );
    expect(getWhatsAppLink("")).toBe("#");
  });
});

describe("buildCartOrderMessage", () => {
  it("should format multi-item cart correctly", () => {
    const items = [
      { name: "Netflix Premium", duration: "1 Month", price: 499 },
      { name: "Spotify Premium", duration: "3 Months", price: 899 },
    ];
    const msg = buildCartOrderMessage(items, 1398);
    expect(msg).toBe(
      "Hi! I'd like to order:\n" +
      "1. Netflix Premium (1 Month) — ৳499\n" +
      "2. Spotify Premium (3 Months) — ৳899\n\n" +
      "Total: ৳1,398"
    );
  });

  it("should format single-item cart correctly", () => {
    const items = [
      { name: "Canva Pro", duration: "1 Year", price: 1999 },
    ];
    const msg = buildCartOrderMessage(items, 1999);
    expect(msg).toBe(
      "Hi! I'd like to order:\n" +
      "1. Canva Pro (1 Year) — ৳1,999\n\n" +
      "Total: ৳1,999"
    );
  });

  it("should gracefully compose with getWhatsAppLink", () => {
    const items = [{ name: "Test Service", duration: "1 Month", price: 100 }];
    const msg = buildCartOrderMessage(items, 100);
    const link = getWhatsAppLink("+880123", msg);
    expect(link).toContain("text=Hi!%20I'd%20like%20to%20order%3A%0A1.%20Test%20Service%20(1%20Month)%20%E2%80%94%20%E0%A7%B3100%0A%0ATotal%3A%20%E0%A7%B3100");
  });
});
