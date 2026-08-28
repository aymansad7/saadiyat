import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../server/data/hidd_al_saadiyat.json", import.meta.url);
const outputPath = new URL("../client/src/data/hiddPublic.json", import.meta.url);
const publicFields = [
  "villaNumber",
  "zone",
  "street",
  "bedrooms",
  "villaType",
  "plotNumberAlJaber",
  "admPlotNumber",
  "buaAreaSqM",
  "buaAreaSqFt",
  "plotAreaSqFt",
  "newBuaArea",
  "tocExpiry",
  "dlpExpiry",
];

const raw = JSON.parse(await readFile(sourcePath, "utf8"));
const publicRows = raw.map(row => Object.fromEntries(
  publicFields
    .filter(field => row[field] !== undefined && row[field] !== null && row[field] !== "")
    .map(field => [field, row[field]]),
));

await writeFile(outputPath, `${JSON.stringify(publicRows, null, 2)}\n`, "utf8");
console.log(`Wrote ${publicRows.length} public Hidd records to ${outputPath.pathname}`);
