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

  it("imports the exact and user-approved CSV matches", () => {
    const transactions = Object.values(golfViewsPlotData).flatMap(
      (plot) => plot.transactions,
    );

    expect(golfViewsTransactionRecords).toHaveLength(19);
    expect(transactions).toHaveLength(25);
    expect(transactions.filter((tx) => tx.saleType === "primary")).toHaveLength(18);
    expect(transactions.filter((tx) => tx.saleType === "secondary")).toHaveLength(7);
    expect(transactions.filter((tx) => tx.confidence === "possible")).toHaveLength(1);
    expect(GOLF_VIEWS_TRANSACTION_SUMMARY.excludedUnmatchedRows).toBe(12);
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

  it("assigns the user-confirmed AED 55M resales to Plot 6/6 only", () => {
    const plotSixSales = golfViewsPlotData["golf-views/SDN2_6_6"].transactions;
    const plotElevenSales = golfViewsPlotData["golf-views/SDN2_6_11"].transactions;

    expect(plotSixSales.map((transaction) => transaction.date)).toEqual([
      "2024-03-18",
      "2024-05-30",
    ]);
    expect(plotSixSales.every((transaction) => transaction.priceAed === 55_000_000)).toBe(true);
    expect(plotElevenSales.some((transaction) => transaction.priceAed === 55_000_000)).toBe(false);
  });

  it("stores the user-confirmed unique-nearest resales with BUA and land delta", () => {
    expect(golfViewsPlotData["golf-views/SDN2_6_14"].transactions).toContainEqual(
      expect.objectContaining({
        date: "2025-11-28",
        priceAed: 76_500_000,
        builtUpAreaSqm: 2116.06,
        confidence: "user-confirmed",
        areaDifferenceSqm: 11.16,
      }),
    );
    expect(golfViewsPlotData["golf-views/SDN2_6_26"].transactions).toContainEqual(
      expect.objectContaining({
        date: "2025-11-14",
        priceAed: 26_000_000,
        builtUpAreaSqm: 1133,
        confidence: "user-confirmed",
        areaDifferenceSqm: 60.82,
      }),
    );
  });
});
