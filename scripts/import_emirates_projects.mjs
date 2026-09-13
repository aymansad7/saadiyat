import ExcelJS from "exceljs";
import { getDb } from "../server/db.ts";
import { externalDeveloperProjects, externalDeveloperUnits } from "../drizzle/schema.ts";

const WORKBOOK_PATH = "/home/ubuntu/upload/EmiratesOne_All_Properties.xlsx";
const WORKBOOK_NAME = "EmiratesOne_All_Properties.xlsx";
const IMPORTED_BY = "owner-supplied Emirates workbook importer";
const BATCH_SIZE = 20;

const PROJECTS = [
  {
    slug: "emirates-jumeirah-al-maryah",
    displayName: "Jumeirah",
    developerName: "Emirates",
    locationLabel: "Al Maryah Island",
    sourceProjectName: "Al Maryah Tower",
    sourceSheet: "Al Maryah Tower",
  },
  {
    slug: "emirates-elie-saab-yas",
    displayName: "Elie Saab",
    developerName: "Emirates",
    locationLabel: "Yas Island",
    sourceProjectName: "Stellar By Elie Saab",
    sourceSheet: "Stellar By Elie Saab",
  },
  {
    slug: "emirates-hilton-yas",
    displayName: "Hilton",
    developerName: "Emirates",
    locationLabel: "Yas Island",
    sourceProjectName: "Hilton Al Raha",
    sourceSheet: "Hilton Al Raha",
  },
];

function valueOf(cell) {
  const raw = cell?.value;
  if (raw == null) return null;
  if (typeof raw === "object" && "text" in raw) return normalise(raw.text);
  return normalise(raw);
}

function normalise(value) {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  return value;
}

function numberOrNull(value) {
  if (value == null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(String(value).replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

async function processInBatches(items, callback) {
  for (let start = 0; start < items.length; start += BATCH_SIZE) {
    await Promise.all(items.slice(start, start + BATCH_SIZE).map(callback));
  }
}

async function main() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(WORKBOOK_PATH);
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable");

  const preparedProjects = [];
  for (const project of PROJECTS) {
    const sheet = workbook.getWorksheet(project.sourceSheet);
    if (!sheet) throw new Error(`Source sheet not found: ${project.sourceSheet}`);
    const headers = {};
    sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, column) => {
      const header = valueOf(cell);
      if (typeof header === "string") headers[header] = column;
    });
    const requiredHeaders = ["ID", "Unit Number", "Project", "Status"];
    for (const header of requiredHeaders) {
      if (!headers[header]) throw new Error(`${project.sourceSheet} is missing header ${header}`);
    }

    const units = [];
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const get = header => valueOf(row.getCell(headers[header] ?? 0));
      const sourceId = numberOrNull(get("ID"));
      const unitNumber = get("Unit Number");
      const sourceProject = get("Project");
      if (sourceProject !== project.sourceProjectName) {
        throw new Error(`Unexpected project in ${project.sourceSheet}, row ${rowNumber}: ${sourceProject}`);
      }
      if (!Number.isInteger(sourceId) || unitNumber == null) {
        throw new Error(`Missing exact source ID or unit number in ${project.sourceSheet}, row ${rowNumber}`);
      }
      units.push({
        projectSlug: project.slug,
        sourceId,
        sourceRow: rowNumber,
        unitNumber: String(unitNumber),
        sourceTitle: get("Title"),
        sourceStatus: get("Status"),
        propertyType: get("Property Type"),
        internalAreaSqft: numberOrNull(get("Internal Area (sqft)")),
        externalAreaSqft: numberOrNull(get("External Area (sqft)")),
        totalAreaSqft: numberOrNull(get("Total Area (sqft)")),
        floorLabel: get("Floor"),
        viewLabel: get("View"),
        sourceExplorerUrl: get("Link"),
        sourceRating: get("rating"),
        sourceDescription: get("description"),
        sourceWorkbook: WORKBOOK_NAME,
        sourceSheet: project.sourceSheet,
      });
    });
    preparedProjects.push({ project, units });
  }

  for (const { project, units } of preparedProjects) {
    const availableCount = units.filter(unit => String(unit.sourceStatus ?? "").toLowerCase() === "available").length;
    const projectRow = {
      projectSlug: project.slug,
      displayName: project.displayName,
      developerName: project.developerName,
      locationLabel: project.locationLabel,
      sourceProjectName: project.sourceProjectName,
      sourceWorkbook: WORKBOOK_NAME,
      sourceSheet: project.sourceSheet,
      sourceRowCount: units.length,
      sourceAvailableCount: availableCount,
      importedBy: IMPORTED_BY,
    };
    await db.insert(externalDeveloperProjects).values(projectRow).onDuplicateKeyUpdate({ set: projectRow });
    await processInBatches(units, unit => db.insert(externalDeveloperUnits).values(unit).onDuplicateKeyUpdate({ set: unit }));
    console.log(`${project.displayName} (${project.sourceProjectName}): ${units.length} source rows, ${availableCount} source available`);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
