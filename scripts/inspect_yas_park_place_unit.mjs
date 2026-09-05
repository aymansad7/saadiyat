import { readFile } from "node:fs/promises";

const input = process.argv[2] ?? "203";
const snapshot = JSON.parse(await readFile(new URL("../server/data/aldar_other.json", import.meta.url), "utf8"));

const projects = [];
const matches = [];
const b1Sample = [];
function walk(value, path = [], inYasParkPlace = false) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, [...path, String(index)], inYasParkPlace));
    return;
  }
  if (!value || typeof value !== "object") return;

  const text = JSON.stringify(value);
  const name = String(value.name ?? value.projectName ?? value.project_name ?? "");
  const slug = String(value.slug ?? value.projectSlug ?? value.project_slug ?? "");
  const projectText = `${path.join("/")} ${name} ${slug}`.toLowerCase();
  const isYasParkPlace = inYasParkPlace || name.toLowerCase().includes("yas park place") || slug.toLowerCase().includes("yasparkplace");
  if (name.toLowerCase().includes("yas park place") || slug.toLowerCase().includes("yasparkplace")) {
    projects.push({ path: path.join("/"), name, slug, keys: Object.keys(value).slice(0, 12) });
  }
  if (isYasParkPlace && text.includes(input)) {
    const unit = value.unit_name ?? value.unitNumber ?? value.unit_number ?? value.name ?? value.unit ?? null;
    if (typeof unit === "string" && unit.includes(input)) {
      matches.push({
        path: path.join("/"),
        unit,
        status: value.status ?? value.unitStatus ?? null,
        priceAed: value.priceAed ?? value.price_aed ?? value.price ?? null,
        building: value.buildingName ?? value.building ?? null,
        aldarLink: value.aldarLink ?? value.aldar_link ?? null,
      });
    }
  }

  if (isYasParkPlace && path.join("/").includes("buildings/0/units/")) {
    const unit = value.unit_name ?? value.unitNumber ?? value.unit_number ?? value.unit_no ?? value.name ?? value.unit ?? null;
    if (b1Sample.length < 15) {
      b1Sample.push({
        keys: Object.keys(value).slice(0, 16),
        unit,
        status: value.status ?? value.unitStatus ?? value.unit_status ?? null,
      });
    }
  }

  Object.entries(value).forEach(([key, item]) => walk(item, [...path, key], isYasParkPlace));
}

walk(snapshot);
console.log(JSON.stringify({ query: input, projects, b1Sample, matches }, null, 2));
