import { refreshAlGhadeerOfficialInventory } from "./alGhadeerOfficialSync";
import { refreshSeiSaadiyatOfficialInventory } from "./seiSaadiyatOfficialSync";

type RefreshInput = { trigger: "manual"; triggeredBy: string };

export type ManualOfficialRefreshDependencies = {
  refreshGhadeer: (input: RefreshInput) => Promise<Record<string, unknown>>;
  refreshSei: (input: RefreshInput) => Promise<Record<string, unknown>>;
};

export type ManualOfficialRefreshResult =
  | { status: "success"; result: Record<string, unknown> }
  | { status: "error"; message: string };

async function safelyRefresh(
  refresh: (input: RefreshInput) => Promise<Record<string, unknown>>,
  input: RefreshInput,
): Promise<ManualOfficialRefreshResult> {
  try {
    return { status: "success", result: await refresh(input) };
  } catch (error) {
    return { status: "error", message: String((error as Error)?.message ?? error).slice(0, 500) };
  }
}

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
  const ghadeer = await safelyRefresh(dependencies.refreshGhadeer, input);
  const sei = await safelyRefresh(dependencies.refreshSei, input);
  return { ghadeer, sei };
}
