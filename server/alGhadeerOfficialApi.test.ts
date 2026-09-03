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
  }, 15_000);

  it("returns exact workbook-backed cards and direct official unit links without assigning operational availability", async () => {
    const building = await caller("master").getBuilding({ projectSlug: "al-ghadeer-gardens", buildingSlug: "n2" });
    expect(building.unit_count).toBe(353);
    const exceptional = building.units.find(unit => unit.unit_name === "AlGhadeerGardens-N2-V-004-Test-01");
    expect(exceptional).toMatchObject({
      status: null,
      aldar_link: "https://world.aldar.com/uae/abudhabi/alghadeergardens/property/N2-V-004-Test-01/0?scheme=S1&unitstate=floorplan&furnished=true",
      price_source: "User-provided Aldar Al Ghadeer Hero Full Complete workbook",
    });
    expect(exceptional?.price_aed).toBeNull();
    expect(exceptional?.official_payment_plans).toEqual(expect.any(Array));
  });

  it("keeps Parks starting prices as project metadata and stores matched unit prices separately", async () => {
    const project = await caller("master").getProject({ slug: "al-ghadeer-parks-1" });
    expect(project.published_starting_prices).toMatchObject({
      payment_plan: "55/45",
      prices: [
        { unit_type: "2-bedroom Townhouse", starting_price_aed: 1900000 },
        { unit_type: "3-bedroom Townhouse", starting_price_aed: 2200000 },
        { unit_type: "4-bedroom Villa", starting_price_aed: 3300000 },
      ],
    });
    const building = await caller("master").getBuilding({ projectSlug: "al-ghadeer-parks-1", buildingSlug: "nc" });
    expect(building.units).toHaveLength(280);
    expect(building.units.every(unit => typeof unit.price_aed === "number" && unit.price_aed > 0)).toBe(true);
    expect(building.units.every(unit => unit.status == null)).toBe(true);
  });

  it("keeps Aldar Other inventory unavailable to a normal admin even when the data exists", async () => {
    await expect(caller("admin").getProject({ slug: "al-ghadeer-parks-1" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
