export type InventoryPublicationState =
  | { label: "available"; tone: "available" }
  | { label: "live"; tone: "live" }
  | { label: "registration open"; tone: "registration" }
  | { label: "no active inventory published"; tone: "unpublished" };

/**
 * A zero count is evidence only that this snapshot has no active inventory.
 * It is never evidence that a project or phase sold out.
 */
export function getInventoryPublicationState(
  slug: string,
  availableCount: number,
  liveCount: number,
): InventoryPublicationState {
  if (availableCount > 0) return { label: "available", tone: "available" };
  if (liveCount > 0) return { label: "live", tone: "live" };
  if (slug === "al-ghadeer-parks-1" || slug === "al-ghadeer-parks-2") {
    return { label: "registration open", tone: "registration" };
  }
  return { label: "no active inventory published", tone: "unpublished" };
}
