import { describe, expect, it } from "vitest";
import { describeInventoryEvent } from "../AdminInventoryHistory";

describe("Sync History change labels", () => {
  it("shows the exact prior and newly published price when no prior price existed", () => {
    expect(describeInventoryEvent({
      eventType: "price_change",
      fromStatus: null,
      toStatus: null,
      fromSourceStatus: null,
      toSourceStatus: null,
      fromPriceAed: null,
      toPriceAed: 3_727_606,
    })).toBe("Price first published: Not published → AED 3,727,606");
  });

  it("shows both values for a later price change and both values for an official source-state change", () => {
    expect(describeInventoryEvent({
      eventType: "price_change",
      fromStatus: null,
      toStatus: null,
      fromSourceStatus: null,
      toSourceStatus: null,
      fromPriceAed: 3_100_000,
      toPriceAed: 3_250_000,
    })).toBe("Price changed: AED 3,100,000 → AED 3,250,000");
    expect(describeInventoryEvent({
      eventType: "source_status_change",
      fromStatus: null,
      toStatus: null,
      fromSourceStatus: "New",
      toSourceStatus: "Booked",
      fromPriceAed: null,
      toPriceAed: null,
    })).toBe("Official source state: New → Booked");
  });
});
