import { describe, expect, it } from "vitest";
import { canRenderAldarBuildingUnit } from "../AldarBuilding";

describe("Aldar building unit visibility", () => {
  it("keeps all unit rows visible to Master Admin while the permission batch refreshes", () => {
    expect(canRenderAldarBuildingUnit("master", undefined)).toBe(true);
    expect(canRenderAldarBuildingUnit("master", { canAccess: false })).toBe(true);
  });

  it("remains deny-by-default for every non-Master role", () => {
    expect(canRenderAldarBuildingUnit("admin", undefined)).toBe(false);
    expect(canRenderAldarBuildingUnit("user", { canAccess: false })).toBe(false);
    expect(canRenderAldarBuildingUnit("admin", { canAccess: true })).toBe(true);
  });
});
