import { describe, expect, it } from "vitest";
import { filterProjectBuildingsByStatus } from "../AldarProject";
import type { StatusBreakdown } from "@/data/aldar";

const empty = (): StatusBreakdown => ({
  available: 0,
  new: 0,
  booked: 0,
  blocked: 0,
  reserved: 0,
  sold: 0,
  other: 0,
  total: 0,
});

describe("Aldar project source-status filters", () => {
  it("keeps only buildings containing the selected exact source state", () => {
    const building1 = { name: "Building 1", breakdown: { ...empty(), new: 57, total: 57 } };
    const building4 = { name: "Building 4", breakdown: { ...empty(), blocked: 106, total: 106 } };
    const building5 = { name: "Building 5", breakdown: { ...empty(), booked: 122, total: 122 } };
    const building6 = { name: "Building 6", breakdown: { ...empty(), available: 109, total: 109 } };
    const buildings = [building1, building4, building5, building6];

    expect(filterProjectBuildingsByStatus(buildings, "all")).toEqual(buildings);
    expect(filterProjectBuildingsByStatus(buildings, "available")).toEqual([building6]);
    expect(filterProjectBuildingsByStatus(buildings, "blocked")).toEqual([building4]);
    expect(filterProjectBuildingsByStatus(buildings, "booked")).toEqual([building5]);
    expect(filterProjectBuildingsByStatus(buildings, "sold")).toEqual([]);
  });
});
