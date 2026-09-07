import { captureSeiSaadiyatOfficialSnapshot } from "../server/seiSaadiyatOfficialCapture";

const capture = await captureSeiSaadiyatOfficialSnapshot();
const project = capture.dataset.projects.find(item => item.slug === "sei-saadiyat");
const unitCount = Array.isArray(project?.buildings)
  ? project.buildings.reduce((sum, building) => sum + (Array.isArray((building as any).units) ? (building as any).units.length : 0), 0)
  : 0;

console.log(JSON.stringify({
  project: project?.name ?? null,
  captureDate: capture.captureDate,
  unitCount,
  publishedPriceCount: capture.publishedPriceCount,
  source: "World of Aldar live page",
}, null, 2));
