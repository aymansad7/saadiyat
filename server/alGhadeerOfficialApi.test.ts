import { describe, expect, it } from "vitest";
import { aldarOtherRouter } from "./routers/aldarOther";

function caller(role: "master" | "admin") {
  return aldarOtherRouter.createCaller({
    user: { id: 900, role, email: `${role}@example.test`, name: role },
  } as never);
}

describe("Al Ghadeer official project browsing", () => {
  it("surfaces the three project cards in the Al Ghadeer area for Master Admin", async () => {
    const result = await caller("master").listByArea({ q: "Al Ghadeer" });
    const area = result.areas.find(item => item.key === "al-ghadeer");
    expect(area?.projects.map(project => project.slug).sort()).toEqual([
      "al-ghadeer-gardens",
      "al-ghadeer-parks-1",
      "al-ghadeer-parks-2",
    ]);
    expect(area?.unit_count).toBe(1243);
    expect(area?.available_count).toBe(0);
  });

  it("returns exact cards and direct official unit links without assigning a price or availability", async () => {
    const building = await caller("master").getBuilding({ projectSlug: "al-ghadeer-gardens", buildingSlug: "n2" });
    expect(building.unit_count).toBe(353);
    const exceptional = building.units.find(unit => unit.unit_name === "AlGhadeerGardens-N2-V-004-Test-01");
    expect(exceptional).toMatchObject({
      price_aed: null,
      status: null,
      source_unit_status: "Booked",
      aldar_link: "https://world.aldar.com/uae/abudhabi/alghadeergardens/property/N2-V-004-Test-01/0?scheme=S1&unitstate=floorplan&furnished=true",
    });
  });

  it("keeps Aldar Other inventory unavailable to a normal admin even when the data exists", async () => {
    await expect(caller("admin").getProject({ slug: "al-ghadeer-parks-1" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
