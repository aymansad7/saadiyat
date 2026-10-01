import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { and, eq, isNull } from "drizzle-orm";
import { FOUR_SEASONS_VILLAS } from "../client/src/data/fourSeasons";
import {
  FOUR_SEASONS_FIVE_BEDROOM_PROPOSALS,
  FOUR_SEASONS_FIVE_BEDROOM_PROPOSAL_SOURCE,
  fourSeasonsVillaKey,
} from "../server/fourSeasonsFiveBedroomProposal";
import { appendActivityAudit } from "../server/activityAudit";
import { getDb } from "../server/db";
import {
  createOneDriveViewLink,
  ensureFolderPath,
  exportUnitRegisterWorkbook,
  getConfiguredOneDrive,
  unitFolderPath,
  uploadOneDriveFile,
} from "../server/oneDrive";
import { oneDriveSyncEvents, unitDocuments, villaListingAudit, villaListings } from "../drizzle/schema";

const source = FOUR_SEASONS_FIVE_BEDROOM_PROPOSAL_SOURCE;
const uploadPath = resolve(process.cwd(), "../upload", source.localFilename);
const proposalBytes = Buffer.from(await readFile(uploadPath));
const db = await getDb();
if (!db) throw new Error("Database is unavailable.");
const configured = await getConfiguredOneDrive();
const canonicalKeys = new Set(FOUR_SEASONS_VILLAS.map((villa) => villa.villaKey));

async function withRetry<T>(label: string, operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 1_000));
    }
  }
  throw new Error(`${label} failed after 3 attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

function proposalNotes(input: (typeof FOUR_SEASONS_FIVE_BEDROOM_PROPOSALS)[number]) {
  return `${input.proposedType} · ${input.view} view · Land ${input.landAreaSqft.toLocaleString("en-AE", { maximumFractionDigits: 2 })} sq ft · Total ${input.builtUpAreaSqft.toLocaleString("en-AE", { maximumFractionDigits: 2 })} sq ft · Available per owner-supplied proposal dated 1 Oct 2026.`;
}

let listingUpdates = 0;
let documentsUploaded = 0;
let retainedDocuments = 0;
const items: Array<{ villaNumber: number; priceAed: number; documentId: number | null }> = [];

for (const proposal of FOUR_SEASONS_FIVE_BEDROOM_PROPOSALS) {
  const villaKey = fourSeasonsVillaKey(proposal.villaNumber);
  if (!canonicalKeys.has(villaKey)) throw new Error(`Canonical Four Seasons unit is missing: ${villaKey}`);

  const before = (await db.select().from(villaListings).where(eq(villaListings.villaKey, villaKey)).limit(1))[0] ?? null;
  const now = new Date();
  const update = {
    community: "four-seasons",
    askingPriceAed: proposal.askingPriceAed,
    status: "available" as const,
    publicNotes: proposalNotes(proposal),
    landAreaSqm: proposal.landAreaSqm,
    builtUpAreaSqm: proposal.builtUpAreaSqm,
    bedrooms: 5,
    unitTypeKey: "5-bedroom",
    publishedAt: before?.publishedAt ?? now,
    publishedBy: before?.publishedBy ?? source.actor,
    publishedByName: before?.publishedByName ?? source.actorName,
    updatedBy: source.actor,
  };

  const fields = [
    "askingPriceAed",
    "status",
    "publicNotes",
    "landAreaSqm",
    "builtUpAreaSqm",
    "bedrooms",
    "unitTypeKey",
  ] as const;
  const changes = Object.fromEntries(
    fields
      .map((field) => [field, { from: before?.[field] ?? null, to: update[field] }])
      .filter(([, value]) => value.from !== value.to),
  );

  if (before) {
    await db.update(villaListings).set(update).where(eq(villaListings.villaKey, villaKey));
  } else {
    await db.insert(villaListings).values({ villaKey, ...update });
  }
  if (Object.keys(changes).length) {
    listingUpdates += 1;
    await db.insert(villaListingAudit).values({
      villaKey,
      actorEmail: source.actor,
      actorName: source.actorName,
      summary: "Recorded the 1 Oct 2026 owner-supplied 5 Bedroom proposal; set Available, asking price, land area, and BUA.",
      changesJson: JSON.stringify(changes),
    });
    await appendActivityAudit({
      eventType: "property_edit",
      actorEmail: source.actor,
      actorName: source.actorName,
      entityType: "villa_listing",
      entityKey: villaKey,
      summary: "Recorded Four Seasons 5 Bedroom proposal fields.",
      changes,
    });
  }

  const existing = (await db.select().from(unitDocuments).where(and(
    eq(unitDocuments.villaKey, villaKey),
    eq(unitDocuments.filename, source.filename),
    eq(unitDocuments.documentType, "marketing"),
    isNull(unitDocuments.removedAt),
  )).limit(1))[0] ?? null;

  if (existing) {
    retainedDocuments += 1;
    items.push({ villaNumber: proposal.villaNumber, priceAed: proposal.askingPriceAed, documentId: existing.id });
    continue;
  }

  const folderId = await withRetry(`Preparing OneDrive folder for ${villaKey}`, () => ensureFolderPath(configured.drive.id, configured.root.id, unitFolderPath({
    community: "four-seasons",
    villaKey,
    documentType: "marketing",
  })));
  const item = await withRetry(`Uploading proposal for ${villaKey}`, () => uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: folderId,
    filename: source.filename,
    bytes: proposalBytes,
    mimeType: "application/pdf",
  }));
  if (!item.id) throw new Error(`OneDrive did not return a document identifier for ${villaKey}.`);

  const shareUrl = await withRetry(`Creating proposal link for ${villaKey}`, () => createOneDriveViewLink({ driveId: configured.drive.id, itemId: item.id }));
  await db.insert(unitDocuments).values({
    villaKey,
    community: "four-seasons",
    documentType: "marketing",
    websiteVisibility: "card_link",
    shareAccess: "anyone_link",
    filename: item.name || source.filename,
    mimeType: item.file?.mimeType || "application/pdf",
    sizeBytes: item.size ?? proposalBytes.length,
    description: `${proposal.proposedType} · ${source.sourceLabel}`,
    driveId: configured.drive.id,
    itemId: item.id,
    parentItemId: folderId,
    webUrl: item.webUrl ?? null,
    shareUrl,
    etag: item.eTag ?? null,
    uploadedBy: source.actor,
    uploadedByName: source.actorName,
  });

  const stored = (await db.select().from(unitDocuments).where(and(
    eq(unitDocuments.driveId, configured.drive.id),
    eq(unitDocuments.itemId, item.id),
  )).limit(1))[0];
  if (!stored) throw new Error(`The new proposal document was not registered for ${villaKey}.`);
  await db.insert(oneDriveSyncEvents).values({
    connectionKey: "primary",
    documentId: stored.id,
    eventType: "upload",
    status: "success",
    idempotencyKey: `four-seasons-five-bedroom-proposal:${stored.id}:${item.eTag ?? "unknown"}`,
    summary: `Uploaded Five Bedroom proposal reference for ${villaKey}.`,
    detailsJson: JSON.stringify({ villaKey, proposalType: proposal.proposedType, sourceLabel: source.sourceLabel }),
    attemptedAt: new Date(),
    completedAt: new Date(),
  }).onDuplicateKeyUpdate({
    set: { status: "success", summary: `Uploaded Five Bedroom proposal reference for ${villaKey}.`, completedAt: new Date() },
  });
  await appendActivityAudit({
    eventType: "document_create",
    actorEmail: source.actor,
    actorName: source.actorName,
    entityType: "unit_document",
    entityKey: `${villaKey}:${stored.id}`,
    summary: "Stored Four Seasons Five Bedroom proposal reference in OneDrive.",
    changes: { documentType: "marketing", websiteVisibility: "card_link" },
  });
  documentsUploaded += 1;
  items.push({ villaNumber: proposal.villaNumber, priceAed: proposal.askingPriceAed, documentId: stored.id });
}

const unitRegister = await exportUnitRegisterWorkbook();
console.log(JSON.stringify({
  source: source.sourceLabel,
  proposalCount: FOUR_SEASONS_FIVE_BEDROOM_PROPOSALS.length,
  listingUpdates,
  documentsUploaded,
  retainedDocuments,
  items,
  unitRegister: { profileCount: unitRegister.profileCount },
}, null, 2));

process.exit(0);
