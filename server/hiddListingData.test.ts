import { describe, expect, it } from "vitest";
import publicHiddData from "../client/src/data/hiddPublic.json";
import { getHiddSensitiveFacts } from "./hiddListingData";

describe("Hidd protected listing data", () => {
  it("never includes source owner or tenant fields in the browser dataset", () => {
    const forbidden = [
      "owner1Name", "owner1Email", "owner1Mobile", "owner2Name", "owner2Email", "owner2Mobile",
      "tenantName", "tenantEmail", "tenantMobile", "ownerRepName", "ownerRepEmail", "ownerRepMobile",
      "hiddCard", "plateNumber", "tenantPlateNumber",
    ];
    expect(publicHiddData.length).toBeGreaterThan(0);
    for (const row of publicHiddData) {
      for (const field of forbidden) expect(row).not.toHaveProperty(field);
    }
  });

  it("does not return protected facts without a signed-in caller", async () => {
    await expect(getHiddSensitiveFacts(null)).resolves.toEqual([]);
  });

  it("returns available protected facts to a Master Admin without exposing them to anonymous callers", async () => {
    const facts = await getHiddSensitiveFacts({ role: "master", email: "master-hidd-test@example.test" });
    expect(facts.length).toBeGreaterThan(0);
    expect(facts.every(fact => fact.villaKey.startsWith("hidd/"))).toBe(true);
    expect(facts.some(fact => fact.ownerName || fact.ownerPhone || fact.tenant)).toBe(true);
  });
});
