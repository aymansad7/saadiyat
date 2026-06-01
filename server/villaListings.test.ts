/**
 * villaListings router invariants — admin-edited property profiles.
 *
 *   - byKey + listByCommunity are publicProcedure but mask owner fields
 *   - admin/master callers see owner fields in same procedures
 *   - upsert is adminProcedure (UNAUTHORIZED for non-admin, FORBIDDEN for user role)
 *   - upsert writes an audit row containing the diff
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { villaListingAudit, villaListings } from "../drizzle/schema";
import { eq, like } from "drizzle-orm";

const TEST_KEY = "test-villaListings/Plot-1";
const TEST_COMMUNITY = "test-villaListings";

const anonCtx = { user: null } as any;
const userCtx = {
  user: { id: "u-1", role: "user", name: "U", email: "u@u.test" },
} as any;
const adminCtx = {
  user: { id: "a-1", role: "admin", name: "A", email: "a@a.test" },
} as any;

beforeAll(async () => {
  const db = await getDb();
  if (!db) return;
  await db.delete(villaListingAudit).where(eq(villaListingAudit.villaKey, TEST_KEY));
  await db.delete(villaListings).where(eq(villaListings.villaKey, TEST_KEY));
});

afterAll(async () => {
  const db = await getDb();
  if (!db) return;
  await db.delete(villaListingAudit).where(eq(villaListingAudit.villaKey, TEST_KEY));
  await db.delete(villaListings).where(eq(villaListings.villaKey, TEST_KEY));
  await db.delete(villaListings).where(like(villaListings.community, "test-villaListings%"));
});

describe("villaListings router — public masking", () => {
  it("byKey returns null for an unknown villa", { timeout: 20_000 }, async () => {
    const caller = appRouter.createCaller(anonCtx);
    const row = await caller.villaListings.byKey({ villaKey: TEST_KEY });
    expect(row).toBeNull();
  });

  it("listByCommunity is publicProcedure (no login required)", { timeout: 20_000 }, async () => {
    const caller = appRouter.createCaller(anonCtx);
    const rows = await caller.villaListings.listByCommunity({
      community: "this-community-does-not-exist",
    });
    expect(Array.isArray(rows)).toBe(true);
  });

  it("rejects malformed villaKey via Zod regex", async () => {
    const caller = appRouter.createCaller(anonCtx);
    await expect(
      caller.villaListings.byKey({ villaKey: "../../etc/passwd" }),
    ).rejects.toBeTruthy();
    await expect(
      caller.villaListings.byKey({ villaKey: "with spaces" }),
    ).rejects.toBeTruthy();
  });
});

describe("villaListings router — admin upsert + masking", () => {
  it("rejects upsert for anonymous callers", async () => {
    const caller = appRouter.createCaller(anonCtx);
    await expect(
      caller.villaListings.upsert({
        villaKey: TEST_KEY,
        community: TEST_COMMUNITY,
        askingPriceAed: 1_000_000,
      }),
    ).rejects.toBeTruthy();
  });

  it("rejects upsert for plain users", async () => {
    const caller = appRouter.createCaller(userCtx);
    await expect(
      caller.villaListings.upsert({
        villaKey: TEST_KEY,
        community: TEST_COMMUNITY,
        askingPriceAed: 1_000_000,
      }),
    ).rejects.toBeTruthy();
  });

  it("admin can create + update a listing and audit row is written", { timeout: 30_000 }, async () => {
    const admin = appRouter.createCaller(adminCtx);

    // create
    const created = await admin.villaListings.upsert({
      villaKey: TEST_KEY,
      community: TEST_COMMUNITY,
      askingPriceAed: 4_500_000,
      status: "available",
      listingPartners: "NAS Luxury",
      ownerName: "Test Owner",
      ownerPhone: "+9715000",
      internalNotes: "Internal: very motivated",
    });
    expect(created.askingPriceAed).toBe(4_500_000);
    expect(created.status).toBe("available");
    expect(created.ownerName).toBe("Test Owner");

    // public callers must NOT see owner fields
    const pubRow: any = await appRouter
      .createCaller(anonCtx)
      .villaListings.byKey({ villaKey: TEST_KEY });
    expect(pubRow).toBeTruthy();
    expect(pubRow.askingPriceAed).toBe(4_500_000);
    expect(pubRow.ownerName).toBeUndefined();
    expect(pubRow.ownerPhone).toBeUndefined();
    expect(pubRow.internalNotes).toBeUndefined();

    // admin DOES see owner fields
    const adminRow: any = await admin.villaListings.byKey({ villaKey: TEST_KEY });
    expect(adminRow.ownerName).toBe("Test Owner");
    expect(adminRow.internalNotes).toBe("Internal: very motivated");

    // update price → audit row should be appended
    await admin.villaListings.upsert({
      villaKey: TEST_KEY,
      community: TEST_COMMUNITY,
      askingPriceAed: 4_750_000,
    });

    const audit = await admin.villaListings.audit({ villaKey: TEST_KEY });
    expect(audit.length).toBeGreaterThanOrEqual(2);
    const summaries = audit.map((a: any) => a.summary).join("\n");
    expect(summaries).toMatch(/askingPriceAed/);
  });

  it("listByCommunity bulk fetches the test community", { timeout: 20_000 }, async () => {
    const rows = await appRouter
      .createCaller(anonCtx)
      .villaListings.listByCommunity({ community: TEST_COMMUNITY });
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].villaKey).toBe(TEST_KEY);
    // public projection
    expect((rows[0] as any).ownerName).toBeUndefined();
  });
});


describe("villaListings — Aldar villaKey shapes", () => {
  const ALDAR_KEYS = [
    {
      villaKey: "aldar-saadiyat/faya-al-saadiyat/fayaalsaadiyat-sb45/FayaAlSaadiyat-SB45-V-01-01",
      community: "aldar-saadiyat",
    },
    {
      villaKey: "aldar-other/al-deem-townhomes/aldeemtownhomes-aldeem/AlDeemTownhomes-AlDeem-TH-021",
      community: "aldar-other",
    },
  ];

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;
    for (const k of ALDAR_KEYS) {
      await db.delete(villaListingAudit).where(eq(villaListingAudit.villaKey, k.villaKey));
      await db.delete(villaListings).where(eq(villaListings.villaKey, k.villaKey));
    }
  });

  it("accepts aldar-saadiyat and aldar-other villaKeys via admin upsert", async () => {
    const caller = appRouter.createCaller(adminCtx);
    for (const k of ALDAR_KEYS) {
      const row = await caller.villaListings.upsert({
        villaKey: k.villaKey,
        community: k.community,
        askingPriceAed: 1_500_000,
        status: "available",
      });
      expect(row.villaKey).toBe(k.villaKey);
      expect(row.community).toBe(k.community);
      expect(row.askingPriceAed).toBe(1_500_000);
    }
  });

  it("listByCommunity returns aldar rows when filtered by community", async () => {
    const caller = appRouter.createCaller(anonCtx);
    const rows = await caller.villaListings.listByCommunity({ community: "aldar-saadiyat" });
    expect(rows.some(r => r.villaKey.startsWith("aldar-saadiyat/"))).toBe(true);
  });

  it("listByCommunity prefix filter narrows to a single project/building", async () => {
    const caller = appRouter.createCaller(anonCtx);
    const rows = await caller.villaListings.listByCommunity({
      prefix: "aldar-saadiyat/faya-al-saadiyat/",
    });
    expect(rows.every(r => r.villaKey.startsWith("aldar-saadiyat/faya-al-saadiyat/"))).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
  });
});
