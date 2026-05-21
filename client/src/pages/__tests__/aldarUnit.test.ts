import { describe, expect, it } from "vitest";
import { parsePaymentPlans } from "../AldarUnit";
import { buildingDisplayName } from "@/data/aldar/buildingLabels";
import { statusTone } from "@/data/aldar";

describe("parsePaymentPlans — Grammar A (||| with =>)", () => {
  const RAW =
    "100 (Standard) Disc:5% => Upon Signing SPA: 100% ||| 70-30 (Standard) Disc:0% => Payment 1: 10%, Payment 2: 10%, Payment 3: 15%, Payment 4: 10%, Payment 5: 15%, Payment 6: 10%, Handover: 30%";

  it("splits two plans", () => {
    expect(parsePaymentPlans(RAW)).toHaveLength(2);
  });

  it("captures discount on first plan", () => {
    expect(parsePaymentPlans(RAW)[0].discountPct).toBe(5);
  });

  it("first plan = 100% upfront", () => {
    const p = parsePaymentPlans(RAW)[0];
    expect(p.installments).toEqual([{ label: "Upon Signing SPA", pct: 100 }]);
  });

  it("70-30 plan handover = 30%", () => {
    const p = parsePaymentPlans(RAW)[1];
    const handover = p.installments.find(i => i.label === "Handover");
    expect(handover?.pct).toBe(30);
  });
});

describe("parsePaymentPlans — Grammar B (' | ' with [...] bracket body)", () => {
  const RAW =
    "Mamsha Garden B (B6,B5,B1)-80-20 Reb 2% (Disc:0%) [Payment 1: 10%; Payment 2: 10%; Payment 3: 15%; Payment 4: 15%; Payment 5: 15%; Payment 6: 15%; Handover: 20%] | Mamsha Garden B (B6,B5,B1)-100-4% Disc (Disc:4%) [Payment 1: 100%]";

  it("splits two plans", () => {
    expect(parsePaymentPlans(RAW)).toHaveLength(2);
  });

  it("4% discount captured on the 100% upfront plan", () => {
    const plans = parsePaymentPlans(RAW);
    const upfront = plans.find(p => p.installments.length === 1);
    expect(upfront?.discountPct).toBe(4);
    expect(upfront?.installments[0]).toEqual({ label: "Payment 1", pct: 100 });
  });

  it("80-20 plan totals 100%", () => {
    const plans = parsePaymentPlans(RAW);
    const split = plans.find(p => p.installments.length > 1)!;
    const total = split.installments.reduce((s, i) => s + i.pct, 0);
    expect(total).toBe(100);
  });

  it("Effective price applies discount to base", () => {
    const plans = parsePaymentPlans(RAW);
    const upfront = plans.find(p => p.installments.length === 1)!;
    const base = 10_000_000;
    expect(base * (1 - upfront.discountPct / 100)).toBe(9_600_000);
  });
});

describe("buildingDisplayName Grove → Heart mappings", () => {
  it.each([
    ["Grove-Heart1", "Beach Views"],
    ["Grove-Heart2", "Uptown Views"],
    ["Grove-Heart3", "Gallery Views"],
    ["Grove-Heart4", "Fountain Views"],
    ["Grove-Heart5", "Museum Views"],
  ])("%s → %s", (raw, expected) => {
    const dn = buildingDisplayName(raw);
    expect(dn.primary).toBe(expected);
    expect(dn.secondary).toBe(raw);
  });

  it("Unknown buildings fall back to raw name with no secondary", () => {
    const dn = buildingDisplayName("MamshaGarden-B1");
    expect(dn.primary).toBe("MamshaGarden-B1");
    expect(dn.secondary).toBeUndefined();
  });
});

describe("statusTone semantics", () => {
  it("Available + New count as available", () => {
    expect(statusTone("Available")).toBe("available");
    expect(statusTone("New")).toBe("available");
  });
  it("Sold and Booked/Blocked map to sold / reserved", () => {
    expect(statusTone("Sold")).toBe("sold");
    expect(statusTone("Booked")).toBe("reserved");
    expect(statusTone("Blocked")).toBe("reserved");
  });
  it("Unknown statuses become 'other'", () => {
    expect(statusTone(null)).toBe("other");
    expect(statusTone("Mystery")).toBe("other");
  });
});


describe("breakdownForUnits + actionableCount", () => {
  it("buckets statuses correctly", async () => {
    const { breakdownForUnits, actionableCount } = await import("@/data/aldar");
    const units = [
      { status: "Available" },
      { status: "Available" },
      { status: "New" },
      { status: "Booked" },
      { status: "Blocked" },
      { status: "Reserved" },
      { status: "Sold" },
      { status: "Sold" },
      { status: "Sold" },
      { status: null },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any;
    const bd = breakdownForUnits(units);
    expect(bd.available).toBe(2);
    expect(bd.new).toBe(1);
    expect(bd.booked).toBe(1);
    expect(bd.blocked).toBe(1);
    expect(bd.reserved).toBe(1);
    expect(bd.sold).toBe(3);
    expect(bd.other).toBe(1);
    expect(bd.total).toBe(10);
    // actionable = available + new + booked + blocked + reserved
    expect(actionableCount(bd)).toBe(6);
  });
});
