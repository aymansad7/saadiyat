import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import {
  activityAudit,
  propertyAccessGrants,
  villaListingAudit,
  villaListings,
} from "../drizzle/schema";
import { getDb } from "./db";
import { appRouter } from "./routers";

const EMAIL = "delegated-property-editor@test.local";
const VILLA_KEY = "permissions-test/Plot-1";
const COMMUNITY = "permissions-test";

const masterCtx = {
  user: { id: 901, role: "master", name: "Master Tester", email: "master@test.local" },
} as any;
const delegatedCtx = {
  user: { id: 902, role: "user", name: "Delegated Tester", email: EMAIL },
} as any;
const adminCtx = {
  user: { id: 903, role: "admin", name: "Admin Tester", email: "admin@test.local" },
} as any;

async function cleanup() {
  const db = await getDb();
  if (!db) return;
  await db.delete(propertyAccessGrants).where(eq(propertyAccessGrants.email, EMAIL));
  await db.delete(villaListingAudit).where(eq(villaListingAudit.villaKey, VILLA_KEY));
  await db.delete(villaListings).where(eq(villaListings.villaKey, VILLA_KEY));
  await db.delete(activityAudit).where(
    and(eq(activityAudit.entityKey, VILLA_KEY), eq(activityAudit.entityType, "property")),
  );
}

beforeAll(cleanup);
afterAll(cleanup);

describe("Master Admin property grants", () => {
  it("allows only a real master to manage delegated property grants", async () => {
    await expect(
      appRouter.createCaller(adminCtx).propertyAccess.grants.create({
        email: EMAIL,
        areaKey: "other",
        projectKey: null,
        canViewOriginalPrice: true,
        canViewOwnerName: false,
        canViewOwnerPhone: false,
        canEditProperties: false,
      }),
    ).rejects.toBeTruthy();

    const master = appRouter.createCaller(masterCtx);
    const grant = await master.propertyAccess.grants.create({
      email: EMAIL,
      areaKey: "other",
      projectKey: null,
      canViewOriginalPrice: true,
      canViewOwnerName: true,
      canViewOwnerPhone: true,
      canEditProperties: true,
    });
    expect(grant.email).toBe(EMAIL);

    const permissions = await appRouter.createCaller(delegatedCtx).propertyAccess.permissions({
      projects: [COMMUNITY, "st-regis"],
    });
    expect(permissions[0]?.permissions).toMatchObject({
      canAccess: true,
      canViewOriginalPrice: true,
      canViewOwnerName: true,
      canViewOwnerPhone: true,
      canEditProperties: true,
    });
    expect(permissions[1]?.permissions.canAccess).toBe(false);
  });

  it("lets a master add multiple project and phase grants without exposing another Lagoons phase", async () => {
    const master = appRouter.createCaller(masterCtx);
    const result = await master.propertyAccess.grants.createMany({
      email: EMAIL,
      scopes: [
        { areaKey: null, projectKey: "lagoons", phaseKey: "SL2" },
        { areaKey: null, projectKey: "hidd", phaseKey: null },
      ],
      canViewOriginalPrice: true,
      canViewOwnerName: true,
      canViewOwnerPhone: false,
      canEditProperties: true,
    });
    expect(result.created).toHaveLength(2);

    const permissions = await appRouter.createCaller(delegatedCtx).propertyAccess.permissions({
      scopes: [
        { projectKey: "lagoons", phaseKey: "SL2" },
        { projectKey: "lagoons", phaseKey: "SL8" },
        { projectKey: "hidd", phaseKey: null },
      ],
    });
    expect(permissions[0]?.permissions).toMatchObject({
      canAccess: true,
      canViewOriginalPrice: true,
      canViewOwnerName: true,
      canViewOwnerPhone: false,
      canEditProperties: true,
    });
    expect(permissions[1]?.permissions.canAccess).toBe(false);
    expect(permissions[2]?.permissions.canEditProperties).toBe(true);
  });

  it("persists delegated edits including areas and rent, and appends activity history", async () => {
    const caller = appRouter.createCaller(delegatedCtx);
    const row = await caller.villaListings.upsert({
      villaKey: VILLA_KEY,
      community: COMMUNITY,
      askingPriceAed: 9_500_000,
      status: "available",
      landAreaSqm: 1_240.5,
      builtUpAreaSqm: 875.25,
      availableForRent: true,
      rentPriceAed: 650_000,
      ownerName: "Delegated Test Owner",
      ownerPhone: "+971500000000",
    });

    expect(row).toMatchObject({
      askingPriceAed: 9_500_000,
      landAreaSqm: 1_240.5,
      builtUpAreaSqm: 875.25,
      availableForRent: true,
      rentPriceAed: 650_000,
    });

    const delegatedView: any = await caller.villaListings.byKey({ villaKey: VILLA_KEY });
    expect(delegatedView.ownerName).toBe("Delegated Test Owner");
    expect(delegatedView.ownerPhone).toBe("+971500000000");
    expect(delegatedView.ownerEmail).toBeUndefined();

    const publicView: any = await appRouter.createCaller({ user: null } as any).villaListings.byKey({ villaKey: VILLA_KEY });
    expect(publicView.landAreaSqm).toBe(1_240.5);
    expect(publicView.rentPriceAed).toBe(650_000);
    expect(publicView.ownerName).toBeUndefined();
    expect(publicView.ownerPhone).toBeUndefined();

    const db = await getDb();
    if (!db) return;
    const events = await db
      .select()
      .from(activityAudit)
      .where(and(eq(activityAudit.entityType, "property"), eq(activityAudit.entityKey, VILLA_KEY)));
    expect(events.some(event => event.eventType === "property_edit" && event.actorEmail === EMAIL)).toBe(true);
  });
});
