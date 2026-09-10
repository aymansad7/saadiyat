import { describe, expect, it } from "vitest";
import { systemRowsFromCardHistory } from "./AdminInventoryHistory";

describe("systemRowsFromCardHistory", () => {
  it("splits a card edit into readable before-and-after rows with the exact card link", () => {
    const rows = systemRowsFromCardHistory({
      id: "card-12",
      createdAt: "2026-09-10T10:00:00.000Z",
      eventType: "card_update",
      villaKey: "four-seasons/Villa-7",
      projectSlug: "four-seasons",
      buildingName: null,
      unitName: "Villa 7",
      href: "/four-seasons?villa=7",
      fromStatus: "warm",
      toStatus: "available",
      fromPriceAed: null,
      toPriceAed: 320000000,
      saleAgentName: null,
      soldAt: null,
      actorName: "Master Admin",
      actorEmail: "admin@example.com",
      changes: {
        askingPriceAed: { from: null, to: 320000000 },
        status: { from: "warm", to: "available" },
      },
    });

    expect(rows).toEqual(expect.arrayContaining([
      expect.objectContaining({
        field: "Asking price",
        before: "Not stated",
        after: "AED 320,000,000",
        href: "/four-seasons?villa=7",
      }),
      expect.objectContaining({
        field: "Operational status",
        before: "warm",
        after: "available",
        actor: "Master Admin",
      }),
    ]));
  });
});
