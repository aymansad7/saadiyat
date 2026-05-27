/**
 * Tests for the cross-area Resale Filter router.
 *
 * Although the file is still named `publicResale.ts` (kept for git churn
 * reasons), every procedure must now be admin-only:
 *
 *   - Anonymous and regular `user` callers must hit FORBIDDEN.
 *   - `admin` and `master` callers must succeed and see the aggregated data.
 *
 * We also keep the dataset / aggregation sanity checks.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import { _internal as publicInternal } from "./routers/publicResale";

const ANY_REQ = {} as any;
const ANY_RES = { clearCookie: () => undefined } as any;

function caller(role: "admin" | "master" | "user" | null) {
  const user =
    role === null
      ? null
      : { id: `u-${role}`, role, name: role, email: `${role}@a` };
  return appRouter.createCaller({ req: ANY_REQ, res: ANY_RES, user } as any);
}

async function expectForbidden(p: Promise<unknown>) {
  await expect(p).rejects.toMatchObject({ code: "FORBIDDEN" });
}

describe("resale-filter router (publicResale, admin-only)", () => {
  it("source uses adminProcedure (no public/protected leakage)", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "./routers/publicResale.ts"),
      "utf8",
    );
    expect(src).toContain("adminProcedure");
    expect(src).not.toContain("publicProcedure");
    expect(src).not.toContain("protectedProcedure");
  });

  it("rejects anonymous callers (no session)", async () => {
    const c = caller(null);
    await expectForbidden(c.publicResale.summary());
    await expectForbidden(c.publicResale.list());
  });

  it("rejects regular users (role !== admin/master)", async () => {
    const c = caller("user");
    await expectForbidden(c.publicResale.summary());
    await expectForbidden(c.publicResale.list());
  });

  it("admin can read summary with sane counts", async () => {
    const c = caller("admin");
    const res = await c.publicResale.summary();
    expect(res.total).toBeGreaterThan(100);
    expect(res.aldar_resale).toBeGreaterThan(50);
    expect(res.primary_live).toBeGreaterThan(100);
    expect(res.total).toBe(res.aldar_resale + res.primary_live);
    expect(res.by_area.saadiyat).toBeGreaterThan(0);
  });

  it("master can read summary too", async () => {
    const c = caller("master");
    const res = await c.publicResale.summary();
    expect(res.total).toBeGreaterThan(100);
  });

  it("admin: list with no filters returns the full dataset (capped)", async () => {
    const c = caller("admin");
    const res = await c.publicResale.list();
    expect(res.total_in_dataset).toBeGreaterThan(100);
    expect(res.total_after_filters).toBe(res.total_in_dataset);
    expect(res.items.length).toBeLessThanOrEqual(800);
  });

  it("admin: source filter narrows results to aldar-resale only", async () => {
    const c = caller("admin");
    const res = await c.publicResale.list({ source: "aldar-resale" });
    expect(res.items.length).toBeGreaterThan(0);
    for (const it of res.items) expect(it.source).toBe("aldar-resale");
  });

  it("admin: source filter narrows results to primary-live only", async () => {
    const c = caller("admin");
    const res = await c.publicResale.list({ source: "primary-live" });
    expect(res.items.length).toBeGreaterThan(0);
    for (const it of res.items) expect(it.source).toBe("primary-live");
  });

  it("admin: area filter narrows results to a single area", async () => {
    const c = caller("admin");
    const res = await c.publicResale.list({ area: "saadiyat" });
    expect(res.items.length).toBeGreaterThan(0);
    for (const it of res.items) expect(it.area).toBe("saadiyat");
  });

  it("admin: price range filter is applied", async () => {
    const c = caller("admin");
    const res = await c.publicResale.list({
      minPrice: 5_000_000,
      maxPrice: 15_000_000,
      sort: "price-asc",
    });
    for (const it of res.items.filter(i => typeof i.price_aed === "number")) {
      expect(it.price_aed!).toBeGreaterThanOrEqual(5_000_000);
      expect(it.price_aed!).toBeLessThanOrEqual(15_000_000);
    }
  });

  it("admin: free-text query matches project name", async () => {
    const c = caller("admin");
    const res = await c.publicResale.list({
      query: "nobu",
      source: "aldar-resale",
    });
    expect(res.items.length).toBeGreaterThan(0);
    for (const it of res.items) {
      expect(it.project_name.toLowerCase()).toContain("nobu");
    }
  });

  it("dataset never exposes Sold rows", () => {
    const all = publicInternal.getAllListings();
    for (const it of all) {
      const status = (it.status || "").toLowerCase();
      expect(status).not.toBe("sold");
    }
  });

  // Suppress unused import warning when @trpc/server upgrades
  void TRPCError;
});
