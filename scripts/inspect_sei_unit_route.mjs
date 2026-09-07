import ExcelJS from "exceljs";

const workbookPath = process.argv[2] ?? "/home/ubuntu/upload/Aldar_Sei_Saadiyat_778_Units_FULL.xlsx";
const targetUnit = process.argv[3] ?? "SeiSaadiyat-T4-05-07";
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(workbookPath);
const sheet = workbook.getWorksheet("All Units");
if (!sheet) throw new Error("All Units worksheet not found.");
const headers = sheet.getRow(1).values.slice(1).map(value => String(value ?? "").trim());
for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
  const row = sheet.getRow(rowNumber).values.slice(1);
  const item = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? null]));
  if (String(item.unitNumber ?? "").trim() !== targetUnit) continue;
  console.log(JSON.stringify({
    unitNumber: item.unitNumber,
    unitShortName: item.unitShortName,
    displayName: item.displayName,
    tower: item.tower,
    projectName: item.projectName,
    detailUnitId: item.detailUnitId,
    directUnitURL: item.directUnitURL,
  }, null, 2));
  process.exit(0);
}
throw new Error(`Unit not found: ${targetUnit}`);
