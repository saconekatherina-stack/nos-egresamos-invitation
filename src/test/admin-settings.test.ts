import { describe, it, expect } from "vitest";
import { buildSettingsUpdate } from "@/lib/invitation";

describe("admin settings save", () => {
  it("never sends the hidden second name, so an empty value can't block saving", () => {
    const { update, missing } = buildSettingsUpdate({ name_one: "Katherina", name_two: "" }, ["name_one"]);
    expect(missing).toEqual([]);
    expect("name_two" in update).toBe(false);
  });

  it("allows event details that aren't configured yet to stay empty", () => {
    const { update, missing } = buildSettingsUpdate({ event_date: "", venue_name: "  ", maps_url: "" }, ["event_date", "venue_name", "maps_url"]);
    expect(missing).toEqual([]);
    expect(update).toEqual({ event_date: null, venue_name: null, maps_url: null });
  });

  it("reports an empty required text instead of saving it", () => {
    const { missing } = buildSettingsUpdate({ headline: " ", year: "2026" }, ["headline", "year"]);
    expect(missing).toEqual(["headline"]);
  });

  it("lets the entry price and its phrase be edited or left empty", () => {
    const { update, missing } = buildSettingsUpdate({ entry_price: "19.000", entry_note: "" }, ["entry_price", "entry_note"]);
    expect(missing).toEqual([]);
    expect(update).toEqual({ entry_price: "19.000", entry_note: null });
  });
});
