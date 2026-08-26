import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const approved = JSON.parse(readFileSync(resolve(root, "tmp/hidd-yandex-approved-candidates.json"), "utf8"));
const locations = approved.accepted.map((entry) => {
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

const output = {
  source: "Yandex Maps house-address search",
  matchingRule: "Exact villa number and street only; BOULEVARD is equivalent to Al Dhiba Street. User-supplied control points take precedence.",
  generatedAt: new Date().toISOString(),
  locations,
};
const outputPath = resolve(root, "scripts/source-data/hidd-yandex-exact-locations.json");
writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(JSON.stringify({ outputPath, count: locations.length }, null, 2));
