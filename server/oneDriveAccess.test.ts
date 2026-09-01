import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { propertyAccessGrants, unitDocuments, villaListings } from "../drizzle/schema";
import { getDb } from "./db";
import { appRouter } from "./routers";

const VILLA_KEY = "onedrive-access-test/Unit-1";
const COMMUNITY = "onedrive-access-test";
const DELEGATED_EMAIL = "onedrive-owner-file-viewer@test.local";

const masterCtx = {
  user: { id: 1001, role: "master", name: "Master Tester", email: "master@test.local" },
} as any;
const delegatedCtx = {
  user: { id: 1002, role: "user", name: "Delegated Viewer", email: DELEGATED_EMAIL },
} as any;
const unscopedAdminCtx = {
  user: { id: 1003, role: "admin", name: "Unscoped Admin", email: "onedrive-unscoped-admin@test.local" },
} as any;

async function cleanup() {
  const db = await getDb();
  if (!db) return;
  await db.delete(unitDocuments).where(and(eq(unitDocuments.villaKey, VILLA_KEY), eq(unitDocuments.community, COMMUNITY)));
  await db.delete(villaListings).where(eq(villaListings.villaKey, VILLA_KEY));
  await db.delete(propertyAccessGrants).where(eq(propertyAccessGrants.email, DELEGATED_EMAIL));
}

beforeAll(cleanup);
afterAll(cleanup);

describe("OneDrive unit document access", () => {
  it("releases only an explicitly granted owner document for the exact unit scope", async () => {
    const db = await getDb();
    if (!db) return;
    await db.insert(villaListings).values({
      villaKey: VILLA_KEY,
      community: COMMUNITY,
      buildingKey: "B-17",
      unitTypeKey: "2BHK",
      bedrooms: 2,
      status: "draft",
    });
    await db.insert(propertyAccessGrants).values({
      email: DELEGATED_EMAIL,
      areaKey: "other",
      projectKey: COMMUNITY,
      buildingKey: "B-17",
      unitTypeKey: "2BHK",
      bedrooms: 2,
      canViewOriginalPrice: false,
      canViewOwnerName: false,
      canViewOwnerPhone: false,
      canViewOwnerDocuments: true,
      canEditProperties: false,
      createdBy: masterCtx.user.email,
    });
    await db.insert(unitDocuments).values([
      {
        villaKey: VILLA_KEY,
        community: COMMUNITY,
        documentType: "owner_document",
        websiteVisibility: "master_admin",
        filename: "owner-verification.txt",
        mimeType: "text/plain",
        driveId: "test-access-drive",
        itemId: "test-owner-document",
        uploadedBy: masterCtx.user.email,
        shareUrl: "https://example.test/owner-document",
      },
      {
        villaKey: VILLA_KEY,
        community: COMMUNITY,
        documentType: "spa",
        websiteVisibility: "master_admin",
        filename: "spa.txt",
        mimeType: "text/plain",
        driveId: "test-access-drive",
        itemId: "test-spa-document",
        uploadedBy: masterCtx.user.email,
        shareUrl: "https://example.test/spa-document",
      },
    ]);

    const delegated = await appRouter.createCaller(delegatedCtx).oneDrive.forVilla({ villaKey: VILLA_KEY, community: COMMUNITY });
    expect(delegated.map(document => document.documentType)).toEqual(["owner_document"]);
    expect(delegated[0]?.shareUrl).toBe("https://example.test/owner-document");

    await expect(
      appRouter.createCaller(unscopedAdminCtx).oneDrive.forVilla({ villaKey: VILLA_KEY, community: COMMUNITY }),
    ).rejects.toBeTruthy();

    const master = await appRouter.createCaller(masterCtx).oneDrive.forVilla({ villaKey: VILLA_KEY, community: COMMUNITY });
    expect(master.map(document => document.documentType).sort()).toEqual(["owner_document", "spa"]);

    const publicCardLinks = await appRouter.createCaller({ user: null } as any).oneDrive.cardLinks({ villaKey: VILLA_KEY });
    expect(publicCardLinks).toEqual([]);
  });
});
