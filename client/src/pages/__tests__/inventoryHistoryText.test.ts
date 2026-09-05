import { describe, expect, it } from "vitest";
import { describeCardHistoryEvent, describeInventoryEvent } from "../AdminInventoryHistory";

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

  it("shows an operational sale as a documented transition instead of a generic card update", () => {
    const label = describeCardHistoryEvent({
      id: "card-1",
      createdAt: "2026-09-05T14:14:03.000Z",
      eventType: "manual_sold",
      villaKey: "aldar-other/yas-park-place/yasparkplace-b1/YasParkPlace-B1-02-03",
      projectSlug: "yas-park-place",
      buildingName: "yasparkplace-b1",
      unitName: "YasParkPlace-B1-02-03",
      href: "/aldar-other/yas-park-place/yasparkplace-b1/YasParkPlace-B1-02-03",
      fromStatus: "available",
      toStatus: "sold",
      fromPriceAed: null,
      toPriceAed: null,
      saleAgentName: "Test Representative",
      soldAt: "2026-09-05T14:14:03.000Z",
      actorName: "Master Admin",
      actorEmail: "master@example.test",
      changes: { status: { from: "available", to: "sold" } },
    });
    expect(label).toContain("Operational sale: available → Sold");
    expect(label).toContain("responsible: Test Representative");
  });
});
