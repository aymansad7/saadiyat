/**
 * Unit Search Router — vitest
 *
 * Validates that the global unit search endpoint queries across all three
 * datasets (Saadiyat, Other, Lagoons) and respects filters.
 */
import { describe, it, expect } from "vitest";
import { TRPCError } from "@trpc/server";
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

  it("requires authentication (rejects anonymous)", async () => {
    const caller = appRouter.createCaller(anonCtx);
    await expect(caller.unitSearch.search({ q: "test" })).rejects.toThrow(TRPCError);
  });
});
