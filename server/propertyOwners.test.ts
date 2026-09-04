import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { propertyOwnerImportRecords, propertyOwnerUnits, propertyOwners, villaListingAudit, villaListings } from "../drizzle/schema";
import { getDb } from "./db";
import { appRouter } from "./routers";

const OWNER_SOURCE = "vitest-unified-owner-record";
const OWNER_REVIEW_SOURCE = "vitest-unified-owner-review";
const OWNER_REVIEW_FILE = "vitest-owner-review.xlsx";
const VILLA_KEY = "owners-test/Villa-1";
const SECOND_VILLA_KEY = "owners-test/Villa-2";
const REVIEW_VILLA_KEY = "owners-test/Villa-review";
const PUBLISHED_VILLA_KEY = "owners-test/Villa-Published";
const COMMUNITY = "owners-test";

const masterCtx = {
  user: { id: 991, role: "master", email: "master-owner-test@example.test", name: "Owner Test Master" },
} as any;
const adminCtx = {
  user: { id: 992, role: "admin", email: "admin-owner-test@example.test", name: "Owner Test Admin" },
} as any;
const userCtx = {
  user: { id: 993, role: "user", email: "user-owner-test@example.test", name: "Owner Test User" },
} as any;

async function cleanup() {
  const db = await getDb();
  if (!db) return;
  await db.delete(propertyOwnerImportRecords).where(eq(propertyOwnerImportRecords.sourceFile, OWNER_REVIEW_FILE));
  await db.delete(propertyOwnerUnits).where(eq(propertyOwnerUnits.villaKey, VILLA_KEY));
  await db.delete(propertyOwnerUnits).where(eq(propertyOwnerUnits.villaKey, SECOND_VILLA_KEY));
  await db.delete(propertyOwnerUnits).where(eq(propertyOwnerUnits.villaKey, REVIEW_VILLA_KEY));
  await db.delete(villaListingAudit).where(eq(villaListingAudit.villaKey, VILLA_KEY));
  await db.delete(villaListings).where(eq(villaListings.villaKey, VILLA_KEY));
  await db.delete(villaListings).where(eq(villaListings.villaKey, SECOND_VILLA_KEY));
  await db.delete(villaListings).where(eq(villaListings.villaKey, REVIEW_VILLA_KEY));
  await db.delete(villaListings).where(eq(villaListings.villaKey, PUBLISHED_VILLA_KEY));
  await db.delete(propertyOwners).where(eq(propertyOwners.sourceLabel, OWNER_SOURCE));
  await db.delete(propertyOwners).where(eq(propertyOwners.sourceLabel, OWNER_REVIEW_SOURCE));
}

beforeAll(cleanup);
afterAll(cleanup);

describe("unified owner records", () => {
  it("links a Master-reviewed owner to an exact unit without publishing availability", async () => {
    const master = appRouter.createCaller(masterCtx);
    const owner = await master.propertyOwners.create({
      displayName: "Verified Owner Test",
      phone: "+971500001234",
      email: "verified.owner@example.test",
      sourceLabel: OWNER_SOURCE,
      internalNotes: "Evidence retained in test record.",
    });

    await master.propertyOwners.linkUnit({
      ownerId: owner.id,
      villaKey: VILLA_KEY,
      community: COMMUNITY,
      relationship: "owner",
      sourceLabel: OWNER_SOURCE,
    });
    await master.propertyOwners.linkUnit({
      ownerId: owner.id,
      villaKey: SECOND_VILLA_KEY,
      community: COMMUNITY,
      relationship: "owner",
      sourceLabel: OWNER_SOURCE,
    });

    const detail = await master.propertyOwners.detail({ id: owner.id });
    expect(detail?.links).toHaveLength(2);
    expect(detail?.links).toContainEqual(expect.objectContaining({ villaKey: VILLA_KEY, community: COMMUNITY, relationship: "owner" }));
    expect(detail?.links).toContainEqual(expect.objectContaining({ villaKey: SECOND_VILLA_KEY, community: COMMUNITY, relationship: "owner" }));

    const masterCard: any = await master.villaListings.byKey({ villaKey: VILLA_KEY });
    expect(masterCard).toMatchObject({ ownerName: "Verified Owner Test", ownerPhone: "+971500001234", status: "draft" });
    expect(masterCard.publishedAt).toBeUndefined();
    const secondCard: any = await master.villaListings.byKey({ villaKey: SECOND_VILLA_KEY });
    expect(secondCard).toMatchObject({ status: "draft" });
  });

  it("never gives an unscoped Admin or User the owner contact or owner register", async () => {
    const admin = appRouter.createCaller(adminCtx);
    const user = appRouter.createCaller(userCtx);

    const adminCard: any = await admin.villaListings.byKey({ villaKey: VILLA_KEY });
    const userCard: any = await user.villaListings.byKey({ villaKey: VILLA_KEY });
    expect(adminCard.ownerName).toBeUndefined();
    expect(adminCard.ownerPhone).toBeUndefined();
    expect(userCard.ownerName).toBeUndefined();
    expect(userCard.ownerPhone).toBeUndefined();

    await expect(admin.propertyOwners.list({ limit: 10 })).rejects.toBeTruthy();
    await expect(user.propertyOwners.list({ limit: 10 })).rejects.toBeTruthy();
  });

  it("keeps exact historical unit emails, their documented role, and their source Master-only", async () => {
    const db = await getDb();
    if (!db) throw new Error("Test database unavailable.");
    await db.insert(villaListingAudit).values({
      villaKey: VILLA_KEY,
      actorEmail: masterCtx.user.email,
      actorName: masterCtx.user.name,
      summary: "Updated owner email",
      changesJson: JSON.stringify({ ownerEmail: { from: "previous.contact@example.test", to: "verified.owner@example.test" } }),
    });
    const master = appRouter.createCaller(masterCtx);
    const contacts = await master.propertyOwners.unitContacts({ villaKey: VILLA_KEY, community: COMMUNITY });
    expect(contacts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        email: "verified.owner@example.test",
        roles: expect.arrayContaining(["Owner"]),
      }),
      expect.objectContaining({
        email: "previous.contact@example.test",
        roles: expect.arrayContaining(["Previous card contact"]),
      }),
    ]));
    const admin = appRouter.createCaller(adminCtx);
    const user = appRouter.createCaller(userCtx);
    await expect(admin.propertyOwners.unitContacts({ villaKey: VILLA_KEY, community: COMMUNITY })).rejects.toBeTruthy();
    await expect(user.propertyOwners.unitContacts({ villaKey: VILLA_KEY, community: COMMUNITY })).rejects.toBeTruthy();
  });

  it("requires a Master-confirmed exact key to resolve an imported exception row", async () => {
    const master = appRouter.createCaller(masterCtx);
    const owner = await master.propertyOwners.create({
      displayName: "Review Queue Owner",
      phone: "+971500009999",
      sourceLabel: OWNER_REVIEW_SOURCE,
    });
    const db = await getDb();
    if (!db) throw new Error("Test database unavailable.");
    const result = await db.insert(propertyOwnerImportRecords).values({
      sourceFile: OWNER_REVIEW_FILE,
      sourceSheet: "Owners",
      sourceRow: 1,
      sourceUnit: "B1-01-01",
      sourceProject: "Test Project",
      ownerId: owner.id,
      matchStatus: "unlinked",
      matchReason: "no_exact_unit_match",
      rawOwnerName: owner.displayName,
      rawOwnerPhone: owner.phone,
      importedBy: masterCtx.user.email,
    });
    const importRecordId = Number(result[0].insertId);
    const queued = await master.propertyOwners.reviewQueue({ sourceFile: OWNER_REVIEW_FILE, limit: 10 });
    expect(queued).toEqual(expect.arrayContaining([expect.objectContaining({ id: importRecordId, matchStatus: "unlinked" })]));

    await master.propertyOwners.resolveImport({
      importRecordId,
      villaKey: REVIEW_VILLA_KEY,
      community: COMMUNITY,
      relationship: "owner",
    });
    const detail = await master.propertyOwners.detail({ id: owner.id });
    expect(detail?.links).toContainEqual(expect.objectContaining({ villaKey: REVIEW_VILLA_KEY, relationship: "owner" }));
    expect(detail?.imports).toContainEqual(expect.objectContaining({ id: importRecordId, villaKey: REVIEW_VILLA_KEY, matchStatus: "linked", matchReason: "master_confirmed_exact_link" }));
    const directoryByProject: any[] = await master.propertyOwners.list({ q: "Test Project", limit: 10 });
    expect(directoryByProject).toContainEqual(expect.objectContaining({
      id: owner.id,
      sourceProjects: ["Test Project"],
      links: expect.arrayContaining([expect.objectContaining({ villaKey: REVIEW_VILLA_KEY })]),
      importRecords: expect.arrayContaining([expect.objectContaining({ id: importRecordId, matchStatus: "linked" })]),
    }));
    const remaining = await master.propertyOwners.reviewQueue({ sourceFile: OWNER_REVIEW_FILE, limit: 10 });
    expect(remaining).toHaveLength(0);
  }, 15_000);

  it("records the publisher and first publication date when a unified unit becomes available for resale", async () => {
    const master = appRouter.createCaller(masterCtx);
    const available = await master.villaListings.upsert({
      villaKey: PUBLISHED_VILLA_KEY,
      community: COMMUNITY,
      status: "available",
      askingPriceAed: 7_500_000,
    });
    expect(available.status).toBe("available");
    expect(available.publishedAt).toBeInstanceOf(Date);
    expect(available.publishedBy).toBe(masterCtx.user.email);
    expect(available.publishedByName).toBe(masterCtx.user.name);

    const warmed = await master.villaListings.upsert({
      villaKey: PUBLISHED_VILLA_KEY,
      community: COMMUNITY,
      status: "warm",
    });
    expect(warmed.publishedAt).toEqual(available.publishedAt);
    expect(warmed.publishedBy).toBe(masterCtx.user.email);
  });
});
