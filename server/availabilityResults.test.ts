import { describe, expect, it } from "vitest";
import { canonicalAvailabilityIdentity, dedupeAvailabilityResults, resolveAvailabilityHref, summarizeAvailabilityResults, type AvailabilityResult } from "./availabilityResults";

function row(overrides: Partial<AvailabilityResult>): AvailabilityResult {
  return { id: "a", community: "saadiyat-lagoons", unitKey: "Lagoons-AlSidr-V-176-02", title: "176 02", source: "nas-luxury", provenance: "test", status: "available", priceAed: null, bedrooms: null, updatedAt: null, href: null, sourceUrl: null, exactInternalMatch: false, ...overrides };
}

describe("availability result routing", () => {
  it("opens exact known property routes where a source-backed key permits it", () => {
    expect(resolveAvailabilityHref("jawaher", "jawaher/Plot-78")).toBe("/jawaher/plot/78");
    expect(resolveAvailabilityHref("saadiyat-lagoons", "lagoons/AlSidr-176-02")).toBe("/saadiyat-lagoons/al-sidr/AlSidr-176-02");
    expect(resolveAvailabilityHref("aldar-saadiyat", "aldar-saadiyat/mamsha/b2/Mamsha-01")).toBe("/aldar-saadiyat/mamsha/b2/Mamsha-01");
  });

  it("uses a map route only as a fallback for an otherwise unresolvable source key", () => {
    expect(resolveAvailabilityHref("unknown-community", "unknown/unit-01")).toBe("/map?plot=unknown%2Funit-01");
  });

  it("normalizes the legacy and editable Lagoons forms into one NAS identity", () => {
    expect(canonicalAvailabilityIdentity("saadiyat-lagoons", "Lagoons-AlSidr-V-176-02")).toBe(canonicalAvailabilityIdentity("saadiyat-lagoons", "lagoons/AlSidr-176-02"));
  });

  it("does not double-count a verified NAS listing and its auto-derived property status", () => {
    const rows = dedupeAvailabilityResults([row({ id: "verified" }), row({ id: "derived", unitKey: "lagoons/AlSidr-176-02" })]);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("verified");
  });

  it("aggregates click-through source counters from unique documented availability only", () => {
    const summary = summarizeAvailabilityResults([
      row({ id: "nas", source: "nas-luxury" }),
      row({ id: "broker", source: "others", unitKey: "jawaher/Plot-78", community: "jawaher" }),
      row({ id: "aldar", source: "aldar", unitKey: "aldar-saadiyat/x/b/X-1", community: "aldar-saadiyat" }),
    ]);
    expect(summary.find(item => item.community === "saadiyat-lagoons")?.bySource["nas-luxury"]).toBe(1);
    expect(summary.find(item => item.community === "jawaher")?.bySource.others).toBe(1);
    expect(summary.find(item => item.community === "aldar-saadiyat")?.bySource.aldar).toBe(1);
  });
});
