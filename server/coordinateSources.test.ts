import { describe, expect, it } from "vitest";
import { plotCoordinates } from "../client/src/data/plotCoordinates";

describe("individual DCR coordinate sources", () => {
  it("preserves the newly recovered Private Villas and Golf Views centroids", () => {
    expect(plotCoordinates["private-villas/SDN2_160"]).toEqual({
      lat: 24.54930157,
      lng: 54.44571272,
    });
    expect(plotCoordinates["golf-views/SDN2_6_27"]).toEqual({
      lat: 24.53811313,
      lng: 54.43053869,
    });
  });
});
