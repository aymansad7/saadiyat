import {
  captureMarsaAlSaadiyatOfficialProject,
  selectMarsaProductionSourceUnits,
  TALAY_CONFIG,
} from "./marsaAlSaadiyatOfficialCapture";
import { refreshMarsaAlSaadiyatOfficialProject } from "./marsaAlSaadiyatOfficialSync";

/** Exported for focused source-coverage regression tests. */
export function selectTalayProductionSourceUnits(source: Array<Record<string, unknown> & { unitNumber?: string }>) {
  return selectMarsaProductionSourceUnits(source, TALAY_CONFIG);
}

/** Complete, fail-closed Talay capture: exact unit status, price, areas, and source configuration. */
export async function captureTalayOfficialSourceState() {
  return captureMarsaAlSaadiyatOfficialProject(TALAY_CONFIG);
}

/** Daily safe Talay refresh. A capture must contain all 169 verified units before any database mutation. */
export async function refreshTalayOfficialInventory(input: { trigger: "scheduled" | "manual"; triggeredBy: string }) {
  return refreshMarsaAlSaadiyatOfficialProject(TALAY_CONFIG, input);
}
