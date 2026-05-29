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


/**
 * Access-control invariants for upload + delete.
 * We don't actually push bytes to S3 in these tests; we only verify the
 * authorization layer rejects unauthenticated/unprivileged callers BEFORE
 * any storage I/O happens.
 */
describe("files router — auth & access control", () => {
  const userCtx = { user: { id: "u-1", role: "user", name: "U", email: "u@u" } } as any;
  const adminCtx = { user: { id: "a-1", role: "admin", name: "A", email: "a@a" } } as any;
  const masterCtx = { user: { id: "m-1", role: "master", name: "M", email: "m@m" } } as any;

  it("listGlobal is publicProcedure (anonymous can read)", { timeout: 30_000 }, async () => {
    const caller = appRouter.createCaller(anonCtx);
    const rows = await caller.files.listGlobal();
    expect(Array.isArray(rows)).toBe(true);
  });

  it("upload rejects anonymous callers (protectedProcedure)", async () => {
    const caller = appRouter.createCaller(anonCtx);
    await expect(
      caller.files.upload({
        scope: "global",
        filename: "test.pdf",
        mimeType: "application/pdf",
        dataB64: Buffer.from("dummy").toString("base64"),
      }),
    ).rejects.toBeTruthy();
  });

  it("upload rejects mismatched scope/villaKey before storage I/O", async () => {
    const caller = appRouter.createCaller(userCtx);
    await expect(
      caller.files.upload({
        scope: "villa", // requires villaKey
        filename: "test.pdf",
        mimeType: "application/pdf",
        dataB64: Buffer.from("x").toString("base64"),
      }),
    ).rejects.toThrow(/villaKey is required/);
  });

  it("upload rejects unsupported mime types before storage I/O", async () => {
    const caller = appRouter.createCaller(userCtx);
    await expect(
      caller.files.upload({
        scope: "global",
        filename: "evil.exe",
        mimeType: "application/x-msdownload",
        dataB64: Buffer.from("MZ").toString("base64"),
      }),
    ).rejects.toThrow(/Unsupported file type/);
  });

  it("upload rejects empty payloads (decoded to 0 bytes) before storage I/O", async () => {
    const caller = appRouter.createCaller(userCtx);
    // "=" is a valid 1-char base64 string but decodes to 0 bytes
    await expect(
      caller.files.upload({
        scope: "global",
        filename: "blank.pdf",
        mimeType: "application/pdf",
        dataB64: "=",
      }),
    ).rejects.toThrow(/Empty file/);
  });

  it("delete rejects regular users (adminProcedure)", async () => {
    const caller = appRouter.createCaller(userCtx);
    await expect(caller.files.delete({ id: 999_999 })).rejects.toBeTruthy();
  });

  it("delete rejects anonymous callers (adminProcedure)", async () => {
    const caller = appRouter.createCaller(anonCtx);
    await expect(caller.files.delete({ id: 999_999 })).rejects.toBeTruthy();
  });

  it("delete returns NOT_FOUND for an unknown id when called by admin/master", { timeout: 30_000 }, async () => {
    // Using a very large id that should never exist in the seeded table.
    const adminCaller = appRouter.createCaller(adminCtx);
    await expect(adminCaller.files.delete({ id: 2_000_000_000 })).rejects.toThrow(/not found|NOT_FOUND/i);

    const masterCaller = appRouter.createCaller(masterCtx);
    await expect(masterCaller.files.delete({ id: 2_000_000_000 })).rejects.toThrow(/not found|NOT_FOUND/i);
  });
});
