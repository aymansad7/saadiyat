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
import { propertyAccessGrants, villaListingAudit, villaListings } from "../drizzle/schema";
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
const masterCtx = {
  user: { id: "m-1", role: "master", name: "M", email: "m@m.test" },
} as any;

beforeAll(async () => {
  const db = await getDb();
  if (!db) return;
  await db.delete(villaListingAudit).where(eq(villaListingAudit.villaKey, TEST_KEY));
  await db.delete(villaListings).where(eq(villaListings.villaKey, TEST_KEY));
  await db.delete(propertyAccessGrants).where(eq(propertyAccessGrants.email, "a@a.test"));
}, 30_000);

afterAll(async () => {
  const db = await getDb();
  if (!db) return;
  await db.delete(villaListingAudit).where(eq(villaListingAudit.villaKey, TEST_KEY));
  await db.delete(villaListings).where(eq(villaListings.villaKey, TEST_KEY));
  await db.delete(villaListings).where(like(villaListings.community, "test-villaListings%"));
  await db.delete(propertyAccessGrants).where(eq(propertyAccessGrants.email, "a@a.test"));
}, 30_000);

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

describe("villaListings router — Master Admin upsert + masking", () => {
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

  it("Master Admin can create + update a listing and audit row is written", { timeout: 30_000 }, async () => {
    const admin = appRouter.createCaller(masterCtx);

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

    // Master Admin does see owner fields
    const adminRow: any = await admin.villaListings.byKey({ villaKey: TEST_KEY });
    expect(adminRow.ownerName).toBe("Test Owner");
    expect(adminRow.internalNotes).toBe("Internal: very motivated");

    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    await db.update(villaListings).set({
      ownerCurrentDataJson: JSON.stringify([{ sourceRow: 18, stage: "Current" }]),
      ownerHistoryJson: JSON.stringify([{ kind: "prior_card_owner_overlay", data: { ownerPhone: "+9715000" } }]),
    }).where(eq(villaListings.villaKey, TEST_KEY));
    const protectedMasterRow: any = await admin.villaListings.byKey({ villaKey: TEST_KEY });
    const protectedPublicRow: any = await appRouter.createCaller(anonCtx).villaListings.byKey({ villaKey: TEST_KEY });
    expect(protectedMasterRow.ownerCurrentDataJson).toContain("Current");
    expect(protectedMasterRow.ownerHistoryJson).toContain("prior_card_owner_overlay");
    expect(protectedPublicRow.ownerCurrentDataJson).toBeUndefined();
    expect(protectedPublicRow.ownerHistoryJson).toBeUndefined();

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

    await admin.villaListings.upsert({
      villaKey: TEST_KEY,
      community: TEST_COMMUNITY,
      status: "sold",
      saleAgentName: "Test Representative",
      soldAt: new Date("2026-09-05T12:00:00.000Z"),
    });
    const saleHistory = await admin.villaListings.history({ villaKey: TEST_KEY });
    const sale = saleHistory.find((entry: any) => entry.eventType === "manual_sold");
    expect(sale).toBeTruthy();
    expect(sale.saleAgentName).toBe("Test Representative");
    expect(sale.fromStatus).toBe("available");
    expect(sale.toStatus).toBe("sold");
    await expect(appRouter.createCaller(adminCtx).villaListings.history({ villaKey: TEST_KEY })).rejects.toBeTruthy();
  });

  it("shows delegated owner name and phone without releasing Google current or history payloads", { timeout: 30_000 }, async () => {
    const db = await getDb();
    if (!db) return;
    await db.insert(propertyAccessGrants).values({
      email: "a@a.test",
      areaKey: "other",
      projectKey: TEST_COMMUNITY,
      canViewOwnerName: true,
      canViewOwnerPhone: true,
      createdBy: "m@m.test",
    });
    const delegatedRow: any = await appRouter.createCaller(adminCtx).villaListings.byKey({ villaKey: TEST_KEY });
    expect(delegatedRow.ownerName).toBe("Test Owner");
    expect(delegatedRow.ownerPhone).toBe("+9715000");
    expect(delegatedRow.ownerCurrentDataJson).toBeUndefined();
    expect(delegatedRow.ownerHistoryJson).toBeUndefined();
    expect(delegatedRow.internalNotes).toBeUndefined();
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

  it("accepts aldar-saadiyat and aldar-other villaKeys via Master Admin upsert", async () => {
    const caller = appRouter.createCaller(masterCtx);
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

describe("villaListings.adminList — price range + multi-field search", () => {
  const STAMP = Date.now();
  const PRICE_COMMUNITY = "test-vl-price";
  const Q_COMMUNITY = "test-vl-q";
  const NEEDLE = `RareNeedle${STAMP}`;
  const PRICE_KEY_LOW = `tests/admin-list-${STAMP}-low`;
  const PRICE_KEY_MID = `tests/admin-list-${STAMP}-mid`;
  const PRICE_KEY_HIGH = `tests/admin-list-${STAMP}-high`;
  const Q_KEY_A = `tests/q-key-${STAMP}-a`;
  const Q_KEY_B = `tests/q-key-${STAMP}-b`;
  const Q_KEY_C = `tests/q-key-${STAMP}-c-${NEEDLE.toLowerCase()}`;

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;
    for (const k of [
      PRICE_KEY_LOW,
      PRICE_KEY_MID,
      PRICE_KEY_HIGH,
      Q_KEY_A,
      Q_KEY_B,
      Q_KEY_C,
    ]) {
      await db.delete(villaListingAudit).where(eq(villaListingAudit.villaKey, k));
      await db.delete(villaListings).where(eq(villaListings.villaKey, k));
    }
  });

  it("filters by priceMin/priceMax inclusive bounds", { timeout: 30_000 }, async () => {
    const admin = appRouter.createCaller(masterCtx);
    await admin.villaListings.upsert({
      villaKey: PRICE_KEY_LOW,
      community: PRICE_COMMUNITY,
      askingPriceAed: 5_000_000,
      status: "available",
    });
    await admin.villaListings.upsert({
      villaKey: PRICE_KEY_MID,
      community: PRICE_COMMUNITY,
      askingPriceAed: 12_000_000,
      status: "available",
    });
    await admin.villaListings.upsert({
      villaKey: PRICE_KEY_HIGH,
      community: PRICE_COMMUNITY,
      askingPriceAed: 25_000_000,
      status: "available",
    });

    const inRange = await admin.villaListings.adminList({
      community: PRICE_COMMUNITY,
      priceMin: 10_000_000,
      priceMax: 20_000_000,
      limit: 100,
    });
    const inKeys = inRange.map(r => r.villaKey).sort();
    expect(inKeys).toEqual([PRICE_KEY_MID]);

    const onlyMin = await admin.villaListings.adminList({
      community: PRICE_COMMUNITY,
      priceMin: 10_000_000,
      limit: 100,
    });
    const minKeys = onlyMin.map(r => r.villaKey).sort();
    expect(minKeys).toEqual([PRICE_KEY_HIGH, PRICE_KEY_MID].sort());

    const onlyMax = await admin.villaListings.adminList({
      community: PRICE_COMMUNITY,
      priceMax: 10_000_000,
      limit: 100,
    });
    const maxKeys = onlyMax.map(r => r.villaKey).sort();
    expect(maxKeys).toEqual([PRICE_KEY_LOW]);
  });

  it("free-text q matches across villaKey, ownerName, and internalNotes", { timeout: 30_000 }, async () => {
    const admin = appRouter.createCaller(masterCtx);

    await admin.villaListings.upsert({
      villaKey: Q_KEY_A,
      community: Q_COMMUNITY,
      ownerName: `Owner ${NEEDLE}`,
    });
    await admin.villaListings.upsert({
      villaKey: Q_KEY_B,
      community: Q_COMMUNITY,
      internalNotes: `Internal note mentioning ${NEEDLE} on file`,
    });
    await admin.villaListings.upsert({
      villaKey: Q_KEY_C,
      community: Q_COMMUNITY,
    });

    const hits = await admin.villaListings.adminList({
      community: Q_COMMUNITY,
      q: NEEDLE,
      limit: 50,
    });
    const hitKeys = hits.map(r => r.villaKey).sort();
    expect(hitKeys).toEqual([Q_KEY_A, Q_KEY_B, Q_KEY_C].sort());
  });
});
