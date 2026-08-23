import { describe, expect, it } from "vitest";

import {
  GOLF_VIEWS_TRANSACTION_SUMMARY,
  golfViewsPlotData,
  golfViewsTransactionRecords,
} from "../client/src/data/golfViewsPlotData";

describe("Golf Views transaction import", () => {
  it("keeps every available Golf Views DCR land area", () => {
    expect(Object.keys(golfViewsPlotData)).toHaveLength(25);
    expect(GOLF_VIEWS_TRANSACTION_SUMMARY.plotsWithDcrArea).toBe(25);
  });

  it("imports only the confirmed CSV matches", () => {
    const transactions = Object.values(golfViewsPlotData).flatMap(
      (plot) => plot.transactions,
    );

    expect(golfViewsTransactionRecords).toHaveLength(19);
    expect(transactions).toHaveLength(28);
    expect(transactions.filter((tx) => tx.saleType === "primary")).toHaveLength(20);
    expect(transactions.filter((tx) => tx.saleType === "secondary")).toHaveLength(8);
    expect(GOLF_VIEWS_TRANSACTION_SUMMARY.excludedAmbiguousRows).toBe(1);
    expect(GOLF_VIEWS_TRANSACTION_SUMMARY.excludedUnmatchedRows).toBe(92);
  });

  it("stores each plot history chronologically without duplicate events", () => {
    for (const plot of Object.values(golfViewsPlotData)) {
      const dates = plot.transactions.map((tx) => tx.date);
      expect(dates).toEqual([...dates].sort());

      const identities = plot.transactions.map(
        (tx) => `${tx.date}|${tx.priceAed}|${tx.saleType}`,
      );
      expect(new Set(identities).size).toBe(identities.length);
    }
  });

  it("uses the combined post-merge DCR area for merged plots", () => {
    expect(golfViewsPlotData["golf-views/SDN2_6-1_2"]).toMatchObject({
      landSqm: 5343.06,
      landSqft: 57512.16,
    });
    expect(golfViewsPlotData["golf-views/SDN2_6_7-6_8"]).toMatchObject({
      landSqm: 4866.77,
      landSqft: 52385.43,
    });
    expect(golfViewsPlotData["golf-views/SDN2_6_23-6_24"]).toMatchObject({
      landSqm: 6057.2,
      landSqft: 65199.1,
    });

    expect(golfViewsPlotData["golf-views/SDN2_6-1_2"].transactions).toHaveLength(1);
    expect(golfViewsPlotData["golf-views/SDN2_6_7-6_8"].transactions).toHaveLength(1);
    expect(golfViewsPlotData["golf-views/SDN2_6_23-6_24"].transactions).toHaveLength(1);
  });
});
