import { archiveSeiSaadiyatSourceFiles } from "../server/seiSaadiyatOfficialExport";
import { captureSeiSaadiyatOfficialFullPricePatch } from "../server/seiSaadiyatOfficialCapture";
import { applyOfficialUnitPricePatch } from "../server/inventorySync";

const capture = await captureSeiSaadiyatOfficialFullPricePatch();
const sync = await applyOfficialUnitPricePatch({
  trigger: "manual",
  triggeredBy: "owner-requested-sei-full-official-price-refresh-2026-09-15",
  dataset: "saadiyat",
  projectSlug: "sei-saadiyat",
  prices: capture.publishedPrices,
});
const archive = await archiveSeiSaadiyatSourceFiles(capture.files, capture.captureDate);

console.log(JSON.stringify({
  captureDate: capture.captureDate,
  sourceUnitCount: capture.sourceUnitCount,
  hasCompleteSourceCoverage: capture.hasCompleteSourceCoverage,
  detailResponseCount: capture.detailResponseCount,
  detailFailureCount: capture.detailFailureCount,
  validPublishedPriceCount: capture.publishedPrices.length,
  pricePatch: {
    runId: sync.runId,
    unitsScreened: sync.counts.unitsScanned,
    priceChanges: sync.counts.priceChanges,
    appliedUnitCount: sync.appliedUnitCount,
  },
  archivedFiles: archive.fileCount,
}, null, 2));
