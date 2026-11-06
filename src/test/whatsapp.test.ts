import { describe, it, expect } from "vitest";
import { buildWhatsAppLink } from "@/lib/invitation";

describe("WhatsApp RSVP", () => {
  it("sends to +5492635013396 with the guest name", () => {
    const url = buildWhatsAppLink("Lucía", 1, "Katherina & Naomi");
    expect(url.startsWith("https://wa.me/5492635013396?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1])).toContain("Soy Lucía y confirmo mi asistencia");
  });
});
