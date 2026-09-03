import { readFile } from "node:fs/promises";

const source = JSON.parse(await readFile(new URL("../server/data/aldar_other.json", import.meta.url), "utf8"));
const parks = source.projects.filter((project) => /^al-ghadeer-parks-[12]$/.test(project.slug));

console.log(JSON.stringify(parks.map((project) => ({
  slug: project.slug,
  keys: Object.keys(project).sort(),
  name: project.name,
  source_file: project.source_file,
  unit_count: project.unit_count,
  available_count: project.available_count,
  first_unit: project.buildings?.[0]?.units?.[0] ?? null,
})), null, 2));
