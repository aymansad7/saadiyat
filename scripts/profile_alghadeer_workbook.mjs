import ExcelJS from "exceljs";
import { writeFile } from "node:fs/promises";

const workbookPath = process.argv[2];
const outputPath = process.argv[3] ?? "/tmp/alghadeer_workbook_profile.json";
if (!workbookPath) throw new Error("Usage: node scripts/profile_alghadeer_workbook.mjs INPUT.xlsx [OUTPUT.json]");

const book = new ExcelJS.Workbook();
await book.xlsx.readFile(workbookPath);

function values(row) {
  return row.values.slice(1).map(value => {
    if (value == null) return null;
    if (typeof value === "object" && "text" in value) return value.text;
    return value;
  });
}

function findHeaderRow(sheet) {
  let best = { rowNumber: 1, values: values(sheet.getRow(1)), nonEmpty: 0 };
  for (let rowNumber = 1; rowNumber <= Math.min(sheet.rowCount, 15); rowNumber += 1) {
    const candidate = values(sheet.getRow(rowNumber));
    const nonEmpty = candidate.filter(value => value != null && String(value).trim()).length;
    if (nonEmpty > best.nonEmpty) best = { rowNumber, values: candidate, nonEmpty };
  }
  return best;
}

function headerIndex(headers) {
  return Object.fromEntries(headers.map((value, index) => [String(value ?? "").trim(), index]));
}

function countBy(rows, key) {
  const out = {};
  for (const row of rows) {
    const value = String(row[key] ?? "").trim() || "(blank)";
    out[value] = (out[value] ?? 0) + 1;
  }
  return out;
}

const sheets = book.worksheets.map(sheet => {
  const headerRow = findHeaderRow(sheet);
  const headers = headerRow.values;
  const index = headerIndex(headers);
  const samples = [];
  for (let rowNumber = headerRow.rowNumber + 1; rowNumber <= Math.min(sheet.rowCount, headerRow.rowNumber + 3); rowNumber += 1) {
    const row = values(sheet.getRow(rowNumber));
    samples.push(Object.fromEntries(headers.map((header, i) => [String(header ?? ""), row[i] ?? null])));
  }
  return { name: sheet.name, rowCount: sheet.rowCount, headerRow: headerRow.rowNumber, headers, headerIndex: index, samples };
});

const allUnits = book.getWorksheet("All Units");
const allUnitsHeader = findHeaderRow(allUnits);
const headers = allUnitsHeader.values;
const rows = [];
for (let rowNumber = allUnitsHeader.rowNumber + 1; rowNumber <= allUnits.rowCount; rowNumber += 1) {
  const row = values(allUnits.getRow(rowNumber));
  if (row.every(value => value == null || value === "")) continue;
  rows.push(Object.fromEntries(headers.map((header, i) => [String(header ?? ""), row[i] ?? null])));
}

const profile = {
  workbook: workbookPath,
  sheetProfiles: sheets,
  allUnits: {
    rowCount: rows.length,
    sectionCounts: countBy(rows, "Section"),
    sourceStatusCounts: countBy(rows, "Source Unit Status"),
    pricedRows: rows.filter(row => Number(row["Price AED"]) > 0).length,
    exactCodeSamples: rows.slice(0, 6).map(row => ({
      section: row.Section ?? null,
      unitName: row["Unit Name"] ?? null,
      shortCode: row["Short Unit Code"] ?? null,
      priceAed: row["Price AED"] ?? null,
      sourceStatus: row["Source Unit Status"] ?? null,
    })),
  },
};

await writeFile(outputPath, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputPath, sheets: sheets.map(sheet => ({ name: sheet.name, rowCount: sheet.rowCount })), allUnits: profile.allUnits }, null, 2));
