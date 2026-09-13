import { describe, expect, it } from "vitest";
import { computeOfficialPricePatchEvents, inventoryUnitKey, type PrevState } from "./inventorySync";

describe("computeOfficialPricePatchEvents", () => {
  it("records exact price changes without generating removed events for units absent from a partial source", () => {
    const first: PrevState = {
      unitName: "SeiSaadiyat-T3-01-01",
      dataset: "saadiyat",
      projectSlug: "sei-saadiyat",
      projectName: "Sei Saadiyat",
      status: "New",
      sourceStatus: "New",
      priceAed: null,
      isPresent: true,
    };
    const untouched: PrevState = { ...first, unitName: "SeiSaadiyat-T3-01-02" };
    const previous = new Map([
      [inventoryUnitKey(first), first],
      [inventoryUnitKey(untouched), untouched],
    ]);

    const events = computeOfficialPricePatchEvents(previous, "saadiyat", "sei-saadiyat", [
      { unitName: "SeiSaadiyat-T3-01-01", priceAed: 5_251_700.49 },
    ]);

    expect(events).toEqual([expect.objectContaining({
      eventType: "price_change",
      unitName: "SeiSaadiyat-T3-01-01",
      fromPriceAed: null,
      toPriceAed: 5_251_700,
    })]);
    expect(events.some(event => event.eventType === "removed")).toBe(false);
  });
});
