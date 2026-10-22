import { readFileSync } from "node:fs";
import { and, eq } from "drizzle-orm";
import { appendActivityAudit } from "../server/activityAudit";
import { getDb } from "../server/db";
import { LAGOONS_SL7_V219, isExactLagoonsSl7Villa219Source } from "../server/lagoonsSl7Villa219";
import {
  createOneDriveViewLink,
  ensureFolderPath,
  exportUnitRegisterWorkbook,
  getConfiguredOneDrive,
  unitFolderPath,
  uploadOneDriveFileSafely,
} from "../server/oneDrive";
import {
  oneDriveSyncEvents,
  unitDocuments,
  villaListingAudit,
  villaListings,
} from "../drizzle/schema";

const ACTOR_EMAIL = "master-import@saadiyat-resalehub.local";
const ACTOR_NAME = "Master Admin · user-directed import";
const UNIT_NAME = LAGOONS_SL7_V219.canonicalUnitName;

const MEDIA = [
  {
    localPath: "/home/ubuntu/upload/PHOTO-2026-10-18-09-42-53.jpg",
    filename: "SL7-V219-Floorplan-Ground-and-First-Floor.jpg",
    mimeType: "image/jpeg",
    documentType: "floorplan" as const,
    description: "Floorplan reference supplied by Master · Saadiyat Lagoons Wilds SL7 Villa 219 · Ground and First Floor.",
  },
  {
    localPath: "/home/ubuntu/upload/PHOTO-2026-10-18-09-42-54.jpg",
    filename: "SL7-V219-Premium-Finishes-Reference.jpg",
    mimeType: "image/jpeg",
    documentType: "marketing" as const,
    description: "Premium finishes reference supplied by Master · Saadiyat Lagoons Wilds SL7 Villa 219.",
  },
  {
    localPath: "/home/ubuntu/upload/VIDEO-2026-10-18-09-42-52.mp4",
    filename: "SL7-V219-Property-Video.mp4",
    mimeType: "video/mp4",
    documentType: "marketing" as const,
    description: "Property video supplied by Master · Saadiyat Lagoons Wilds SL7 Villa 219.",
  },
] as const;

type LagoonsSourceVilla = {
  unit_name: string;
  bedrooms?: number | null;
  plot_area_sqm?: number | null;
  saleable_area_sqm?: number | null;
  aldar_data?: {
    aldar_unit_name?: string | null;
    bedrooms?: number | null;
    plot_area_sqm?: number | null;
    total_area_sqm?: number | null;
  } | null;
};

function plain(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as unknown;
}

function changesFor(before: Record<string, unknown> | null, after: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(after).flatMap(([field, value]) =>
    JSON.stringify(plain(before?.[field] ?? null)) === JSON.stringify(plain(value ?? null))
      ? []
      : [[field, { from: before?.[field] ?? null, to: value ?? null }]],
  ));
}

function loadExactSource() {
  const source = JSON.parse(readFileSync("server/data/lagoons.json", "utf8")) as { villas?: LagoonsSourceVilla[] };
  const villa = source.villas?.find(row => row.unit_name === UNIT_NAME);
  if (!villa?.aldar_data) throw new Error(`Exact Lagoons source record ${UNIT_NAME} was not found.`);
  const exact = isExactLagoonsSl7Villa219Source({
    aldarUnitName: villa.aldar_data.aldar_unit_name,
    bedrooms: villa.aldar_data.bedrooms ?? villa.bedrooms,
    landAreaSqm: villa.aldar_data.plot_area_sqm ?? villa.plot_area_sqm,
    builtUpAreaSqm: villa.aldar_data.total_area_sqm ?? villa.saleable_area_sqm,
  });
  if (!exact) throw new Error("Lagoons SL7 Villa 219 source identity, bedroom count, or areas did not match the verified record.");
  return villa;
}

async function upsertListing() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable.");
  const before = (await db.select().from(villaListings).where(eq(villaListings.villaKey, LAGOONS_SL7_V219.villaKey)).limit(1))[0] ?? null;
  const payload = {
    community: LAGOONS_SL7_V219.community,
    askingPriceAed: LAGOONS_SL7_V219.masterListing.askingPriceAed,
    status: LAGOONS_SL7_V219.masterListing.status,
    listingPartners: LAGOONS_SL7_V219.masterListing.listingPartners,
    publicNotes: LAGOONS_SL7_V219.masterListing.publicNotes,
    saleAgentName: null,
    soldAt: null,
    landAreaSqm: LAGOONS_SL7_V219.sourceLandAreaSqm,
    builtUpAreaSqm: LAGOONS_SL7_V219.sourceBuiltUpAreaSqm,
    availableForRent: null,
    rentPriceAed: null,
    phaseKey: LAGOONS_SL7_V219.phaseKey,
    buildingKey: LAGOONS_SL7_V219.buildingKey,
    unitTypeKey: LAGOONS_SL7_V219.unitTypeKey,
    bedrooms: LAGOONS_SL7_V219.bedrooms,
    inventoryKey: LAGOONS_SL7_V219.inventoryKey,
    ownerName: null,
    ownerPhone: null,
    ownerEmail: null,
    internalNotes: LAGOONS_SL7_V219.masterListing.internalNotes,
    updatedBy: ACTOR_EMAIL,
    publishedAt: before?.publishedAt ?? new Date(),
    publishedBy: before?.publishedBy ?? ACTOR_EMAIL,
    publishedByName: before?.publishedByName ?? ACTOR_NAME,
  };
  if (before) {
    await db.update(villaListings).set(payload).where(eq(villaListings.id, before.id));
  } else {
    await db.insert(villaListings).values({ villaKey: LAGOONS_SL7_V219.villaKey, ...payload });
  }
  const after = (await db.select().from(villaListings).where(eq(villaListings.villaKey, LAGOONS_SL7_V219.villaKey)).limit(1))[0];
  if (!after) throw new Error("SL7 Villa 219 listing could not be saved.");
  const changes = changesFor(before as unknown as Record<string, unknown> | null, {
    askingPriceAed: after.askingPriceAed,
    status: after.status,
    listingPartners: after.listingPartners,
    publicNotes: after.publicNotes,
    landAreaSqm: after.landAreaSqm,
    builtUpAreaSqm: after.builtUpAreaSqm,
    phaseKey: after.phaseKey,
    buildingKey: after.buildingKey,
    unitTypeKey: after.unitTypeKey,
    bedrooms: after.bedrooms,
    inventoryKey: after.inventoryKey,
    internalNotes: after.internalNotes,
  });
  if (Object.keys(changes).length) {
    await db.insert(villaListingAudit).values({
      villaKey: LAGOONS_SL7_V219.villaKey,
      actorEmail: ACTOR_EMAIL,
      actorName: ACTOR_NAME,
      summary: "Imported Master-supplied Available listing and verified details for Lagoons Wilds SL7 Villa 219; resale ask not supplied.",
      changesJson: JSON.stringify(changes),
    });
    await appendActivityAudit({
      eventType: "property_edit",
      actorEmail: ACTOR_EMAIL,
      actorName: ACTOR_NAME,
      entityType: "property",
      entityKey: LAGOONS_SL7_V219.villaKey,
      summary: "Imported Master-supplied Available listing for Lagoons Wilds SL7 Villa 219 without inferring a resale asking price.",
      changes,
    });
  }
  return { before, after, changes };
}

async function storeMedia() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable.");
  const configured = await getConfiguredOneDrive();
  const results: Array<{ filename: string; itemId: string; documentId: number; shareUrl: string }> = [];
  for (const media of MEDIA) {
    const bytes = readFileSync(media.localPath);
    const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, unitFolderPath({
      villaKey: LAGOONS_SL7_V219.villaKey,
      community: LAGOONS_SL7_V219.community,
      phaseKey: LAGOONS_SL7_V219.phaseKey,
      documentType: media.documentType,
    }));
    const item = await uploadOneDriveFileSafely({
      driveId: configured.drive.id,
      parentItemId: folderId,
      filename: media.filename,
      bytes,
      mimeType: media.mimeType,
    });
    if (!item.id) throw new Error(`OneDrive did not return a document identifier for ${media.filename}.`);
    const shareUrl = await createOneDriveViewLink({ driveId: configured.drive.id, itemId: item.id });
    await db.insert(unitDocuments).values({
      villaKey: LAGOONS_SL7_V219.villaKey,
      ownerId: null,
      community: LAGOONS_SL7_V219.community,
      phaseKey: LAGOONS_SL7_V219.phaseKey,
      documentType: media.documentType,
      websiteVisibility: "card_link",
      shareAccess: "anyone_link",
      filename: item.name || media.filename,
      mimeType: item.file?.mimeType || media.mimeType,
      sizeBytes: item.size ?? bytes.length,
      description: media.description,
      driveId: configured.drive.id,
      itemId: item.id,
      parentItemId: folderId,
      webUrl: item.webUrl ?? null,
      shareUrl,
      etag: item.eTag ?? null,
      uploadedBy: ACTOR_EMAIL,
      uploadedByName: ACTOR_NAME,
    }).onDuplicateKeyUpdate({
      set: {
        phaseKey: LAGOONS_SL7_V219.phaseKey,
        documentType: media.documentType,
        websiteVisibility: "card_link",
        shareAccess: "anyone_link",
        filename: item.name || media.filename,
        mimeType: item.file?.mimeType || media.mimeType,
        sizeBytes: item.size ?? bytes.length,
        description: media.description,
        parentItemId: folderId,
        webUrl: item.webUrl ?? null,
        shareUrl,
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
    if (!stored) throw new Error(`OneDrive document registration failed for ${media.filename}.`);
    await db.insert(oneDriveSyncEvents).values({
      connectionKey: "primary",
      documentId: stored.id,
      eventType: "upload",
      status: "success",
      idempotencyKey: `lagoons-sl7-v219:${configured.drive.id}:${item.id}:${item.eTag ?? "unknown"}`,
      summary: `Uploaded ${media.documentType} media for Lagoons Wilds SL7 Villa 219.`,
      detailsJson: JSON.stringify({ villaKey: LAGOONS_SL7_V219.villaKey, filename: media.filename, documentType: media.documentType }),
      attemptedAt: new Date(),
      completedAt: new Date(),
    }).onDuplicateKeyUpdate({
      set: { status: "success", completedAt: new Date(), summary: `Uploaded ${media.documentType} media for Lagoons Wilds SL7 Villa 219.` },
    });
    await appendActivityAudit({
      eventType: "document_create",
      actorEmail: ACTOR_EMAIL,
      actorName: ACTOR_NAME,
      entityType: "unit_document",
      entityKey: `${LAGOONS_SL7_V219.villaKey}:${stored.id}`,
      summary: `Added card-facing ${media.documentType} media to Lagoons Wilds SL7 Villa 219.`,
      changes: { documentType: media.documentType, websiteVisibility: "card_link", filename: media.filename },
    });
    results.push({ filename: stored.filename, itemId: item.id, documentId: stored.id, shareUrl });
  }
  return results;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const source = loadExactSource();
  const preview = {
    canonicalVillaKey: LAGOONS_SL7_V219.villaKey,
    sourceUnitName: source.unit_name,
    officialAldarUnitName: source.aldar_data?.aldar_unit_name,
    sourceBedrooms: source.aldar_data?.bedrooms,
    sourceLandAreaSqm: source.aldar_data?.plot_area_sqm,
    sourceBuiltUpAreaSqm: source.aldar_data?.total_area_sqm,
    officialDeveloperBasePriceAed: LAGOONS_SL7_V219.sourceOfficialBasePriceAed,
    masterProvidedFinancialReference: LAGOONS_SL7_V219.financialReference,
    operationalStatus: LAGOONS_SL7_V219.masterListing.status,
    resaleAskingPriceAed: LAGOONS_SL7_V219.masterListing.askingPriceAed,
    media: MEDIA.map(row => ({ filename: row.filename, documentType: row.documentType })),
  };
  if (!apply) {
    console.log(JSON.stringify({ mode: "dry-run", preview }, null, 2));
    return;
  }
  const listing = await upsertListing();
  const media = await storeMedia();
  const register = await exportUnitRegisterWorkbook();
  const db = await getDb();
  if (db) {
    await db.insert(oneDriveSyncEvents).values({
      connectionKey: "primary",
      eventType: "workbook_export",
      status: "success",
      idempotencyKey: `lagoons-sl7-v219-register:${register.itemId}:${register.etag ?? "unknown"}`,
      summary: "Exported Unit Register after Lagoons Wilds SL7 Villa 219 listing import.",
      detailsJson: JSON.stringify({ villaKey: LAGOONS_SL7_V219.villaKey, profileCount: register.profileCount }),
      attemptedAt: new Date(),
      completedAt: new Date(),
    }).onDuplicateKeyUpdate({ set: { status: "success", completedAt: new Date(), summary: "Exported Unit Register after Lagoons Wilds SL7 Villa 219 listing import." } });
  }
  console.log(JSON.stringify({
    mode: "applied",
    preview,
    listing: { id: listing.after.id, status: listing.after.status, publishedAt: listing.after.publishedAt, changedFields: Object.keys(listing.changes) },
    media,
    unitRegister: { itemId: register.itemId, profileCount: register.profileCount },
  }, null, 2));
}

main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
