import { describe, it, expect } from "vitest";
import { sanitizeWhatsAppNumber, getWhatsAppLink } from "../lib/format";

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
