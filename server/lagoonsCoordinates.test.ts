import { describe, expect, it } from "vitest";
import { lagoonsVillaCoords } from "../client/src/data/lagoonsCoordinates";

describe("Saadiyat Lagoons coordinate calibration", () => {
  it("preserves direct SDE3 controls and labels every derived position", () => {
    const direct = lagoonsVillaCoords.filter(
      (villa) => villa.position_source === "official_user_control",
    );
    expect(direct).toHaveLength(37);
    expect(lagoonsVillaCoords).toHaveLength(1547);

    expect(lagoonsVillaCoords.find((villa) => villa.unit_name === "AlGhaf-139-01")).toMatchObject({
      lat: 24.5286618,
      lng: 54.4361179,
      position_source: "official_user_control",
    });
    expect(lagoonsVillaCoords.find((villa) => villa.unit_name === "AlSidr-099-01")).toMatchObject({
      lat: 24.5406052,
      lng: 54.4426801,
      position_source: "official_user_control",
    });
    expect(lagoonsVillaCoords.find((villa) => villa.unit_name === "Ethir-017-01")).toMatchObject({
      lat: 24.543418,
      lng: 54.4511409,
      position_source: "official_user_control",
    });

    expect(lagoonsVillaCoords.some((villa) => villa.unit_name === "Ethir-230-01")).toBe(false);
    expect(lagoonsVillaCoords.some((villa) => villa.unit_name === "Ethir-231-01")).toBe(false);
    expect(
      lagoonsVillaCoords
        .filter((villa) => villa.position_source !== "official_user_control")
        .every((villa) => villa.position_source === "masterplan_affine_calibrated_to_official_controls"),
    ).toBe(true);
  });
});
