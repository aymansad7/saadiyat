import { describe, expect, it } from "vitest";

import {
  FOUR_SEASONS_MASTERPLAN_IMAGE,
  FOUR_SEASONS_MASTERPLAN_PDF,
  FOUR_SEASONS_VILLAS,
} from "../client/src/data/fourSeasons";
import {
  FOUR_SEASONS_PENDING_SUMMARY,
  FOUR_SEASONS_PENDING_TRANSACTIONS,
} from "../client/src/data/fourSeasonsPendingTransactions";
import {
  FOUR_SEASONS_FLOORPLANS,
  FOUR_SEASONS_FLOORPLAN_BY_VILLA,
} from "../client/src/data/fourSeasonsFloorplans";
import {
  FOUR_SEASONS_TRANSACTION_MATCHES,
  FOUR_SEASONS_TRANSACTION_SUMMARY,
  FOUR_SEASONS_UNMATCHED_TRANSACTIONS,
  getFourSeasonsTransactions,
} from "../client/src/data/fourSeasonsTransactions";
import { COMMUNITIES } from "../client/src/data/communities";
import { getPlotLandArea } from "../client/src/data/plotLandAreas";
import { plotCoordinates } from "../client/src/data/plotCoordinates";

const EXPECTED_AVAILABLE = [11, 12, 13, 19, 25, 26, 27, 30, 32, 48, 50];

describe("Four Seasons source integrity", () => {
  it("keeps exactly the 56 official master-plan villas", () => {
    expect(FOUR_SEASONS_VILLAS).toHaveLength(56);
    expect(FOUR_SEASONS_VILLAS.map((villa) => villa.villaNumber)).toEqual(
      Array.from({ length: 56 }, (_, index) => index + 1),
    );
    expect(new Set(FOUR_SEASONS_VILLAS.map((villa) => villa.villaKey)).size).toBe(56);
  });

  it("marks only the 11 villas from the 23 Aug 2026 current sheet as available", () => {
    expect(
      FOUR_SEASONS_VILLAS.filter((villa) => villa.status === "available").map(
        (villa) => villa.villaNumber,
      ),
    ).toEqual(EXPECTED_AVAILABLE);

    for (const villa of FOUR_SEASONS_VILLAS) {
      if (EXPECTED_AVAILABLE.includes(villa.villaNumber)) {
        expect(villa.availabilityUpdatedAt).toBe("2026-08-23");
        expect(villa.askingPriceAed).toBeGreaterThan(0);
      } else {
        expect(villa.status).toBe("unknown");
        expect(villa.askingPriceAed).toBeNull();
        expect(villa.availabilityUpdatedAt).toBeNull();
      }
    }
  });

  it("uses the official master-plan assets and labels calibrated map positions honestly", () => {
    expect(FOUR_SEASONS_MASTERPLAN_IMAGE).toBe(
      "/manus-storage/FourSeasons_MasterPlan_aa0ee03b.png",
    );
    expect(FOUR_SEASONS_MASTERPLAN_PDF).toBe(
      "/manus-storage/FourSeasons_MasterPlan_f2902c89.pdf",
    );
    expect(
      FOUR_SEASONS_VILLAS.every(
        (villa) => villa.positionSource === "masterplan_calibrated_to_dcr",
      ),
    ).toBe(true);
  });

  it("keeps all municipal rows pending and source-traceable", () => {
    expect(FOUR_SEASONS_PENDING_TRANSACTIONS).toHaveLength(15);
    expect(FOUR_SEASONS_PENDING_SUMMARY.recordCount).toBe(15);
    expect(
      FOUR_SEASONS_PENDING_TRANSACTIONS.every(
        (transaction) => transaction.matchStatus === "pending_land_match",
      ),
    ).toBe(true);
    expect(
      FOUR_SEASONS_PENDING_TRANSACTIONS.every(
        (transaction) => transaction.matchedVillaKey === null,
      ),
    ).toBe(true);
    expect(new Set(FOUR_SEASONS_PENDING_TRANSACTIONS.map((tx) => tx.sourceRow)).size).toBe(15);
  });

  it("registers the 20 developer floorplans without treating them as availability", () => {
    expect(FOUR_SEASONS_FLOORPLANS).toHaveLength(20);
    expect(new Set(FOUR_SEASONS_FLOORPLANS.map((floorplan) => floorplan.villaNumber)).size).toBe(20);
    expect(FOUR_SEASONS_FLOORPLANS.filter((floorplan) => floorplan.bedrooms === 5)).toHaveLength(11);
    expect(FOUR_SEASONS_FLOORPLANS.filter((floorplan) => floorplan.bedrooms === 6)).toHaveLength(9);
    expect(FOUR_SEASONS_FLOORPLANS.every((floorplan) => floorplan.sourceKind === "developer_floorplan")).toBe(true);
    expect(FOUR_SEASONS_FLOORPLANS.every((floorplan) => floorplan.pdfUrl.startsWith("/manus-storage/"))).toBe(true);

    const villa29 = FOUR_SEASONS_VILLAS.find((villa) => villa.villaNumber === 29);
    expect(villa29?.plotAreaSqft).toBe(18976);
    expect(villa29?.status).toBe("unknown");
    expect(villa29?.askingPriceAed).toBeNull();
    expect(FOUR_SEASONS_FLOORPLAN_BY_VILLA.get(29)?.sellableAreaSqft).toBe(22718);
  });

  it("keeps explicit confirmed and possible municipal matches unique", () => {
    expect(FOUR_SEASONS_TRANSACTION_SUMMARY).toEqual({
      total: 15,
      confirmed: 3,
      possible: 2,
      unmatched: 10,
    });
    expect(FOUR_SEASONS_UNMATCHED_TRANSACTIONS).toHaveLength(10);
    expect(new Set(FOUR_SEASONS_TRANSACTION_MATCHES.map((transaction) => transaction.sourceRow)).size).toBe(
      FOUR_SEASONS_TRANSACTION_MATCHES.length,
    );

    const villa9 = getFourSeasonsTransactions(9);
    expect(villa9).toHaveLength(1);
    expect(villa9[0]).toMatchObject({
      sourceRow: 2,
      priceAed: 350000000,
      date: "2026-08-20",
      confidence: "confirmed",
      matchBasis: "user_confirmed",
    });

    expect(getFourSeasonsTransactions(38)[0]).toMatchObject({
      sourceRow: 5,
      priceAed: 83400000,
      confidence: "confirmed",
    });
    expect(getFourSeasonsTransactions(38)[0].landDifferenceSqm).toBeLessThan(0.01);
    expect(getFourSeasonsTransactions(40)[0]).toMatchObject({
      sourceRow: 7,
      priceAed: 87500000,
      confidence: "confirmed",
    });
    expect(getFourSeasonsTransactions(40)[0].landDifferenceSqm).toBeLessThan(0.05);

    expect(getFourSeasonsTransactions(14)[0]).toMatchObject({ sourceRow: 3, confidence: "possible" });
    expect(getFourSeasonsTransactions(21)[0]).toMatchObject({ sourceRow: 11, confidence: "possible" });
  });
});

describe("SDN3_10 huge plot registration", () => {
  it("uses the official DCR land area and centroid", () => {
    expect(getPlotLandArea("huge-plot-four-seasons-omniyat/SDN3_10")).toEqual({
      sqm: 31766.65,
      sqft: 341933.37,
    });
    expect(plotCoordinates["huge-plot-four-seasons-omniyat/SDN3_10"]).toEqual({
      lat: 24.55285144,
      lng: 54.44457573,
    });
  });

  it("is exposed as a one-plot Saadiyat community", () => {
    const community = COMMUNITIES.find(
      (item) => item.slug === "huge-plot-four-seasons-omniyat",
    );
    expect(community).toBeDefined();
    expect(community?.name).toBe("A Huge Plot Between Four Seasons and Omniyat");
    expect(community?.totalPlots).toBe(1);
    expect(community?.flatPlots[0]?.villaKey).toBe(
      "huge-plot-four-seasons-omniyat/SDN3_10",
    );
  });
});
