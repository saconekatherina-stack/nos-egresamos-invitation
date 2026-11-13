import { describe, it, expect } from "vitest";
import { buildWhatsAppLink, normalizeDni } from "@/lib/invitation";

const decode = (url: string) => decodeURIComponent(url.split("text=")[1] ?? "");

describe("WhatsApp RSVP", () => {
  it("sends to +5492635013396 with name, DNI and answer", () => {
    const url = buildWhatsAppLink("Lucía Pérez", "40123456", "si", "Katherina");
    expect(url.startsWith("https://wa.me/5492635013396?text=")).toBe(true);
    const text = decode(url);
    expect(text).toContain("Nombre y apellido: Lucía Pérez");
    expect(text).toContain("DNI: 40123456");
    expect(text).toContain("Respuesta: Sí asistiré");
    expect(text).not.toContain("Naomi");
  });

  it("includes the negative answer", () => {
    expect(decode(buildWhatsAppLink("Ana", "1234567", "no", "Katherina"))).toContain("Respuesta: No podré asistir");
  });

  it("requires a 7–8 digit DNI", () => {
    expect(normalizeDni("40.123.456")).toBe("40123456");
    expect(normalizeDni("12345")).toBeNull();
    expect(normalizeDni("")).toBeNull();
  });
});
