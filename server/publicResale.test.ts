/**
 * Tests for the public Resale Filter router.
 *
 * The whole point of this router is to be reachable WITHOUT the password
 * gate or any user session, so we verify both:
 *   1) the dataset/aggregation logic produces sane numbers, and
 *   2) every procedure is mounted as `publicProcedure` (no auth required).
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { appRouter } from "./routers";
import { _internal as publicInternal } from "./routers/publicResale";

const ANY_REQ = {} as any;
const ANY_RES = { clearCookie: () => undefined } as any;

function makeCaller() {
  return appRouter.createCaller({ req: ANY_REQ, res: ANY_RES, user: null });
}

describe("publicResale router", () => {
  it("is composed of public-only procedures (source check)", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "./routers/publicResale.ts"),
      "utf8",
    );
    expect(src).toContain("publicProcedure");
    // No authenticated procedure types should leak into the public surface.
    expect(src).not.toContain("protectedProcedure");
    expect(src).not.toContain("masterProcedure");
    expect(src).not.toContain("adminProcedure");
  });

  it("summary endpoint can be called anonymously and returns sane counts", async () => {
    const caller = makeCaller();
    const res = await caller.publicResale.summary();
    expect(res.total).toBeGreaterThan(100);
    expect(res.aldar_resale).toBeGreaterThan(50);
    expect(res.primary_live).toBeGreaterThan(100);
    expect(res.by_area.saadiyat).toBeGreaterThan(0);
    expect(res.total).toBe(res.aldar_resale + res.primary_live);
  });

  it("list endpoint with no filters returns the full dataset (capped)", async () => {
    const caller = makeCaller();
    const res = await caller.publicResale.list();
    expect(res.total_in_dataset).toBeGreaterThan(100);
    expect(res.total_after_filters).toBe(res.total_in_dataset);
    expect(res.items.length).toBeLessThanOrEqual(800);
    // Sorted by price desc by default; first item should have a price >= last.
    const first = res.items.find(i => typeof i.price_aed === "number");
    const last = [...res.items]
      .reverse()
      .find(i => typeof i.price_aed === "number");
    if (first && last) {
      expect(first.price_aed!).toBeGreaterThanOrEqual(last.price_aed!);
    }
  });

  it("source filter narrows results to only Aldar resale rows", async () => {
    const caller = makeCaller();
    const res = await caller.publicResale.list({ source: "aldar-resale" });
    expect(res.items.length).toBeGreaterThan(0);
    for (const it of res.items) expect(it.source).toBe("aldar-resale");
  });

  it("source filter narrows results to only primary-live rows", async () => {
    const caller = makeCaller();
    const res = await caller.publicResale.list({ source: "primary-live" });
    expect(res.items.length).toBeGreaterThan(0);
    for (const it of res.items) expect(it.source).toBe("primary-live");
  });

  it("area filter narrows results to a single area", async () => {
    const caller = makeCaller();
    const res = await caller.publicResale.list({ area: "saadiyat" });
    expect(res.items.length).toBeGreaterThan(0);
    for (const it of res.items) expect(it.area).toBe("saadiyat");
  });

  it("price range filter is applied", async () => {
    const caller = makeCaller();
    const res = await caller.publicResale.list({
      minPrice: 5_000_000,
      maxPrice: 15_000_000,
      sort: "price-asc",
    });
    for (const it of res.items.filter(i => typeof i.price_aed === "number")) {
      expect(it.price_aed!).toBeGreaterThanOrEqual(5_000_000);
      expect(it.price_aed!).toBeLessThanOrEqual(15_000_000);
    }
  });

  it("free-text query matches project name", async () => {
    const caller = makeCaller();
    const res = await caller.publicResale.list({
      query: "nobu",
      source: "aldar-resale",
    });
    expect(res.items.length).toBeGreaterThan(0);
    for (const it of res.items) {
      expect(it.project_name.toLowerCase()).toContain("nobu");
    }
  });

  it("no listing exposes a Sold status (public surface stays available-only)", () => {
    const all = publicInternal.getAllListings();
    for (const it of all) {
      const status = (it.status || "").toLowerCase();
      expect(status).not.toBe("sold");
    }
  });
});
