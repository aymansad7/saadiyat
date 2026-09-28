import { readFileSync } from "node:fs";
import { and, eq } from "drizzle-orm";
import { appendActivityAudit } from "../server/activityAudit";
import { getDb } from "../server/db";
import {
  ensureFolderPath,
  exportUnitRegisterWorkbook,
  getConfiguredOneDrive,
  unitFolderPath,
  uploadOneDriveFile,
} from "../server/oneDrive";
import {
  inventoryImportedProjects,
  oneDriveSyncEvents,
  propertyOwnerUnits,
  propertyOwners,
  unitDocuments,
  villaListingAudit,
  villaListings,
} from "../drizzle/schema";

const ACTOR_EMAIL = "master-import@saadiyat-resalehub.local";
const ACTOR_NAME = "Master Admin · user-directed import";
const COMMUNITY = "aldar-other";
const PROJECT_SLUG = "yas-links-luxury-living";
const BUILDING = "YasLinksLuxury-B3";
const OWNER = {
  displayName: "Christopher King Piche",
  phone: "+971 56 696 6933",
  sourceLabel: "Waldorf Astoria SPA · 28 Sep 2026",
  internalNotes: "Verified purchaser in the supplied Aldar SPAs. No government ID, passport, or other identity-document values were stored in the CRM.",
} as const;
const CONTACT = {
  displayName: "Charan Owner FSPR AND WALDORF ASTORIA",
  phone: "+971 54 410 7299",
  sourceLabel: "Master contact screenshot · 28 Sep 2026",
  internalNotes: "Master-supplied operational contact for FSPR and Waldorf Astoria. The supplied SPAs do not establish this person as a co-owner.",
} as const;

const LISTINGS = [
  {
    unitName: "YasLinksLuxury-B3-07-04",
    bedrooms: 3,
    sourceAreaSqm: 267.64,
    areaSqft: 2881,
    askingPriceAed: 10_582_000,
    askingRateAedSqft: 3_672.5,
    originalDeveloperPriceAed: 8_595_800,
    spaPath: "/home/ubuntu/upload/SPA-WaldorfAstoriaB3-07-04.pdf",
    spaFilename: "SPA-WaldorfAstoriaB3-07-04.pdf",
    sourceUnitType: "3 Bedroom Type A",
  },
  {
    unitName: "YasLinksLuxury-B3-07-05",
    bedrooms: 2,
    sourceAreaSqm: 206.47,
    areaSqft: 2222,
    askingPriceAed: 8_165_000,
    askingRateAedSqft: 3_672.5,
    originalDeveloperPriceAed: 6_181_400,
    spaPath: "/home/ubuntu/upload/SPA-WaldorfAstoriaB3-07-05.pdf",
    spaFilename: "SPA-WaldorfAstoriaB3-07-05.pdf",
    sourceUnitType: "2 Bedroom Type B",
  },
] as const;

type ImportedUnit = {
  unit_name: string;
  bedrooms: string | null;
  saleable_area_sqm: number | null;
  total_area_sqm: number | null;
  price_aed: number | null;
  unit_category: string | null;
  unit_model: string | null;
};

function listingKey(unitName: string) {
  return `${COMMUNITY}/${PROJECT_SLUG}/${BUILDING}/${unitName}`;
}

function plain(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as unknown;
}

async function upsertOwner(input: typeof OWNER | typeof CONTACT) {
  const db = await getDb();
  if (db === null) throw new Error("Database unavailable.");
  const existing = (await db.select().from(propertyOwners).where(and(
    eq(propertyOwners.displayName, input.displayName),
    eq(propertyOwners.phone, input.phone),
  )).limit(1))[0];
  if (existing) {
    await db.update(propertyOwners).set({
      internalNotes: input.internalNotes,
      sourceLabel: input.sourceLabel,
      createdBy: ACTOR_EMAIL,
      createdByName: ACTOR_NAME,
    }).where(eq(propertyOwners.id, existing.id));
    return { id: existing.id, created: false };
  }
  const insert = await db.insert(propertyOwners).values({
    displayName: input.displayName,
    phone: input.phone,
    email: null,
    internalNotes: input.internalNotes,
    sourceLabel: input.sourceLabel,
    createdBy: ACTOR_EMAIL,
    createdByName: ACTOR_NAME,
  });
  const id = Number(insert[0].insertId);
  await appendActivityAudit({
    eventType: "owner_create",
    actorEmail: ACTOR_EMAIL,
    actorName: ACTOR_NAME,
    entityType: "property_owner",
    entityKey: String(id),
    summary: `Created verified owner/contact record ${input.displayName}.`,
  });
  return { id, created: true };
}

async function linkOwner(input: {
  ownerId: number;
  villaKey: string;
  relationship: "owner" | "representative";
  sourceLabel: string;
}) {
  const db = await getDb();
  if (db === null) throw new Error("Database unavailable.");
  await db.insert(propertyOwnerUnits).values({
    ownerId: input.ownerId,
    villaKey: input.villaKey,
    community: COMMUNITY,
    relationship: input.relationship,
    sourceLabel: input.sourceLabel,
    linkedBy: ACTOR_EMAIL,
    linkedByName: ACTOR_NAME,
  }).onDuplicateKeyUpdate({
    set: {
      relationship: input.relationship,
      sourceLabel: input.sourceLabel,
      linkedBy: ACTOR_EMAIL,
      linkedByName: ACTOR_NAME,
    },
  });
  await appendActivityAudit({
    eventType: "owner_unit_link",
    actorEmail: ACTOR_EMAIL,
    actorName: ACTOR_NAME,
    entityType: "property_owner_unit",
    entityKey: `${COMMUNITY}/${input.villaKey}`,
    summary: `Linked ${input.relationship} to exact Waldorf / Yas Links unit ${input.villaKey}.`,
  });
}

async function upsertListing(input: typeof LISTINGS[number], ownerId: number, sourceUnit: ImportedUnit) {
  const db = await getDb();
  if (db === null) throw new Error("Database unavailable.");
  const villaKey = listingKey(input.unitName);
  const before = (await db.select().from(villaListings).where(eq(villaListings.villaKey, villaKey)).limit(1))[0] ?? null;
  const publicNotes = `${input.bedrooms} Bedroom · ${input.areaSqft.toLocaleString("en-AE")} ft² · asking-price guidance AED ${input.askingRateAedSqft.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/ft².`;
  const internalNotes = [
    `SPA-verified original developer price: AED ${input.originalDeveloperPriceAed.toLocaleString("en-AE")}.`,
    `Master-supplied resale asking price: AED ${input.askingPriceAed.toLocaleString("en-AE")}.`,
    `Reference rate supplied by Master: AED ${input.askingRateAedSqft.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/ft² across ${input.areaSqft.toLocaleString("en-AE")} ft².`,
    `Primary owner: ${OWNER.displayName} · ${OWNER.phone}.`,
    `Operational representative: ${CONTACT.displayName} · ${CONTACT.phone}. Stored as representative because the supplied SPA does not evidence a co-owner.`,
    "Listing status is Draft: no resale availability instruction was supplied.",
  ].join("\n");
  const payload = {
    community: COMMUNITY,
    askingPriceAed: input.askingPriceAed,
    status: "draft" as const,
    listingPartners: null,
    publicNotes,
    saleAgentName: null,
    soldAt: null,
    landAreaSqm: null,
    builtUpAreaSqm: input.sourceAreaSqm,
    availableForRent: null,
    rentPriceAed: null,
    phaseKey: null,
    buildingKey: BUILDING,
    unitTypeKey: sourceUnit.unit_model,
    bedrooms: input.bedrooms,
    inventoryKey: sourceUnit.unit_category,
    ownerName: OWNER.displayName,
    ownerPhone: OWNER.phone,
    ownerEmail: null,
    internalNotes,
    updatedBy: ACTOR_EMAIL,
  };
  if (before) {
    await db.update(villaListings).set(payload).where(eq(villaListings.id, before.id));
  } else {
    await db.insert(villaListings).values({ villaKey, ...payload });
  }
  const after = (await db.select().from(villaListings).where(eq(villaListings.villaKey, villaKey)).limit(1))[0];
  if (!after) throw new Error(`Could not persist listing ${villaKey}.`);
  const watched = ["askingPriceAed", "status", "publicNotes", "builtUpAreaSqm", "buildingKey", "unitTypeKey", "bedrooms", "inventoryKey", "ownerName", "ownerPhone", "internalNotes"] as const;
  const changes = Object.fromEntries(watched.flatMap(field => {
    const from = before?.[field] ?? null;
    const to = after[field] ?? null;
    return JSON.stringify(plain(from)) === JSON.stringify(plain(to)) ? [] : [[field, { from, to }]];
  }));
  if (Object.keys(changes).length) {
    await db.insert(villaListingAudit).values({
      villaKey,
      actorEmail: ACTOR_EMAIL,
      actorName: ACTOR_NAME,
      summary: `Imported user-supplied Waldorf resale listing; AED ${input.askingPriceAed.toLocaleString("en-AE")}; status=draft.`,
      changesJson: JSON.stringify(changes),
    });
    await appendActivityAudit({
      eventType: "property_edit",
      actorEmail: ACTOR_EMAIL,
      actorName: ACTOR_NAME,
      entityType: "property",
      entityKey: villaKey,
      summary: `Imported Waldorf listing for ${input.unitName}.`,
      changes,
    });
  }
  return { villaKey, listingId: after.id };
}

async function uploadSpa(input: typeof LISTINGS[number], ownerId: number, villaKey: string) {
  const db = await getDb();
  if (db === null) throw new Error("Database unavailable.");
  const configured = await getConfiguredOneDrive();
  const folder = await ensureFolderPath(configured.drive.id, configured.root.id, unitFolderPath({
    villaKey,
    community: COMMUNITY,
    phaseKey: BUILDING,
    documentType: "spa",
  }));
  const bytes = readFileSync(input.spaPath);
  const item = await uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: folder,
    filename: input.spaFilename,
    bytes,
    mimeType: "application/pdf",
  });
  if (!item.id) throw new Error(`OneDrive did not return a document id for ${input.spaFilename}.`);
  await db.insert(unitDocuments).values({
    villaKey,
    ownerId,
    community: COMMUNITY,
    phaseKey: BUILDING,
    documentType: "spa",
    websiteVisibility: "master_admin",
    shareAccess: "restricted",
    filename: item.name || input.spaFilename,
    mimeType: item.file?.mimeType || "application/pdf",
    sizeBytes: item.size ?? bytes.length,
    description: `Confidential SPA · ${input.unitName} · purchaser ${OWNER.displayName} · original developer price AED ${input.originalDeveloperPriceAed.toLocaleString("en-AE")}.`,
    driveId: configured.drive.id,
    itemId: item.id,
    parentItemId: folder,
    webUrl: item.webUrl ?? null,
    shareUrl: null,
    etag: item.eTag ?? null,
    uploadedBy: ACTOR_EMAIL,
    uploadedByName: ACTOR_NAME,
  }).onDuplicateKeyUpdate({
    set: {
      ownerId,
      phaseKey: BUILDING,
      documentType: "spa",
      websiteVisibility: "master_admin",
      filename: item.name || input.spaFilename,
      mimeType: item.file?.mimeType || "application/pdf",
      sizeBytes: item.size ?? bytes.length,
      description: `Confidential SPA · ${input.unitName} · purchaser ${OWNER.displayName} · original developer price AED ${input.originalDeveloperPriceAed.toLocaleString("en-AE")}.`,
      parentItemId: folder,
      webUrl: item.webUrl ?? null,
      shareUrl: null,
      shareAccess: "restricted",
      etag: item.eTag ?? null,
      uploadedBy: ACTOR_EMAIL,
      uploadedByName: ACTOR_NAME,
      removedAt: null,
    },
  });
  const stored = (await db.select().from(unitDocuments).where(and(
    eq(unitDocuments.driveId, configured.drive.id),
    eq(unitDocuments.itemId, item.id),
  )).limit(1))[0];
  await db.insert(oneDriveSyncEvents).values({
    connectionKey: "primary",
    documentId: stored?.id ?? null,
    eventType: "upload",
    status: "success",
    idempotencyKey: `waldorf-spa:${configured.drive.id}:${item.id}:${item.eTag ?? "unknown"}`,
    summary: `Uploaded confidential SPA for ${input.unitName}.`,
    detailsJson: JSON.stringify({ villaKey, documentType: "spa" }),
    attemptedAt: new Date(),
    completedAt: new Date(),
  }).onDuplicateKeyUpdate({ set: { status: "success", completedAt: new Date(), summary: `Uploaded confidential SPA for ${input.unitName}.` } });
  await appendActivityAudit({
    eventType: "document_create",
    actorEmail: ACTOR_EMAIL,
    actorName: ACTOR_NAME,
    entityType: "unit_document",
    entityKey: `${villaKey}:${stored?.id ?? item.id}`,
    summary: `Added confidential SPA to ${input.unitName}.`,
    changes: { documentType: "spa", websiteVisibility: "master_admin" },
  });
  return { itemId: item.id, documentId: stored?.id ?? null };
}

async function validateSourceUnits() {
  const db = await getDb();
  if (db === null) throw new Error("Database unavailable.");
  const project = (await db.select().from(inventoryImportedProjects).where(and(
    eq(inventoryImportedProjects.dataset, "other"),
    eq(inventoryImportedProjects.projectSlug, PROJECT_SLUG),
  )).limit(1))[0];
  if (!project) throw new Error("Yas Links Luxury Living inventory project was not found.");
  const source = JSON.parse(project.sourceJson) as { buildings?: Array<{ name?: string; units?: ImportedUnit[] }> };
  const building = source.buildings?.find(item => item.name === BUILDING);
  if (!building?.units) throw new Error(`Source building ${BUILDING} was not found.`);
  return LISTINGS.map(listing => {
    const sourceUnit = building.units!.find(unit => unit.unit_name === listing.unitName);
    if (!sourceUnit) throw new Error(`Exact source unit ${listing.unitName} was not found.`);
    if (Number(sourceUnit.bedrooms) !== listing.bedrooms) throw new Error(`${listing.unitName} bedroom count does not match SPA.`);
    if (Math.abs(Number(sourceUnit.total_area_sqm ?? sourceUnit.saleable_area_sqm) - listing.sourceAreaSqm) > 0.01) throw new Error(`${listing.unitName} area does not match SPA.`);
    if (Number(sourceUnit.price_aed) !== listing.originalDeveloperPriceAed) throw new Error(`${listing.unitName} original price does not match SPA.`);
    return { listing, sourceUnit };
  });
}

async function main() {
  const apply = process.argv.includes("--apply");
  const sourceUnits = await validateSourceUnits();
  const preview = sourceUnits.map(({ listing, sourceUnit }) => ({
    unit: listing.unitName,
    canonicalVillaKey: listingKey(listing.unitName),
    sourceBedrooms: sourceUnit.bedrooms,
    sourceAreaSqm: sourceUnit.total_area_sqm ?? sourceUnit.saleable_area_sqm,
    sourceOriginalDeveloperPriceAed: sourceUnit.price_aed,
    suppliedAskingPriceAed: listing.askingPriceAed,
    suppliedRateAedSqft: listing.askingRateAedSqft,
    suppliedAreaSqft: listing.areaSqft,
  }));
  if (!apply) {
    console.log(JSON.stringify({ mode: "dry-run", preview, owner: OWNER, operationalRepresentative: CONTACT }, null, 2));
    return;
  }
  const [owner, contact] = await Promise.all([upsertOwner(OWNER), upsertOwner(CONTACT)]);
  const results = [] as Array<Record<string, unknown>>;
  for (const { listing, sourceUnit } of sourceUnits) {
    const villaKey = listingKey(listing.unitName);
    await linkOwner({ ownerId: owner.id, villaKey, relationship: "owner", sourceLabel: `SPA · purchaser 100% · ${listing.spaFilename}` });
    await linkOwner({ ownerId: contact.id, villaKey, relationship: "representative", sourceLabel: "Master-supplied operational contact screenshot · 28 Sep 2026" });
    const listingResult = await upsertListing(listing, owner.id, sourceUnit);
    const documentResult = await uploadSpa(listing, owner.id, villaKey);
    results.push({ ...listingResult, ...documentResult, askingPriceAed: listing.askingPriceAed });
  }
  const workbook = await exportUnitRegisterWorkbook();
  const db = await getDb();
  if (db !== null) {
    await db.insert(oneDriveSyncEvents).values({
      connectionKey: "primary",
      eventType: "workbook_export",
      status: "success",
      idempotencyKey: `waldorf-register:${workbook.itemId}:${workbook.etag ?? "unknown"}`,
      summary: "Exported Unit Register after Waldorf B3 listing import.",
      detailsJson: JSON.stringify({ results, profileCount: workbook.profileCount }),
      attemptedAt: new Date(),
      completedAt: new Date(),
    }).onDuplicateKeyUpdate({ set: { status: "success", completedAt: new Date(), summary: "Exported Unit Register after Waldorf B3 listing import." } });
  }
  console.log(JSON.stringify({
    mode: "applied",
    preview,
    owner,
    operationalRepresentative: contact,
    results,
    unitRegister: { itemId: workbook.itemId, profileCount: workbook.profileCount },
  }, null, 2));
}

main().then(() => {
  process.exit(0);
}).catch(error => {
  console.error(error);
  process.exit(1);
});
