import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { and, eq, isNull } from "drizzle-orm";
import { FOUR_SEASONS_VILLAS } from "../client/src/data/fourSeasons";
import { unitDocuments, villaListingAudit, villaListings } from "../drizzle/schema";
import { getDb } from "../server/db";
import {
  FOUR_SEASONS_OFFER_SOURCE_LABEL,
  FOUR_SEASONS_SALES_OFFERS,
  FOUR_SEASONS_SUPPORTING_DOCUMENTS,
  fourSeasonsVillaKey,
} from "../server/fourSeasonsSalesOffers";
import {
  createOneDriveViewLink,
  ensureFolderPath,
  exportUnitRegisterWorkbook,
  getConfiguredOneDrive,
  unitFolderPath,
  uploadOneDriveFile,
} from "../server/oneDrive";

const uploadDir = resolve(process.cwd(), "../upload");
const actor = "owner-supplied-four-seasons-offers-2026-09-08";
const actorName = "Owner-supplied Four Seasons offers";
const sourceFiles = new Map<string, { bytes: Buffer; mimeType: string }>();

const offeredFilenames = FOUR_SEASONS_SALES_OFFERS.map(offer => offer.filename);
const supportingFilenames = FOUR_SEASONS_SUPPORTING_DOCUMENTS.map(document => document.filename);
for (const filename of new Set([...offeredFilenames, ...supportingFilenames])) {
  sourceFiles.set(filename, {
    bytes: Buffer.from(await readFile(resolve(uploadDir, filename))),
    mimeType: "application/pdf",
  });
}

const db = await getDb();
if (!db) throw new Error("Database is unavailable.");
const canonicalKeys = new Set(FOUR_SEASONS_VILLAS.map(villa => villa.villaKey));
const configured = await getConfiguredOneDrive();

let listingsUpdated = 0;
let offersUploaded = 0;
let existingOffersRetained = 0;
let supportingDocumentsUploaded = 0;
let existingSupportingDocumentsRetained = 0;
for (const offer of FOUR_SEASONS_SALES_OFFERS) {
  const villaKey = fourSeasonsVillaKey(offer.villaNumber);
  if (!canonicalKeys.has(villaKey)) throw new Error(`Four Seasons canonical unit is missing: ${villaKey}`);
  const before = (await db.select().from(villaListings).where(eq(villaListings.villaKey, villaKey)).limit(1))[0] ?? null;
  const now = new Date();
  const update = {
    community: "four-seasons",
    askingPriceAed: offer.askingPriceAed,
    status: "available" as const,
    publicNotes: `${offer.offerLabel} · Available per owner-supplied offer dated 8 Sep 2026.`,
    bedrooms: offer.bedrooms,
    publishedAt: before?.publishedAt ?? now,
    publishedBy: before?.publishedBy ?? actor,
    publishedByName: before?.publishedByName ?? actorName,
    updatedBy: actor,
  };
  const changes = Object.fromEntries(
    Object.entries({
      askingPriceAed: { from: before?.askingPriceAed ?? null, to: update.askingPriceAed },
      status: { from: before?.status ?? null, to: update.status },
      publicNotes: { from: before?.publicNotes ?? null, to: update.publicNotes },
      bedrooms: { from: before?.bedrooms ?? null, to: update.bedrooms },
    }).filter(([, value]) => value.from !== value.to),
  );
  if (before) {
    await db.update(villaListings).set(update).where(eq(villaListings.villaKey, villaKey));
  } else {
    await db.insert(villaListings).values({ villaKey, ...update });
  }
  if (Object.keys(changes).length) {
    await db.insert(villaListingAudit).values({
      villaKey,
      actorEmail: actor,
      actorName,
      summary: `Imported ${offer.offerLabel}; set Available and documented asking price.`,
      changesJson: JSON.stringify(changes),
    });
    listingsUpdated += 1;
  }

  const existing = (await db.select().from(unitDocuments).where(and(
    eq(unitDocuments.villaKey, villaKey),
    eq(unitDocuments.filename, offer.filename),
    eq(unitDocuments.documentType, "marketing"),
    isNull(unitDocuments.removedAt),
  )).limit(1))[0];
  if (existing) {
    existingOffersRetained += 1;
    continue;
  }
  const file = sourceFiles.get(offer.filename);
  if (!file) throw new Error(`Offer file missing: ${offer.filename}`);
  const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, unitFolderPath({
    community: "four-seasons",
    villaKey,
    documentType: "marketing",
  }));
  const item = await uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: folderId,
    filename: offer.filename,
    bytes: file.bytes,
    mimeType: file.mimeType,
  });
  if (!item.id) throw new Error(`OneDrive did not return an item for ${villaKey}.`);
  const existingByDriveItem = (await db.select().from(unitDocuments).where(and(
    eq(unitDocuments.driveId, configured.drive.id),
    eq(unitDocuments.itemId, item.id),
    isNull(unitDocuments.removedAt),
  )).limit(1))[0];
  if (existingByDriveItem) {
    if (existingByDriveItem.villaKey !== villaKey) {
      throw new Error(`OneDrive item ${item.id} is already linked to a different unit.`);
    }
    existingOffersRetained += 1;
    continue;
  }
  const shareUrl = await createOneDriveViewLink({ driveId: configured.drive.id, itemId: item.id });
  await db.insert(unitDocuments).values({
    villaKey,
    community: "four-seasons",
    documentType: "marketing",
    websiteVisibility: "card_link",
    shareAccess: "anyone_link",
    filename: item.name || offer.filename,
    mimeType: item.file?.mimeType || file.mimeType,
    sizeBytes: item.size ?? file.bytes.length,
    description: `${offer.offerLabel} · ${FOUR_SEASONS_OFFER_SOURCE_LABEL}`,
    driveId: configured.drive.id,
    itemId: item.id,
    parentItemId: folderId,
    webUrl: item.webUrl ?? null,
    shareUrl,
    etag: item.eTag ?? null,
    uploadedBy: actor,
    uploadedByName: actorName,
  });
  offersUploaded += 1;
}

for (const document of FOUR_SEASONS_SUPPORTING_DOCUMENTS) {
  const villaKey = fourSeasonsVillaKey(document.villaNumber);
  if (!canonicalKeys.has(villaKey)) throw new Error(`Four Seasons canonical unit is missing: ${villaKey}`);
  const existing = (await db.select().from(unitDocuments).where(and(
    eq(unitDocuments.villaKey, villaKey),
    eq(unitDocuments.filename, document.filename),
    eq(unitDocuments.documentType, "marketing"),
    isNull(unitDocuments.removedAt),
  )).limit(1))[0];
  if (existing) {
    existingSupportingDocumentsRetained += 1;
    continue;
  }
  const file = sourceFiles.get(document.filename);
  if (!file) throw new Error(`Supporting document file missing: ${document.filename}`);
  const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, unitFolderPath({
    community: "four-seasons",
    villaKey,
    documentType: "marketing",
  }));
  const item = await uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: folderId,
    filename: document.filename,
    bytes: file.bytes,
    mimeType: file.mimeType,
  });
  if (!item.id) throw new Error(`OneDrive did not return an item for ${villaKey}.`);
  const existingByDriveItem = (await db.select().from(unitDocuments).where(and(
    eq(unitDocuments.driveId, configured.drive.id),
    eq(unitDocuments.itemId, item.id),
    isNull(unitDocuments.removedAt),
  )).limit(1))[0];
  if (existingByDriveItem) {
    if (existingByDriveItem.villaKey !== villaKey) {
      throw new Error(`OneDrive item ${item.id} is already linked to a different unit.`);
    }
    existingSupportingDocumentsRetained += 1;
    continue;
  }
  const shareUrl = await createOneDriveViewLink({ driveId: configured.drive.id, itemId: item.id });
  await db.insert(unitDocuments).values({
    villaKey,
    community: "four-seasons",
    documentType: "marketing",
    websiteVisibility: "card_link",
    shareAccess: "anyone_link",
    filename: item.name || document.filename,
    mimeType: item.file?.mimeType || file.mimeType,
    sizeBytes: item.size ?? file.bytes.length,
    description: `${document.documentLabel} · Supporting document; does not set a price.`,
    driveId: configured.drive.id,
    itemId: item.id,
    parentItemId: folderId,
    webUrl: item.webUrl ?? null,
    shareUrl,
    etag: item.eTag ?? null,
    uploadedBy: actor,
    uploadedByName: actorName,
  });
  supportingDocumentsUploaded += 1;
}

const videos = [
  "VIDEO-2026-09-08-10-45-24.mp4",
  "VIDEO-2026-09-08-10-44-33.mp4",
  "VIDEO-2026-09-08-10-44-53.mp4",
];
let videosArchived = 0;
const mediaKey = "four-seasons/media-unassigned";
for (const filename of videos) {
  const existing = (await db.select().from(unitDocuments).where(and(
    eq(unitDocuments.villaKey, mediaKey),
    eq(unitDocuments.filename, filename),
    isNull(unitDocuments.removedAt),
  )).limit(1))[0];
  if (existing) continue;
  const bytes = Buffer.from(await readFile(resolve(uploadDir, filename)));
  const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, unitFolderPath({
    community: "four-seasons",
    villaKey: mediaKey,
    documentType: "source_file",
  }));
  const item = await uploadOneDriveFile({ driveId: configured.drive.id, parentItemId: folderId, filename, bytes, mimeType: "video/mp4" });
  if (!item.id) throw new Error(`OneDrive did not return an item for ${filename}.`);
  await db.insert(unitDocuments).values({
    villaKey: mediaKey,
    community: "four-seasons",
    documentType: "source_file",
    websiteVisibility: "master_admin",
    shareAccess: "restricted",
    filename: item.name || filename,
    mimeType: item.file?.mimeType || "video/mp4",
    sizeBytes: item.size ?? bytes.length,
    description: "Unassigned Four Seasons video; awaiting documented 5BR/6BR/7BR association.",
    driveId: configured.drive.id,
    itemId: item.id,
    parentItemId: folderId,
    webUrl: item.webUrl ?? null,
    shareUrl: null,
    etag: item.eTag ?? null,
    uploadedBy: actor,
    uploadedByName: actorName,
  });
  videosArchived += 1;
}

const unitRegister = await exportUnitRegisterWorkbook();
console.log(JSON.stringify({
  villasMatched: FOUR_SEASONS_SALES_OFFERS.length,
  listingsUpdated,
  offersUploaded,
  existingOffersRetained,
  supportingDocumentsUploaded,
  existingSupportingDocumentsRetained,
  videosArchived,
  unitRegister: { profileCount: unitRegister.profileCount },
}, null, 2));
