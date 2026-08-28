export type SalesStatusFilter = "all" | "available" | "new" | "price-changed";

export type InventoryUnitKey = {
  dataset: string;
  projectSlug: string;
  unitName: string;
};

/** A project-qualified unit key; raw unit names can repeat across Aldar projects. */
export function inventoryUnitEventKey(unit: InventoryUnitKey) {
  return `${unit.dataset}:${unit.projectSlug}:${unit.unitName}`;
}

export function matchesSalesStatusFilter(
  unit: InventoryUnitKey & { status: string | null },
  filter: SalesStatusFilter,
  priceChangedKeys: ReadonlySet<string>,
) {
  if (filter === "all") return true;
  if (filter === "price-changed") return priceChangedKeys.has(inventoryUnitEventKey(unit));
  return (unit.status ?? "").trim().toLowerCase() === filter;
}
