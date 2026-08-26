import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const coordinatesSource = readFileSync(resolve(root, "client/src/data/hiddCoordinates.ts"), "utf8");
const coordinateMatch = coordinatesSource.match(/hiddVillaCoords:\s*HiddVillaCoord\[\]\s*=\s*(\[[\s\S]*?\])\s*;\s*\n\s*export function/);
if (!coordinateMatch) throw new Error("Could not read hiddVillaCoords");

const coordinates = JSON.parse(coordinateMatch[1]);
const controls = JSON.parse(readFileSync(resolve(root, "scripts/source-data/hidd-controls.json"), "utf8")).controls;
const yandexResults = JSON.parse(readFileSync("/home/ubuntu/reconcile_hidd_yandex_locations.json", "utf8")).results;
const controlsByKey = new Map(controls.map((control) => [`${control.villaNumber}|${control.street}`, control]));
const coordinatesByKey = new Map(coordinates.map((coordinate) => [`${coordinate.villaNumber}|${coordinate.street}`, coordinate]));

function distanceMeters(a, b) {
  const latitudeScale = 111_320;
  const longitudeScale = latitudeScale * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  return Math.hypot((a.lat - b.lat) * latitudeScale, (a.lng - b.lng) * longitudeScale);
}

const reviewed = yandexResults.map(({ output, error }) => {
  const coordinate = coordinatesByKey.get(output?.hidd_key);
  const control = controlsByKey.get(output?.hidd_key);
  const candidate = output?.exact_match && output.latitude && output.longitude
    ? { lat: output.latitude, lng: output.longitude }
    : null;
  return {
    key: output?.hidd_key ?? null,
    current: coordinate ? { lat: coordinate.lat, lng: coordinate.lng, source: coordinate.positionSource } : null,
    yandex: candidate ? { ...candidate, address: output.returned_address, url: output.yandex_url } : null,
    exactMatch: output?.exact_match === true,
    isUserControl: Boolean(control),
    displacementMeters: coordinate && candidate ? Number(distanceMeters(coordinate, candidate).toFixed(2)) : null,
    disposition: !candidate ? "unmatched_or_ambiguous" : control ? "retain_user_control" : "candidate_yandex_exact_match",
    error: error ?? null,
  };
});

const summary = reviewed.reduce((counts, row) => {
  counts[row.disposition] = (counts[row.disposition] ?? 0) + 1;
  return counts;
}, {});
const candidates = reviewed.filter((row) => row.disposition === "candidate_yandex_exact_match");
const output = { generatedAt: new Date().toISOString(), summary, candidates, retainedControls: reviewed.filter((row) => row.disposition === "retain_user_control"), unmatched: reviewed.filter((row) => row.disposition === "unmatched_or_ambiguous") };
const outputPath = resolve(root, "tmp/hidd-yandex-reconciliation.json");
writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(JSON.stringify({ summary, candidateCount: candidates.length, maxCandidateDisplacementMeters: Math.max(...candidates.map((row) => row.displacementMeters ?? 0), 0), outputPath }, null, 2));
