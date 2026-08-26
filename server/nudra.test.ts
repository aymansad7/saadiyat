import { describe, expect, it } from "vitest";
import { NUDRA_UNITS, NUDRA_UNMATCHED_TRANSACTIONS, NUDRA_YANDEX_ADDRESS_POINTS } from "../client/src/data/nudra";

describe("Nudra by IMKAN source registry", () => {
  it("preserves the 38 schedule-of-areas records from the supplied plot plan", () => {
    expect(NUDRA_UNITS).toHaveLength(38);
    expect(NUDRA_UNITS.filter((unit) => unit.category === "Shores private mansion plot")).toHaveLength(4);
    expect(NUDRA_UNITS.filter((unit) => unit.category === "Beach villa")).toHaveLength(11);
    expect(NUDRA_UNITS.filter((unit) => unit.category === "Dunes villa")).toHaveLength(23);
  });

  it("keeps the S-2 launch price and its primary/secondary history distinct", () => {
    const s2 = NUDRA_UNITS.find((unit) => unit.unitNumber === "S-2");
    expect(s2?.plotAreaSqm).toBe(2489.6);
    expect(s2?.originalPriceFiveYearAed).toBe(26334777);
    expect(s2?.originalPriceSevenYearAed).toBe(27650777);
    expect(s2?.transactions).toEqual(expect.arrayContaining([
      expect.objectContaining({ saleType: "primary", priceAed: 26334777, confidence: "confirmed" }),
      expect.objectContaining({ saleType: "secondary", priceAed: 26334777, confidence: "confirmed" }),
    ]));
  });

  it("does not assign ambiguous transactions and retains exact Yandex address sources separately", () => {
    expect(NUDRA_UNMATCHED_TRANSACTIONS.length).toBeGreaterThan(0);
    expect(NUDRA_UNMATCHED_TRANSACTIONS.every((transaction) => transaction.note.includes("No unique"))).toBe(true);
    expect(NUDRA_YANDEX_ADDRESS_POINTS).toHaveLength(18);
    expect(NUDRA_YANDEX_ADDRESS_POINTS.find((point) => point.addressNumber === "1")).toMatchObject({ latitude: 24.537638, longitude: 54.415915 });
    expect(NUDRA_YANDEX_ADDRESS_POINTS.every((point) => point.returnedAddress.includes("1 Street"))).toBe(true);
  });
});
