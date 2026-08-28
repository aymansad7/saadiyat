import hiddDataRaw from "./data/hidd_al_saadiyat.json";
import { eq } from "drizzle-orm";
import { propertyAccessGrants } from "../drizzle/schema";
import { getPropertyScope, resolvePropertyPermissions } from "../shared/propertyAccess";
import { getDb } from "./db";

type HiddRawVilla = Record<string, unknown>;

export type HiddSensitiveFact = {
  villaKey: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  tenant?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  tenancyStart?: string;
  tenancyEnd?: string;
  tenancyContractReceived?: string;
  tenantRelationship?: string;
  tenantNationality?: string;
  tenantAccessCards?: string;
  tenantPlateNumber?: string;
  tenantVehicleType?: string;
  owner2Relationship?: string;
  ownerRepName?: string;
  ownerRepEmail?: string;
  ownerRepMobile?: string;
  hiddCard?: string;
  plateNumber?: string;
  vehicleType?: string;
  registeredAccessCards?: string;
};

const rawVillas: HiddRawVilla[] = (Array.isArray(hiddDataRaw)
  ? hiddDataRaw
  : (hiddDataRaw as { default?: HiddRawVilla[] }).default ?? []) as HiddRawVilla[];

function text(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const normalized = String(value).trim();
  return normalized || undefined;
}

function hiddVillaKey(row: HiddRawVilla): string | null {
  const villaNumber = text(row.villaNumber);
  const street = text(row.street);
  return villaNumber && street ? `hidd/${villaNumber}/${street}` : null;
}

function joined(...values: unknown[]): string | undefined {
  const result = values.map(text).filter((value): value is string => Boolean(value)).join(" · ");
  return result || undefined;
}

/**
 * Maps the protected columns from the Hidd source file only after the caller's
 * project/field permissions are resolved. The browser never receives this raw
 * source file.
 */
export async function getHiddSensitiveFacts(user: { role?: string | null; email?: string | null } | null | undefined) {
  if (!user) return [] as HiddSensitiveFact[];
  const isAdmin = user.role === "admin" || user.role === "master";
  const db = await getDb();
  const grants = !db || !user.email
    ? []
    : await db
      .select()
      .from(propertyAccessGrants)
      .where(eq(propertyAccessGrants.email, user.email.toLowerCase()));
  const permissions = resolvePropertyPermissions(user.role, grants, getPropertyScope("hidd"));
  if (!permissions.canAccess || (!permissions.canViewOwnerName && !permissions.canViewOwnerPhone && !isAdmin)) {
    return [] as HiddSensitiveFact[];
  }

  return rawVillas.flatMap(row => {
    const villaKey = hiddVillaKey(row);
    if (!villaKey) return [];
    const fact: HiddSensitiveFact = { villaKey };

    if (permissions.canViewOwnerName || isAdmin) {
      fact.ownerName = joined(row.owner1Name, row.owner2Name);
      fact.owner2Relationship = text(row.owner2Relationship);
      fact.ownerRepName = text(row.ownerRepName);
    }
    if (permissions.canViewOwnerPhone || isAdmin) {
      fact.ownerPhone = joined(row.owner1Mobile, row.owner2Mobile);
      fact.ownerRepMobile = text(row.ownerRepMobile);
    }
    // Email, tenant, vehicle, access-card, and tenancy details retain the
    // existing master/admin-only policy.
    if (isAdmin) {
      fact.ownerEmail = joined(row.owner1Email, row.owner2Email);
      fact.ownerRepEmail = text(row.ownerRepEmail);
      fact.hiddCard = text(row.hiddCard);
      fact.plateNumber = text(row.plateNumber);
      fact.vehicleType = text(row.vehicleType);
      fact.registeredAccessCards = text(row.registeredAccessCards);
      fact.tenant = text(row.tenantName);
      fact.tenantPhone = text(row.tenantMobile);
      fact.tenantEmail = text(row.tenantEmail);
      fact.tenancyStart = text(row.tenancyStart);
      fact.tenancyEnd = text(row.tenancyEnd);
      fact.tenancyContractReceived = text(row.tenancyContractReceived);
      fact.tenantRelationship = text(row.tenantRelationship);
      fact.tenantNationality = text(row.tenantNationality);
      fact.tenantAccessCards = text(row.tenantAccessCards);
      fact.tenantPlateNumber = text(row.tenantPlateNumber);
      fact.tenantVehicleType = text(row.tenantVehicleType);
    }
    return Object.keys(fact).length > 1 ? [fact] : [];
  });
}
