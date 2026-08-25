import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const coordinatePath = resolve(root, "client/src/data/hiddCoordinates.ts");
const baselinePath = resolve(__dirname, "source-data/hidd-coordinate-baseline.json");
const controlsPath = resolve(__dirname, "source-data/hidd-controls.json");

function parseCoordinatesFromTs(source) {
  const match = source.match(/hiddVillaCoords:\s*HiddVillaCoord\[\]\s*=\s*(\[[\s\S]*?\])\s*;\s*\n\s*export function/);
  if (!match) throw new Error("Could not locate hiddVillaCoords array");
  return JSON.parse(match[1]);
}

function solve3(matrix, vector) {
  const augmented = matrix.map((row, index) => [...row, vector[index]]);
  for (let col = 0; col < 3; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < 3; row += 1) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivot][col])) pivot = row;
    }
    if (Math.abs(augmented[pivot][col]) < 1e-14) throw new Error("Degenerate affine controls");
    [augmented[col], augmented[pivot]] = [augmented[pivot], augmented[col]];
    const divisor = augmented[col][col];
    for (let index = col; index < 4; index += 1) augmented[col][index] /= divisor;
    for (let row = 0; row < 3; row += 1) {
      if (row === col) continue;
      const factor = augmented[row][col];
      for (let index = col; index < 4; index += 1) augmented[row][index] -= factor * augmented[col][index];
    }
  }
  return augmented.map(row => row[3]);
}

function fitAffine(samples) {
  const xtx = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const xtLat = [0, 0, 0];
  const xtLng = [0, 0, 0];
  for (const sample of samples) {
    const x = [sample.base.lat, sample.base.lng, 1];
    for (let i = 0; i < 3; i += 1) {
      xtLat[i] += x[i] * sample.control.latitude;
      xtLng[i] += x[i] * sample.control.longitude;
      for (let j = 0; j < 3; j += 1) xtx[i][j] += x[i] * x[j];
    }
  }
  return { lat: solve3(xtx, xtLat), lng: solve3(xtx, xtLng) };
}

function applyAffine(model, point) {
  const x = [point.lat, point.lng, 1];
  return {
    lat: model.lat.reduce((sum, coefficient, index) => sum + coefficient * x[index], 0),
    lng: model.lng.reduce((sum, coefficient, index) => sum + coefficient * x[index], 0),
  };
}

function calculateIdwDisplacement(point, samples) {
  let weightTotal = 0;
  let latDelta = 0;
  let lngDelta = 0;
  for (const sample of samples) {
    const distanceSquared = (point.lat - sample.base.lat) ** 2 + (point.lng - sample.base.lng) ** 2;
    const weight = 1 / Math.max(distanceSquared, 1e-12);
    weightTotal += weight;
    latDelta += weight * (sample.control.latitude - sample.base.lat);
    lngDelta += weight * (sample.control.longitude - sample.base.lng);
  }
  return { lat: point.lat + latDelta / weightTotal, lng: point.lng + lngDelta / weightTotal };
}

if (!existsSync(baselinePath)) {
  mkdirSync(dirname(baselinePath), { recursive: true });
  writeFileSync(baselinePath, JSON.stringify(parseCoordinatesFromTs(readFileSync(coordinatePath, "utf8")), null, 2));
  console.log(`Preserved pre-control Hidd shape at ${baselinePath}`);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const { controls } = JSON.parse(readFileSync(controlsPath, "utf8"));
const byKey = new Map(baseline.map(point => [`${point.street}|${point.villaNumber}`, point]));
const matchedControls = controls.map(control => ({ control, base: byKey.get(`${control.street}|${control.villaNumber}`) })).filter(item => item.base);
const unmatchedControls = controls.filter(control => !byKey.has(`${control.street}|${control.villaNumber}`));
if (matchedControls.length < 3) throw new Error("At least three matched controls are required");

const controlsByStreet = new Map();
for (const sample of matchedControls) {
  const list = controlsByStreet.get(sample.control.street) ?? [];
  list.push(sample);
  controlsByStreet.set(sample.control.street, list);
}
const streetModels = new Map();
for (const [street, samples] of controlsByStreet) {
  if (samples.length >= 3) {
    try {
      streetModels.set(street, fitAffine(samples));
    } catch (error) {
      // The old street interpolation is frequently collinear. In that case,
      // preserve its order and use the street's own direct controls through IDW.
      console.warn(`Using local control displacement for Street ${street}: ${error.message}`);
      streetModels.set(street, null);
    }
  }
}

const directByKey = new Map(matchedControls.map(sample => [`${sample.control.street}|${sample.control.villaNumber}`, sample.control]));
const output = baseline.map(point => {
  const key = `${point.street}|${point.villaNumber}`;
  const control = directByKey.get(key);
  if (control) {
    return { ...point, lat: control.latitude, lng: control.longitude, positionSource: "user_supplied_coordinate", controlPlot: control.plotNumber ?? null };
  }
  const model = streetModels.get(point.street);
  if (model) {
    const calibrated = applyAffine(model, point);
    return { ...point, ...calibrated, positionSource: "street_control_calibrated", controlPlot: null };
  }
  const streetControls = controlsByStreet.get(point.street);
  if (streetControls?.length) {
    const calibrated = calculateIdwDisplacement(point, streetControls);
    return { ...point, ...calibrated, positionSource: "street_control_calibrated", controlPlot: null };
  }
  const calibrated = calculateIdwDisplacement(point, matchedControls);
  return { ...point, ...calibrated, positionSource: "shape_control_calibrated", controlPlot: null };
});

const outputTs = `/**\n * Hidd Al Saadiyat villa coordinates.\n * Direct controls are user-supplied sources; other coordinates are derived from the preserved street/master-plan shape and those controls.\n */\n\nexport type HiddPositionSource = "user_supplied_coordinate" | "street_control_calibrated" | "shape_control_calibrated";\n\nexport interface HiddVillaCoord {\n  villaNumber: string;\n  street: string;\n  lat: number;\n  lng: number;\n  positionSource: HiddPositionSource;\n  controlPlot: string | null;\n}\n\nexport const hiddVillaCoords: HiddVillaCoord[] = ${JSON.stringify(output, null, 2)};\n\nexport function findHiddCoord(villaNumber: string, street: string): HiddVillaCoord | undefined {\n  return hiddVillaCoords.find(c => c.villaNumber === villaNumber && c.street === street);\n}\n`;
writeFileSync(coordinatePath, outputTs);

const report = {
  totalVillas: output.length,
  directControls: matchedControls.length,
  unmatchedControls,
  streetModels: [...streetModels.keys()],
  sourceCounts: output.reduce((counts, item) => ({ ...counts, [item.positionSource]: (counts[item.positionSource] ?? 0) + 1 }), {}),
};
const reportPath = resolve(root, "tmp/hidd-calibration-audit.json");
writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
