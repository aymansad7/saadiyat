import { refreshAlGhadeerOfficialInventory } from "./alGhadeerOfficialSync";
import { refreshSeiSaadiyatOfficialInventory } from "./seiSaadiyatOfficialSync";

type RefreshInput = { trigger: "manual"; triggeredBy: string };

export type ManualOfficialRefreshDependencies = {
  refreshGhadeer: (input: RefreshInput) => Promise<Record<string, unknown>>;
  refreshSei: (input: RefreshInput) => Promise<Record<string, unknown>>;
};

const defaultDependencies: ManualOfficialRefreshDependencies = {
  refreshGhadeer: refreshAlGhadeerOfficialInventory,
  refreshSei: refreshSeiSaadiyatOfficialInventory,
};

/**
 * The Sales Desk button refreshes every currently enabled official live source.
 * Runs are intentionally sequential to keep outbound Aldar request volume bounded.
 */
export async function runManualOfficialAldarRefresh(
  triggeredBy: string,
  dependencies: ManualOfficialRefreshDependencies = defaultDependencies,
) {
  const input: RefreshInput = { trigger: "manual", triggeredBy };
  const ghadeer = await dependencies.refreshGhadeer(input);
  const sei = await dependencies.refreshSei(input);
  return { ghadeer, sei };
}
