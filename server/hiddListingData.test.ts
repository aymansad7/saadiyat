import { afterEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import publicHiddData from "../client/src/data/hiddPublic.json";
import { propertyAccessGrants } from "../drizzle/schema";
import { getHiddSensitiveFacts } from "./hiddListingData";
import { getDb } from "./db";

const NARROW_HIDD_EMAIL = "hidd-narrow-viewer@test.local";

function scopeKeyPart(value: string | undefined): string | null {
  const normalized = value?.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return normalized || null;
}

afterEach(async () => {
  const db = await getDb();
  if (db) await db.delete(propertyAccessGrants).where(eq(propertyAccessGrants.email, NARROW_HIDD_EMAIL));
});

describe("Hidd protected listing data", () => {
  it("never includes source owner or tenant fields in the browser dataset", () => {
    const forbidden = [
      "owner1Name", "owner1Email", "owner1Mobile", "owner2Name", "owner2Email", "owner2Mobile",
      "tenantName", "tenantEmail", "tenantMobile", "ownerRepName", "ownerRepEmail", "ownerRepMobile",
      "hiddCard", "plateNumber", "tenantPlateNumber",
    ];
    expect(publicHiddData.length).toBeGreaterThan(0);
    for (const row of publicHiddData) {
      for (const field of forbidden) expect(row).not.toHaveProperty(field);
    }
  });

  it("does not return protected facts without a signed-in caller", async () => {
    await expect(getHiddSensitiveFacts(null)).resolves.toEqual([]);
  });

  it("returns available protected facts to a Master Admin without exposing them to anonymous callers", async () => {
    const facts = await getHiddSensitiveFacts({ role: "master", email: "master-hidd-test@example.test" });
    expect(facts.length).toBeGreaterThan(0);
    expect(facts.every(fact => fact.villaKey.startsWith("hidd/"))).toBe(true);
    expect(facts.some(fact => fact.ownerName || fact.ownerPhone || fact.tenant)).toBe(true);
  });

  it("applies owner visibility to the exact Hidd street, type, and bedroom scope", async () => {
    const masterFacts = await getHiddSensitiveFacts({ role: "master", email: "master-hidd-test@example.test" });
    const target = masterFacts.find(fact => Boolean(fact.ownerName));
    expect(target).toBeDefined();
    const [, villaNumber, street] = target!.villaKey.split("/");
    const source = publicHiddData.find(row => row.villaNumber === villaNumber && row.street === street);
    expect(source).toBeDefined();
    const bedrooms = Number.parseInt(source?.bedrooms ?? "", 10);
    const db = await getDb();
    if (!db) return;
    await db.insert(propertyAccessGrants).values({
      email: NARROW_HIDD_EMAIL,
      areaKey: "saadiyat",
      projectKey: "hidd",
      buildingKey: scopeKeyPart(`street-${source?.street ?? ""}`),
      unitTypeKey: scopeKeyPart(source?.villaType),
      bedrooms: Number.isInteger(bedrooms) ? bedrooms : null,
      canViewOriginalPrice: false,
      canViewOwnerName: true,
      canViewOwnerPhone: false,
      canViewOwnerDocuments: false,
      canEditProperties: false,
      createdBy: "master-hidd-test@example.test",
    });

    const exact = await getHiddSensitiveFacts({ role: "user", email: NARROW_HIDD_EMAIL });
    expect(exact.length).toBeGreaterThan(0);
    expect(exact.some(fact => fact.villaKey === target!.villaKey)).toBe(true);
    expect(exact.every(fact => {
      const [, factVillaNumber, factStreet] = fact.villaKey.split("/");
      const factSource = publicHiddData.find(row => row.villaNumber === factVillaNumber && row.street === factStreet);
      return scopeKeyPart(`street-${factSource?.street ?? ""}`) === scopeKeyPart(`street-${source?.street ?? ""}`)
        && scopeKeyPart(factSource?.villaType) === scopeKeyPart(source?.villaType)
        && Number.parseInt(factSource?.bedrooms ?? "", 10) === bedrooms;
    })).toBe(true);
    expect(exact.every(fact => fact.ownerPhone === undefined)).toBe(true);

    const unscopedAdmin = await getHiddSensitiveFacts({ role: "admin", email: "hidd-unscoped-admin@test.local" });
    expect(unscopedAdmin).toEqual([]);
  });
});
