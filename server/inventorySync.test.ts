import { describe, expect, it } from "vitest";
import {
  computeDiff,
  buildSyncChangeSummary,
  detectNewInventoryProjects,
  decorateInventoryEvents,
  getInventoryUnitHref,
  inventoryUnitKey,
  isSaleAvailableStatus,
  isSoldStatus,
  loadSnapshotUnits,
  normStatus,
  summarize,
  shouldNotifyInventoryOwner,
  toCurrentSaleInventoryUnits,
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
  return new Map(
    states.map(state => [
      inventoryUnitKey({
        dataset: state.dataset ?? "saadiyat",
        projectSlug: state.projectSlug ?? "bs-park-place",
        unitName: state.unitName,
      }),
      state,
    ]),
  );
}

describe("normStatus / availability classification", () => {
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

  it("includes Aldar Available and New states without including blocked inventory", () => {
    expect(isSaleAvailableStatus("Available")).toBe(true);
    expect(isSaleAvailableStatus(" new ")).toBe(true);
    expect(isSaleAvailableStatus("Booked")).toBe(false);
    expect(isSaleAvailableStatus("Sold")).toBe(false);
  });
});

describe("sales-desk detail routes", () => {
  it("creates an exact Saadiyat unit card route", () => {
    expect(getInventoryUnitHref(unit({ unitName: "BSPP V-01 / A" }))).toBe(
      "/aldar-saadiyat/bs-park-place/b1/BSPP%20V-01%20%2F%20A",
    );
  });

  it("creates an exact Other Aldar card route and rejects incomplete rows", () => {
    expect(
      getInventoryUnitHref(
        unit({
          dataset: "other",
          unitName: "Noya-V-01",
          projectSlug: "noya",
          buildingSlug: "noya-1",
        }),
      ),
    ).toBe("/aldar-other/noya/noya-1/Noya-V-01");
    expect(getInventoryUnitHref(unit({ unitName: "No building", buildingSlug: null }))).toBeNull();
  });

  it("retains same-named purchasable units from different projects", () => {
    const units = toCurrentSaleInventoryUnits([
      unit({ unitName: "A-101", projectSlug: "one", projectName: "One", status: "Available" }),
      unit({ unitName: "A-101", projectSlug: "two", projectName: "Two", status: "New" }),
      unit({ unitName: "A-102", projectSlug: "two", projectName: "Two", status: "Sold" }),
    ]);
    expect(units).toHaveLength(2);
    expect(units.map(item => item.projectSlug)).toEqual(["one", "two"]);
  });

  it("keeps every purchasable record from the deployed Aldar snapshot linked to its exact unit route", () => {
    const units = toCurrentSaleInventoryUnits(loadSnapshotUnits());
    expect(units.length).toBeGreaterThan(0);
    expect(units.every(item => isSaleAvailableStatus(item.status))).toBe(true);
    expect(units.every(item => item.href !== null)).toBe(true);
  });

  it("derives documented The Canopies B1–B6 route keys from its blank-source-slug export", () => {
    const unitFromCanopies = toCurrentSaleInventoryUnits(loadSnapshotUnits()).find(
      item => item.projectSlug === "the-canopies" && item.buildingName === "B1",
    );
    expect(unitFromCanopies?.href).toContain("/aldar-other/the-canopies/b1/");
  });
});

describe("daily inventory event card links", () => {
  it("links a tracked event to its exact card and leaves an unknown removed unit unlinked", () => {
    const rows = decorateInventoryEvents(
      [
        {
          id: 1,
          runId: 12,
          createdAt: new Date("2026-08-28T02:00:00Z"),
          dataset: "saadiyat",
          projectSlug: "faya",
          projectName: "Faya Al Saadiyat",
          unitName: "FAYA-01",
          eventType: "status_change",
          fromStatus: "Available",
          toStatus: "Sold",
          fromPriceAed: null,
          toPriceAed: null,
        },
        {
          id: 2,
          runId: 12,
          createdAt: new Date("2026-08-28T02:00:00Z"),
          dataset: "saadiyat",
          projectSlug: "faya",
          projectName: "Faya Al Saadiyat",
          unitName: "REMOVED-01",
          eventType: "removed",
          fromStatus: "Available",
          toStatus: null,
          fromPriceAed: null,
          toPriceAed: null,
        },
      ],
      [unit({ projectSlug: "faya", unitName: "FAYA-01", buildingSlug: "m1", buildingName: "Massena 1" })],
    );
    expect(rows[0]).toMatchObject({ href: "/aldar-saadiyat/faya/m1/FAYA-01", buildingName: "Massena 1" });
    expect(rows[1]).toMatchObject({ href: null, buildingName: null });
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
    const prev = prevMap([{ unitName: "BSPP-V-01", status: "Available", priceAed: 1_000_000, isPresent: true }]);
    const events = computeDiff(prev, [unit({ unitName: "BSPP-V-01", status: "Sold" })]);
    const sc = events.find(event => event.eventType === "status_change");
    expect(sc).toBeTruthy();
    expect(sc!.fromStatus).toBe("Available");
    expect(sc!.toStatus).toBe("Sold");
    expect(isSoldStatus(sc!.toStatus)).toBe(true);
  });

  it("does not emit a status change for case-only differences", () => {
    const prev = prevMap([{ unitName: "BSPP-V-01", status: "available", priceAed: 1_000_000, isPresent: true }]);
    expect(computeDiff(prev, [unit({ unitName: "BSPP-V-01", status: "Available" })]).find(event => event.eventType === "status_change")).toBeUndefined();
  });

  it("emits price_change when the price differs but not when a price is unknown", () => {
    const changed = computeDiff(prevMap([{ unitName: "BSPP-V-01", status: "Available", priceAed: 1_000_000, isPresent: true }]), [unit({ unitName: "BSPP-V-01", priceAed: 1_200_000 })]);
    expect(changed.find(event => event.eventType === "price_change")?.toPriceAed).toBe(1_200_000);
    const unknown = computeDiff(prevMap([{ unitName: "BSPP-V-01", status: "Available", priceAed: null, isPresent: true }]), [unit({ unitName: "BSPP-V-01", priceAed: 1_000_000 })]);
    expect(unknown.find(event => event.eventType === "price_change")).toBeUndefined();
  });

  it("emits removed and reappeared events as appropriate", () => {
    const removed = computeDiff(prevMap([{ unitName: "BSPP-V-01", status: "Available", priceAed: 1_000_000, isPresent: true }]), []);
    expect(removed[0].eventType).toBe("removed");
    const reappeared = computeDiff(prevMap([{ unitName: "BSPP-V-01", status: "Available", priceAed: 1_000_000, isPresent: false }]), [unit({ unitName: "BSPP-V-01" })]);
    expect(reappeared.find(event => event.eventType === "reappeared")).toBeTruthy();
  });

  it("is idempotent when snapshot equals previous state", () => {
    const prev = prevMap([{ unitName: "BSPP-V-01", status: "Available", priceAed: 1_000_000, isPresent: true }]);
    expect(computeDiff(prev, [unit({ unitName: "BSPP-V-01" })])).toHaveLength(0);
  });

  it("keeps same-named units in different projects independent during a sync", () => {
    const prev = prevMap([
      {
        dataset: "saadiyat",
        projectSlug: "one",
        unitName: "A-101",
        status: "Available",
        priceAed: 1_000_000,
        isPresent: true,
      },
    ]);
    const events = computeDiff(prev, [
      unit({ projectSlug: "one", projectName: "One", unitName: "A-101", status: "Available" }),
      unit({ projectSlug: "two", projectName: "Two", unitName: "A-101", status: "New" }),
    ]);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ eventType: "first_seen", projectSlug: "two", unitName: "A-101" });
  });
});

describe("summarize", () => {
  it("counts sold, new and price changes while rolling them up by project", () => {
    const prev = prevMap([
      { unitName: "BSPP-V-01", status: "Available", priceAed: 1_000_000, isPresent: true },
      { unitName: "BSPP-V-02", status: "Available", priceAed: 2_000_000, isPresent: true },
      { projectSlug: "fay-alghadeer", unitName: "GHD-V-09", status: "Available", priceAed: 1_500_000, isPresent: true },
    ]);
    const current = [
      unit({ unitName: "BSPP-V-01", status: "Sold" }),
      unit({ unitName: "BSPP-V-02", priceAed: 2_200_000 }),
      unit({ unitName: "GHD-V-10", projectSlug: "fay-alghadeer", projectName: "Fay Al Ghadeer" }),
      unit({ unitName: "GHD-V-09", projectSlug: "fay-alghadeer", projectName: "Fay Al Ghadeer", priceAed: 1_500_000 }),
    ];
    const { counts, rollups } = summarize(computeDiff(prev, current));
    expect(counts.soldUnits).toBe(1);
    expect(counts.priceChanges).toBe(1);
    expect(counts.newUnits).toBe(1);
    expect(rollups.find(row => row.projectSlug === "bs-park-place")?.sold).toBe(1);
    expect(rollups.find(row => row.projectSlug === "fay-alghadeer")?.newUnits).toBe(1);
  });
});

describe("sync change summary", () => {
  it("reports no-change runs without an unnecessary alert payload", () => {
    const summary = buildSyncChangeSummary({ unitsScanned: 5, newUnits: 0, soldUnits: 0, statusChanges: 0, priceChanges: 0, removedUnits: 0 }, []);
    expect(summary.changed).toBe(0);
    expect(summary.headline).toContain("No changes detected");
    expect(summary.projects).toEqual([]);
  });

  it("includes category totals and the affected project in a changed run", () => {
    const summary = buildSyncChangeSummary(
      { unitsScanned: 15, newUnits: 1, soldUnits: 2, statusChanges: 0, priceChanges: 1, removedUnits: 0 },
      [{ dataset: "saadiyat", projectSlug: "park-place", projectName: "Park Place", newUnits: 1, sold: 2, statusChanges: 0, priceChanges: 1, removed: 0, examples: [] }],
    );
    expect(summary.changed).toBe(4);
    expect(summary.metrics).toContain("2 sold");
    expect(summary.projects[0]).toContain("Park Place");
  });
});

describe("new project detection", () => {
  const incoming = {
    saadiyat: {
      projects: [
        {
          slug: "marsa-al-saadiyat",
          name: "Marsa Al Saadiyat",
          buildings: [{ slug: "marsa", name: "Marsa", units: [{ unit_name: "M-101", status: "Available", price_aed: 4_000_000 }] }],
        },
        { slug: "pulse-district", name: "Pulse District", buildings: [] },
      ],
    },
    other: {
      projects: [
        {
          slug: "unknown-new-project",
          name: "Unknown New Project",
          buildings: [{ slug: "tower-a", name: "Tower A", units: [{ unit_name: "A-1", status: "New", price_aed: null }] }],
        },
      ],
    },
  };

  it("accepts only source-complete projects and preserves the Saadiyat area", () => {
    const found = detectNewInventoryProjects(incoming, []);
    expect(found).toEqual(expect.arrayContaining([
      expect.objectContaining({ projectSlug: "marsa-al-saadiyat", areaKey: "saadiyat", unitCount: 1, availableCount: 1, priceMinAed: 4_000_000 }),
      expect.objectContaining({ projectSlug: "unknown-new-project", areaKey: "other", unitCount: 1, priceMinAed: null }),
    ]));
    expect(found.some(project => project.projectSlug === "pulse-district")).toBe(false);
  });

  it("does not report a project twice once its source identity is known", () => {
    const found = detectNewInventoryProjects(incoming, ["saadiyat::marsa-al-saadiyat"]);
    expect(found.some(project => project.projectSlug === "marsa-al-saadiyat")).toBe(false);
    expect(found.some(project => project.projectSlug === "unknown-new-project")).toBe(true);
  });

  it("notifies the owner only when inventory changed or a new complete project appears", () => {
    const unchanged = { newUnits: 0, soldUnits: 0, statusChanges: 0, priceChanges: 0, removedUnits: 0 };
    expect(shouldNotifyInventoryOwner(unchanged, [])).toBe(false);
    expect(shouldNotifyInventoryOwner(unchanged, detectNewInventoryProjects(incoming, []))).toBe(true);
    expect(shouldNotifyInventoryOwner({ ...unchanged, priceChanges: 1 }, [])).toBe(true);
  });
});
