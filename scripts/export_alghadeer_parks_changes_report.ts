import ExcelJS from "exceljs";
import { and, desc, gte, inArray } from "drizzle-orm";
import { inventoryUnitEvents, inventoryUnitState } from "../drizzle/schema";
import { getDb } from "../server/db";

const PROJECTS = ["al-ghadeer-parks-1", "al-ghadeer-parks-2"] as const;
const OUTPUT = "/home/ubuntu/Downloads/Al_Ghadeer_Parks_Changes_Last_36_Hours.xlsx";

function projectLabel(slug: string) {
  return slug === "al-ghadeer-parks-1" ? "Al Ghadeer Parks 1 (NC)" : "Al Ghadeer Parks 2 (ND)";
}

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const from = new Date(Date.now() - 36 * 60 * 60 * 1000);
  const [events, states] = await Promise.all([
    db.select().from(inventoryUnitEvents).where(and(
      inArray(inventoryUnitEvents.projectSlug, [...PROJECTS]),
      gte(inventoryUnitEvents.createdAt, from),
    )).orderBy(desc(inventoryUnitEvents.createdAt), desc(inventoryUnitEvents.id)),
    db.select().from(inventoryUnitState).where(and(
      inArray(inventoryUnitState.projectSlug, [...PROJECTS]),
      inArray(inventoryUnitState.isPresent, [true]),
    )).orderBy(inventoryUnitState.projectSlug, inventoryUnitState.unitName),
  ]);
  const priceEvents = events.filter(event => event.eventType === "price_change");
  const firstPublished = priceEvents.filter(event => event.fromPriceAed == null && event.toPriceAed != null);
  const actualPriceRevisions = priceEvents.filter(event => event.fromPriceAed != null && event.toPriceAed != null && event.fromPriceAed !== event.toPriceAed);
  const statusEvents = events.filter(event => event.eventType === "status_change");
  const sourceStatusEvents = events.filter(event => event.eventType === "source_status_change");

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Saadiyat Resale Hub";
  workbook.created = new Date();
  workbook.properties.title = "Al Ghadeer Parks change report";

  const summary = workbook.addWorksheet("Summary");
  summary.columns = [{ width: 39 }, { width: 94 }];
  summary.addRows([
    ["Report scope", "Al Ghadeer Parks 1 (NC) and Al Ghadeer Parks 2 (ND)"],
    ["Window", `${from.toISOString()} through ${new Date().toISOString()} (rolling 36 hours)`],
    ["Tracked units", states.length],
    ["Newly tracked baseline records", events.filter(event => event.eventType === "first_seen").length],
    ["First price publications", firstPublished.length],
    ["Actual price revisions", actualPriceRevisions.length],
    ["Operational status changes", statusEvents.length],
    ["Official source-state changes", sourceStatusEvents.length],
    ["Reading the Price Change label", "A blank previous price means the unit had no stored price at the baseline. It is labeled First price published, not a reduction or increase."],
    ["Current source state", "All current Parks units in this report are recorded as New from the official source. This is kept separate from NAS resale availability."],
  ]);
  summary.getRow(1).font = { bold: true };
  summary.getColumn(1).font = { bold: true };

  const changes = workbook.addWorksheet("Changes");
  changes.columns = [
    { header: "Recorded at", key: "createdAt", width: 22 },
    { header: "Project", key: "project", width: 30 },
    { header: "Unit", key: "unit", width: 22 },
    { header: "Change type", key: "type", width: 24 },
    { header: "Previous price (AED)", key: "fromPrice", width: 23 },
    { header: "New price (AED)", key: "toPrice", width: 20 },
    { header: "Previous operational status", key: "fromStatus", width: 28 },
    { header: "New operational status", key: "toStatus", width: 24 },
    { header: "Previous official source state", key: "fromSourceStatus", width: 29 },
    { header: "New official source state", key: "toSourceStatus", width: 26 },
    { header: "Explanation", key: "explanation", width: 50 },
  ];
  for (const event of events.filter(event => ["price_change", "status_change", "source_status_change"].includes(event.eventType))) {
    const explanation = event.eventType === "price_change"
      ? event.fromPriceAed == null
        ? "First price published from the matched unit workbook; no prior stored price exists."
        : "Published price changed from the recorded prior price."
      : event.eventType === "source_status_change"
        ? "Official World of Aldar source state changed; this does not change NAS availability."
        : "Operational inventory status changed.";
    changes.addRow({
      createdAt: event.createdAt,
      project: projectLabel(event.projectSlug),
      unit: event.unitName,
      type: event.eventType,
      fromPrice: event.fromPriceAed,
      toPrice: event.toPriceAed,
      fromStatus: event.fromStatus,
      toStatus: event.toStatus,
      fromSourceStatus: event.fromSourceStatus,
      toSourceStatus: event.toSourceStatus,
      explanation,
    });
  }
  changes.getRow(1).font = { bold: true };
  changes.views = [{ state: "frozen", ySplit: 1 }];
  changes.getColumn("fromPrice").numFmt = 'AED #,##0';
  changes.getColumn("toPrice").numFmt = 'AED #,##0';

  const current = workbook.addWorksheet("Current Parks State");
  current.columns = [
    { header: "Project", key: "project", width: 30 },
    { header: "Unit", key: "unit", width: 22 },
    { header: "Official source state", key: "sourceStatus", width: 26 },
    { header: "Operational status", key: "status", width: 22 },
    { header: "Current original price (AED)", key: "price", width: 29 },
    { header: "Last captured", key: "lastSeen", width: 22 },
  ];
  for (const state of states) {
    current.addRow({
      project: projectLabel(state.projectSlug),
      unit: state.unitName,
      sourceStatus: state.sourceStatus ?? "Not published",
      status: state.status ?? "Not published",
      price: state.priceAed,
      lastSeen: state.lastSeenAt,
    });
  }
  current.getRow(1).font = { bold: true };
  current.views = [{ state: "frozen", ySplit: 1 }];
  current.getColumn("price").numFmt = 'AED #,##0';
  await workbook.xlsx.writeFile(OUTPUT);
  console.log(JSON.stringify({ output: OUTPUT, from: from.toISOString(), events: events.length, firstPublished: firstPublished.length, actualPriceRevisions: actualPriceRevisions.length, statusEvents: statusEvents.length, sourceStatusEvents: sourceStatusEvents.length }, null, 2));
}

main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
