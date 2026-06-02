import { describe, it, expect } from "vitest";
import {
  computeDiff,
  summarize,
  isSoldStatus,
  normStatus,
  type PrevState,
  type SnapshotUnit,
} from "./inventorySync";

function unit(partial: Partial<SnapshotUnit> & { unitName: string }): SnapshotUnit {
  return {
    dataset: "saadiyat",
    projectSlug: "bs-park-place",
    projectName: "BS Park Place",
    buildingSlug: "b1",
    buildingName: "B1",
    aldarLink: null,
    status: "Available",
    priceAed: 1_000_000,
    bedrooms: "3",
    unitType: "Villa",
    ...partial,
  };
}

function prevMap(states: PrevState[]): Map<string, PrevState> {
  const m = new Map<string, PrevState>();
  for (const s of states) m.set(s.unitName, s);
  return m;
}

describe("normStatus / isSoldStatus", () => {
  it("normalizes case and whitespace", () => {
    expect(normStatus("  Available ")).toBe("available");
    expect(normStatus(null)).toBe("");
  });
  it("detects sold regardless of case", () => {
    expect(isSoldStatus("Sold")).toBe(true);
    expect(isSoldStatus("SOLD")).toBe(true);
    expect(isSoldStatus("Available")).toBe(false);
    expect(isSoldStatus(null)).toBe(false);
  });
});

describe("computeDiff", () => {
  it("emits first_seen for brand-new units", () => {
    const events = computeDiff(prevMap([]), [unit({ unitName: "BSPP-V-01", status: "Available" })]);
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe("first_seen");
    expect(events[0].toStatus).toBe("Available");
  });

  it("emits status_change Available -> Sold", () => {
    const prev = prevMap([
      { unitName: "BSPP-V-01", status: "Available", priceAed: 1_000_000, isPresent: true },
    ]);
    const events = computeDiff(prev, [unit({ unitName: "BSPP-V-01", status: "Sold" })]);
    const sc = events.find(e => e.eventType === "status_change");
    expect(sc).toBeTruthy();
    expect(sc!.fromStatus).toBe("Available");
    expect(sc!.toStatus).toBe("Sold");
    expect(isSoldStatus(sc!.toStatus)).toBe(true);
  });

  it("does NOT emit a status change for case-only differences", () => {
    const prev = prevMap([
      { unitName: "BSPP-V-01", status: "available", priceAed: 1_000_000, isPresent: true },
    ]);
    const events = computeDiff(prev, [unit({ unitName: "BSPP-V-01", status: "Available" })]);
    expect(events.find(e => e.eventType === "status_change")).toBeUndefined();
  });

  it("emits price_change when the price differs", () => {
    const prev = prevMap([
      { unitName: "BSPP-V-01", status: "Available", priceAed: 1_000_000, isPresent: true },
    ]);
    const events = computeDiff(prev, [unit({ unitName: "BSPP-V-01", priceAed: 1_200_000 })]);
    const pc = events.find(e => e.eventType === "price_change");
    expect(pc).toBeTruthy();
    expect(pc!.fromPriceAed).toBe(1_000_000);
    expect(pc!.toPriceAed).toBe(1_200_000);
  });

  it("does NOT emit a phantom price change when the rounded price is identical", () => {
    // engine rounds at the source; here both states already hold the rounded int
    const prev = prevMap([
      { unitName: "BSPP-V-01", status: "Available", priceAed: 4_019_724, isPresent: true },
    ]);
    const events = computeDiff(prev, [unit({ unitName: "BSPP-V-01", priceAed: 4_019_724 })]);
    expect(events.find(e => e.eventType === "price_change")).toBeUndefined();
  });

  it("does NOT emit a price change when a price is unknown (null)", () => {
    const prev = prevMap([
      { unitName: "BSPP-V-01", status: "Available", priceAed: null, isPresent: true },
    ]);
    const events = computeDiff(prev, [unit({ unitName: "BSPP-V-01", priceAed: 1_000_000 })]);
    expect(events.find(e => e.eventType === "price_change")).toBeUndefined();
  });

  it("emits removed for units that disappear from the feed", () => {
    const prev = prevMap([
      { unitName: "BSPP-V-01", status: "Available", priceAed: 1_000_000, isPresent: true },
    ]);
    const events = computeDiff(prev, []);
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe("removed");
    expect(events[0].fromStatus).toBe("Available");
  });

  it("emits reappeared when a removed unit comes back", () => {
    const prev = prevMap([
      { unitName: "BSPP-V-01", status: "Available", priceAed: 1_000_000, isPresent: false },
    ]);
    const events = computeDiff(prev, [unit({ unitName: "BSPP-V-01", status: "Available" })]);
    expect(events.find(e => e.eventType === "reappeared")).toBeTruthy();
  });

  it("is idempotent — no changes when snapshot equals previous state", () => {
    const prev = prevMap([
      { unitName: "BSPP-V-01", status: "Available", priceAed: 1_000_000, isPresent: true },
    ]);
    const events = computeDiff(prev, [unit({ unitName: "BSPP-V-01", status: "Available", priceAed: 1_000_000 })]);
    expect(events).toHaveLength(0);
  });
});

describe("summarize", () => {
  it("counts sold/new/price and rolls up per project with examples", () => {
    const prev = prevMap([
      { unitName: "BSPP-V-01", status: "Available", priceAed: 1_000_000, isPresent: true },
      { unitName: "BSPP-V-02", status: "Available", priceAed: 2_000_000, isPresent: true },
      { unitName: "GHD-V-09", status: "Available", priceAed: 1_500_000, isPresent: true },
    ]);
    const current = [
      unit({ unitName: "BSPP-V-01", status: "Sold" }), // sold
      unit({ unitName: "BSPP-V-02", status: "Available", priceAed: 2_200_000 }), // price change
      unit({
        unitName: "GHD-V-10",
        projectSlug: "fay-alghadeer",
        projectName: "Fay Al Ghadeer",
        status: "Available",
      }), // new (GHD-V-09 will be removed)
      unit({
        unitName: "GHD-V-09",
        projectSlug: "fay-alghadeer",
        projectName: "Fay Al Ghadeer",
        status: "Available",
        priceAed: 1_500_000,
      }), // unchanged
    ];
    const events = computeDiff(prev, current);
    const { counts, rollups } = summarize(events);

    expect(counts.soldUnits).toBe(1);
    expect(counts.priceChanges).toBe(1);
    expect(counts.newUnits).toBe(1);

    const bspp = rollups.find(r => r.projectSlug === "bs-park-place");
    expect(bspp).toBeTruthy();
    expect(bspp!.sold).toBe(1);
    expect(bspp!.priceChanges).toBe(1);
    expect(bspp!.examples.some(e => e.includes("SOLD"))).toBe(true);

    const ghd = rollups.find(r => r.projectSlug === "fay-alghadeer");
    expect(ghd).toBeTruthy();
    expect(ghd!.newUnits).toBe(1);
  });
});
