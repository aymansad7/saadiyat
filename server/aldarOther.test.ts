import { describe, expect, it } from "vitest";
import { breakdown, isLive, statusGroup } from "./routers/aldarOther";

describe("aldarOther statusGroup", () => {
  it("normalises common Aldar statuses", () => {
    expect(statusGroup("Available")).toBe("available");
    expect(statusGroup("AVAILABLE ")).toBe("available");
    expect(statusGroup("Sold")).toBe("sold");
    expect(statusGroup("New")).toBe("new");
    expect(statusGroup("Booked")).toBe("booked");
    expect(statusGroup("Blocked")).toBe("blocked");
    expect(statusGroup("Reserved")).toBe("reserved");
  });
  it("treats unknown values as other", () => {
    expect(statusGroup(null)).toBe("other");
    expect(statusGroup("")).toBe("other");
    expect(statusGroup("Cancelled")).toBe("other");
  });
});

describe("aldarOther isLive", () => {
  it("considers Available / New / Booked / Blocked / Reserved as live", () => {
    expect(isLive("Available")).toBe(true);
    expect(isLive("New")).toBe(true);
    expect(isLive("Booked")).toBe(true);
    expect(isLive("Blocked")).toBe(true);
    expect(isLive("Reserved")).toBe(true);
  });
  it("excludes Sold and unknown values", () => {
    expect(isLive("Sold")).toBe(false);
    expect(isLive("Cancelled")).toBe(false);
    expect(isLive(null)).toBe(false);
  });
});

describe("aldarOther breakdown", () => {
  it("counts every bucket and total", () => {
    const result = breakdown([
      { status: "Available" },
      { status: "Available" },
      { status: "Sold" },
      { status: "Booked" },
      { status: "Blocked" },
      { status: "Reserved" },
      { status: "New" },
      { status: null },
      { status: "Cancelled" },
    ]);
    expect(result).toEqual({
      available: 2,
      new: 1,
      booked: 1,
      blocked: 1,
      reserved: 1,
      sold: 1,
      other: 2,
      total: 9,
    });
  });

  it("returns zeros for empty input", () => {
    expect(breakdown([])).toEqual({
      available: 0,
      new: 0,
      booked: 0,
      blocked: 0,
      reserved: 0,
      sold: 0,
      other: 0,
      total: 0,
    });
  });
});
