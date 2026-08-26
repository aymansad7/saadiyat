import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(process.cwd(), "client/src/pages/SaadiyatMap.tsx"),
  "utf8",
);

describe("Interactive Map card dismissal", () => {
  it("closes the active InfoWindow when the user clicks empty map space", () => {
    expect(source).toContain('map.addListener("click", dismissInfoWindow)');
    expect(source).toContain("infoWindowRef.current?.close()");
  });

  it("removes the plot deep link on map click and on the InfoWindow close button", () => {
    expect(source).toContain('url.searchParams.delete("plot")');
    expect(source).toContain('addListener("closeclick", clearPlotDeepLink)');
    expect(source).toContain("window.history.replaceState");
  });
});
