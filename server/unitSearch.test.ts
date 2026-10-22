/**
 * Unit Search Router — Vitest
 *
 * Validates global unit lookup and its project-scoped access projection.
 */
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { visibleSearchUnitsForUser, type ScopedSearchableUnit } from "./routers/unitSearch";
import type { Context } from "./_core/context";

const anonCtx: Context = { user: null } as any;
const masterCtx = (overrides: Partial<any> = {}): Context =>
  ({
    user: {
      id: "master-test",
      name: "Master Test",
      role: "master",
      ...overrides,
    },
  }) as any;

describe("unitSearch.search", () => {
  it("returns results from Saadiyat dataset when matching", async () => {
    const caller = appRouter.createCaller(masterCtx());
    const res = await caller.unitSearch.search({ q: "Mamsha", limit: 5 });
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.results[0].dataset).toBe("saadiyat");
    expect(res.results[0].href).toContain("/aldar-saadiyat/");
  });

  it("returns results from Other dataset for Master Admin", async () => {
    const caller = appRouter.createCaller(masterCtx());
    const res = await caller.unitSearch.search({ q: "YasParkPlace-B1", limit: 5 });
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.results[0].dataset).toBe("other");
    expect(res.results[0].href).toContain("/aldar-other/");
  });

  it("finds The Beach House Fahid units by project and exact unit code", async () => {
    const caller = appRouter.createCaller(masterCtx());
    const byProject = await caller.unitSearch.search({ q: "Fahid", dataset: "other", projectSlug: "thebeachhouse", limit: 10 });
    const byUnit = await caller.unitSearch.search({ q: "B8-01-01", dataset: "other", projectSlug: "thebeachhouse", limit: 10 });
    expect(byProject.results.length).toBeGreaterThan(0);
    expect(byProject.results.every(result => result.projectSlug === "thebeachhouse")).toBe(true);
    expect(byUnit.results.some(result => result.unitName.endsWith("B8-01-01"))).toBe(true);
    expect(byUnit.results[0]?.href).toContain("/aldar-other/thebeachhouse/");
  });

  it("finds captured Al Ghadeer units by exact unit code", async () => {
    const caller = appRouter.createCaller(masterCtx());
    const byProject = await caller.unitSearch.search({ q: "Al Ghadeer Parks 2", dataset: "other", projectSlug: "al-ghadeer-parks-2", limit: 10 });
    const byExactCode = await caller.unitSearch.search({ q: "N2 V 004 Test 01", dataset: "other", projectSlug: "al-ghadeer-gardens", limit: 10 });
    expect(byProject.results.length).toBeGreaterThan(0);
    expect(byProject.results.every(result => result.projectSlug === "al-ghadeer-parks-2")).toBe(true);
    expect(byExactCode.results).toEqual(expect.arrayContaining([
      expect.objectContaining({
        unitName: "AlGhadeerGardens-N2-V-004-Test-01",
        href: "/aldar-other/al-ghadeer-gardens/n2/AlGhadeerGardens-N2-V-004-Test-01",
        priceAed: null,
        status: null,
      }),
    ]));
  });

  it("returns results from Lagoons dataset", async () => {
    const caller = appRouter.createCaller(masterCtx());
    const res = await caller.unitSearch.search({ q: "AlGhaf", limit: 5 });
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.results[0].dataset).toBe("lagoons");
    expect(res.results[0].href).toContain("/saadiyat-lagoons/");
  });

  it("returns empty results for non-matching query", async () => {
    const caller = appRouter.createCaller(masterCtx());
    const res = await caller.unitSearch.search({ q: "ZZZZNONEXISTENT999" });
    expect(res.results).toHaveLength(0);
  });

  it("respects dataset filter", async () => {
    const caller = appRouter.createCaller(masterCtx());
    const res = await caller.unitSearch.search({ q: "AlGhaf", limit: 5, dataset: "saadiyat" });
    expect(res.results).toHaveLength(0);
  });

  it("respects limit parameter", async () => {
    const caller = appRouter.createCaller(masterCtx());
    const res = await caller.unitSearch.search({ q: "APT", limit: 3 });
    expect(res.results.length).toBeLessThanOrEqual(3);
  });

  it("requires authentication for unit lookup", async () => {
    const caller = appRouter.createCaller(anonCtx);
    await expect(caller.unitSearch.search({ q: "SC 362" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("unitSearch.filter", () => {
  it("filters units by the normalized square-metre area range", async () => {
    const caller = appRouter.createCaller(masterCtx());
    const res = await caller.unitSearch.filter({
      availableOnly: false,
      areaMinSqm: 100,
      areaMaxSqm: 150,
      limit: 100,
    });

    expect(res.results.length).toBeGreaterThan(0);
    expect(res.results.every((unit) => unit.areaSqm != null && unit.areaSqm >= 100 && unit.areaSqm <= 150)).toBe(true);
  });
});

describe("unitSearch scoped result projection", () => {
  const scopedReserve: ScopedSearchableUnit = {
    unitName: "Plot 21",
    projectName: "Saadiyat Reserve",
    projectSlug: "saadiyat-reserve",
    buildingName: "Phase 1",
    buildingSlug: "phase-1",
    dataset: "reserve",
    status: "Available",
    priceAed: 15_000_000,
    bedrooms: null,
    unitType: "Residential Land",
    areaSqm: 1000,
    areaSqft: 10_764,
    href: "/saadiyat-reserve?plot=21",
    scope: { areaKey: "saadiyat", projectKey: "saadiyat-reserve", phaseKey: "PHASE-1", unitTypeKey: "Residential Land", bedrooms: null, inventoryKey: "reserve_land" },
    priceAedRequiresOriginalPricePermission: true,
  };

  it("returns only a user's granted Reserve phase and redacts price without a price grant", () => {
    const result = visibleSearchUnitsForUser([scopedReserve], "user", [{
      areaKey: "saadiyat",
      projectKey: "saadiyat-reserve",
      phaseKey: "PHASE-1",
      canViewOriginalPrice: false,
      canViewOwnerName: false,
      canViewOwnerPhone: false,
      canEditProperties: false,
    }]);
    expect(result).toEqual([expect.objectContaining({ unitName: "Plot 21", priceAed: null })]);
  });

  it("does not return a project outside the user's grants", () => {
    expect(visibleSearchUnitsForUser([scopedReserve], "user", [])).toEqual([]);
  });
});
