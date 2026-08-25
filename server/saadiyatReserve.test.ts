import { describe, expect, it } from "vitest";
import {
  SAADIYAT_RESERVE_DUNES_VILLAS,
  SAADIYAT_RESERVE_LAND_PLOTS,
  SAADIYAT_RESERVE_MASTERPLAN_IMAGE_URL,
  SAADIYAT_RESERVE_MASTERPLAN_PDF_URL,
  SAADIYAT_RESERVE_PHASE_1_PLOTS,
  SAADIYAT_RESERVE_PHASE_2_PLOTS,
  SAADIYAT_RESERVE_RECORDS,
} from "../client/src/data/saadiyatReserve";

const officialControls = new Map<number, { latitude: number; longitude: number }>([
  [21, { latitude: 24.5251825, longitude: 54.4432384 }],
  [22, { latitude: 24.5253477, longitude: 54.443178 }],
  [37, { latitude: 24.528035, longitude: 54.4412528 }],
  [61, { latitude: 24.524202, longitude: 54.4387504 }],
  [67, { latitude: 24.5234405, longitude: 54.4395702 }],
  [68, { latitude: 24.5233284, longitude: 54.4397131 }],
  [81, { latitude: 24.5216449, longitude: 54.4413981 }],
  [82, { latitude: 24.5214185, longitude: 54.4416178 }],
  [101, { latitude: 24.5188397, longitude: 54.4441996 }],
  [114, { latitude: 24.519821, longitude: 54.4466872 }],
  [126, { latitude: 24.5212737, longitude: 54.445333 }],
  [131, { latitude: 24.5211075, longitude: 54.4438846 }],
  [134, { latitude: 24.5217749, longitude: 54.4447532 }],
  [193, { latitude: 24.523873, longitude: 54.441105 }],
  [200, { latitude: 24.524959, longitude: 54.4406262 }],
  [272, { latitude: 24.5219579, longitude: 54.4423814 }],
  [296, { latitude: 24.5202447, longitude: 54.4440922 }],
]);

const officialDunesPlotNumbers = [
  ...Array.from({ length: 49 }, (_, index) => index + 82),
  272,
  274,
  ...Array.from({ length: 32 }, (_, index) => index + 276),
];

describe("Saadiyat Reserve authoritative registry", () => {
  it("contains every official numbered record from Plot 2 through Plot 307", () => {
    expect(SAADIYAT_RESERVE_RECORDS).toHaveLength(306);
    expect(SAADIYAT_RESERVE_RECORDS.map(record => record.plotNumber)).toEqual(
      Array.from({ length: 306 }, (_, index) => index + 2),
    );
    expect(new Set(SAADIYAT_RESERVE_RECORDS.map(record => record.villaKey)).size).toBe(306);
    expect(new Set(SAADIYAT_RESERVE_RECORDS.map(record => `${record.hotspotXPercent}:${record.hotspotYPercent}`)).size).toBe(306);
  });

  it("preserves the official phase split and separates land from built Dunes villas", () => {
    expect(SAADIYAT_RESERVE_PHASE_1_PLOTS).toHaveLength(116);
    expect(SAADIYAT_RESERVE_PHASE_2_PLOTS).toHaveLength(107);
    expect(SAADIYAT_RESERVE_LAND_PLOTS).toHaveLength(223);
    expect(SAADIYAT_RESERVE_DUNES_VILLAS).toHaveLength(83);
    expect(SAADIYAT_RESERVE_DUNES_VILLAS.every(record => record.phase === 3)).toBe(true);
    expect(SAADIYAT_RESERVE_LAND_PLOTS.every(record => record.phase === 1 || record.phase === 2)).toBe(true);
  });

  it("matches Phase 3 exactly to the official World of Aldar Dunes villa IDs", () => {
    expect(SAADIYAT_RESERVE_DUNES_VILLAS.map(record => record.plotNumber)).toEqual(officialDunesPlotNumbers);
    expect(SAADIYAT_RESERVE_DUNES_VILLAS.filter(record => record.dunes?.bedrooms === 4)).toHaveLength(53);
    expect(SAADIYAT_RESERVE_DUNES_VILLAS.filter(record => record.dunes?.bedrooms === 5)).toHaveLength(30);
    for (const record of SAADIYAT_RESERVE_DUNES_VILLAS) {
      expect(record.dunes?.unitNumber).toBe(`${String(record.plotNumber).padStart(3, "0")}-01`);
      expect(record.dunes?.officialWorldAldarUrl).toContain(`/property/Dunes-${String(record.plotNumber).padStart(3, "0")}-01/`);
      expect(record.dunes?.existingDetailsPath).toContain("/aldar-saadiyat/saadiyat-reserve-the-dunes/saadiyatreserve-dunes/");
    }
  });

  it("preserves all 17 user-supplied SDE3 coordinates exactly", () => {
    for (const [plotNumber, expected] of officialControls) {
      const record = SAADIYAT_RESERVE_RECORDS.find(item => item.plotNumber === plotNumber);
      expect(record, `Plot ${plotNumber}`).toBeDefined();
      expect(record?.positionSource).toBe("user_supplied_sde3_coordinate");
      expect(record?.latitude).toBe(expected.latitude);
      expect(record?.longitude).toBe(expected.longitude);
    }
    expect(SAADIYAT_RESERVE_RECORDS.filter(record => record.positionSource === "user_supplied_sde3_coordinate")).toHaveLength(17);
  });

  it("does not fabricate current availability, asking prices, owners, or transactions", () => {
    for (const record of SAADIYAT_RESERVE_RECORDS) {
      expect(record.availability).toBeNull();
      expect(record.askingPriceAed).toBeNull();
      expect(record.ownerName).toBeNull();
      expect(record.ownerMobile).toBeNull();
      expect(record.transactionHistory).toEqual([]);
    }
  });

  it("uses permanent official master-plan assets", () => {
    expect(SAADIYAT_RESERVE_MASTERPLAN_PDF_URL).toBe("/manus-storage/SaadiyatReservePlotsMasterplan_4bb2d343.pdf");
    expect(SAADIYAT_RESERVE_MASTERPLAN_IMAGE_URL).toBe("/manus-storage/SaadiyatReservePlotsMasterplan_4c506cd8.png");
  });
});
