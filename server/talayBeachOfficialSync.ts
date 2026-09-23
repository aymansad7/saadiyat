import {
  captureMarsaAlSaadiyatOfficialProject,
  selectMarsaProductionSourceUnits,
  TALAY_BEACH_CONFIG,
} from "./marsaAlSaadiyatOfficialCapture";
import { refreshMarsaAlSaadiyatOfficialProject } from "./marsaAlSaadiyatOfficialSync";

/** Exported for source-coverage regression tests. */
export function selectTalayBeachProductionSourceUnits(source: Array<Record<string, unknown> & { unitNumber?: string }>) {
  return selectMarsaProductionSourceUnits(source, TALAY_BEACH_CONFIG);
}

/** Complete, fail-closed Talay Beach capture: exact price, source status, areas, and villa configuration. */
export async function captureTalayBeachOfficialSourceState() {
  return captureMarsaAlSaadiyatOfficialProject(TALAY_BEACH_CONFIG);
}

/** Daily safe Talay Beach refresh. A capture must contain all 184 verified units before any database mutation. */
export async function refreshTalayBeachOfficialInventory(input: { trigger: "scheduled" | "manual"; triggeredBy: string }) {
  return refreshMarsaAlSaadiyatOfficialProject(TALAY_BEACH_CONFIG, input);
}
