import ExcelJS from "exceljs";
import { writeFile } from "node:fs/promises";

const workbookPath = process.argv[2] ?? "/home/ubuntu/upload/Aldar_Sei_Saadiyat_778_Units_FULL.xlsx";
const outputPath = process.argv[3] ?? "/tmp/sei_workbook_profile.json";

const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const asCellValue = (cell) => {
  if (cell?.text) return normalize(cell.text);
  if (cell?.value && typeof cell.value === "object" && "result" in cell.value) return normalize(cell.value.result);
  return normalize(cell?.value);
};

function findHeaderRow(worksheet) {
  for (let rowNumber = 1; rowNumber <= Math.min(25, worksheet.rowCount); rowNumber += 1) {
    const cells = worksheet.getRow(rowNumber).values.slice(1).map(normalize);
    const lower = cells.join(" ").toLowerCase();
    if (lower.includes("unit") && (lower.includes("building") || lower.includes("tower"))) return rowNumber;
  }
  return null;
}

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(workbookPath);
const output = { workbookPath, sheets: [] };

for (const worksheet of workbook.worksheets) {
  const headerRow = findHeaderRow(worksheet);
  const summary = {
    name: worksheet.name,
    rows: worksheet.rowCount,
    columns: worksheet.columnCount,
    headerRow,
  };
  if (headerRow) {
    const headers = worksheet.getRow(headerRow).values.slice(1).map(normalize);
    const keyFor = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const columnByHeader = Object.fromEntries(headers.map((header, index) => [keyFor(header), index + 1]));
    const pick = (...names) => names.map((name) => columnByHeader[keyFor(name)]).find(Boolean);
    const buildingColumn = pick("building", "building name", "tower", "tower name", "source building");
    const unitColumn = pick("unit", "unit number", "unit name", "unitNumber", "source unit", "source unit code");
    const priceColumn = pick("price", "price aed", "published price aed", "publishedPriceAED", "original price", "list price");
    const statusColumn = pick("status", "unit status", "source status", "apiStatus", "rscStatus");
    const projectColumn = pick("project", "project name", "projectName", "source project");
    const buildings = new Map();
    const statusCounts = new Map();
    let populatedUnits = 0;
    let populatedPrices = 0;
    let zeroPrices = 0;
    let projectSample = "";
    for (let rowNumber = headerRow + 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      const unit = unitColumn ? asCellValue(row.getCell(unitColumn)) : "";
      if (!unit) continue;
      populatedUnits += 1;
      const building = buildingColumn ? asCellValue(row.getCell(buildingColumn)) || "(blank)" : "(not found)";
      buildings.set(building, (buildings.get(building) ?? 0) + 1);
      const status = statusColumn ? asCellValue(row.getCell(statusColumn)) || "(blank)" : "(not found)";
      statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
      if (!projectSample && projectColumn) projectSample = asCellValue(row.getCell(projectColumn));
      if (priceColumn) {
        const raw = asCellValue(row.getCell(priceColumn)).replace(/[\s,AED]/gi, "");
        const numeric = Number(raw);
        if (Number.isFinite(numeric) && numeric > 0) populatedPrices += 1;
        if (Number.isFinite(numeric) && numeric === 0) zeroPrices += 1;
      }
    }
    Object.assign(summary, {
      headers,
      fieldsDetected: { buildingColumn, unitColumn, priceColumn, statusColumn, projectColumn },
      populatedUnits,
      buildingCounts: Object.fromEntries(buildings),
      statusCounts: Object.fromEntries(statusCounts),
      priceSummary: { populatedPrices, zeroPrices },
      projectSample,
    });
  }
  output.sheets.push(summary);
}

await writeFile(outputPath, JSON.stringify(output, null, 2));
console.log(`Profile written to ${outputPath}`);
console.log(JSON.stringify(output, null, 2));
