import { describe, expect, it } from "vitest";
import { inventoryUnitEventKey, matchesSalesStatusFilter } from "./inventorySalesFilters";

const unit = { dataset: "saadiyat", projectSlug: "faya", unitName: "FAYA-01", status: "Available" };

describe("inventory sales price-change filter", () => {
  it("matches only a price-change record qualified by dataset and project", () => {
    const changed = new Set([inventoryUnitEventKey(unit)]);
    expect(matchesSalesStatusFilter(unit, "price-changed", changed)).toBe(true);
    expect(matchesSalesStatusFilter({ ...unit, projectSlug: "another-project" }, "price-changed", changed)).toBe(false);
  });

  it("retains Aldar status matching independently from the historical price filter", () => {
    expect(matchesSalesStatusFilter(unit, "available", new Set())).toBe(true);
    expect(matchesSalesStatusFilter({ ...unit, status: "New" }, "available", new Set())).toBe(false);
    expect(matchesSalesStatusFilter({ ...unit, status: "New" }, "new", new Set())).toBe(true);
  });
});
