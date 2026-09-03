import ExcelJS from "exceljs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [workbookPath, outputPath = "server/data/sources/world-of-aldar/2026-09-03/alghadeer_complete_workbook.json", reportPath = "/tmp/alghadeer_complete_workbook_match.json"] = process.argv.slice(2);
if (!workbookPath) {
  throw new Error("Usage: node scripts/normalize_alghadeer_complete_workbook.mjs INPUT.xlsx [OUTPUT.json] [REPORT.json]");
}

const root = process.cwd();
const reportOnly = process.argv.includes("--report-only");
const asText = value => {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text.trim() || null;
    if ("result" in value) return asText(value.result);
    if ("richText" in value && Array.isArray(value.richText)) return value.richText.map(part => part.text).join("").trim() || null;
  }
  const text = String(value).trim();
  return text || null;
};

const asNumber = value => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(asText(value));
  return Number.isFinite(parsed) ? parsed : null;
};

const asPublishedPrice = value => {
  const number = asNumber(value);
  return number != null && number > 0 ? number : null;
};

const asBoolean = value => {
  if (typeof value === "boolean") return value;
  const text = asText(value)?.toLowerCase();
  if (text === "true" || text === "yes") return true;
  if (text === "false" || text === "no") return false;
  return null;
};

const canonicalCode = value => asText(value)?.replace(/-01$/i, "") ?? null;

function table(sheet) {
  if (!sheet) throw new Error("Required worksheet is missing.");
  const headers = sheet.getRow(1).values.slice(1).map(asText);
  const rows = [];
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const raw = sheet.getRow(rowNumber).values.slice(1);
    if (raw.every(value => asText(value) == null)) continue;
    const row = Object.fromEntries(headers.map((header, i) => [header ?? `Column ${i + 1}`, raw[i] ?? null]));
    rows.push(row);
  }
  return rows;
}

function groupBy(rows, key) {
  const grouped = new Map();
  for (const row of rows) {
    const code = canonicalCode(row[key]);
    if (!code) continue;
    const group = grouped.get(code) ?? [];
    group.push(row);
    grouped.set(code, group);
  }
  return grouped;
}

function uniqueBy(rows, key) {
  const seen = new Set();
  return rows.filter(row => {
    const value = asText(row[key]);
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(workbookPath);
const units = table(workbook.getWorksheet("All Units"));
const planRows = table(workbook.getWorksheet("Payment Plans"));
const installmentRows = table(workbook.getWorksheet("Plan Installments"));
const offerRows = table(workbook.getWorksheet("Offers"));
const offerLineRows = table(workbook.getWorksheet("Offer Lines"));

const plansByUnit = groupBy(planRows, "Unit Number");
const installmentsByUnitPlan = new Map();
for (const row of installmentRows) {
  const unitCode = canonicalCode(row["Unit Number"]);
  const planId = asText(row["Payment Plan ID"]);
  if (!unitCode || !planId) continue;
  const key = `${unitCode}::${planId}`;
  const group = installmentsByUnitPlan.get(key) ?? [];
  group.push(row);
  installmentsByUnitPlan.set(key, group);
}
const offersByUnit = groupBy(offerRows, "Unit Number");
const offerLinesByUnitOffer = new Map();
for (const row of offerLineRows) {
  const unitCode = canonicalCode(row["Unit Number"]);
  const offerId = asText(row["Offer ID"]);
  if (!unitCode || !offerId) continue;
  const key = `${unitCode}::${offerId}`;
  const group = offerLinesByUnitOffer.get(key) ?? [];
  group.push(row);
  offerLinesByUnitOffer.set(key, group);
}

function normalizePlan(row, unitCode) {
  const id = asText(row["Payment Plan ID"]);
  const installments = (installmentsByUnitPlan.get(`${unitCode}::${id}`) ?? [])
    .map(item => ({
      label: asText(item.Description) ?? asText(item["Installment Name"]) ?? "Installment",
      number: asNumber(item["Installment Number"]),
      percentage: asNumber(item["Installment %"]),
      date: asText(item["Installment Date"]),
      is_handover: asBoolean(item["Is Handover Payment"]),
      amount_aed: asNumber(item["Installment Amount"]),
    }))
    .sort((a, b) => (a.number ?? Number.MAX_SAFE_INTEGER) - (b.number ?? Number.MAX_SAFE_INTEGER));
  return {
    name: asText(row["Payment Plan Name"]),
    classification: asText(row.Classification),
    type: asText(row["Payment Plan Type"]),
    discount_pct: asNumber(row["Discount %"]),
    rebate_pct: asNumber(row["Rebate %"]),
    premium_pct: asNumber(row["Premium %"]),
    standard: asText(row["Standard Flag"]),
    broker_portal: asBoolean(row["Broker Portal Flag"]),
    digital_sales: asBoolean(row["Digital Sales"]),
    installments,
  };
}

function normalizeOffer(row, unitCode) {
  const id = asText(row["Offer ID"]);
  return {
    name: asText(row["Offer Name"]),
    digital_sales: asBoolean(row["Digital Sales"]),
    broker_portal: asBoolean(row["Broker Portal Flag"]),
    lines: uniqueBy(offerLinesByUnitOffer.get(`${unitCode}::${id}`) ?? [], "Offer Line ID").map(line => ({
      name: asText(line["Offer Line Name"]),
      type: asText(line["Offer Type"]),
      applies_to: asText(line["Offer On"]),
      value: asNumber(line["Offer Value"]),
      value_type: asText(line["Offer Value Type"]),
      promo_type: asText(line["Promo Type"]),
      promo_value: asText(line["Promo Value"]),
      customer_type: asText(line["Customer Type"]),
      agent_type: asText(line["Agent Type"]),
    })),
  };
}

const previous = JSON.parse(await readFile(resolve(root, "server/data/aldar_other.json"), "utf8"));
const existingUnits = previous.projects
  .filter(project => ["al-ghadeer-gardens", "al-ghadeer-parks-1", "al-ghadeer-parks-2"].includes(project.slug))
  .flatMap(project => project.buildings.flatMap(building => building.units.map(unit => ({ project: project.slug, building: building.slug, unit }))));
const existingByCode = new Map(existingUnits.map(entry => [canonicalCode(entry.unit.unit_name), entry]));
if (new Set(existingByCode).size !== existingUnits.length) throw new Error("Existing Ghadeer units do not have unique canonical codes.");

const workbookByCode = new Map();
const duplicateCodes = [];
for (const row of units) {
  const code = canonicalCode(row["Unit Number"]);
  if (!code) continue;
  if (workbookByCode.has(code)) duplicateCodes.push(code);
  workbookByCode.set(code, row);
}

const normalizedUnits = [];
const unmatchedWorkbook = [];
for (const [code, row] of workbookByCode) {
  const existing = existingByCode.get(code);
  if (!existing) {
    unmatchedWorkbook.push({ code, sourceSection: asText(row["Source Section"]) });
    continue;
  }
  const rawCurrency = asText(row.Currency);
  const currency = rawCurrency?.toUpperCase().replace(/[^A-Z]/g, "") ?? null;
  const price = asPublishedPrice(row.Price);
  if (price != null && currency && currency !== "AED") throw new Error(`${code}: currency is not AED (${rawCurrency}).`);
  const paymentPlans = uniqueBy(plansByUnit.get(code) ?? [], "Payment Plan ID").map(row => normalizePlan(row, code));
  const offers = uniqueBy(offersByUnit.get(code) ?? [], "Offer ID").map(row => normalizeOffer(row, code));
  normalizedUnits.push({
    canonical_unit_code: code,
    unit_name: existing.unit.unit_name,
    project_slug: existing.project,
    building_slug: existing.building,
    source_section: asText(row["Source Section"]),
    project_name: asText(row["Project Name"]),
    building_cluster: asText(row["Building / Cluster"]),
    source_unit_status: asText(row.Status),
    property_status: asText(row["Property Status"]),
    inventory_category: asText(row["Inventory Category"]),
    unit_type: asText(row["Unit Type"]),
    unit_category: asText(row["Unit Category"]),
    unit_model: asText(row["Unit Model"]),
    features_spec: asText(row["Features Specification"]),
    bedrooms: asNumber(row.Bedrooms),
    total_rooms: asText(row["Total Rooms"]),
    saleable_area_sqm: asNumber(row["Saleable Area sqm"]),
    total_area_sqm: asNumber(row["Total Area sqm"]),
    suite_area_sqm: asNumber(row["Suite Area sqm"]),
    terrace_area_sqm: asNumber(row["Terrace Area sqm"]),
    plot_area_sqm: asNumber(row["Plot Area sqm"]),
    price_aed: price,
    price_per_sqm_aed: asPublishedPrice(row["Price per sqm"]),
    price_per_sqft_aed: asPublishedPrice(row["Price per sqft"]),
    service_charge_aed_sqm: asNumber(row["Anticipated Service Charges"]),
    service_charge_escalation_pct: asNumber(row["Escalation Service Charge %"]),
    reservation_amount_aed: asNumber(row["Reservation Amount"]),
    online_reservation_fee_aed: asNumber(row["Online Reservation Fee"]),
    completion_date: asText(row["Completion Date"]),
    car_parks: asNumber(row["Car Parks"]),
    digital_sales: asBoolean(row["Digital Sales"]),
    kiosk_enabled: asBoolean(row["Kiosk Enabled"]),
    eligible_for_furnishing: asBoolean(row["Eligible for Furnishing"]),
    eligible_for_unit_finishing: asBoolean(row["Eligible for Unit Finishing"]),
    eligible_for_swimming_pool: asBoolean(row["Eligible for Swimming Pool"]),
    eligible_for_pod: asBoolean(row["Eligible for POD"]),
    eligible_for_multi_purpose: asBoolean(row["Eligible for Multi Purpose"]),
    mandatory_premium: asBoolean(row["Mandatory Premium"]),
    mandatory_swimming_pool: asBoolean(row["Mandatory Swimming Pool"]),
    mandatory_pod: asBoolean(row["Mandatory POD"]),
    document_label: asText(row["Document Label"]),
    unit_finishes: asText(row["Unit Finishes"]),
    swimming_pool_options: asText(row["Swimming Pool Options"]),
    pod_types: asText(row["POD Types"]),
    design_types: asText(row["Design Types"]),
    amenities: asText(row.Amenities),
    virtual_tour: asText(row["Virtual Tour"]),
    darna_applicable: asBoolean(row["Darna Applicable"]),
    source_page: asText(row["Source Page"]),
    captured_at: asText(row["Last Updated (Dubai)"]),
    payment_plans: paymentPlans,
    offers,
  });
}

const missingExisting = existingUnits
  .filter(entry => !workbookByCode.has(canonicalCode(entry.unit.unit_name)))
  .map(entry => ({ unitName: entry.unit.unit_name, project: entry.project, building: entry.building }));
const serializedUnitLengths = normalizedUnits.map(unit => ({
  unit_name: unit.unit_name,
  length: JSON.stringify(unit).length,
}));
const largestUnitName = serializedUnitLengths.reduce((largest, entry) => entry.length > largest.length ? entry : largest).unit_name;
const largestUnit = normalizedUnits.find(unit => unit.unit_name === largestUnitName);
const largestUnitFieldBytes = Object.entries(largestUnit ?? {})
  .map(([key, value]) => ({ key, bytes: JSON.stringify(value).length }))
  .sort((a, b) => b.bytes - a.bytes)
  .slice(0, 12);
const largestUnitPlanCounts = (largestUnit?.payment_plans ?? []).map(plan => ({
  name: plan.name,
  installments: plan.installments.length,
}));
const report = {
  source: workbookPath,
  workbookRows: units.length,
  existingGhadeerUnits: existingUnits.length,
  matched: normalizedUnits.length,
  duplicateCodes: [...new Set(duplicateCodes)],
  unmatchedWorkbook,
  missingExisting,
  projectCounts: Object.fromEntries(Object.entries(Object.groupBy(normalizedUnits, unit => unit.project_slug)).map(([project, rows]) => [project, rows.length])),
  pricedUnits: normalizedUnits.filter(unit => unit.price_aed != null).length,
  paymentPlans: normalizedUnits.reduce((sum, unit) => sum + unit.payment_plans.length, 0),
  offers: normalizedUnits.reduce((sum, unit) => sum + unit.offers.length, 0),
  maxPaymentPlansPerUnit: Math.max(...normalizedUnits.map(unit => unit.payment_plans.length)),
  maxOffersPerUnit: Math.max(...normalizedUnits.map(unit => unit.offers.length)),
  maxOfferLinesPerOffer: Math.max(0, ...normalizedUnits.flatMap(unit => unit.offers.map(offer => offer.lines.length))),
  totalSerializedUnitBytes: serializedUnitLengths.reduce((sum, entry) => sum + entry.length, 0),
  largestSerializedUnit: serializedUnitLengths.reduce((largest, entry) => entry.length > largest.length ? entry : largest),
  largestSerializedUnitFields: largestUnitFieldBytes,
  largestSerializedUnitPlanCounts: largestUnitPlanCounts,
};
await writeFile(resolve(root, reportPath), `${JSON.stringify(report, null, 2)}\n`, "utf8");
if (report.duplicateCodes.length || report.unmatchedWorkbook.length || report.missingExisting.length || report.matched !== 1243) {
  throw new Error(`Workbook exact-match validation failed. See ${reportPath}`);
}
if (reportOnly) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}
await writeFile(resolve(root, outputPath), `${JSON.stringify({
  source: "User-provided Aldar Al Ghadeer Hero Full Complete workbook",
  captured_at: "2026-09-03",
  source_row_count: normalizedUnits.length,
  units: normalizedUnits,
}, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
