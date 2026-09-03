import { archiveAlGhadeerOfficialSourceFiles } from "./alGhadeerOfficialExport";
import { captureAlGhadeerOfficialSnapshot } from "./alGhadeerOfficialCapture";
import { runInventorySync } from "./inventorySync";

export async function refreshAlGhadeerOfficialInventory(input: { trigger: "scheduled" | "manual"; triggeredBy: string }) {
  const capture = await captureAlGhadeerOfficialSnapshot();
  await archiveAlGhadeerOfficialSourceFiles(capture.files, capture.captureDate);
  const sync = await runInventorySync({
    trigger: input.trigger,
    triggeredBy: input.triggeredBy,
    datasets: { other: capture.otherDataset as any },
  });
  return { ...sync, captureDate: capture.captureDate, clusters: capture.clusters };
}
