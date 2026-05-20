import { describe, expect, it } from "vitest";

// Inline copy of the parser used by LagoonsVillaDetail for testability.
// If this drifts from the implementation in LagoonsVillaDetail.tsx, update both.
type ParsedPlan = {
  name: string;
  discountPct: number;
  installments: { label: string; pct: number }[];
};

function parsePaymentPlans(raw: string): ParsedPlan[] {
  return raw
    .split("|||")
    .map(s => s.trim())
    .filter(Boolean)
    .map(plan => {
      const [headerRaw, bodyRaw = ""] = plan.split("=>").map(s => s.trim());
      const discMatch = headerRaw.match(/Disc:\s*(\d+(?:\.\d+)?)%/i);
      const discountPct = discMatch ? parseFloat(discMatch[1]) : 0;
      const name = headerRaw.replace(/Disc:.*$/i, "").trim();
      const installments = bodyRaw
        .split(",")
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => {
          const m = part.match(/^(.*?):\s*(\d+(?:\.\d+)?)%$/);
          if (!m) return null;
          return { label: m[1].trim(), pct: parseFloat(m[2]) };
        })
        .filter((x): x is { label: string; pct: number } => Boolean(x));
      return { name, discountPct, installments };
    })
    .filter(p => p.installments.length > 0);
}

const SAMPLE =
  "100 (Standard) Disc:5% => Upon Signing SPA: 100% ||| 70-30 (Standard) Disc:0% => Payment 1: 10%, Payment 2: 10%, Payment 3: 15%, Payment 4: 10%, Payment 5: 15%, Payment 6: 10%, Handover: 30% ||| 40-60 (Standard) Disc:0% => Payment 1: 5%, Payment 2: 5%, Payment 3: 10%, Payment 4: 5%, Payment 5: 5%, Payment 6: 10%, Handover: 60%";

describe("parsePaymentPlans", () => {
  it("splits the raw string into 3 plans", () => {
    const plans = parsePaymentPlans(SAMPLE);
    expect(plans).toHaveLength(3);
  });

  it("captures discount percentages correctly", () => {
    const plans = parsePaymentPlans(SAMPLE);
    expect(plans[0].discountPct).toBe(5);
    expect(plans[1].discountPct).toBe(0);
    expect(plans[2].discountPct).toBe(0);
  });

  it("preserves plan names without the Disc fragment", () => {
    const plans = parsePaymentPlans(SAMPLE);
    expect(plans[0].name).toBe("100 (Standard)");
    expect(plans[1].name).toBe("70-30 (Standard)");
    expect(plans[2].name).toBe("40-60 (Standard)");
  });

  it("parses each installment with correct label and percentage", () => {
    const plans = parsePaymentPlans(SAMPLE);
    expect(plans[0].installments).toEqual([
      { label: "Upon Signing SPA", pct: 100 },
    ]);
    expect(plans[1].installments[0]).toEqual({ label: "Payment 1", pct: 10 });
    expect(plans[1].installments.at(-1)).toEqual({ label: "Handover", pct: 30 });
    expect(plans[2].installments.at(-1)).toEqual({ label: "Handover", pct: 60 });
  });

  it("each plan totals 100%", () => {
    const plans = parsePaymentPlans(SAMPLE);
    for (const plan of plans) {
      const total = plan.installments.reduce((s, i) => s + i.pct, 0);
      expect(total).toBeCloseTo(100, 5);
    }
  });

  it("amount calculation respects discount on base price", () => {
    const plans = parsePaymentPlans(SAMPLE);
    const base = 10_000_000; // AED 10M
    // Plan 100% with 5% discount → effective 9.5M, single 100% installment = 9.5M
    const plan100 = plans[0];
    const eff100 = base * (1 - plan100.discountPct / 100);
    expect(eff100).toBe(9_500_000);
    expect(eff100 * (plan100.installments[0].pct / 100)).toBe(9_500_000);

    // Plan 70-30 has no discount; handover = 30% of 10M = 3M
    const plan70 = plans[1];
    const eff70 = base * (1 - plan70.discountPct / 100);
    const handover = plan70.installments.find(i => i.label === "Handover")!;
    expect(eff70 * (handover.pct / 100)).toBe(3_000_000);
  });

  it("handles a plan with only two segments (100 + 40-60)", () => {
    const raw =
      "100 (Standard) Disc:5% => Upon Signing SPA: 100% ||| 40-60 (Standard) Disc:0% => Payment 1: 5%, Payment 2: 5%, Payment 3: 10%, Payment 4: 5%, Payment 5: 5%, Payment 6: 10%, Handover: 60%";
    const plans = parsePaymentPlans(raw);
    expect(plans).toHaveLength(2);
    expect(plans[1].name).toBe("40-60 (Standard)");
  });

  it("returns empty array for empty / invalid input", () => {
    expect(parsePaymentPlans("")).toEqual([]);
    expect(parsePaymentPlans("garbage")).toEqual([]);
  });
});
