import { readFileSync } from "node:fs";

const plan = JSON.parse(readFileSync("/home/ubuntu/lagoons_google_import_plan.json", "utf8"));
const records = Array.isArray(plan.records) ? plan.records : [];
const exact = records.filter((record) => Array.isArray(record.candidate_keys) && record.candidate_keys.length === 1);
const groups = new Map();

for (const record of exact) {
  const key = record.candidate_keys[0];
  groups.set(key, [...(groups.get(key) ?? []), record]);
}

const countBy = (values, selector) => Object.fromEntries(
  [...values.reduce((counts, value) => {
    const key = selector(value) ?? "(blank)";
    counts.set(key, (counts.get(key) ?? 0) + 1);
    return counts;
  }, new Map()).entries()].sort((a, b) => b[1] - a[1]),
);

const latestByUnit = [...groups.values()].map((rows) =>
  rows.slice().sort((a, b) => Number(b.source_row) - Number(a.source_row))[0],
);

console.log(JSON.stringify({
  sourceRows: records.length,
  exactRows: exact.length,
  exactUnits: groups.size,
  exactUnitsWithMultipleRows: [...groups.values()].filter((rows) => rows.length > 1).length,
  latestExactStageCounts: countBy(latestByUnit, (row) => row.snapshot?.stage),
  latestExactAvailabilityCounts: countBy(latestByUnit, (row) => row.snapshot?.listingAvailability),
  latestExactPricePresent: latestByUnit.filter((row) => Boolean(row.snapshot?.offeringPrice)).length,
}, null, 2));
