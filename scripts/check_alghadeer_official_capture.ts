import { captureAlGhadeerOfficialSnapshot } from "../server/alGhadeerOfficialCapture";

const capture = await captureAlGhadeerOfficialSnapshot();
const projects = capture.otherDataset.projects.filter(project => [
  "al-ghadeer-gardens",
  "al-ghadeer-parks-1",
  "al-ghadeer-parks-2",
].includes(String(project.slug)));

console.log(JSON.stringify({
  captureDate: capture.captureDate,
  clusters: capture.clusters,
  totalUnits: capture.clusters.reduce((sum, cluster) => sum + cluster.unitCount, 0),
  projects: projects.map(project => ({
    slug: project.slug,
    units: project.unit_count,
    pricedUnits: (project.buildings as Array<{ units: Array<{ price_aed: number | null }> }>)
      .flatMap(building => building.units)
      .filter(unit => unit.price_aed != null).length,
  })),
}, null, 2));
