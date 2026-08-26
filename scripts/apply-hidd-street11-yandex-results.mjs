import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const inputPath = resolve(root, "tmp/hidd-street11-yandex-results.json");
const sourcePath = resolve(root, "scripts/source-data/hidd-yandex-exact-locations.json");
const auditPath = resolve(root, "server/data/hidd_street11_yandex_2026_08_26.json");
const expectedPath = resolve(root, "tmp/hidd-street11-villas.tsv");

const batch = JSON.parse(readFileSync(inputPath, "utf8"));
const existingSource = existsSync(sourcePath)
  ? JSON.parse(readFileSync(sourcePath, "utf8"))
  : { locations: [] };

const accepted = [];
const skipped = [];

for (const result of batch.results ?? []) {
  const output = result.output;
  const villaNumber = String(output?.villa_number ?? result.input ?? "").split("|")[0].trim();
  const latitude = Number(output?.latitude);
  const longitude = Number(output?.longitude);
  const normalizedAddress = String(output?.address ?? "").trim().toLowerCase();
  const expectedPrefix = `${villaNumber}, 11 street`.toLowerCase();
  const complete =
    output?.matched === true &&
    output?.confidence === "high" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    String(output?.yandex_url ?? "").startsWith("https://") &&
    normalizedAddress.startsWith(expectedPrefix) &&
    normalizedAddress.includes("saadiyat island north");

  if (!complete) {
    skipped.push({
      villaNumber,
      reason: result.error || output?.notes || "Incomplete or non-exact Yandex result",
    });
    continue;
  }

  accepted.push({
    villaNumber,
    street: "11",
    latitude,
    longitude,
    returnedAddress: output.address,
    yandexUrl: output.yandex_url,
    displacementMetersFromPriorCalibration: null,
  });
}

const processedKeys = new Set([
  ...accepted.map(entry => entry.villaNumber),
  ...skipped.map(entry => entry.villaNumber),
]);
if (existsSync(expectedPath)) {
  const expectedVillaNumbers = readFileSync(expectedPath, "utf8")
    .split(/\r?\n/)
    .map(line => line.split("\t")[0]?.trim())
    .filter(Boolean);
  for (const villaNumber of expectedVillaNumbers) {
    if (processedKeys.has(villaNumber)) continue;
    skipped.push({
      villaNumber,
      reason: "Yandex lookup did not return a complete result; skipped by user instruction.",
    });
  }
}

const byKey = new Map(
  (existingSource.locations ?? []).map(location => [
    `${location.villaNumber}|${location.street}`,
    location,
  ]),
);
for (const location of accepted) {
  byKey.set(`${location.villaNumber}|11`, location);
}

const locations = [...byKey.values()].sort((a, b) =>
  `${a.street}|${a.villaNumber}`.localeCompare(
    `${b.street}|${b.villaNumber}`,
    undefined,
    { numeric: true },
  ),
);

writeFileSync(
  sourcePath,
  JSON.stringify(
    {
      source: "Yandex Maps exact house-address matches",
      matchingRule:
        "Exact villa number and street only; BOULEVARD is equivalent to Al Dhiba Street. User-supplied control points take precedence.",
      generatedAt: new Date().toISOString(),
      locations,
    },
    null,
    2,
  ),
);

writeFileSync(
  auditPath,
  JSON.stringify(
    {
      source: "User-requested Street 11 Yandex reconciliation",
      generatedAt: new Date().toISOString(),
      rule: "Only completed high-confidence exact villa-number + 11 Street matches are accepted.",
      accepted,
      skipped,
    },
    null,
    2,
  ),
);

console.log(
  JSON.stringify(
    {
      accepted: accepted.length,
      skipped: skipped.length,
      exactLocationTotal: locations.length,
      sourcePath,
      auditPath,
    },
    null,
    2,
  ),
);
