import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { propertyOwnerUnits, propertyOwners, villaListings } from "../drizzle/schema";
import { getDb } from "./db";
import { appRouter } from "./routers";

const OWNER_SOURCE = "vitest-unified-owner-record";
const VILLA_KEY = "owners-test/Villa-1";
const SECOND_VILLA_KEY = "owners-test/Villa-2";
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
  await db.delete(propertyOwnerUnits).where(eq(propertyOwnerUnits.villaKey, VILLA_KEY));
  await db.delete(propertyOwnerUnits).where(eq(propertyOwnerUnits.villaKey, SECOND_VILLA_KEY));
  await db.delete(villaListings).where(eq(villaListings.villaKey, VILLA_KEY));
  await db.delete(villaListings).where(eq(villaListings.villaKey, SECOND_VILLA_KEY));
  await db.delete(villaListings).where(eq(villaListings.villaKey, PUBLISHED_VILLA_KEY));
  await db.delete(propertyOwners).where(eq(propertyOwners.sourceLabel, OWNER_SOURCE));
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
