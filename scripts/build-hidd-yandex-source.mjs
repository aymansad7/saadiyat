import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const root = resolve(import.meta.dirname, "..");
const approved = JSON.parse(readFileSync(resolve(root, "tmp/hidd-yandex-approved-candidates.json"), "utf8"));
const outputPath = resolve(root, "scripts/source-data/hidd-yandex-exact-locations.json");
const existingLocations = existsSync(outputPath)
  ? JSON.parse(readFileSync(outputPath, "utf8")).locations ?? []
  : [];
const newLocations = approved.accepted.map((entry) => {
  const [villaNumber, street] = entry.key.split("|");
  return {
    villaNumber,
    street,
    latitude: entry.yandex.lat,
    longitude: entry.yandex.lng,
    returnedAddress: entry.yandex.address,
    yandexUrl: entry.yandex.url,
    displacementMetersFromPriorCalibration: entry.displacementMeters,
  };
});
const byKey = new Map(existingLocations.map((entry) => [`${entry.villaNumber}|${entry.street}`, entry]));
for (const location of newLocations) byKey.set(`${location.villaNumber}|${location.street}`, location);
const locations = [...byKey.values()].sort((a, b) => `${a.street}|${a.villaNumber}`.localeCompare(`${b.street}|${b.villaNumber}`, undefined, { numeric: true }));

const output = {
  source: "Yandex Maps house-address search",
  matchingRule: "Exact villa number and street only; BOULEVARD is equivalent to Al Dhiba Street. User-supplied control points take precedence.",
  generatedAt: new Date().toISOString(),
  locations,
};
writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(JSON.stringify({ outputPath, count: locations.length }, null, 2));
