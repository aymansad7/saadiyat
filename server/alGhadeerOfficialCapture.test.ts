import { describe, expect, it } from "vitest";
import { extractOfficialWorldAldarUnits, AL_GHADEER_OFFICIAL_CLUSTERS } from "./alGhadeerOfficialCapture";

describe("Al Ghadeer official capture parser", () => {
  it("extracts only the exact project and phase prefix from escaped official page content", () => {
    const html = [
      '{\\"unitType\\":\\"Villa\\",\\"unitNumber\\":\\"AlGhadeerGardens-R2-V-001-01\\",\\"unitStatus\\":\\"Sold\\",\\"price\\":\\"\\"}',
      '{\\"unitType\\":\\"Villa\\",\\"unitNumber\\":\\"AlGhadeerGardens-N2-V-001-01\\",\\"unitStatus\\":\\"Available\\",\\"price\\":\\"1500000\\"}',
    ].join(" ");
    const rows = extractOfficialWorldAldarUnits(html, AL_GHADEER_OFFICIAL_CLUSTERS[0].prefix);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ unitNumber: "AlGhadeerGardens-R2-V-001-01", unitStatus: "Sold" });
  });
});
