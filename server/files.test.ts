/**
 * files router invariants — DCR PDF migration coverage.
 *
 *   - listByPrefix is publicProcedure (no login required)
 *   - rejects malformed prefixes
 *   - returns rows whose villaKey actually starts with the prefix (DB-backed)
 *   - the seeded DCR PDFs (Jawaher / SBV) are reachable via the prefix lookup
 */
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

const anonCtx: Context = { user: null } as any;

describe("files router — listByPrefix", () => {
  it("is callable anonymously (publicProcedure)", async () => {
    const caller = appRouter.createCaller(anonCtx);
    const rows = await caller.files.listByPrefix({ prefix: "jawaher/" });
    expect(Array.isArray(rows)).toBe(true);
  }, 30_000);

  it("returns rows whose villaKey starts with the requested prefix", async () => {
    const caller = appRouter.createCaller(anonCtx);
    const rows = await caller.files.listByPrefix({
      prefix: "saadiyat-beach-villas/Gate2-",
    });
    for (const r of rows) {
      expect(r.villaKey ?? "").toMatch(/^saadiyat-beach-villas\/Gate2-/);
    }
  }, 30_000);

  it("returns the DCR PDFs uploaded for Jawaher (>=80 plots)", { timeout: 30_000 }, async () => {
    const caller = appRouter.createCaller(anonCtx);
    const rows = await caller.files.listByPrefix({ prefix: "jawaher/" });
    // 83 PDFs were seeded for Jawaher; allow a few stragglers
    expect(rows.length).toBeGreaterThanOrEqual(80);
    // Every row should be a PDF in our own /manus-storage path
    for (const r of rows) {
      expect(r.mimeType).toBe("application/pdf");
      expect(r.storageKey).toMatch(/^dcr\/jawaher\//);
    }
  });

  it("returns the DCR PDFs uploaded for SBV Gate 2 (~156 plots)", { timeout: 30_000 }, async () => {
    const caller = appRouter.createCaller(anonCtx);
    const rows = await caller.files.listByPrefix({
      prefix: "saadiyat-beach-villas/Gate2-",
    });
    expect(rows.length).toBeGreaterThanOrEqual(150);
  });

  it("rejects malformed prefixes via Zod regex", async () => {
    const caller = appRouter.createCaller(anonCtx);
    await expect(
      caller.files.listByPrefix({ prefix: "../etc/passwd" }),
    ).rejects.toBeTruthy();
    await expect(
      caller.files.listByPrefix({ prefix: "WITH SPACES" }),
    ).rejects.toBeTruthy();
  });

  it("listByVilla still works for a known seeded plot", { timeout: 30_000 }, async () => {
    const caller = appRouter.createCaller(anonCtx);
    const rows = await caller.files.listByVilla({
      villaKey: "jawaher/Plot-100",
    });
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].mimeType).toBe("application/pdf");
  });
});
