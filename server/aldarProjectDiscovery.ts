import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { eq, inArray } from "drizzle-orm";
import { aldarProjectDiscoveries } from "../drizzle/schema";
import { areaForProject, type AreaKey } from "./aldarAreas";
import { extractAllOfficialWorldAldarUnits } from "./alGhadeerOfficialCapture";
import { getDb } from "./db";
import { runInventorySync, type Dataset, type DetectedInventoryProject, type RawProject } from "./inventorySync";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "./oneDrive";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ALDAR_ABU_DHABI_DIRECTORY_URL = "https://world.aldar.com/uae/abudhabi?v=0";

type DirectoryProject = { projectName: string; sourcePath: string; projectSlug: string; dataset: Dataset; areaKey: AreaKey };
type OfficialRawUnit = Record<string, unknown> & { unitNumber?: string };
type SourceProject = RawProject & { source_file: string; unit_count: number; available_count: number; building_count: number };

export type ProjectDiscoveryResult = {
  directoryProjectCount: number;
  newlyDetected: Array<{ projectName: string; sourcePath: string; status: "incomplete" | "imported" | "error" }>;
  importedProjects: DetectedInventoryProject[];
  incompleteProjects: Array<{ projectName: string; sourcePath: string; reason: string }>;
  errors: Array<{ projectName: string; message: string }>;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function decodeDirectoryHtml(html: string) {
  return html
    .replace(/&quot;/gi, '"')
    .replace(/\\"/g, '"')
    .replace(/\\u0026/g, "&")
    .replace(/&amp;/gi, "&");
}

/** Extracts only titled navigable project cards from Aldar's official directory. */
export function extractAldarDirectoryProjects(html: string): Array<{ projectName: string; sourcePath: string }> {
  const decoded = decodeDirectoryHtml(html);
  const result = new Map<string, { projectName: string; sourcePath: string }>();
  const cardPattern = /"title"\s*:\s*"([^"\\]+)"[\s\S]{0,1400}?"navigateTo"\s*:\s*"(\/uae\/(?:abudhabi\/)?[^"?#\\]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = cardPattern.exec(decoded)) !== null) {
    const projectName = match[1]?.trim();
    const sourcePath = match[2]?.trim();
    if (!projectName || !sourcePath || /^coming soon$/i.test(projectName) || /district$|boulevard$/i.test(projectName) || /museum|gallery|pier|familyhouse|\/louvre$/i.test(sourcePath)) continue;
    result.set(sourcePath, { projectName, sourcePath });
  }
  return Array.from(result.values());
}

const KNOWN_NAME_ALIASES: Record<string, string> = {
  [normalize("Manarat Living III")]: "Manarat Residences 3",
  [normalize("Mamsha Garden")]: "Mamsha Gardens",
  [normalize("Mandarin Oriental")]: "Mandarin Oriental (Fountain View)",
  [normalize("Baccarat Residences Saadiyat")]: "One Saadiyat (Baccarat)",
};

const KNOWN_PATH_ALIASES: Record<string, string> = {
  "/uae/thearthousehero": "The Arthouse",
  "/uae/thebeachhousehero": "The Beach House Fahid",
};

function canonicalDirectoryProjectName(card: { projectName: string; sourcePath: string }) {
  return KNOWN_PATH_ALIASES[card.sourcePath]
    ?? KNOWN_NAME_ALIASES[normalize(card.projectName)]
    ?? card.projectName;
}

function classifyDirectoryProject(projectName: string): Pick<DirectoryProject, "dataset" | "areaKey"> {
  const value = projectName.toLowerCase();
  if (/(saadiyat|mamsha|manarat|nobu|louvre|arthouse|grove|fountain|source)/.test(value)) {
    return { dataset: "saadiyat", areaKey: "saadiyat" };
  }
  if (/fahid/.test(value)) return { dataset: "other", areaKey: "fahid-island" };
  if (/yas|noya|gardenia|mayan/.test(value)) return { dataset: "other", areaKey: "yas-island" };
  if (/ghadeer/.test(value)) return { dataset: "other", areaKey: "al-ghadeer" };
  return { dataset: "other", areaKey: areaForProject(slugify(projectName)) };
}

function readDataset(file: string): Array<{ name?: string; slug?: string }> {
  const candidates = [
    resolve(__dirname, "data", file),
    resolve(__dirname, "..", "data", file),
    resolve(process.cwd(), "server", "data", file),
    resolve(process.cwd(), "dist", "data", file),
  ];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(readFileSync(candidate, "utf-8")) as { projects?: Array<{ name?: string; slug?: string }> };
      return parsed.projects ?? [];
    } catch {
      // Continue through development and deployed source locations.
    }
  }
  return [];
}

export function existingOfficialProjectNames() {
  const names = new Set<string>();
  for (const project of [...readDataset("aldar_saadiyat.json"), ...readDataset("aldar_other.json")]) {
    if (project.name) names.add(normalize(project.name));
  }
  for (const alias of Object.values(KNOWN_NAME_ALIASES)) names.add(normalize(alias));
  return names;
}

function sourceCompleteProject(candidate: DirectoryProject, html: string, captureDate: string): { project?: SourceProject; reason?: string } {
  const sourceUnits = extractAllOfficialWorldAldarUnits(html) as OfficialRawUnit[];
  if (!sourceUnits.length) return { reason: "Official project page does not yet publish unit records." };
  if (new Set(sourceUnits.map(unit => text(unit.unitNumber))).size !== sourceUnits.length) return { reason: "Official project page contains duplicate or missing unit identities." };

  const incompleteUnit = sourceUnits.find(unit => !text(unit.unitNumber) || !text(unit.unitType));
  if (incompleteUnit) return { reason: "Official project page has unit records without a stable code or unit type." };

  const units = sourceUnits.map(unit => {
    const rawPrice = numeric(unit.price);
    const price = rawPrice != null && rawPrice > 1 ? rawPrice : null;
    return {
      unit_name: text(unit.unitNumber),
      aldar_link: null,
      unit_type: text(unit.unitType),
      unit_category: text(unit.unitCategory),
      unit_model: text(unit.propertyName) ?? text(unit.unitModel),
      bedrooms: numeric(unit.bedroomCount) == null ? null : String(numeric(unit.bedroomCount)),
      total_rooms: text(unit.propertyName),
      status: null,
      source_unit_status: text(unit.unitStatus) ?? text(unit.status),
      price_aed: price,
      reservation_amount: null,
      plot_area_sqm: numeric(unit.plotArea),
      saleable_area_sqm: numeric(unit.saleableArea),
      total_area_sqm: numeric(unit.suiteArea) ?? numeric(unit.saleableArea),
      balcony_area_sqm: numeric(unit.balconyArea),
      payment_plans: text(unit.paymentPlan),
      building_section: "Official project release",
      project_field: "Captured automatically from a complete official World of Aldar project page. NAS availability is maintained separately.",
      source_captured_at: captureDate,
      source_route: candidate.sourcePath,
    };
  });

  return {
    project: {
      slug: candidate.projectSlug,
      name: candidate.projectName,
      area: candidate.areaKey,
      source_file: `World of Aldar daily project discovery · ${captureDate}`,
      unit_count: units.length,
      available_count: 0,
      building_count: 1,
      buildings: [{ slug: "official-release", name: "Official project release", units }],
    },
  };
}

async function archiveOfficialProjectPage(candidate: DirectoryProject, html: string, captureDate: string) {
  const configured = await getConfiguredOneDrive();
  const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, ["Operations", "Official-Snapshots", "World-of-Aldar", captureDate, "New-Projects"]);
  const filename = `${candidate.projectSlug}-${captureDate}.html`;
  await uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: folderId,
    filename,
    bytes: Buffer.from(html),
    mimeType: "text/html",
  });
}

async function storeDiscovery(input: {
  candidate: DirectoryProject;
  status: "discovered" | "incomplete" | "imported" | "error";
  unitCount?: number;
  error?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for official project discovery.");
  const now = new Date();
  await db.insert(aldarProjectDiscoveries).values({
    sourcePath: input.candidate.sourcePath,
    projectSlug: input.candidate.projectSlug,
    projectName: input.candidate.projectName,
    dataset: input.candidate.dataset,
    areaKey: input.candidate.areaKey,
    status: input.status,
    unitCount: input.unitCount ?? 0,
    lastSeenAt: now,
    lastCheckedAt: now,
    importedAt: input.status === "imported" ? now : null,
    lastError: input.error ?? null,
  }).onDuplicateKeyUpdate({
    set: {
      projectSlug: input.candidate.projectSlug,
      projectName: input.candidate.projectName,
      dataset: input.candidate.dataset,
      areaKey: input.candidate.areaKey,
      status: input.status,
      unitCount: input.unitCount ?? 0,
      lastSeenAt: now,
      lastCheckedAt: now,
      importedAt: input.status === "imported" ? now : null,
      lastError: input.error ?? null,
    },
  });
}

/**
 * Scans Aldar's official directory daily. New directory cards are recorded
 * immediately; only pages with a complete, stable unit set are imported.
 */
export async function discoverAndImportOfficialAldarProjects(input: { trigger: "scheduled" | "manual"; triggeredBy: string; fetchImpl?: typeof fetch }): Promise<ProjectDiscoveryResult> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(ALDAR_ABU_DHABI_DIRECTORY_URL, { headers: { Accept: "text/html", "User-Agent": "SaadiyatResaleHub/1.0" } });
  if (!response.ok) throw new Error(`Aldar directory returned HTTP ${response.status}.`);
  const directoryHtml = await response.text();
  const directoryCards = extractAldarDirectoryProjects(directoryHtml);
  const knownNames = existingOfficialProjectNames();
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for official project discovery.");
  const stored = directoryCards.length
    ? await db.select().from(aldarProjectDiscoveries).where(inArray(aldarProjectDiscoveries.sourcePath, directoryCards.map(card => card.sourcePath)))
    : [];
  const storedByPath = new Map(stored.map(row => [row.sourcePath, row]));
  const candidates = directoryCards
    .map(card => ({
      ...card,
      projectName: canonicalDirectoryProjectName(card),
      projectSlug: slugify(canonicalDirectoryProjectName(card)),
      ...classifyDirectoryProject(canonicalDirectoryProjectName(card)),
    }))
    .filter(candidate => !knownNames.has(normalize(candidate.projectName)) || Boolean(storedByPath.get(candidate.sourcePath)))
    .filter(candidate => storedByPath.get(candidate.sourcePath)?.status !== "imported");

  const captureDate = new Date().toISOString().slice(0, 10);
  const newlyDetected: ProjectDiscoveryResult["newlyDetected"] = [];
  const incompleteProjects: ProjectDiscoveryResult["incompleteProjects"] = [];
  const errors: ProjectDiscoveryResult["errors"] = [];
  const importCandidates: Array<{ candidate: DirectoryProject; project: SourceProject }> = [];

  for (const candidate of candidates) {
    const previouslyKnown = storedByPath.has(candidate.sourcePath);
    try {
      const projectResponse = await fetchImpl(new URL(candidate.sourcePath, "https://world.aldar.com"), { headers: { Accept: "text/html", "User-Agent": "SaadiyatResaleHub/1.0" } });
      if (!projectResponse.ok) throw new Error(`Official project page returned HTTP ${projectResponse.status}.`);
      const projectHtml = await projectResponse.text();
      const evaluated = sourceCompleteProject(candidate, projectHtml, captureDate);
      if (!evaluated.project) {
        await storeDiscovery({ candidate, status: "incomplete", error: evaluated.reason });
        incompleteProjects.push({ projectName: candidate.projectName, sourcePath: candidate.sourcePath, reason: evaluated.reason ?? "Source page is incomplete." });
        if (!previouslyKnown) newlyDetected.push({ projectName: candidate.projectName, sourcePath: candidate.sourcePath, status: "incomplete" });
        continue;
      }
      await archiveOfficialProjectPage(candidate, projectHtml, captureDate);
      importCandidates.push({ candidate, project: evaluated.project });
    } catch (error) {
      const message = String((error as Error).message ?? error).slice(0, 1000);
      await storeDiscovery({ candidate, status: "error", error: message });
      errors.push({ projectName: candidate.projectName, message });
      if (!previouslyKnown) newlyDetected.push({ projectName: candidate.projectName, sourcePath: candidate.sourcePath, status: "error" });
    }
  }

  let importedProjects: DetectedInventoryProject[] = [];
  if (importCandidates.length) {
    const datasets = {
      saadiyat: { projects: importCandidates.filter(item => item.candidate.dataset === "saadiyat").map(item => item.project) },
      other: { projects: importCandidates.filter(item => item.candidate.dataset === "other").map(item => item.project) },
    };
    const sync = await runInventorySync({
      trigger: input.trigger,
      triggeredBy: input.triggeredBy,
      datasets,
      projectScope: importCandidates.map(item => ({ dataset: item.candidate.dataset, projectSlug: item.candidate.projectSlug })),
    });
    importedProjects = sync.newProjects;
    for (const item of importCandidates) {
      await storeDiscovery({ candidate: item.candidate, status: "imported", unitCount: item.project.unit_count });
      newlyDetected.push({ projectName: item.candidate.projectName, sourcePath: item.candidate.sourcePath, status: "imported" });
    }
  }

  return { directoryProjectCount: directoryCards.length, newlyDetected, importedProjects, incompleteProjects, errors };
}

export function buildDiscoveredProjectFromOfficialPage(candidate: DirectoryProject, html: string, captureDate = "2026-09-09") {
  return sourceCompleteProject(candidate, html, captureDate);
}

export function classifyOfficialDirectoryProject(projectName: string) {
  return classifyDirectoryProject(projectName);
}
