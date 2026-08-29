import { ENV } from "./_core/env";
import ExcelJS from "exceljs";
import { eq, isNull, sql } from "drizzle-orm";
import { oneDriveConnections, unitDocuments, villaListings } from "../drizzle/schema";
import { getDb } from "./db";

const GRAPH_ROOT = "https://graph.microsoft.com/v1.0";

export type OneDriveDrive = { id: string; driveType?: string };
export type OneDriveItem = {
  id: string;
  name: string;
  size?: number;
  webUrl?: string;
  eTag?: string;
  parentReference?: { id?: string };
  file?: { mimeType?: string };
  folder?: { childCount?: number };
  createdDateTime?: string;
  lastModifiedDateTime?: string;
};

function required(value: string, name: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`OneDrive configuration is missing ${name}.`);
  return trimmed;
}

function graphSegment(value: string) {
  return encodeURIComponent(value).replace(/%2F/gi, "%252F");
}

function rootFolderName() {
  const root = required(ENV.oneDriveRootPath, "ONEDRIVE_ROOT_PATH");
  if (root.includes("/") || root.includes("\\") || root === "." || root === "..") {
    throw new Error("ONEDRIVE_ROOT_PATH must name one top-level folder.");
  }
  return root;
}

export function safeOneDriveName(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  // OneDrive does not allow the listed characters in names. Replacing rather
  // than accepting a path separator prevents escaping the approved root.
  const safe = trimmed
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  if (!safe || safe === ".") throw new Error(`${label} is not a valid OneDrive name.`);
  return safe;
}

async function fetchAppToken() {
  const tenantId = required(ENV.oneDriveTenantId, "ONEDRIVE_TENANT_ID");
  const clientId = required(ENV.oneDriveClientId, "ONEDRIVE_CLIENT_ID");
  const clientSecret = required(ENV.oneDriveClientSecret, "ONEDRIVE_CLIENT_SECRET");
  const response = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        scope: "https://graph.microsoft.com/.default",
      }),
    },
  );
  if (!response.ok) throw new Error(`OneDrive token request failed (HTTP ${response.status}).`);
  const result = (await response.json()) as { access_token?: string };
  if (!result.access_token) throw new Error("OneDrive token response did not include an access token.");
  return result.access_token;
}

async function graph<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await fetchAppToken();
  const response = await fetch(`${GRAPH_ROOT}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`OneDrive request failed (HTTP ${response.status}).`);
  return (await response.json()) as T;
}

async function graphOrNull<T>(path: string): Promise<T | null> {
  const token = await fetchAppToken();
  const response = await fetch(`${GRAPH_ROOT}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`OneDrive request failed (HTTP ${response.status}).`);
  return (await response.json()) as T;
}

export async function getConfiguredOneDrive() {
  const ownerUpn = required(ENV.oneDriveOwnerUpn, "ONEDRIVE_OWNER_UPN");
  const drive = await graph<OneDriveDrive>(`/users/${graphSegment(ownerUpn)}/drive?$select=id,driveType`);
  if (!drive.id || drive.driveType !== "business") throw new Error("Configured Microsoft account does not expose a business OneDrive.");
  const root = await graph<OneDriveItem>(`/drives/${graphSegment(drive.id)}/root:/${graphSegment(rootFolderName())}?$select=id,name,webUrl,eTag`);
  if (!root.id) throw new Error("The approved Saadiyat Resale Hub root folder was not found.");
  return { drive, root, ownerUpn, rootPath: rootFolderName() };
}

export async function ensureFolderPath(driveId: string, rootItemId: string, path: string[]) {
  let parentId = rootItemId;
  for (const rawSegment of path) {
    const segment = safeOneDriveName(rawSegment, "Folder name");
    const existing = await graphOrNull<OneDriveItem>(
      `/drives/${graphSegment(driveId)}/items/${graphSegment(parentId)}:/${graphSegment(segment)}?$select=id,name,folder`,
    );
    if (existing?.id && existing.folder) {
      parentId = existing.id;
      continue;
    }
    const created = await graph<OneDriveItem>(`/drives/${graphSegment(driveId)}/items/${graphSegment(parentId)}/children`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: segment, folder: {}, "@microsoft.graph.conflictBehavior": "fail" }),
    });
    if (!created.id) throw new Error("OneDrive did not return a folder identifier.");
    parentId = created.id;
  }
  return parentId;
}

export async function uploadOneDriveFile(input: {
  driveId: string;
  parentItemId: string;
  filename: string;
  bytes: Buffer;
  mimeType: string;
}) {
  const filename = safeOneDriveName(input.filename, "File name");
  return graph<OneDriveItem>(
    `/drives/${graphSegment(input.driveId)}/items/${graphSegment(input.parentItemId)}:/${graphSegment(filename)}:/content`,
    {
      method: "PUT",
      headers: { "Content-Type": input.mimeType },
      body: new Uint8Array(input.bytes),
    },
  );
}

export async function createOneDriveViewLink(input: { driveId: string; itemId: string }) {
  const link = await graph<{ link?: { webUrl?: string } }>(
    `/drives/${graphSegment(input.driveId)}/items/${graphSegment(input.itemId)}/createLink`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view", scope: "anonymous" }),
    },
  );
  const shareUrl = link.link?.webUrl;
  if (!shareUrl) throw new Error("OneDrive did not return a share URL for this file.");
  return shareUrl;
}

export function unitFolderPath(input: {
  community: string;
  phaseKey?: string | null;
  villaKey: string;
  documentType: "brochure" | "spa" | "owner_document" | "floorplan" | "source_file" | "marketing" | "other";
}) {
  const category: Record<typeof input.documentType, string> = {
    brochure: "Brochures",
    spa: "SPA",
    owner_document: "Owner-Documents",
    floorplan: "Floorplans",
    source_file: "Source-Files",
    marketing: "Marketing",
    other: "Other",
  };
  return [
    "Communities",
    safeOneDriveName(input.community, "Community"),
    ...(input.phaseKey ? [safeOneDriveName(input.phaseKey, "Phase")] : []),
    safeOneDriveName(input.villaKey, "Unit or plot key"),
    category[input.documentType],
  ];
}

/** Writes the operational workbook from the website database. This is a
 * one-way export: direct changes to the OneDrive workbook are never imported.
 */
export async function exportUnitRegisterWorkbook() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for the Unit Register export.");
  const configured = await getConfiguredOneDrive();
  const [profiles, documentRows] = await Promise.all([
    db.select().from(villaListings).orderBy(villaListings.community, villaListings.villaKey),
    db.select({ villaKey: unitDocuments.villaKey, documentCount: sql<number>`COUNT(*)` })
      .from(unitDocuments)
      .where(isNull(unitDocuments.removedAt))
      .groupBy(unitDocuments.villaKey),
  ]);
  const countByVilla = new Map(documentRows.map(row => [row.villaKey, Number(row.documentCount)]));
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Saadiyat Resale Hub";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Unit Register");
  sheet.columns = [
    { header: "Community", key: "community", width: 28 },
    { header: "Unit / Plot Key", key: "villaKey", width: 32 },
    { header: "Status", key: "status", width: 14 },
    { header: "Asking Price (AED)", key: "askingPriceAed", width: 20 },
    { header: "Land Area (m²)", key: "landAreaSqm", width: 18 },
    { header: "Built-up Area (m²)", key: "builtUpAreaSqm", width: 20 },
    { header: "Available for Rent", key: "availableForRent", width: 20 },
    { header: "Rent Price (AED)", key: "rentPriceAed", width: 18 },
    { header: "Listing Partners", key: "listingPartners", width: 28 },
    { header: "Public Notes", key: "publicNotes", width: 45 },
    { header: "Document Count", key: "documentCount", width: 16 },
    { header: "Website Updated (UTC)", key: "updatedAt", width: 25 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  for (const profile of profiles) {
    sheet.addRow({
      community: profile.community,
      villaKey: profile.villaKey,
      status: profile.status,
      askingPriceAed: profile.askingPriceAed,
      landAreaSqm: profile.landAreaSqm,
      builtUpAreaSqm: profile.builtUpAreaSqm,
      availableForRent: profile.availableForRent ? "Yes" : profile.availableForRent === false ? "No" : null,
      rentPriceAed: profile.rentPriceAed,
      listingPartners: profile.listingPartners,
      publicNotes: profile.publicNotes,
      documentCount: countByVilla.get(profile.villaKey) ?? 0,
      updatedAt: profile.updatedAt?.toISOString() ?? null,
    });
  }
  const operationsFolder = await ensureFolderPath(configured.drive.id, configured.root.id, ["Operations"]);
  const bytes = Buffer.from(await workbook.xlsx.writeBuffer());
  const item = await uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: operationsFolder,
    filename: "Saadiyat-Unit-Register.xlsx",
    bytes,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  if (!item.id) throw new Error("OneDrive did not return the Unit Register identifier.");
  await db.insert(oneDriveConnections).values({
    connectionKey: "primary",
    status: "active",
    ownerUpn: configured.ownerUpn,
    tenantId: ENV.oneDriveTenantId.trim() || null,
    clientId: ENV.oneDriveClientId.trim() || null,
    driveId: configured.drive.id,
    rootItemId: configured.root.id,
    rootPath: configured.rootPath,
    unitRegisterItemId: item.id,
    lastWorkbookExportAt: new Date(),
    lastError: null,
  }).onDuplicateKeyUpdate({
    set: { status: "active", unitRegisterItemId: item.id, lastWorkbookExportAt: new Date(), lastError: null },
  });
  return { itemId: item.id, etag: item.eTag ?? null, webUrl: item.webUrl ?? null, profileCount: profiles.length };
}
