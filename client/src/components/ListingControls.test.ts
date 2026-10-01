import { describe, expect, it } from "vitest";
import { cardDocumentAction } from "./ListingControls";

describe("cardDocumentAction", () => {
  it("labels owner-supplied proposal marketing files clearly", () => {
    expect(cardDocumentAction("marketing", "Five Bedroom Proposal · owner supplied")).toBe("Open proposal");
  });

  it("retains explicit brochure, floorplan, and sales offer labels", () => {
    expect(cardDocumentAction("brochure", "proposal")).toBe("Open brochure");
    expect(cardDocumentAction("floorplan", "proposal")).toBe("Open floorplan");
    expect(cardDocumentAction("marketing", "Owner-supplied sales offer")).toBe("Open Sales Offer");
  });
});
