import { describe, expect, it } from "vitest";
import { getInventoryPublicationState } from "./inventoryPublicationState";

describe("getInventoryPublicationState", () => {
  it("does not equate an empty current inventory count with sold out", () => {
    expect(getInventoryPublicationState("al-ghadeer-parks-1", 0, 0)).toEqual({
      label: "registration open",
      tone: "registration",
    });
    expect(getInventoryPublicationState("another-project", 0, 0)).toEqual({
      label: "no active inventory published",
      tone: "unpublished",
    });
  });

  it("prioritizes documented current inventory counts", () => {
    expect(getInventoryPublicationState("al-ghadeer-parks-1", 2, 0)).toEqual({ label: "available", tone: "available" });
    expect(getInventoryPublicationState("al-ghadeer-parks-1", 0, 1)).toEqual({ label: "live", tone: "live" });
  });
});
