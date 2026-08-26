import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const reconciliation = JSON.parse(readFileSync(resolve(root, "tmp/hidd-yandex-reconciliation.json"), "utf8"));

const candidateRows = reconciliation.candidates;
const latitudes = candidateRows.map((row) => row.current.lat);
const longitudes = candidateRows.map((row) => row.current.lng);
const bounds = {
  minLat: Math.min(...latitudes) - 0.004,
  maxLat: Math.max(...latitudes) + 0.004,
  minLng: Math.min(...longitudes) - 0.004,
  maxLng: Math.max(...longitudes) + 0.004,
};

const accepted = [];
const rejected = [];
for (const row of candidateRows) {
  const inCommunityEnvelope = row.yandex.lat >= bounds.minLat && row.yandex.lat <= bounds.maxLat && row.yandex.lng >= bounds.minLng && row.yandex.lng <= bounds.maxLng;
  const withinSafetyDistance = (row.displacementMeters ?? Infinity) <= 1_500;
  const result = { ...row, inCommunityEnvelope, withinSafetyDistance };
  (inCommunityEnvelope && withinSafetyDistance ? accepted : rejected).push(result);
}

const output = { bounds, accepted, rejected, retainedControls: reconciliation.retainedControls, unmatched: reconciliation.unmatched };
const outputPath = resolve(root, "tmp/hidd-yandex-approved-candidates.json");
writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(JSON.stringify({ bounds, accepted: accepted.length, rejected: rejected.length, retainedControls: reconciliation.retainedControls.length, unmatched: reconciliation.unmatched.length, outputPath }, null, 2));
