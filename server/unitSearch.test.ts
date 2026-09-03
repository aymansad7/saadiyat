/**
 * Unit Search Router — vitest
 *
 * Validates that the global unit search endpoint queries across all three
 * datasets (Saadiyat, Other, Lagoons) and respects filters.
 */
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

const anonCtx: Context = { user: null } as any;
const adminCtx = (overrides: Partial<any> = {}): Context =>
  ({
    user: {
      id: "admin-test",
      name: "Admin Test",
      role: "admin",
      ...overrides,
    },
  }) as any;

describe("unitSearch.search", () => {
  it("returns results from Saadiyat dataset when matching", async () => {
    const caller = appRouter.createCaller(adminCtx());
    // "Mamsha" is a known Saadiyat project with units like "MamshaGardens-..."
    const res = await caller.unitSearch.search({ q: "Mamsha", limit: 5 });
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.results[0].dataset).toBe("saadiyat");
    expect(res.results[0].href).toContain("/aldar-saadiyat/");
  });

  it("returns results from Other dataset (Yas Park Place)", async () => {
    const caller = appRouter.createCaller(adminCtx());
    // YasParkPlace-B1 is a known unit prefix in Yas Park Place
    const res = await caller.unitSearch.search({ q: "YasParkPlace-B1", limit: 5 });
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.results[0].dataset).toBe("other");
    expect(res.results[0].href).toContain("/aldar-other/");
  });

  it("finds The Beach House Fahid units by project and exact unit code", async () => {
    const caller = appRouter.createCaller(adminCtx());
    const byProject = await caller.unitSearch.search({ q: "Fahid", dataset: "other", projectSlug: "thebeachhouse", limit: 10 });
    const byUnit = await caller.unitSearch.search({ q: "B8-01-01", dataset: "other", projectSlug: "thebeachhouse", limit: 10 });
    expect(byProject.results.length).toBeGreaterThan(0);
    expect(byProject.results.every(result => result.projectSlug === "thebeachhouse")).toBe(true);
    expect(byUnit.results.some(result => result.unitName.endsWith("B8-01-01"))).toBe(true);
    expect(byUnit.results[0]?.href).toContain("/aldar-other/thebeachhouse/");
  });

  it("finds captured Al Ghadeer units by project and preserves their exact card route", async () => {
    const caller = appRouter.createCaller(adminCtx());
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
    const caller = appRouter.createCaller(adminCtx());
    // "AlGhaf" is a known prefix in Lagoons
    const res = await caller.unitSearch.search({ q: "AlGhaf", limit: 5 });
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.results[0].dataset).toBe("lagoons");
    expect(res.results[0].href).toContain("/saadiyat-lagoons/");
  });

  it("returns empty results for non-matching query", async () => {
    const caller = appRouter.createCaller(adminCtx());
    const res = await caller.unitSearch.search({ q: "ZZZZNONEXISTENT999" });
    expect(res.results).toHaveLength(0);
  });

  it("respects dataset filter", async () => {
    const caller = appRouter.createCaller(adminCtx());
    // AlGhaf is only in lagoons, so filtering to saadiyat should return 0
    const res = await caller.unitSearch.search({ q: "AlGhaf", limit: 5, dataset: "saadiyat" });
    expect(res.results).toHaveLength(0);
  });

  it("respects limit parameter", async () => {
    const caller = appRouter.createCaller(adminCtx());
    const res = await caller.unitSearch.search({ q: "APT", limit: 3 });
    expect(res.results.length).toBeLessThanOrEqual(3);
  });

  it("allows anonymous lookup of non-sensitive unit records", async () => {
    const caller = appRouter.createCaller(anonCtx);
    const res = await caller.unitSearch.search({ q: "SC 362" });
    expect(res.results).toHaveLength(1);
    expect(res.results[0]).toMatchObject({
      unitName: "SC-YN7-TH-362",
      projectName: "The Sustainable City Yas Island",
      unitType: "TownHouse",
    });
  });
});

describe("unitSearch.filter", () => {
  it("filters units by the normalized square-metre area range", async () => {
    const caller = appRouter.createCaller(anonCtx);
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
