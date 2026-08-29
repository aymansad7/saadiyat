import { readFile } from "node:fs/promises";

const projectName = process.argv[2];
if (!projectName) throw new Error("Pass an exact project display name.");

const resale = JSON.parse(await readFile(new URL("../server/data/aldar_resale.json", import.meta.url), "utf8"));
const records = resale.records ?? resale.data ?? resale;

function visit(value, rows = []) {
  if (Array.isArray(value)) {
    for (const item of value) visit(item, rows);
    return rows;
  }
  if (value && typeof value === "object") {
    if (value.project_resale_name === projectName) rows.push(value);
    for (const item of Object.values(value)) visit(item, rows);
    return rows;
  }
  return rows;
}

const rows = visit(records);
const result = rows.map(row => ({
  unit: row.unit_number ?? null,
  status: row.status ?? row.property_status ?? null,
  priceAed: row.asking_price_aed ?? row.price_aed ?? null,
  bedrooms: row.bedrooms ?? null,
  unitType: row.unit_type ?? null,
  areaSqm: row.saleable_area_sqm ?? row.total_area_sqm ?? null,
  sourceId: row.property_id ?? null,
}));
console.log(JSON.stringify({ projectName, count: result.length, units: result }, null, 2));
