import { describe, expect, it } from "vitest";
import { displayStatus } from "./aldarSaadiyat";

describe("displayStatus", () => {
  it("shows the newest guarded raw official state over the imported baseline label", () => {
    expect(displayStatus({ status: "New", source_unit_status: "Blocked" })).toBe("Blocked");
    expect(displayStatus({ status: "New", source_unit_status: "Sold" })).toBe("Sold");
  });

  it("falls back to the imported state when no current source state exists", () => {
    expect(displayStatus({ status: "New", source_unit_status: null })).toBe("New");
  });
});
