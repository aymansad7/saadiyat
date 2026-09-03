import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const current = JSON.parse(readFileSync(resolve(root, "server/data/aldar_other.json"), "utf8"));
const priorRevision = process.argv[2] ?? "c35849e3^";
const prior = JSON.parse(execFileSync("git", ["show", `${priorRevision}:server/data/aldar_other.json`], {
  cwd: root,
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
}));

function summarize(dataset) {
  return dataset.projects
    .filter(project => /ghadeer/i.test(`${project.slug} ${project.name} ${project.source_file ?? ""}`))
    .map(project => ({
      slug: project.slug,
      name: project.name,
      sourceFile: project.source_file ?? null,
      units: project.buildings.flatMap(building => building.units.map(unit => ({ ...unit, building: building.name }))),
    }))
    .map(project => ({
      slug: project.slug,
      name: project.name,
      sourceFile: project.sourceFile,
      unitCount: project.units.length,
      pricedUnitCount: project.units.filter(unit => typeof unit.price_aed === "number" && unit.price_aed > 0).length,
      priceMinAed: Math.min(...project.units.map(unit => unit.price_aed).filter(price => typeof price === "number" && price > 0), Infinity),
      priceMaxAed: Math.max(...project.units.map(unit => unit.price_aed).filter(price => typeof price === "number" && price > 0), -Infinity),
      buildings: Object.entries(Object.groupBy(project.units, unit => unit.building)).map(([building, units]) => ({
        building,
        unitCount: units.length,
        pricedUnitCount: units.filter(unit => typeof unit.price_aed === "number" && unit.price_aed > 0).length,
        unitNameExamples: units.slice(0, 3).map(unit => unit.unit_name),
      })),
    }))
    .map(project => ({
      ...project,
      priceMinAed: Number.isFinite(project.priceMinAed) ? project.priceMinAed : null,
      priceMaxAed: Number.isFinite(project.priceMaxAed) ? project.priceMaxAed : null,
    }));
}

function projectBySlug(dataset, slug) {
  return dataset.projects.find(project => project.slug === slug);
}

function unitsForBuilding(project, buildingName) {
  return (project?.buildings ?? [])
    .filter(building => building.name === buildingName)
    .flatMap(building => building.units);
}

const priorR2 = unitsForBuilding(projectBySlug(prior, "al-ghadeer-gardens"), "Al Ghadeer Gardens");
const currentR2 = unitsForBuilding(projectBySlug(current, "al-ghadeer-gardens"), "R2");
const priorByNormalizedR2 = new Map(priorR2.map(unit => [unit.unit_name, unit]));
const matchedPrices = currentR2
  .map(unit => ({ currentUnit: unit.unit_name, prior: priorByNormalizedR2.get(unit.unit_name.replace(/-01$/i, "")) }))
  .filter(row => row.prior && typeof row.prior.price_aed === "number");

console.log(JSON.stringify({
  priorRevision,
  prior: summarize(prior),
  current: summarize(current),
  r2PriceMapping: {
    priorPricedR2Units: priorR2.filter(unit => typeof unit.price_aed === "number").length,
    currentR2Units: currentR2.length,
    exactNormalizedPriceMatches: matchedPrices.length,
    currentWithoutPriorPrice: currentR2.filter(unit => !priorByNormalizedR2.has(unit.unit_name.replace(/-01$/i, ""))).map(unit => unit.unit_name),
  },
}, null, 2));
