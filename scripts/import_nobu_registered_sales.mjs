import { readFile } from "node:fs/promises";
import { and, eq } from "drizzle-orm";
import { registeredSaleTransactions } from "../drizzle/schema.ts";
import { getDb } from "../server/db.ts";
import {
  NOBU_REGISTERED_SALES_ACTOR,
  NOBU_REGISTERED_SALES_SOURCE_FILE,
  bedroomsFromLayout,
  matchNobuTransaction,
  normalizedNobuPropertyType,
  numberOrNull,
} from "../server/nobuRegisteredSales.ts";

const csvPath = `/home/ubuntu/upload/${NOBU_REGISTERED_SALES_SOURCE_FILE}`;
const sourcePath = new URL("../server/data/aldar_saadiyat.json", import.meta.url);

function parseCsv(text) {
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const keys = header.split(",");
  return lines.map((line, index) => ({ sourceRow: index + 2, values: Object.fromEntries(line.split(",").map((value, keyIndex) => [keys[keyIndex], value])) }));
}

function nullableText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function transactionFromCsv({ sourceRow, values }) {
  const numeric = (key) => numberOrNull(values[key]);
  const price = numeric("Property Sale Price (AED)");
  const area = numeric("Property Sold Area (SQM)");
  if (price == null || price <= 0 || area == null || area <= 0) throw new Error(`Source row ${sourceRow} has no valid registered price or sold area.`);
  return {
    sourceRow,
    saleApplicationDate: values["Sale Application Date"],
    assetClass: nullableText(values["Asset Class"]),
    propertyType: nullableText(values["Property Type"]),
    propertyLayout: nullableText(values["Property Layout"]),
    projectName: values["Project Name"],
    registeredSellingPriceAed: price,
    saleableAreaSqm: area,
    registeredRateAedSqm: numeric("Rate (AED per SQM)"),
    soldShare: numeric("Property Sold Share"),
    landPlotGroundAreaSqm: numeric("Land Plot Ground Area (SQM)"),
    saleApplicationType: nullableText(values["Sale Application Type"]),
    saleSequence: nullableText(values["Sale Sequence"]),
  };
}

const [csv, rawDataset] = await Promise.all([readFile(csvPath, "utf8"), readFile(sourcePath, "utf8")]);
const dataset = JSON.parse(rawDataset);
const project = dataset.projects.find(item => item.slug === "nobu-residences");
if (!project) throw new Error("Nobu Residences project is missing from the Aldar Saadiyat dataset.");
const sourceUnits = project.buildings.flatMap(building => building.units.map(unit => ({
  unitName: unit.unit_name,
  buildingName: building.name,
  bedrooms: bedroomsFromLayout(unit.bedrooms ?? unit.total_rooms ?? unit.unit_category),
  propertyType: normalizedNobuPropertyType(`${unit.unit_type ?? ""} ${unit.unit_category ?? ""} ${unit.unit_model ?? ""}`),
  saleableAreaSqm: numberOrNull(unit.saleable_area_sqm ?? unit.total_area_sqm),
}))).filter(unit => Boolean(unit.unitName));
const matches = parseCsv(csv).map(transactionFromCsv).map(row => matchNobuTransaction(row, sourceUnits));
const db = await getDb();
if (!db) throw new Error("Database is unavailable.");

let inserted = 0;
let retained = 0;
for (const match of matches) {
  const existing = await db.select({ id: registeredSaleTransactions.id }).from(registeredSaleTransactions).where(and(
    eq(registeredSaleTransactions.sourceFile, NOBU_REGISTERED_SALES_SOURCE_FILE),
    eq(registeredSaleTransactions.sourceRow, match.sourceRow),
  )).limit(1);
  if (existing.length) {
    retained += 1;
    continue;
  }
  await db.insert(registeredSaleTransactions).values({
    dataset: "saadiyat",
    projectSlug: "nobu-residences",
    projectName: "Nobu Residences",
    sourceFile: NOBU_REGISTERED_SALES_SOURCE_FILE,
    sourceRow: match.sourceRow,
    saleApplicationDate: match.saleApplicationDate,
    assetClass: match.assetClass,
    propertyType: match.propertyType,
    propertyLayout: match.propertyLayout,
    buildingLabel: match.projectName,
    saleableAreaSqm: match.saleableAreaSqm,
    registeredSellingPriceAed: match.registeredSellingPriceAed,
    registeredRateAedSqm: match.registeredRateAedSqm,
    soldShare: match.soldShare,
    landPlotGroundAreaSqm: match.landPlotGroundAreaSqm,
    saleApplicationType: match.saleApplicationType,
    saleSequence: match.saleSequence,
    matchType: match.matchType,
    matchedUnitName: match.matchedUnitName,
    candidateUnitNamesJson: JSON.stringify(match.candidates.map(candidate => candidate.unitName)),
    matchEvidence: match.matchEvidence,
    importedBy: NOBU_REGISTERED_SALES_ACTOR,
  });
  inserted += 1;
}

console.log(JSON.stringify({
  sourceRows: matches.length,
  inserted,
  retained,
  exactUnitMatches: matches.filter(match => match.matchType === "unit_exact").length,
  areaGroupMatches: matches.filter(match => match.matchType === "area_group").length,
}, null, 2));
process.exit(0);
