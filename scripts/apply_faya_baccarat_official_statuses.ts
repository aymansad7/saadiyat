import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInventorySync, type RawProject } from "../server/inventorySync";
import { ensureFolderPath, getConfiguredOneDrive, uploadOneDriveFile } from "../server/oneDrive";

type AuditProject = {
  project: { slug: string; name: string; storedUnitCount: number };
  source: { route: string; pageUnitCount: number; matchedOfficialUnitCount: number; detailResponseCount: number; detailFallbackOrErrorCount: number };
  units: Array<{ unitName: string; live: { status: string | null; priceAed: number | null; detailError: string | null } | null }>;
};
type Audit = { capturedAt: string; projects: AuditProject[] };
type Dataset = { projects: RawProject[] };

const AUDIT_FILE = resolve(process.cwd(), "private-audits/faya-one-residences-official-audit-2026-09-18.json");
const SOURCE_FILE = resolve(process.cwd(), "server/data/aldar_saadiyat.json");
const TARGETS = new Set(["faya-al-saadiyat", "onesaadiyat"]);

function readDataset(): Dataset {
  return JSON.parse(readFileSync(SOURCE_FILE, "utf8")) as Dataset;
}

async function main() {
  const audit = JSON.parse(readFileSync(AUDIT_FILE, "utf8")) as Audit;
  const baseline = readDataset();
  const targets = audit.projects.filter(project => TARGETS.has(project.project.slug));
  if (targets.length !== 2) throw new Error("Expected exact Faya and One Saadiyat official audit projects.");

  const projects: RawProject[] = [];
  for (const audited of targets) {
    if (audited.source.pageUnitCount !== audited.project.storedUnitCount || audited.source.matchedOfficialUnitCount !== audited.project.storedUnitCount || audited.source.detailResponseCount !== audited.project.storedUnitCount || audited.source.detailFallbackOrErrorCount !== 0) {
      throw new Error(`${audited.project.name}: official capture is incomplete; status sync is blocked.`);
    }
    const stored = baseline.projects.find(project => project.slug === audited.project.slug);
    if (!stored) throw new Error(`${audited.project.name}: baseline project missing.`);
    const liveByUnit = new Map(audited.units.map(unit => [unit.unitName, unit.live]));
    const copied = structuredClone(stored) as RawProject;
    for (const building of copied.buildings ?? []) {
      for (const unit of building.units ?? []) {
        if (!unit.unit_name) continue;
        const live = liveByUnit.get(unit.unit_name);
        if (!live || !live.status || live.detailError) throw new Error(`${audited.project.name}: missing verified live status for ${unit.unit_name}.`);
        // The detail endpoint is the authoritative current operational status.
        unit.status = live.status;
      }
    }
    projects.push(copied);
  }

  const sync = await runInventorySync({
    trigger: "manual",
    triggeredBy: "owner:official-faya-baccarat-status-sync",
    datasets: { saadiyat: { projects }, other: { projects: [] } },
    projectScope: projects.map(project => ({ dataset: "saadiyat" as const, projectSlug: project.slug })),
  });

  const configured = await getConfiguredOneDrive();
  const captureDate = audit.capturedAt.slice(0, 10);
  const folderId = await ensureFolderPath(configured.drive.id, configured.root.id, ["Operations", "Official-Snapshots", "World-of-Aldar", captureDate, "Audits"]);
  const storedAudit = await uploadOneDriveFile({
    driveId: configured.drive.id,
    parentItemId: folderId,
    filename: "faya-one-residences-official-audit-2026-09-18.json",
    bytes: readFileSync(AUDIT_FILE),
    mimeType: "application/json",
  });

  const output = {
    auditedAt: audit.capturedAt,
    projects: targets.map(project => ({ project: project.project.name, officialUnitCount: project.project.storedUnitCount, priceChangesInAudit: project.units.filter(unit => unit.live && false).length })),
    sync,
    oneDriveAuditArchive: { driveItemId: storedAudit.id ?? null, parentItemId: folderId },
  };
  const outputFile = resolve(process.cwd(), "private-audits/faya-one-residences-official-status-sync-2026-09-18.json");
  writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(JSON.stringify({ outputFile, ...output }, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });
